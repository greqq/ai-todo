'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, Send, Sparkles, ArrowLeft, CheckCircle } from 'lucide-react';

/**
 * AI Interview - Conversational onboarding (SIMPLIFIED & DETERMINISTIC)
 *
 * Fixed flow:
 * 1. Ask predefined questions in order
 * 2. User answers
 * 3. Automatically move to next question
 * 4. After all answered, complete onboarding
 *
 * No AI deciding when to proceed = No infinite loops!
 */

interface Message {
  role: 'ai' | 'user';
  content: string;
  timestamp: Date;
}

interface CollectedData {
  goalTitle?: string;
  motivation?: string;
  targetDate?: string;
  schedule?: string;
  energyPattern?: string;
}

const QUESTIONS = [
  {
    key: 'goalTitle' as keyof CollectedData,
    text: "What's the one big goal you want to achieve in the next 3-6 months?",
    placeholder: "e.g., Launch my SaaS product, Get promoted to Senior Developer, etc.",
  },
  {
    key: 'motivation' as keyof CollectedData,
    text: "That sounds exciting! Why is this goal important to you right now?",
    placeholder: "Tell me what drives you to achieve this...",
  },
  {
    key: 'targetDate' as keyof CollectedData,
    text: "When would you like to complete this goal? (Give me a date or timeframe)",
    placeholder: "e.g., June 2025, 3 months from now, etc.",
  },
  {
    key: 'schedule' as keyof CollectedData,
    text: "Tell me about your typical weekday. When do you work? What are your fixed commitments?",
    placeholder: "e.g., I work 9-5, have meetings on Mondays, spend evenings with family...",
  },
  {
    key: 'energyPattern' as keyof CollectedData,
    text: "Almost done! When during the day do you feel most focused and energized?",
    placeholder: "e.g., I'm most productive in the morning, afternoon slump, night owl...",
  },
];

export default function AIInterview() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [collectedData, setCollectedData] = useState<CollectedData>({});
  const [isCompleting, setIsCompleting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Show welcome and first question on mount
  useEffect(() => {
    const welcomeMessage: Message = {
      role: 'ai',
      content: "Hi! I'm your AI productivity coach. I'll ask you a few questions to help set up your personalized system. This should take about 5 minutes. Ready?",
      timestamp: new Date(),
    };

    const firstQuestion: Message = {
      role: 'ai',
      content: QUESTIONS[0].text,
      timestamp: new Date(),
    };

    setMessages([welcomeMessage, firstQuestion]);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim() || loading || isCompleting) return;

    const userMessage = currentInput.trim();
    setCurrentInput('');
    setLoading(true);

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        content: userMessage,
        timestamp: new Date(),
      },
    ]);

    // Save the answer
    const currentQuestion = QUESTIONS[currentQuestionIndex];
    const updatedData = {
      ...collectedData,
      [currentQuestion.key]: userMessage,
    };
    setCollectedData(updatedData);

    // Small delay for better UX (feels more conversational)
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Check if this was the last question
    if (currentQuestionIndex === QUESTIONS.length - 1) {
      // Last question answered - complete onboarding
      await completeOnboarding(updatedData);
    } else {
      // Move to next question
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);

      // Show a brief acknowledgment and then the next question
      const acknowledgments = [
        "Got it!",
        "Perfect, thanks!",
        "Great!",
        "Excellent!",
        "Thank you!",
      ];
      const randomAck = acknowledgments[Math.floor(Math.random() * acknowledgments.length)];

      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content: randomAck,
          timestamp: new Date(),
        },
      ]);

      // Show next question after brief pause
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: 'ai',
            content: QUESTIONS[nextIndex].text,
            timestamp: new Date(),
          },
        ]);
        setLoading(false);
      }, 500);
    }
  };

  const completeOnboarding = async (data: CollectedData) => {
    setIsCompleting(true);
    setLoading(false);

    setMessages((prev) => [
      ...prev,
      {
        role: 'ai',
        content: "Perfect! I have everything I need. Let me create your personalized productivity system...",
        timestamp: new Date(),
      },
    ]);

    try {
      // Format data as interview answers
      const interviewAnswers = {
        question_1: data.goalTitle || '',
        question_2: data.motivation || '',
        question_3: data.targetDate || '',
        question_4: data.schedule || '',
        question_5: data.energyPattern || '',
      };

      const response = await fetch('/api/ai/complete-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interviewAnswers }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('API Error:', errorData);
        throw new Error(errorData.error || errorData.details || 'Failed to complete onboarding');
      }

      const result = await response.json();
      console.log('Onboarding completed:', result);

      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content: `🎉 All set! I've created your goal: "${result.goal.title}" and generated your first tasks. Let's get started!`,
          timestamp: new Date(),
        },
      ]);

      // Redirect to dashboard after short delay
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 2000);
    } catch (error) {
      console.error('Error completing onboarding:', error);

      // Show detailed error to user
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorDetails = error instanceof Response
        ? await error.text().catch(() => 'Could not read error details')
        : errorMessage;

      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content: `I encountered an error: ${errorMessage}. Please check the console for details or try Quick Setup instead.`,
          timestamp: new Date(),
        },
      ]);
      setIsCompleting(false);
    }
  };

  const currentQuestion = QUESTIONS[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / QUESTIONS.length) * 100;

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              disabled={isCompleting}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-medium">AI Interview</span>
            </div>
            <div className="w-20 text-right text-sm text-muted-foreground">
              {currentQuestionIndex + 1}/{QUESTIONS.length}
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-3xl px-4 py-8">
          <div className="space-y-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg bg-muted px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            {isCompleting && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg bg-primary/10 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-sm font-medium text-primary">
                      Setting up your productivity system...
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="border-t bg-background/95 backdrop-blur">
        <div className="container mx-auto max-w-3xl px-4 py-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder={currentQuestion?.placeholder || "Type your answer..."}
              disabled={loading || isCompleting}
              className="flex-1 rounded-lg border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
            <Button
              type="submit"
              disabled={!currentInput.trim() || loading || isCompleting}
              size="icon"
              className="h-12 w-12"
            >
              {loading || isCompleting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </form>
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Press Enter to send</span>
            <span>Question {currentQuestionIndex + 1} of {QUESTIONS.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
