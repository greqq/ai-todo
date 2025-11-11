import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generateText } from 'ai';
import { sonnet } from '@/lib/ai/config';
import { getDailyTaskGenerationPrompt } from '@/lib/ai/prompts';
import {
  getUserDailyContext,
  formatAvailableTasksForPrompt,
} from '@/lib/ai/task-generation-helpers';
import { trackAIUsage } from '@/lib/ai/cost-tracking';

/**
 * POST /api/ai/generate-daily-tasks
 * Generate 3-5 AI-suggested tasks for the day
 *
 * Based on specification Section 6.2.2
 */
export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Gather user context for AI
    const context = await getUserDailyContext(userId);

    // Format available tasks for prompt
    const availableTasksStr = formatAvailableTasksForPrompt(
      context.availableTasksPool
    );

    // Generate AI prompt
    const prompt = getDailyTaskGenerationPrompt({
      goals: context.goals,
      date: context.date,
      dayOfWeek: context.dayOfWeek,
      workHoursStart: context.workHoursStart,
      workHoursEnd: context.workHoursEnd,
      energyPeakTime: context.energyPeakTime,
      last7DaysCompletionRate: context.last7DaysCompletionRate,
      tasksCompletedYesterday: context.tasksCompletedYesterday,
      energyLevels: context.energyLevels,
      existingCommitments: undefined, // TODO: Add calendar integration in future
      availableTasks: availableTasksStr,
    });

    // Call Claude Sonnet for task generation
    const startTime = Date.now();
    const result = await generateText({
      model: sonnet,
      prompt,
      temperature: 0.7,
    });

    const duration = Date.now() - startTime;

    // Track AI usage
    await trackAIUsage({
      userId,
      model: 'claude-sonnet-4-20250514',
      useCase: 'daily_task_generation',
      inputTokens: result.usage?.totalTokens || 0,
      outputTokens: 0,
      totalTokens: result.usage?.totalTokens || 0,
      duration,
      success: true,
    });

    // Parse AI response
    let aiResponse;
    try {
      // Extract JSON from the response (AI might wrap it in markdown)
      const jsonMatch = result.text.match(/```json\n?([\s\S]*?)\n?```/);
      const jsonText = jsonMatch ? jsonMatch[1] : result.text;
      aiResponse = JSON.parse(jsonText.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', result.text);
      return NextResponse.json(
        { error: 'Failed to parse AI response', rawResponse: result.text },
        { status: 500 }
      );
    }

    // Validate response structure
    if (!aiResponse.daily_tasks || !Array.isArray(aiResponse.daily_tasks)) {
      return NextResponse.json(
        {
          error: 'Invalid AI response structure',
          response: aiResponse,
        },
        { status: 500 }
      );
    }

    // Return suggestions (not saved to database yet - user can accept/modify)
    return NextResponse.json({
      suggestions: aiResponse.daily_tasks,
      daily_message: aiResponse.daily_message,
      focus_suggestion: aiResponse.focus_suggestion,
      metadata: {
        generated_at: new Date().toISOString(),
        generation_time_ms: duration,
        tokens_used: result.usage?.totalTokens || 0,
      },
    });
  } catch (error: any) {
    console.error('Error generating daily tasks:', error);

    // Track failed usage
    const { userId } = await auth();
    if (userId) {
      await trackAIUsage({
        userId,
        model: 'claude-sonnet-4-20250514',
        useCase: 'daily_task_generation',
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        duration: 0,
        success: false,
        errorMessage: error.message,
      });
    }

    return NextResponse.json(
      {
        error: 'Failed to generate daily tasks',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
