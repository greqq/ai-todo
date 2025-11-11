'use client';

import { useState, useEffect } from 'react';
import { MorningPlanningDialog } from '@/components/planning/MorningPlanningDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

export default function DashboardPage() {
  const [showMorningPlanning, setShowMorningPlanning] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if morning plan needs to be shown
  useEffect(() => {
    checkMorningPlanStatus();
  }, []);

  const checkMorningPlanStatus = async () => {
    try {
      setLoading(true);
      const hour = new Date().getHours();

      // Only show morning planning before 11 AM
      if (hour >= 11) {
        setLoading(false);
        return;
      }

      // Check if plan is already confirmed for today
      const response = await fetch('/api/daily-plan/confirm');
      if (response.ok) {
        const data = await response.json();

        // Show dialog if not confirmed yet
        if (!data.confirmed) {
          setShowMorningPlanning(true);
        }
      }
    } catch (error) {
      console.error('Error checking morning plan status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanConfirmed = () => {
    setShowMorningPlanning(false);
    // Could refresh dashboard data here
  };

  const handleOpenMorningPlanning = () => {
    setShowMorningPlanning(true);
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
        <Button onClick={handleOpenMorningPlanning} variant="outline">
          <Sparkles className="h-4 w-4 mr-2" />
          Review Daily Plan
        </Button>
      </div>

      {/* Morning Planning Dialog */}
      <MorningPlanningDialog
        open={showMorningPlanning}
        onOpenChange={setShowMorningPlanning}
        onPlanConfirmed={handlePlanConfirmed}
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
