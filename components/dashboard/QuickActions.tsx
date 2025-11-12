'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Target,
  Sparkles,
  Calendar,
  BarChart3,
  Lightbulb,
  MessageSquare
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export function QuickActions() {
  const router = useRouter();

  const actions = [
    {
      icon: Plus,
      label: 'Add Task',
      description: 'Quick capture a new task',
      onClick: () => router.push('/tasks?action=new'),
      color: 'text-blue-500 bg-blue-500/10 hover:bg-blue-500/20',
    },
    {
      icon: Target,
      label: 'New Goal',
      description: 'Create a new goal',
      onClick: () => router.push('/goals?action=new'),
      color: 'text-purple-500 bg-purple-500/10 hover:bg-purple-500/20',
    },
    {
      icon: Sparkles,
      label: 'AI Task Gen',
      description: 'Generate daily tasks',
      onClick: () => router.push('/tasks?action=generate'),
      color: 'text-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/20',
    },
    {
      icon: Calendar,
      label: 'Calendar',
      description: 'View your schedule',
      onClick: () => router.push('/calendar'),
      color: 'text-green-500 bg-green-500/10 hover:bg-green-500/20',
    },
    {
      icon: BarChart3,
      label: 'Analytics',
      description: 'Track your progress',
      onClick: () => router.push('/analytics'),
      color: 'text-orange-500 bg-orange-500/10 hover:bg-orange-500/20',
    },
    {
      icon: Lightbulb,
      label: 'Backlog',
      description: 'Manage ideas',
      onClick: () => router.push('/backlog'),
      color: 'text-pink-500 bg-pink-500/10 hover:bg-pink-500/20',
    },
    {
      icon: MessageSquare,
      label: 'AI Chat',
      description: 'Ask for help',
      onClick: () => router.push('/chat'),
      color: 'text-indigo-500 bg-indigo-500/10 hover:bg-indigo-500/20',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={action.onClick}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border transition-colors ${action.color}`}
              >
                <Icon className="h-6 w-6 mb-2" />
                <span className="text-sm font-medium text-center">{action.label}</span>
                <span className="text-xs text-muted-foreground text-center mt-1">
                  {action.description}
                </span>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
