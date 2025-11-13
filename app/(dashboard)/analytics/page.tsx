'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WeeklySummaryDialog } from '@/components/planning/WeeklySummaryDialog';
import { GoalProgress } from '@/components/analytics/GoalProgress';
import { TaskAnalytics } from '@/components/analytics/TaskAnalytics';
import { Calendar, TrendingUp } from 'lucide-react';

export default function AnalyticsPage() {
  const [showWeeklySummary, setShowWeeklySummary] = useState(false);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Analytics & Progress</h1>

      <div className="space-y-8">
        {/* Weekly Summary Card */}
        <Card className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <Calendar className="h-6 w-6 text-indigo-600" />
                Weekly Summary
              </h2>
              <p className="text-muted-foreground">
                Get AI-powered insights into your weekly progress, patterns, and suggestions for
                improvement.
              </p>
              <div className="pt-4">
                <Button onClick={() => setShowWeeklySummary(true)}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Weekly Summary
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Goal Progress Section */}
        <GoalProgress />

        {/* Task Analytics Section */}
        <TaskAnalytics />
      </div>

      {/* Weekly Summary Dialog */}
      <WeeklySummaryDialog open={showWeeklySummary} onOpenChange={setShowWeeklySummary} />
    </div>
  );
}
