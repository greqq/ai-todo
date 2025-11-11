'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WeeklySummaryDialog } from '@/components/planning/WeeklySummaryDialog';
import { Calendar, TrendingUp, Target, Clock } from 'lucide-react';

export default function AnalyticsPage() {
  const [showWeeklySummary, setShowWeeklySummary] = useState(false);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Analytics & Progress</h1>

      <div className="grid gap-6">
        {/* Weekly Summary Card */}
        <Card className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <Calendar className="h-6 w-6 text-indigo-600" />
                Weekly Summary
              </h2>
              <p className="text-gray-600">
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

        {/* Coming Soon Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <Target className="h-6 w-6 text-green-600" />
              <h3 className="text-xl font-semibold">Goal Progress</h3>
            </div>
            <p className="text-gray-600">
              Track progress across all your goals with detailed completion metrics and timelines.
            </p>
            <p className="text-sm text-gray-500 mt-4">Coming soon...</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="h-6 w-6 text-blue-600" />
              <h3 className="text-xl font-semibold">Time Analysis</h3>
            </div>
            <p className="text-gray-600">
              Understand how you spend your time and identify opportunities for optimization.
            </p>
            <p className="text-sm text-gray-500 mt-4">Coming soon...</p>
          </Card>
        </div>
      </div>

      {/* Weekly Summary Dialog */}
      <WeeklySummaryDialog open={showWeeklySummary} onOpenChange={setShowWeeklySummary} />
    </div>
  );
}
