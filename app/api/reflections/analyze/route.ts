import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';
import { getEveningReflectionPrompt } from '@/lib/ai/prompts';
import { trackAIUsage } from '@/lib/ai/cost-tracking';

// Schema for AI response
const reflectionAnalysisSchema = z.object({
  acknowledgment: z.string(),
  insights: z.array(z.string()),
  suggestion_for_tomorrow: z.string(),
  encouraging_message: z.string(),
});

// POST /api/reflections/analyze - Get AI analysis for reflection
export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      date,
      what_went_well,
      what_blocked_me,
      energy_level,
      mood,
    } = body;

    // Validation
    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

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

    // Get today's tasks
    const { data: completedTasks } = await supabase
      .from('tasks')
      .select('title')
      .eq('user_id', (user as any).id)
      .eq('status', 'completed')
      .gte('completed_at', `${date}T00:00:00`)
      .lte('completed_at', `${date}T23:59:59`);

    const { data: incompleteTasks } = await supabase
      .from('tasks')
      .select('title')
      .eq('user_id', (user as any).id)
      .eq('status', 'todo')
      .lte('due_date', `${date}T23:59:59`);

    const completedTaskTitles = (completedTasks as any[])?.map((t: any) => t.title) || [];
    const incompleteTaskTitles = (incompleteTasks as any[])?.map((t: any) => t.title) || [];

    const totalTasks = completedTaskTitles.length + incompleteTaskTitles.length;
    const completionRate =
      totalTasks > 0 ? Math.round((completedTaskTitles.length / totalTasks) * 100) : 0;

    // Get recent patterns (last 7 days)
    const sevenDaysAgo = new Date(date);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: recentReflections } = await supabase
      .from('daily_reflections')
      .select('*')
      .eq('user_id', (user as any).id)
      .gte('date', sevenDaysAgo.toISOString().split('T')[0])
      .lt('date', date);

    let recentPatterns = undefined;
    if (recentReflections && recentReflections.length > 0) {
      const reflections = recentReflections as any[];
      const avgCompletionRate =
        reflections.reduce(
          (sum, r) => sum + (typeof r.completion_rate === 'number' ? r.completion_rate : 0),
          0
        ) / reflections.length;

      const blockers = reflections
        .map((r) => r.what_blocked_me)
        .filter((b: any) => b && b.trim() !== '');

      const avgEnergy =
        reflections.reduce(
          (sum, r) => sum + (r.energy_level_end_of_day || 0),
          0
        ) / reflections.length;

      recentPatterns = {
        avgCompletionRate: Math.round(avgCompletionRate * 100),
        commonBlockers: blockers.length > 0 ? blockers : ['No blockers reported'],
        energyTrends: `Average energy level: ${avgEnergy.toFixed(1)}/10`,
      };
    }

    // Generate AI analysis
    const startTime = Date.now();

    const prompt = getEveningReflectionPrompt({
      completedTasks: completedTaskTitles,
      incompleteTasks: incompleteTaskTitles,
      completionRate,
      energyLevel: energy_level || 5,
      whatWentWell: what_went_well,
      whatBlockedMe: what_blocked_me,
      mood,
      recentPatterns,
    });

    const { object: analysis } = await generateObject({
      model: anthropic('claude-sonnet-4-20250514'),
      schema: reflectionAnalysisSchema,
      prompt,
    });

    const duration = Date.now() - startTime;

    // Track AI usage
    await trackAIUsage({
      userId: (user as any).id,
      model: 'claude-sonnet-4-20250514',
      useCase: 'evening_reflection',
      inputTokens: 0, // Will be populated by actual usage
      outputTokens: 0,
      totalTokens: 0,
      duration,
      success: true,
    });

    // Save reflection with AI insights
    const { error: saveError } = await supabase
      .from('daily_reflections')
      // @ts-expect-error - Upsert type inference issue
      .upsert(
        {
          user_id: (user as any).id,
          date,
          tasks_completed: completedTaskTitles.length,
          tasks_planned: totalTasks,
          completion_rate: completionRate / 100,
          what_went_well: what_went_well?.trim() || null,
          what_blocked_me: what_blocked_me?.trim() || null,
          energy_level_end_of_day: energy_level || null,
          mood: mood || null,
          ai_insights: analysis.acknowledgment + '\n\n' + analysis.insights.join('\n'),
          ai_suggestions: [analysis.suggestion_for_tomorrow],
        },
        {
          onConflict: 'user_id,date',
        }
      );

    if (saveError) {
      console.error('Error saving reflection with AI analysis:', saveError);
    }

    return NextResponse.json({
      ...analysis,
      stats: {
        completed_tasks: completedTaskTitles.length,
        incomplete_tasks: incompleteTaskTitles.length,
        completion_rate: completionRate,
      },
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
