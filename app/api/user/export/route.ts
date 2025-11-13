import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_user_id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const supabaseUserId = profile.id;

    // Fetch all user data in parallel
    const [
      goalsResult,
      tasksResult,
      backlogResult,
      reflectionsResult,
      energyLogsResult,
      summariesResult,
      aiUsageResult,
    ] = await Promise.all([
      supabase.from('goals').select('*').eq('user_id', supabaseUserId),
      supabase.from('tasks').select('*').eq('user_id', supabaseUserId),
      supabase.from('backlog').select('*').eq('user_id', supabaseUserId),
      supabase.from('reflections').select('*').eq('user_id', supabaseUserId),
      supabase.from('energy_logs').select('*').eq('user_id', supabaseUserId),
      supabase.from('weekly_summaries').select('*').eq('user_id', supabaseUserId),
      supabase.from('ai_usage_log').select('*').eq('user_id', supabaseUserId),
    ]);

    // Build export data
    const exportData = {
      exported_at: new Date().toISOString(),
      user_id: userId,
      profile: {
        email: profile.email,
        full_name: profile.full_name,
        timezone: profile.timezone,
        language: profile.language,
        preferences: profile.preferences,
        onboarding_completed: profile.onboarding_completed,
        created_at: profile.created_at,
      },
      goals: goalsResult.data || [],
      tasks: tasksResult.data || [],
      backlog: backlogResult.data || [],
      reflections: reflectionsResult.data || [],
      energy_logs: energyLogsResult.data || [],
      weekly_summaries: summariesResult.data || [],
      ai_usage_log: aiUsageResult.data || [],
      statistics: {
        total_goals: goalsResult.data?.length || 0,
        total_tasks: tasksResult.data?.length || 0,
        completed_tasks: tasksResult.data?.filter((t) => t.status === 'completed').length || 0,
        total_backlog_items: backlogResult.data?.length || 0,
        total_reflections: reflectionsResult.data?.length || 0,
        total_energy_logs: energyLogsResult.data?.length || 0,
        total_weekly_summaries: summariesResult.data?.length || 0,
      },
    };

    return NextResponse.json(exportData);
  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}
