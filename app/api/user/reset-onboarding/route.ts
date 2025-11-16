import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

/**
 * POST /api/user/reset-onboarding
 * Resets the user's onboarding completion flag to allow them to go through onboarding again
 */
export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();

    // Reset the has_completed_onboarding flag
    const { data, error } = await supabase
      .from('users')
      .update({
        has_completed_onboarding: false,
      })
      .eq('clerk_user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error resetting onboarding:', error);
      return NextResponse.json(
        { error: 'Failed to reset onboarding' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Onboarding reset successfully. You can now go through onboarding again.',
      user: data
    });
  } catch (error) {
    console.error('Error in reset-onboarding route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
