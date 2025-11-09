import { requireAuth } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import { User } from '@/types';

export default async function OnboardingPage() {
  let user: User;

  try {
    user = await requireAuth();
  } catch (error) {
    redirect('/sign-in');
  }

  // If already onboarded, redirect to dashboard
  if (user.onboarding_completed) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <h1 className="text-4xl font-bold mb-4">Welcome to AI TODO</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Let&apos;s set up your personalized productivity system.
        </p>
        <p className="text-sm text-muted-foreground">
          Onboarding flow will be implemented in Task 9.
        </p>
      </div>
    </div>
  );
}
