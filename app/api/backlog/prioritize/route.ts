import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateText } from 'ai';
import { sonnet } from '@/lib/ai/config';
import { BACKLOG_PRIORITIZATION_PROMPT } from '@/lib/ai/prompts';

// POST /api/backlog/prioritize - AI-powered prioritization of backlog items
export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { backlog_item_ids, mode = 'single' } = body; // mode: 'single' or 'bulk'

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

    // Get user's goals for context
    const { data: goals } = await supabase
      .from('goals')
      .select('id, title, description, type, target_date, status')
      .eq('user_id', (user as any).id)
      .eq('status', 'active');

    // Get user's preferences for context
    const { data: preferences } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', (user as any).id)
      .single();

    // Get backlog items to prioritize
    let query = supabase
      .from('backlog_items')
      .select(`
        *,
        goal:goals!backlog_items_goal_id_fkey (
          id,
          title
        )
      `)
      .eq('user_id', (user as any).id)
      .is('archived_at', null);

    if (mode === 'single' && backlog_item_ids && backlog_item_ids.length > 0) {
      query = query.in('id', backlog_item_ids);
    }

    const { data: backlogItems, error: backlogError } = await query;

    if (backlogError || !backlogItems || backlogItems.length === 0) {
      return NextResponse.json({ error: 'No backlog items found to prioritize' }, { status: 404 });
    }

    // Prepare context for AI
    const context = {
      goals: goals || [],
      preferences: preferences || {},
      backlog_items: backlogItems,
    };

    // Call AI to analyze and prioritize
    const { text } = await generateText({
      model: sonnet,
      prompt: BACKLOG_PRIORITIZATION_PROMPT(context),
      temperature: 0.7,
    });

    // Parse AI response (expecting JSON format)
    let aiAnalysis;
    try {
      aiAnalysis = JSON.parse(text);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.error('AI response:', text);
      return NextResponse.json({ error: 'Failed to parse AI analysis' }, { status: 500 });
    }

    // Update backlog items with AI suggestions
    const updates = [];
    for (const suggestion of aiAnalysis.prioritized_items || []) {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (suggestion.suggested_schedule_date) {
        updateData.ai_suggested_schedule_date = suggestion.suggested_schedule_date;
      }
      if (suggestion.eisenhower_quadrant) {
        updateData.ai_eisenhower_quadrant = suggestion.eisenhower_quadrant;
      }
      if (suggestion.effort_estimate) {
        updateData.ai_effort_estimate = suggestion.effort_estimate;
      }
      if (suggestion.impact_score !== undefined) {
        updateData.ai_impact_score = suggestion.impact_score;
      }

      const { data: updated, error: updateError } = await supabase
        .from('backlog_items')
        // @ts-expect-error - Update type inference issue
        .update(updateData)
        .eq('id', suggestion.id)
        .eq('user_id', (user as any).id)
        .select(`
          *,
          goal:goals!backlog_items_goal_id_fkey (
            id,
            title
          )
        `)
        .single();

      if (!updateError && updated) {
        updates.push({
          ...(updated as any),
          ai_reasoning: suggestion.reasoning,
        });
      }
    }

    // Log AI usage
    await supabase
      .from('ai_usage_logs')
      // @ts-expect-error - Insert type inference issue
      .insert({
        user_id: (user as any).id,
        feature: 'backlog_prioritization',
        model: 'claude-sonnet-4-20250514',
        prompt_tokens: 0, // Would need to track from response
        completion_tokens: 0,
        total_cost_usd: 0,
      });

    return NextResponse.json({
      success: true,
      prioritized_items: updates,
      insights: aiAnalysis.insights || {},
      message: `Successfully prioritized ${updates.length} backlog item(s)`
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
