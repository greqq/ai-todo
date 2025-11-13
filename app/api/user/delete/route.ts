import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile to get Supabase user ID
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const supabaseUserId = profile.id;

    // Delete all user data from all tables
    // Note: Some tables might have foreign key constraints, so order matters
    await Promise.all([
      supabase.from('ai_usage_log').delete().eq('user_id', supabaseUserId),
      supabase.from('weekly_summaries').delete().eq('user_id', supabaseUserId),
      supabase.from('energy_logs').delete().eq('user_id', supabaseUserId),
      supabase.from('reflections').delete().eq('user_id', supabaseUserId),
      supabase.from('tasks').delete().eq('user_id', supabaseUserId),
      supabase.from('backlog').delete().eq('user_id', supabaseUserId),
      supabase.from('goals').delete().eq('user_id', supabaseUserId),
    ]);

    // Delete user profile
    await supabase.from('users').delete().eq('id', supabaseUserId);

    // Delete user from Clerk
    const client = await clerkClient();
    await client.users.deleteUser(userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}
