import { auth, currentUser } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function getCurrentUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const supabase = await createClient();

  // Try to get user from Supabase
  let { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_user_id', userId)
    .single();

  // If user doesn't exist in Supabase, create them (webhook fallback)
  if (error || !user) {
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return null;
    }

    // Use admin client to bypass RLS for user creation
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Create user in Supabase with admin privileges
    const { data: newUser, error: createError } = await supabaseAdmin
      .from('users')
      .insert({
        clerk_user_id: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        full_name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null,
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating user in Supabase:', createError);
      return null;
    }

    user = newUser;
  }

  return user;
}

export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
}