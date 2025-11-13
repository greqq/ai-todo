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
  Zap,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Goals', href: '/goals', icon: Target },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Backlog', href: '/backlog', icon: Inbox },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Energy', href: '/energy', icon: Zap },
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

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Your goal-first productivity system
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
