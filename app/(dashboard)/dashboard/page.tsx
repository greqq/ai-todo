'use client';

import { useState, useEffect } from 'react';
import { MorningPlanningDialog } from '@/components/planning/MorningPlanningDialog';
import { EveningReflectionDialog } from '@/components/planning/EveningReflectionDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Moon } from 'lucide-react';

export default function DashboardPage() {
  const [showMorningPlanning, setShowMorningPlanning] = useState(false);
  const [showEveningReflection, setShowEveningReflection] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if morning plan or evening reflection needs to be shown
  useEffect(() => {
    checkDialogStatus();
  }, []);

  const checkDialogStatus = async () => {
    try {
      setLoading(true);
      const hour = new Date().getHours();

      // Show evening reflection after 6 PM
      if (hour >= 18) {
        const reflectionResponse = await fetch('/api/reflections/check');
        if (reflectionResponse.ok) {
          const reflectionData = await reflectionResponse.json();
          if (!reflectionData.completed) {
            setShowEveningReflection(true);
            setLoading(false);
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
    } finally {
      setLoading(false);
    }
  };

  const handlePlanConfirmed = () => {
    setShowMorningPlanning(false);
    // Could refresh dashboard data here
  };

  const handleReflectionComplete = () => {
    setShowEveningReflection(false);
    // Could refresh dashboard data here
  };

  const handleOpenMorningPlanning = () => {
    setShowMorningPlanning(true);
  };

  const handleOpenEveningReflection = () => {
    setShowEveningReflection(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Your daily overview and productivity insights
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleOpenMorningPlanning} variant="outline">
            <Sparkles className="h-4 w-4 mr-2" />
            Review Daily Plan
          </Button>
          <Button onClick={handleOpenEveningReflection} variant="outline">
            <Moon className="h-4 w-4 mr-2" />
            Evening Reflection
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

      {/* Dashboard Content */}
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Task completion metrics will appear here.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Your goal progress will appear here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
