import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Helper to get user ID
async function getUserId() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return null;
  }

  const supabase = createAdminClient();
  const { data: user, error } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_user_id', clerkUserId)
    .single();

  return (user as any)?.id || null;
}

// PATCH /api/calendar/time-blocks/[id]
// Update a time block
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    const supabase = createAdminClient();

    // Check if time block exists and belongs to user
    const { data: existing, error: fetchError } = await supabase
      .from('time_blocks')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Time block not found' },
        { status: 404 }
      );
    }

    // If updating times, check for conflicts
    if (body.start_time || body.end_time) {
      const newStartTime = body.start_time || (existing as any).start_time;
      const newEndTime = body.end_time || (existing as any).end_time;

      const { data: conflicts } = await (supabase as any).rpc('detect_time_block_conflicts', {
        p_user_id: userId,
        p_start_time: newStartTime,
        p_end_time: newEndTime,
        p_exclude_block_id: id
      });

      if (conflicts && conflicts.length > 0) {
        return NextResponse.json(
          {
            error: 'Time block conflicts with existing blocks',
            conflicts
          },
          { status: 409 }
        );
      }
    }

    // Update time block
    const { data: updated, error: updateError } = await (supabase as any)
      .from('time_blocks')
      .update(body)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating time block:', updateError);
      return NextResponse.json(
        { error: 'Failed to update time block' },
        { status: 500 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error in PATCH /api/calendar/time-blocks/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/calendar/time-blocks/[id]
// Delete a time block
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const supabase = createAdminClient();

    const { error } = await supabase
      .from('time_blocks')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting time block:', error);
      return NextResponse.json(
        { error: 'Failed to delete time block' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/calendar/time-blocks/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
