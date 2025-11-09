import { auth, currentUser } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function getCurrentUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const supabase = await createClient();

  // Try to get user from Supabase with regular client
  let { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_user_id', userId)
    .single();

  // If user not found with regular client, try with admin client (bypasses RLS)
  if (error || !user) {
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Try to fetch with admin client first (user might exist but RLS blocks it)
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('clerk_user_id', userId)
      .single();

    if (existingUser) {
      // User exists, just couldn't be read due to RLS
      return existingUser;
    }

    // User truly doesn't exist, create them
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return null;
    }

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