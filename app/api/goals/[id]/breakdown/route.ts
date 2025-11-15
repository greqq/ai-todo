/**
 * Goal Breakdown API Routes
 *
 * GET /api/goals/[id]/breakdown - Get breakdown milestones for a goal
 * POST /api/goals/[id]/breakdown - Generate new breakdown for a goal
 * PUT /api/goals/[id]/breakdown - Regenerate breakdown with AI
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { generateText } from 'ai';
import { sonnet } from '@/lib/ai/config';
import { getGoalBreakdownPrompt } from '@/lib/ai/prompts';
import { generateMilestoneStructure } from '@/lib/goal-breakdown/breakdown-algorithm';

/**
 * GET /api/goals/[id]/breakdown
 * Retrieve breakdown milestones for a goal
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: goalId } = await context.params;
    const supabase = await createClient();

    // Fetch breakdown milestones
    const { data: milestones, error } = await supabase
      .from('goal_breakdown_milestones')
      .select('*')
      .eq('goal_id', goalId)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error fetching breakdown milestones:', error);
      return NextResponse.json(
        { error: 'Failed to fetch breakdown milestones', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ milestones: milestones || [] });
  } catch (error) {
    console.error('Error in GET /api/goals/[id]/breakdown:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/goals/[id]/breakdown
 * Generate new breakdown for a goal using AI
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: goalId } = await context.params;
    const supabase = await createClient();

    // Fetch the goal
    const { data: goal, error: goalError } = await supabase
      .from('goals')
      .select('*')
      .eq('id', goalId)
      .single();

    if (goalError || !goal) {
      return NextResponse.json(
        { error: 'Goal not found', details: goalError?.message },
        { status: 404 }
      );
    }

    const typedGoal = goal as any;

    // Fetch user context for better AI breakdown
    const { data: user } = await supabase
      .from('users')
      .select('vision_statement, energy_preferences')
      .eq('id', userId)
      .single();

    const typedUser = user as any;

    // Generate milestone structure using algorithm
    const startDate = new Date(typedGoal.start_date || new Date());
    const targetDate = new Date(typedGoal.target_date);

    const milestoneStructure = generateMilestoneStructure(
      typedGoal.title,
      startDate,
      targetDate
    );

    console.log('Generated milestone structure:', milestoneStructure);

    // Generate AI-enhanced breakdown
    const prompt = getGoalBreakdownPrompt({
      goalTitle: typedGoal.title,
      goalDescription: typedGoal.description || '',
      goalType: typedGoal.type,
      startDate: milestoneStructure.start_date,
      targetDate: milestoneStructure.target_date,
      totalDurationMonths: milestoneStructure.total_duration_months,
      milestoneStructure: milestoneStructure.milestones,
      userContext: {
        vision_statement: typedUser?.vision_statement,
        energy_preferences: typedUser?.energy_preferences,
      },
    });

    console.log('Calling AI to generate breakdown...');

    const { text } = await generateText({
      model: sonnet,
      prompt,
      temperature: 0.7,
    });

    console.log('AI breakdown received, length:', text.length);

    // Parse AI response
    let breakdownData;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        breakdownData = JSON.parse(jsonMatch[0]);
      } else {
        breakdownData = JSON.parse(text);
      }
    } catch (parseError) {
      console.error('Failed to parse breakdown data:', text);
      return NextResponse.json(
        { error: 'AI response was not in expected format', details: 'JSON parsing failed' },
        { status: 500 }
      );
    }

    // Delete existing breakdown milestones for this goal
    await supabase
      .from('goal_breakdown_milestones')
      .delete()
      .eq('goal_id', goalId);

    // Insert new breakdown milestones
    const milestonesToInsert = breakdownData.milestones.map((milestone: any) => ({
      goal_id: goalId,
      user_id: userId,
      period_type: milestone.period_type,
      title: milestone.title,
      description: milestone.description,
      target_date: milestone.target_date,
      completion_percentage_target: milestone.completion_percentage_target,
      key_deliverables: milestone.key_deliverables || [],
      order_index: milestone.order_index,
      completed: false,
    }));

    const { data: insertedMilestones, error: insertError } = await supabase
      .from('goal_breakdown_milestones')
      .insert(milestonesToInsert)
      .select();

    if (insertError) {
      console.error('Failed to insert breakdown milestones:', insertError);
      return NextResponse.json(
        { error: 'Failed to save breakdown milestones', details: insertError.message },
        { status: 500 }
      );
    }

    console.log(`Successfully created ${insertedMilestones?.length} breakdown milestones`);

    return NextResponse.json({
      success: true,
      milestones: insertedMilestones,
      weekly_themes: breakdownData.weekly_themes,
      critical_path: breakdownData.critical_path,
      success_indicators: breakdownData.success_indicators,
      message: 'Goal breakdown generated successfully',
    });
  } catch (error) {
    console.error('Error in POST /api/goals/[id]/breakdown:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/goals/[id]/breakdown
 * Regenerate breakdown (same as POST, just semantic difference)
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Regenerate is the same as POST - delete old and create new
  return POST(request, context);
}
