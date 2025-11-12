import { requireAuth } from '@/lib/auth/server';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { Toaster } from '@/components/ui/toaster';
import { redirect } from 'next/navigation';
import { User } from '@/types';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user: User;

  try {
    user = await requireAuth();
  } catch (error) {
    redirect('/sign-in');
  }

  // If user hasn't completed onboarding, redirect
  if (!user.onboarding_completed) {
    redirect('/onboarding');
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header user={user} />

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>

      {/* Toast notifications */}
      <Toaster />
    </div>
  );
}
