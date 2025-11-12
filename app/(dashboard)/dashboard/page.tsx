'use client';

import { useState, useEffect } from 'react';
import { MorningPlanningDialog } from '@/components/planning/MorningPlanningDialog';
import { EveningReflectionDialog } from '@/components/planning/EveningReflectionDialog';
import { TodayTasksWidget } from '@/components/dashboard/TodayTasksWidget';
import { GoalProgressCards } from '@/components/dashboard/GoalProgressCards';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { EnergyIndicator } from '@/components/dashboard/EnergyIndicator';
import { UpcomingTasksWidget } from '@/components/dashboard/UpcomingTasksWidget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Moon, Flame, Trophy, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface DashboardData {
  todayTasks: any[];
  todayStats: {
    completed: number;
    total: number;
    completionRate: number;
  };
  activeGoals: any[];
  upcomingTasks: any[];
  energy: {
    current: number | null;
    average: number | null;
    peakTime: string;
  };
  streak: {
    current: number;
    longest: number;
  };
  user: {
    name: string;
    preferences: any;
  };
}

export default function DashboardPage() {
  const [showMorningPlanning, setShowMorningPlanning] = useState(false);
  const [showEveningReflection, setShowEveningReflection] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      // Check dialog status
      await checkDialogStatus();

      // Load dashboard data
      const response = await fetch('/api/dashboard/summary');
      if (!response.ok) {
        throw new Error('Failed to load dashboard');
      }

      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const checkDialogStatus = async () => {
    try {
      const hour = new Date().getHours();

      // Show evening reflection after 6 PM
      if (hour >= 18) {
        const reflectionResponse = await fetch('/api/reflections/check');
        if (reflectionResponse.ok) {
          const reflectionData = await reflectionResponse.json();
          if (!reflectionData.completed) {
            setShowEveningReflection(true);
            return;
          }
        }
      }

      // Show morning planning before 11 AM
      if (hour < 11) {
        const planResponse = await fetch('/api/daily-plan/confirm');
        if (planResponse.ok) {
          const planData = await planResponse.json();
          if (!planData.confirmed) {
            setShowMorningPlanning(true);
          }
        }
      }
    } catch (error) {
      console.error('Error checking dialog status:', error);
    }
  };

  const handlePlanConfirmed = () => {
    setShowMorningPlanning(false);
    loadDashboard();
  };

  const handleReflectionComplete = () => {
    setShowEveningReflection(false);
    loadDashboard();
  };

  const handleOpenMorningPlanning = () => {
    setShowMorningPlanning(true);
  };

  const handleOpenEveningReflection = () => {
    setShowEveningReflection(true);
  };

  const handleTaskComplete = () => {
    loadDashboard();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            {getGreeting()}{dashboardData?.user.name ? `, ${dashboardData.user.name.split(' ')[0]}` : ''}!
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s your productivity overview for today
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleOpenMorningPlanning} variant="outline" size="sm">
            <Sparkles className="h-4 w-4 mr-2" />
            Daily Plan
          </Button>
          <Button onClick={handleOpenEveningReflection} variant="outline" size="sm">
            <Moon className="h-4 w-4 mr-2" />
            Reflection
          </Button>
        </div>
      </div>

      {/* Morning Planning Dialog */}
      <MorningPlanningDialog
        open={showMorningPlanning}
        onOpenChange={setShowMorningPlanning}
        onPlanConfirmed={handlePlanConfirmed}
      />

      {/* Evening Reflection Dialog */}
      <EveningReflectionDialog
        open={showEveningReflection}
        onOpenChange={setShowEveningReflection}
        onReflectionComplete={handleReflectionComplete}
      />

      {dashboardData && (
        <div className="space-y-6">
          {/* Streak Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                <Flame className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.streak.current} days</div>
                <p className="text-xs text-muted-foreground">
                  Keep going! Complete tasks today to extend your streak
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Longest Streak</CardTitle>
                <Trophy className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.streak.longest} days</div>
                <p className="text-xs text-muted-foreground">
                  Your personal best
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <QuickActions />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Today's Tasks & Goals (2 cols on desktop) */}
            <div className="lg:col-span-2 space-y-6">
              <TodayTasksWidget
                tasks={dashboardData.todayTasks}
                completionRate={dashboardData.todayStats.completionRate}
                onTaskComplete={handleTaskComplete}
              />
              <GoalProgressCards goals={dashboardData.activeGoals} />
            </div>

            {/* Right Column - Energy & Upcoming (1 col on desktop) */}
            <div className="space-y-6">
              <EnergyIndicator energy={dashboardData.energy} />
              <UpcomingTasksWidget tasks={dashboardData.upcomingTasks} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
