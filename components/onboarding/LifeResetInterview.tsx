'use client';

/**
 * LifeResetInterview Component
 *
 * Main component for the comprehensive 5-phase Life Reset onboarding interview
 * Manages conversation flow, data collection, and AI interaction
 */

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, Send, ArrowLeft, Sparkles } from 'lucide-react';
import { PhaseProgress } from '@/components/onboarding/PhaseProgress';
import { QuickResponseButtons } from '@/components/onboarding/QuickResponseButtons';
import type {
  InterviewMessage,
  PhaseDefinition,
  LifeResetOnboardingData,
} from '@/types/life-reset.types';

// Define the 5 phases of the interview
const PHASES: PhaseDefinition[] = [
  {
    id: 1,
    name: 'Current Life',
    description: 'Understanding where you are now',
    estimatedMinutes: 6,
    icon: '📊',
    questions: 5,
  },
  {
    id: 2,
    name: 'Anti-Vision',
    description: 'What you want to avoid',
    estimatedMinutes: 4,
    icon: '🚫',
    questions: 5,
  },
  {
    id: 3,
    name: 'Vision',
    description: 'What you want to achieve',
    estimatedMinutes: 5,
    icon: '✨',
    questions: 6,
  },
  {
    id: 4,
    name: 'Time Horizons',
    description: 'Planning your timeline',
    estimatedMinutes: 4,
    icon: '🎯',
    questions: 5,
  },
  {
    id: 5,
    name: 'Obstacles',
    description: 'Identifying challenges',
    estimatedMinutes: 3,
    icon: '🧗',
    questions: 5,
  },
];

export default function LifeResetInterview() {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // State management
  const [currentPhase, setCurrentPhase] = useState(1);
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [collectedData, setCollectedData] = useState<Partial<LifeResetOnboardingData>>({});
  const [startTime] = useState(new Date());
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(22); // Total estimated time

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load initial welcome message
  useEffect(() => {
    const loadWelcomeMessage = async () => {
      try {
        const response = await fetch('/api/ai/life-reset-chat');
        const data = await response.json();

        if (data.aiMessage) {
          setMessages([
            {
              role: 'ai',
              content: data.aiMessage,
              timestamp: new Date(),
            },
          ]);
        }
      } catch (error) {
        console.error('Failed to load welcome message:', error);
        // Fallback welcome message
        setMessages([
          {
            role: 'ai',
            content: "Hi! I'm your AI Productivity Coach. Ready to begin your life reset journey?",
            timestamp: new Date(),
          },
        ]);
      }
    };

    loadWelcomeMessage();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent, message?: string) => {
    e.preventDefault();
    const userMessage = message || currentInput.trim();

    if (!userMessage || loading || isCompleting) return;

    setCurrentInput('');
    setLoading(true);

    // Add user message to chat
    const newUserMessage: InterviewMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);

    try {
      // Call Life Reset chat API
      const response = await fetch('/api/ai/life-reset-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phase: currentPhase,
          userMessage,
          previousMessages: updatedMessages,
          collectedData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();

      // Add AI response to chat
      const aiMessage: InterviewMessage = {
        role: 'ai',
        content: data.aiMessage,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Check if we should proceed to next phase
      if (data.proceedToNextPhase && currentPhase < 5) {
        setTimeout(() => {
          setCurrentPhase((prev) => prev + 1);
          // Update estimated time remaining
          setEstimatedTimeRemaining((prev) =>
            Math.max(0, prev - PHASES[currentPhase - 1].estimatedMinutes)
          );
        }, 1000);
      }

      // Check if all phases are complete
      if (data.allPhasesComplete) {
        await completeOnboarding();
      }
    } catch (error) {
      console.error('Error in interview:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content: "I'm sorry, I encountered an error. Please try again or contact support if this persists.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Handle quick response: "I don't know"
  const handleIDontKnow = () => {
    handleSubmit(
      { preventDefault: () => {} } as React.FormEvent,
      "I don't know yet, but I'm open to exploring this."
    );
  };

  // Handle quick response: "Skip"
  const handleSkip = () => {
    handleSubmit(
      { preventDefault: () => {} } as React.FormEvent,
      "I'd prefer to skip this question for now."
    );
  };

  // Complete onboarding after all phases
  const completeOnboarding = async () => {
    setIsCompleting(true);

    setMessages((prev) => [
      ...prev,
      {
        role: 'ai',
        content: "Perfect! I have everything I need. Let me create your personalized Life Reset Map...",
        timestamp: new Date(),
      },
    ]);

    try {
      const interviewDuration = Math.round((new Date().getTime() - startTime.getTime()) / 60000);

      const response = await fetch('/api/ai/complete-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewAnswers: {
            ...collectedData,
            completed_at: new Date().toISOString(),
            interview_duration_minutes: interviewDuration,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete onboarding');
      }

      const result = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content: `🎉 Your Life Reset Map is ready! I've created your primary goal: "${result.goal?.title}" along with supporting goals and routines. Let's get started on your journey!`,
          timestamp: new Date(),
        },
      ]);

      // Redirect to dashboard after delay
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 3000);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content: "I encountered an error creating your Life Reset Map. Please try again or contact support.",
          timestamp: new Date(),
        },
      ]);
      setIsCompleting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-muted/20">
      {/* Header with progress */}
      <div className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto max-w-4xl px-4 py-4">
          <div className="mb-4 flex items-center justify-between">
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
              <span className="font-medium">Life Reset Interview</span>
            </div>
            <div className="w-20" /> {/* Spacer for centering */}
          </div>

          <PhaseProgress
            currentPhase={currentPhase}
            phases={PHASES}
            estimatedTimeRemaining={estimatedTimeRemaining}
          />
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
                  className={`max-w-[85%] rounded-lg px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <p className="mt-1 text-xs opacity-60">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-lg bg-muted px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            {isCompleting && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-lg bg-primary/10 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-sm font-medium text-primary">
                      Creating your Life Reset Map...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input area */}
      <div className="border-t bg-background/95 backdrop-blur">
        <div className="container mx-auto max-w-3xl px-4 py-4 space-y-3">
          {/* Quick response buttons */}
          <QuickResponseButtons
            onIDontKnow={handleIDontKnow}
            onSkip={handleSkip}
            disabled={loading || isCompleting}
          />

          {/* Input form */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder="Type your answer..."
              disabled={loading || isCompleting}
              className="flex-1 rounded-lg border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
            <Button
              type="submit"
              disabled={!currentInput.trim() || loading || isCompleting}
              size="icon"
              className="h-12 w-12 shrink-0"
            >
              {loading || isCompleting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            Press Enter to send • Your answers help us create a personalized plan
          </p>
        </div>
      </div>
    </div>
  );
}
