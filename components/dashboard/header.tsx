'use client';

import { UserButton } from '@clerk/nextjs';
import { User } from '@/types';
import { MobileSidebar } from './mobile-sidebar';

interface HeaderProps {
  user: User;
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      {/* Mobile menu button */}
      <MobileSidebar />

      {/* Page title or breadcrumb */}
      <div className="flex-1">
        <h1 className="text-lg font-semibold">Welcome back, {user.full_name || 'there'}!</h1>
      </div>

      {/* User menu */}
      <div className="flex items-center space-x-4">
        <UserButton afterSignOutUrl="/" />
      </div>
    </header>
  );
}
