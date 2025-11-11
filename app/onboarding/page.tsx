'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sparkles, Zap, Clock, CheckCircle2 } from 'lucide-react';
import QuickSetup from '@/components/onboarding/QuickSetup';
import AIInterview from '@/components/onboarding/AIInterview';

/**
 * Onboarding Page - Mode Selection
 * Based on specification Section 3.1: AI-Powered Onboarding Interview
 *
 * Two modes:
 * 1. Quick Setup (Form-based, 2 min)
 * 2. AI Interview (Conversational, 5-10 min, RECOMMENDED)
 */

type OnboardingMode = 'selection' | 'quick' | 'ai';

export default function OnboardingPage() {
  const [mode, setMode] = useState<OnboardingMode>('selection');

  if (mode === 'quick') {
    return <QuickSetup />;
  }

  if (mode === 'ai') {
    return <AIInterview />;
  }

  // Mode Selection Screen
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/20 p-6">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="mb-2 text-4xl font-bold">Welcome to AI TODO</h1>
          <p className="text-lg text-muted-foreground">
            Let&apos;s build your personalized productivity system
          </p>
        </div>

        {/* Mode Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Quick Setup */}
          <button
            onClick={() => setMode('quick')}
            className="group relative overflow-hidden rounded-xl border-2 border-border bg-card p-8 text-left transition-all hover:border-primary hover:shadow-lg"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                <Zap className="h-6 w-6 text-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Quick Setup</h2>
                <p className="text-sm text-muted-foreground">Simple form</p>
              </div>
            </div>

            <ul className="mb-6 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>Fill out a quick form with your goal</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>Takes about 2 minutes</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>Get started immediately</span>
              </li>
            </ul>

            <div className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4" />
              <span>~2 minutes</span>
            </div>

            <div className="absolute bottom-0 right-0 h-24 w-24 translate-x-8 translate-y-8 rounded-full bg-primary/5 transition-transform group-hover:scale-150" />
          </button>

          {/* AI Interview - RECOMMENDED */}
          <button
            onClick={() => setMode('ai')}
            className="group relative overflow-hidden rounded-xl border-2 border-primary bg-card p-8 text-left shadow-lg transition-all hover:shadow-xl"
          >
            {/* Recommended Badge */}
            <div className="absolute right-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
              RECOMMENDED
            </div>

            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">AI Interview</h2>
                <p className="text-sm text-muted-foreground">Conversational setup</p>
              </div>
            </div>

            <ul className="mb-6 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>AI asks you questions about your goals</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>More personalized task recommendations</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>Better understanding of your schedule & energy</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>SMART goal validation</span>
              </li>
            </ul>

            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <Clock className="h-4 w-4" />
              <span>~5-10 minutes</span>
            </div>

            <div className="absolute bottom-0 right-0 h-32 w-32 translate-x-12 translate-y-12 rounded-full bg-primary/10 transition-transform group-hover:scale-150" />
          </button>
        </div>

        {/* Footer Note */}
        <p className="mt-8 text-center text-sm text-muted-foreground">
          You can always adjust your settings later in Settings
        </p>
      </div>
    </div>
  );
}
