import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generateText } from 'ai';
import { sonnet } from '@/lib/ai/config';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/ai/complete-onboarding
 * Complete the onboarding process and create initial goal from interview data
 *
 * Based on specification Section 3.1.5: Interview Output
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { interviewAnswers } = body;

    if (!interviewAnswers) {
      return NextResponse.json(
        { error: 'Missing interview answers' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get user from database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_user_id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      );
    }

    // Type assertion needed due to Supabase type inference issues
    const typedUser = user as any;

    // Generate SMART goal analysis from interview answers
    const goalAnalysisPrompt = `Based on this onboarding interview, create a structured goal for the user:

Interview Answers:
${JSON.stringify(interviewAnswers, null, 2)}

Analyze and create:
1. A SMART goal statement (Specific, Measurable, Achievable, Relevant, Time-bound)
2. Goal type classification
3. Key milestones (2-4 milestones)
4. Success criteria
5. Initial task suggestions (3-5 tasks to get started)

Return JSON format:
{
  "goal": {
    "title": "string (concise goal statement)",
    "description": "string (detailed context and why it matters)",
    "type": "career | health | financial | relationships | personal_growth | creative | other",
    "start_date": "YYYY-MM-DD",
    "target_date": "YYYY-MM-DD",
    "priority": "high | medium | low",
    "success_criteria": ["string", "string"]
  },
  "milestones": [
    {
      "title": "string",
      "description": "string",
      "target_date": "YYYY-MM-DD"
    }
  ],
  "initial_tasks": [
    {
      "title": "string",
      "description": "string",
      "estimated_duration_minutes": integer,
      "energy_required": "high | medium | low",
      "task_type": "deep_work | admin | communication | learning | creative | physical | planning",
      "eisenhower_quadrant": "q1_urgent_important | q2_not_urgent_important | q3_urgent_not_important | q4_not_urgent_not_important"
    }
  ],
  "smart_analysis": {
    "specific": boolean,
    "measurable": boolean,
    "achievable": boolean,
    "relevant": boolean,
    "time_bound": boolean,
    "ai_suggestions": "string (any suggestions for improvement)"
  },
  "user_profile": {
    "energy_peak_time": "morning | afternoon | evening | night",
    "work_hours_start": "HH:MM",
    "work_hours_end": "HH:MM"
  }
}`;

    let goalData;
    try {
      const { text } = await generateText({
        model: sonnet,
        prompt: goalAnalysisPrompt,
        temperature: 0.7,
      });

      console.log('AI Response received, length:', text.length);

      // Parse AI response
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          goalData = JSON.parse(jsonMatch[0]);
        } else {
          goalData = JSON.parse(text);
        }
      } catch (parseError) {
        console.error('Failed to parse goal data:', text);
        return NextResponse.json(
          { error: 'AI response was not in expected format', details: 'JSON parsing failed' },
          { status: 500 }
        );
      }
    } catch (aiError) {
      console.error('AI generation failed:', aiError);
      return NextResponse.json(
        {
          error: 'Failed to generate goal analysis with AI',
          details: aiError instanceof Error ? aiError.message : 'Unknown AI error',
        },
        { status: 500 }
      );
    }

    // Create the goal in the database
    const { data: createdGoal, error: goalError } = await supabase
      .from('goals')
      // @ts-expect-error - Insert type inference issue
      .insert({
        user_id: typedUser.id,
        title: goalData.goal.title,
        description: goalData.goal.description,
        type: goalData.goal.type,
        start_date: goalData.goal.start_date,
        target_date: goalData.goal.target_date,
        priority: goalData.goal.priority,
        status: 'active',
        success_criteria: goalData.goal.success_criteria,
        smart_analysis: goalData.smart_analysis,
      })
      .select()
      .single();

    if (goalError) {
      console.error('Failed to create goal:', goalError);
      return NextResponse.json(
        { error: 'Failed to create goal', details: goalError.message },
        { status: 500 }
      );
    }

    // Type assertion for createdGoal
    const typedGoal = createdGoal as any;

    // Create milestones
    if (goalData.milestones && goalData.milestones.length > 0) {
      const milestonesToInsert = goalData.milestones.map((milestone: any, index: number) => ({
        goal_id: typedGoal.id,
        title: milestone.title,
        description: milestone.description,
        target_date: milestone.target_date,
        completed: false,
        order_index: index,
      }));

      const { error: milestonesError } = await supabase
        .from('milestones')
        .insert(milestonesToInsert);

      if (milestonesError) {
        console.error('Failed to create milestones:', milestonesError);
        // Don't fail the whole request, milestones are optional
      }
    }

    // Create initial tasks
    if (goalData.initial_tasks && goalData.initial_tasks.length > 0) {
      const tasksToInsert = goalData.initial_tasks.map((task: any) => ({
        user_id: typedUser.id,
        goal_id: typedGoal.id,
        title: task.title,
        description: task.description,
        estimated_duration_minutes: task.estimated_duration_minutes,
        energy_required: task.energy_required,
        task_type: task.task_type,
        eisenhower_quadrant: task.eisenhower_quadrant,
        status: 'todo',
        source: 'ai_generated',
        priority_score: 75, // Default high priority for initial tasks
      }));

      const { error: tasksError } = await supabase
        .from('tasks')
        .insert(tasksToInsert);

      if (tasksError) {
        console.error('Failed to create initial tasks:', tasksError);
        // Don't fail the whole request
      }
    }

    // Update user preferences and mark onboarding as complete
    const { error: updateUserError } = await supabase
      .from('users')
      // @ts-expect-error - Update type inference issue
      .update({
        onboarding_completed: true,
        onboarding_data: interviewAnswers,
        preferences: {
          ...typedUser.preferences,
          energy_peak_time: goalData.user_profile?.energy_peak_time || 'morning',
          work_hours_start: goalData.user_profile?.work_hours_start || '09:00',
          work_hours_end: goalData.user_profile?.work_hours_end || '17:00',
        },
      })
      .eq('id', typedUser.id);

    if (updateUserError) {
      console.error('Failed to update user:', updateUserError);
      // Don't fail the request, goal is already created
    }

    return NextResponse.json({
      success: true,
      goal: typedGoal,
      message: 'Onboarding completed successfully!',
    });
  } catch (error) {
    console.error('Complete onboarding API error:', error);
    return NextResponse.json(
      { error: 'Failed to complete onboarding', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
