'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';

/**
 * Quick Setup - Form-based onboarding
 * Fast, predictable, ~2 minutes
 */

export default function QuickSetup() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    goalTitle: '',
    goalDescription: '',
    targetDate: '',
    energyPeakTime: 'morning' as 'morning' | 'afternoon' | 'evening' | 'night',
    workHoursStart: '09:00',
    workHoursEnd: '17:00',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create interview answers object matching AI interview format
      const interviewAnswers = {
        question_1: formData.goalTitle,
        question_2: formData.goalDescription,
        question_3: formData.targetDate,
        question_4: `I work from ${formData.workHoursStart} to ${formData.workHoursEnd} on weekdays`,
        question_5: `I feel most energized during the ${formData.energyPeakTime}`,
      };

      const response = await fetch('/api/ai/complete-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interviewAnswers }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete onboarding');
      }

      // Redirect to dashboard
      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      console.error('Error completing onboarding:', error);
      alert('Failed to complete setup. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to selection
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto py-12">
        <div className="container mx-auto max-w-2xl px-4">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold">Quick Setup</h1>
            <p className="text-muted-foreground">
              Fill out this form to get started quickly
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border bg-card p-8">
            {/* Goal Title */}
            <div>
              <label htmlFor="goalTitle" className="mb-2 block text-sm font-medium">
                What&apos;s your main goal for the next 3-6 months? *
              </label>
              <input
                type="text"
                id="goalTitle"
                required
                value={formData.goalTitle}
                onChange={(e) => setFormData({ ...formData, goalTitle: e.target.value })}
                placeholder="e.g., Launch my SaaS product"
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            {/* Goal Description */}
            <div>
              <label htmlFor="goalDescription" className="mb-2 block text-sm font-medium">
                Why is this goal important to you? *
              </label>
              <textarea
                id="goalDescription"
                required
                value={formData.goalDescription}
                onChange={(e) => setFormData({ ...formData, goalDescription: e.target.value })}
                placeholder="Tell us why this matters to you..."
                rows={4}
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            {/* Target Date */}
            <div>
              <label htmlFor="targetDate" className="mb-2 block text-sm font-medium">
                Target completion date *
              </label>
              <input
                type="date"
                id="targetDate"
                required
                value={formData.targetDate}
                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            {/* Energy Peak Time */}
            <div>
              <label htmlFor="energyPeakTime" className="mb-2 block text-sm font-medium">
                When do you feel most focused and energized? *
              </label>
              <select
                id="energyPeakTime"
                value={formData.energyPeakTime}
                onChange={(e) => setFormData({ ...formData, energyPeakTime: e.target.value as any })}
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="morning">Morning (6 AM - 12 PM)</option>
                <option value="afternoon">Afternoon (12 PM - 6 PM)</option>
                <option value="evening">Evening (6 PM - 10 PM)</option>
                <option value="night">Night (10 PM - 2 AM)</option>
              </select>
            </div>

            {/* Work Hours */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="workHoursStart" className="mb-2 block text-sm font-medium">
                  Work hours start *
                </label>
                <input
                  type="time"
                  id="workHoursStart"
                  value={formData.workHoursStart}
                  onChange={(e) => setFormData({ ...formData, workHoursStart: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div>
                <label htmlFor="workHoursEnd" className="mb-2 block text-sm font-medium">
                  Work hours end *
                </label>
                <input
                  type="time"
                  id="workHoursEnd"
                  value={formData.workHoursEnd}
                  onChange={(e) => setFormData({ ...formData, workHoursEnd: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating your productivity system...
                </>
              ) : (
                'Complete Setup'
              )}
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            This information helps us create personalized task recommendations for you
          </p>
        </div>
      </div>
    </div>
  );
}
