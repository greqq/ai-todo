# Task 04: Basic Layout & Navigation

## Objective
Create the main dashboard layout with sidebar navigation, header with user menu, and responsive design.

## Prerequisites
- Tasks 1-3 completed (Project setup, Database, Auth)

## What to Build
1. Dashboard layout component
2. Sidebar navigation
3. Header with user profile menu
4. Responsive mobile menu
5. Protected route layout

## Technical Implementation

### Step 1: Create Dashboard Layout

Create `app/(dashboard)/layout.tsx`:
```typescript
import { UserButton } from '@clerk/nextjs';
import { requireAuth } from '@/lib/auth/server';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();
  
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
    </div>
  );
}
```

### Step 2: Create Sidebar Component

Create `components/dashboard/sidebar.tsx`:
```typescript
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import {
  LayoutDashboard,
  Target,
  CheckSquare,
  Inbox,
  Calendar,
  BarChart3,
  MessageSquare,
  Settings,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Goals', href: '/goals', icon: Target },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Backlog', href: '/backlog', icon: Inbox },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'AI Chat', href: '/chat', icon: MessageSquare },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r border-border bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-border">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <Target className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">AI TODO</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          Your goal-first productivity system
        </p>
      </div>
    </div>
  );
}
```

### Step 3: Create Header Component

Create `components/dashboard/header.tsx`:
```typescript
'use client';

import { UserButton } from '@clerk/nextjs';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { User } from '@/types';

interface HeaderProps {
  user: User;
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => {
          // TODO: Toggle mobile sidebar
        }}
      >
        <Menu className="h-6 w-6" />
      </Button>

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
```

### Step 4: Create Placeholder Dashboard Pages

Create `app/(dashboard)/dashboard/page.tsx`:
```typescript
export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <p className="text-muted-foreground">
        Your daily overview will appear here.
      </p>
    </div>
  );
}
```

Create similar placeholder pages for other routes:
- `app/(dashboard)/goals/page.tsx`
- `app/(dashboard)/tasks/page.tsx`
- `app/(dashboard)/backlog/page.tsx`
- `app/(dashboard)/calendar/page.tsx`
- `app/(dashboard)/analytics/page.tsx`
- `app/(dashboard)/chat/page.tsx`
- `app/(dashboard)/settings/page.tsx`

Template for each:
```typescript
export default function [PageName]Page() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">[Page Name]</h1>
      <p className="text-muted-foreground">
        Coming soon...
      </p>
    </div>
  );
}
```

### Step 5: Create Onboarding Placeholder

Create `app/onboarding/page.tsx`:
```typescript
import { requireAuth } from '@/lib/auth/server';
import { redirect } from 'next/navigation';

export default async function OnboardingPage() {
  const user = await requireAuth();
  
  // If already onboarded, redirect to dashboard
  if (user.onboarding_completed) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <h1 className="text-4xl font-bold mb-4">Welcome to AI TODO</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Let's set up your personalized productivity system.
        </p>
        <p className="text-sm text-muted-foreground">
          Onboarding flow will be implemented in Task 9.
        </p>
      </div>
    </div>
  );
}
```

### Step 6: Add Mobile Sidebar (Bonus)

Create `components/dashboard/mobile-sidebar.tsx`:
```typescript
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X } from 'lucide-react';
import {
  LayoutDashboard,
  Target,
  CheckSquare,
  Inbox,
  Calendar,
  BarChart3,
  MessageSquare,
  Settings,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Goals', href: '/goals', icon: Target },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Backlog', href: '/backlog', icon: Inbox },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'AI Chat', href: '/chat', icon: MessageSquare },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex h-16 items-center px-6 border-b border-border">
            <Link href="/dashboard" className="flex items-center space-x-2" onClick={() => setOpen(false)}>
              <Target className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">AI TODO</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

Create `components/ui/sheet.tsx` (shadcn sheet component):
```bash
npx shadcn-ui@latest add sheet
```

## Files to Create/Modify

**New Files:**
- `app/(dashboard)/layout.tsx`
- `components/dashboard/sidebar.tsx`
- `components/dashboard/header.tsx`
- `components/dashboard/mobile-sidebar.tsx`
- `app/(dashboard)/dashboard/page.tsx`
- `app/(dashboard)/goals/page.tsx`
- `app/(dashboard)/tasks/page.tsx`
- `app/(dashboard)/backlog/page.tsx`
- `app/(dashboard)/calendar/page.tsx`
- `app/(dashboard)/analytics/page.tsx`
- `app/(dashboard)/chat/page.tsx`
- `app/(dashboard)/settings/page.tsx`
- `app/onboarding/page.tsx`
- `components/ui/sheet.tsx`

**Modified Files:**
- `lib/auth/server.ts` (already has requireAuth function)

## Testing

1. Sign in to the app
2. Verify you're redirected to `/onboarding` (since onboarding_completed is false)
3. Manually update user in Supabase: `UPDATE users SET onboarding_completed = true WHERE clerk_user_id = 'your-clerk-id'`
4. Refresh - should now see dashboard
5. Test navigation:
   - ✅ Click each sidebar link
   - ✅ Active link highlights correctly
   - ✅ Mobile menu works (test on narrow screen)
6. Test header:
   - ✅ User name displays
   - ✅ User button works (sign out)

## Acceptance Criteria

- ✅ Dashboard layout renders correctly
- ✅ Sidebar navigation functional
- ✅ All route pages accessible
- ✅ Mobile responsive design works
- ✅ Active nav item highlights
- ✅ User profile button in header
- ✅ Onboarding redirect logic works
- ✅ Protected routes require auth

## Next Task
Task 05: User Profile & Preferences
