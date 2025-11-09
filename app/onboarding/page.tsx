'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSkipOnboarding = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/skip-onboarding', {
        method: 'POST',
      });

      if (response.ok) {
        // Redirect to dashboard after marking onboarding complete
        router.push('/dashboard');
        router.refresh(); // Force refresh to reload user data
      } else {
        alert('Failed to skip onboarding');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error skipping onboarding:', error);
      alert('An error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <h1 className="text-4xl font-bold mb-4">Welcome to AI TODO</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Let&apos;s set up your personalized productivity system.
        </p>
        <p className="text-sm text-muted-foreground mb-8">
          Onboarding flow will be implemented in Task 9.
        </p>

        {/* Temporary skip button for development */}
        <div className="bg-muted p-6 rounded-lg border border-border">
          <p className="text-sm font-medium mb-4">Development Mode</p>
          <p className="text-xs text-muted-foreground mb-4">
            Since the full onboarding (Task 9) isn&apos;t implemented yet, you can skip to the dashboard to explore the completed features.
          </p>
          <Button
            onClick={handleSkipOnboarding}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Loading...' : 'Skip Onboarding & Go to Dashboard'}
          </Button>
        </div>
      </div>
    </div>
  );
}
