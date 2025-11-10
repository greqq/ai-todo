'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, Send, Sparkles } from 'lucide-react';

/**
 * Onboarding AI Interview Page
 * Based on specification Section 3.1: AI-Powered Onboarding Interview
 *
 * Implements Quick Start Mode (5 questions):
 * 1. Main Goal
 * 2. Why It Matters
 * 3. Timeline
 * 4. Daily Schedule
 * 5. Energy Patterns
 */

interface Message {
  role: 'ai' | 'user';
  content: string;
  timestamp: Date;
}

interface InterviewAnswer {
  [key: string]: string;
}

const QUICK_START_QUESTIONS = [
  "What's the one big goal you want to achieve in the next 3-6 months?",
  "Why is this important to you right now?",
  "What's your target completion date for this goal?",
  "Describe your typical weekday. When do you work? What are your fixed commitments?",
  "When during the day do you feel most focused and energized?",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [interviewAnswers, setInterviewAnswers] = useState<InterviewAnswer>({});
  const [isCompleting, setIsCompleting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Show initial greeting and first question
  useEffect(() => {
    const welcomeMessage: Message = {
      role: 'ai',
      content: "Welcome to AI TODO! 👋 I'm here to help you build a personalized productivity system. Let's start with a quick 5-minute conversation to understand your goals and how you work best.",
      timestamp: new Date(),
    };

    const firstQuestion: Message = {
      role: 'ai',
      content: QUICK_START_QUESTIONS[0],
      timestamp: new Date(),
    };

    setMessages([welcomeMessage, firstQuestion]);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim() || loading) return;

    const userMessage = currentInput.trim();
    setCurrentInput('');

    // Add user message to chat
    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        content: userMessage,
        timestamp: new Date(),
      },
    ]);

    setLoading(true);

    try {
      // Call AI interview API
      const response = await fetch('/api/ai/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'quick',
          questionNumber: currentQuestionIndex + 1,
          totalQuestions: QUICK_START_QUESTIONS.length,
          previousAnswers: interviewAnswers,
          currentQuestion: QUICK_START_QUESTIONS[currentQuestionIndex],
          userResponse: userMessage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process interview response');
      }

      const data = await response.json();
      const aiResponse = data.ai_response;

      // Save the answer
      const updatedAnswers = {
        ...interviewAnswers,
        [`question_${currentQuestionIndex + 1}`]: userMessage,
      };
      setInterviewAnswers(updatedAnswers);

      // Check if we need clarification or can proceed
      if (aiResponse.needs_clarification) {
        // AI needs more info, ask follow-up
        setMessages((prev) => [
          ...prev,
          {
            role: 'ai',
            content: aiResponse.ai_message,
            timestamp: new Date(),
          },
        ]);
      } else if (aiResponse.proceed_to_next) {
        // Move to next question
        const nextQuestionIndex = currentQuestionIndex + 1;

        // Add acknowledgment if provided
        if (aiResponse.ai_message && aiResponse.ai_message !== QUICK_START_QUESTIONS[nextQuestionIndex]) {
          setMessages((prev) => [
            ...prev,
            {
              role: 'ai',
              content: aiResponse.ai_message,
              timestamp: new Date(),
            },
          ]);
        }

        // Check if we're done with all questions
        if (nextQuestionIndex >= QUICK_START_QUESTIONS.length) {
          // Complete onboarding
          await completeOnboarding(updatedAnswers);
        } else {
          // Ask next question
          setCurrentQuestionIndex(nextQuestionIndex);
          setTimeout(() => {
            setMessages((prev) => [
              ...prev,
              {
                role: 'ai',
                content: QUICK_START_QUESTIONS[nextQuestionIndex],
                timestamp: new Date(),
              },
            ]);
          }, 500);
        }
      } else {
        // Default: show AI message
        setMessages((prev) => [
          ...prev,
          {
            role: 'ai',
            content: aiResponse.ai_message,
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      console.error('Error processing interview:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content: "I'm sorry, I encountered an error. Could you please try again?",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const completeOnboarding = async (answers: InterviewAnswer) => {
    setIsCompleting(true);

    setMessages((prev) => [
      ...prev,
      {
        role: 'ai',
        content: "Perfect! 🎉 Let me create your personalized productivity system based on what you've shared. This will just take a moment...",
        timestamp: new Date(),
      },
    ]);

    try {
      const response = await fetch('/api/ai/complete-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewAnswers: answers,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete onboarding');
      }

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content: `Excellent! I've created your goal: "${data.goal.title}". I've also generated some initial tasks to help you get started. Ready to see your personalized dashboard?`,
          timestamp: new Date(),
        },
      ]);

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 2000);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content: "I encountered an error while setting up your account. Let me try again...",
          timestamp: new Date(),
        },
      ]);
      setIsCompleting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">AI Onboarding</h1>
            </div>
            <div className="text-sm text-muted-foreground">
              Question {Math.min(currentQuestionIndex + 1, QUICK_START_QUESTIONS.length)} of {QUICK_START_QUESTIONS.length}
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{
                width: `${((currentQuestionIndex + 1) / QUICK_START_QUESTIONS.length) * 100}%`,
              }}
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
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="sticky bottom-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-3xl px-4 py-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder="Type your answer here..."
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
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Press Enter to send • Your responses are saved automatically
          </p>
        </div>
      </div>
    </div>
  );
}
