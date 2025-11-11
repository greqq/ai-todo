import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * GET /api/daily-plan/confirm
 * Check if user has confirmed their morning plan for today
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();

    // Get the user's internal ID
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // Check if there's a daily reflection with morning plan confirmed for today
    const { data: reflection, error: reflectionError } = await supabase
      .from('daily_reflections')
      .select('*')
      .eq('user_id', (user as any).id)
      .eq('date', today)
      .maybeSingle();

    if (reflectionError) {
      console.error('Error checking morning plan:', reflectionError);
      return NextResponse.json(
        { error: 'Failed to check morning plan status' },
        { status: 500 }
      );
    }

    const reflectionData = reflection as any;

    return NextResponse.json({
      confirmed: reflectionData?.morning_plan_confirmed || false,
      confirmed_at: reflectionData?.morning_plan_confirmed_at || null,
      date: today,
    });
  } catch (error: any) {
    console.error('Error in GET /api/daily-plan/confirm:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/daily-plan/confirm
 * Confirm the morning plan for today
 */
export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();

    // Get the user's internal ID
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // Upsert the daily reflection with morning plan confirmed
    const { data: reflection, error: upsertError } = await supabase
      .from('daily_reflections')
      .upsert(
        {
          user_id: (user as any).id,
          date: today,
          morning_plan_confirmed: true,
          morning_plan_confirmed_at: new Date().toISOString(),
        } as any,
        {
          onConflict: 'user_id,date',
        }
      )
      .select()
      .single();

    if (upsertError) {
      console.error('Error confirming morning plan:', upsertError);
      return NextResponse.json(
        { error: 'Failed to confirm morning plan' },
        { status: 500 }
      );
    }

    const reflectionData = reflection as any;

    return NextResponse.json({
      success: true,
      confirmed: true,
      confirmed_at: reflectionData?.morning_plan_confirmed_at,
      date: today,
    });
  } catch (error: any) {
    console.error('Error in POST /api/daily-plan/confirm:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
