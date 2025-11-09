import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Temporary API route to mark onboarding as complete
 * This allows testing dashboard/settings without implementing full onboarding (Task 9)
 */
export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('users')
      // @ts-expect-error - Update type inference issue
      .update({ onboarding_completed: true })
      .eq('clerk_user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating onboarding status:', error);
      return NextResponse.json({ error: 'Failed to update onboarding status' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Onboarding marked as complete',
      user: data
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
