import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';
import { getWeeklySummaryPrompt } from '@/lib/ai/prompts';
import { trackAIUsage } from '@/lib/ai/cost-tracking';
import {
  calculateWeeklyStats,
  getWeekRange,
  getGoalsNeedingAttention,
  getBacklogSuggestions,
} from '@/lib/ai/weekly-summary-helpers';

// Schema for AI response
const weeklySummarySchema = z.object({
  accomplishments_summary: z.string().describe('Summary of accomplishments for the week'),
  key_wins: z.array(z.string()).describe('3-5 specific achievements'),
  insights: z.array(z.string()).describe('3-5 patterns noticed'),
  challenges: z.array(z.string()).describe('2-3 areas for improvement'),
  suggestions_for_next_week: z.array(z.string()).describe('3 actionable recommendations'),
  goals_needing_attention: z.array(
    z.object({
      goal_id: z.string().describe('The UUID of the goal'),
      goal_title: z.string().describe('Title of the goal'),
      reason: z.string().describe('Why this goal needs attention'),
    })
  ).describe('Goals that fell behind or need more focus'),
  backlog_suggestions: z.array(z.string()).describe('UUIDs of backlog items ready to promote'),
  motivational_message: z.string().describe('Encouraging message for the user'),
});

// POST /api/summaries/weekly/generate - Generate weekly summary with AI
export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { date } = body; // Optional: specific week to generate for (defaults to current week)

    const supabase = createAdminClient();

    // Get the user's internal ID
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_user_id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get week range
    const targetDate = date ? new Date(date) : new Date();
    const { weekStartDate, weekEndDate } = getWeekRange(targetDate);

    // Check if summary already exists for this week
    const { data: existingSummary } = await supabase
      .from('weekly_summaries')
      .select('*')
      .eq('user_id', (user as any).id)
      .eq('week_start_date', weekStartDate)
      .single();

    if (existingSummary) {
      return NextResponse.json({
        message: 'Summary already exists for this week',
        summary: existingSummary,
      });
    }

    // Calculate weekly stats
    const stats = await calculateWeeklyStats(
      supabase,
      (user as any).id,
      weekStartDate,
      weekEndDate
    );

    // Get goals needing attention
    const goalsNeedingAttention = await getGoalsNeedingAttention(
      supabase,
      (user as any).id,
      weekStartDate,
      weekEndDate
    );

    // Get backlog suggestions
    const backlogSuggestions = await getBacklogSuggestions(supabase, (user as any).id);

    // Generate AI summary
    const startTime = Date.now();

    const prompt = getWeeklySummaryPrompt({
      weekStartDate: stats.weekStartDate,
      weekEndDate: stats.weekEndDate,
      tasksCompleted: stats.tasksCompleted,
      tasksPlanned: stats.tasksPlanned,
      completionRate: stats.completionRate,
      timeInvestedHours: stats.timeInvestedHours,
      highCompletionDays: stats.highCompletionDays,
      goalsList: stats.goalsList,
      goalProgressDetails: stats.goalProgressDetails,
      dailyReflectionsSummary: stats.dailyReflectionsSummary,
      energyData: stats.energyData,
      patternsDetected: stats.patternsDetected,
    });

    const { object: aiAnalysis } = await generateObject({
      model: anthropic('claude-sonnet-4-20250514'),
      schema: weeklySummarySchema,
      prompt,
    });

    const duration = Date.now() - startTime;

    // Track AI usage
    await trackAIUsage({
      userId: (user as any).id,
      model: 'claude-sonnet-4-20250514',
      useCase: 'weekly_summary',
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      duration,
      success: true,
    });

    // Prepare per-goal progress data
    const { data: goals } = await supabase
      .from('goals')
      .select('id, title, completion_percentage')
      .eq('user_id', (user as any).id)
      .eq('status', 'active');

    const goalProgress = (goals as any[])?.reduce((acc: any, goal: any) => {
      acc[goal.id] = {
        title: goal.title,
        completion_percentage: goal.completion_percentage,
      };
      return acc;
    }, {});

    // Get most productive days and times
    const mostProductiveDays = stats.patternsDetected?.productiveDays || [];
    const mostProductiveTimes = stats.energyData?.bestTime ? [stats.energyData.bestTime] : [];

    // Get task type energies
    const mostEnergizingTaskTypes = stats.energyData?.energizingTasks || [];
    const mostDrainingTaskTypes = stats.energyData?.drainingTasks || [];

    // Merge AI analysis with calculated stats
    const goalsNeedingAttentionSet = new Set([
      ...goalsNeedingAttention.map((g) => g.id),
      ...aiAnalysis.goals_needing_attention.map((g) => g.goal_id),
    ]);
    const goalsNeedingAttentionIds = Array.from(goalsNeedingAttentionSet);

    const backlogSuggestionsSet = new Set([
      ...backlogSuggestions,
      ...aiAnalysis.backlog_suggestions,
    ]);
    const backlogSuggestionsIds = Array.from(backlogSuggestionsSet);

    // Save summary to database
    const { data: savedSummary, error: saveError } = await supabase
      .from('weekly_summaries')
      // @ts-expect-error - Supabase insert type inference issue
      .insert({
        user_id: (user as any).id,
        week_start_date: weekStartDate,
        week_end_date: weekEndDate,
        total_tasks_completed: stats.tasksCompleted,
        total_tasks_planned: stats.tasksPlanned,
        completion_rate: stats.completionRate / 100,
        total_time_invested_minutes: stats.timeInvestedHours * 60,
        average_daily_tasks: stats.tasksPlanned / 7,
        days_with_80_percent_completion: stats.highCompletionDays,
        goal_progress: goalProgress,
        average_energy_level: stats.energyData?.avgEnergy,
        most_energizing_task_types: mostEnergizingTaskTypes,
        most_draining_task_types: mostDrainingTaskTypes,
        most_productive_days: mostProductiveDays,
        most_productive_times: mostProductiveTimes,
        key_wins: aiAnalysis.key_wins,
        challenges: aiAnalysis.challenges,
        patterns_detected: aiAnalysis.insights,
        suggestions_for_next_week: aiAnalysis.suggestions_for_next_week,
        goals_needing_attention: goalsNeedingAttentionIds,
        backlog_items_suggested: backlogSuggestionsIds,
        current_streak: (user as any).current_streak_days || 0,
        new_personal_bests: [],
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving weekly summary:', saveError);
      return NextResponse.json(
        { error: 'Failed to save weekly summary', details: saveError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      summary: savedSummary,
      ai_analysis: aiAnalysis,
      stats,
    });
  } catch (error) {
    console.error('Unexpected error generating weekly summary:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
