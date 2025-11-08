# Task 3: Clerk Authentication Setup

## Objective
Integrate Clerk for user authentication with Supabase user sync via webhooks.

## Prerequisites
- Task 1 & 2 completed
- Clerk account created

## What to Build
1. Configure Clerk in Next.js
2. Create auth pages (sign-in, sign-up)
3. Setup middleware for protected routes
4. Create webhook to sync Clerk users to Supabase
5. Implement auth helper functions

## Technical Implementation

### Step 1: Get Clerk Credentials
1. Go to https://clerk.com and create application
2. Get credentials and add to `.env.local`:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
CLERK_WEBHOOK_SECRET=whsec_...
```

### Step 2: Configure Clerk Middleware

Create `middleware.ts` in root:
```typescript
import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export default authMiddleware({
  publicRoutes: ["/", "/sign-in(.*)", "/sign-up(.*)", "/api/webhooks(.*)"],
  ignoredRoutes: ["/api/webhooks/clerk"],
  
  async afterAuth(auth, req) {
    // If user is signed in and on homepage, redirect to dashboard
    if (auth.userId && req.nextUrl.pathname === "/") {
      const dashboard = new URL("/dashboard", req.url);
      return NextResponse.redirect(dashboard);
    }
    
    // If user is not signed in and trying to access protected route
    if (!auth.userId && !auth.isPublicRoute) {
      const signIn = new URL("/sign-in", req.url);
      return NextResponse.redirect(signIn);
    }
    
    return NextResponse.next();
  },
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

### Step 3: Create Auth Pages

Create `app/(auth)/layout.tsx`:
```typescript
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      {children}
    </div>
  );
}
```

Create `app/(auth)/sign-in/[[...sign-in]]/page.tsx`:
```typescript
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return <SignIn />;
}
```

Create `app/(auth)/sign-up/[[...sign-up]]/page.tsx`:
```typescript
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return <SignUp />;
}
```

### Step 4: Update Root Layout with ClerkProvider

Update `app/layout.tsx`:
```typescript
import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI TODO - Goal-Based Task Management',
  description: 'AI-powered productivity app that helps you achieve your goals',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

### Step 5: Create Clerk Webhook Handler

Create `app/api/webhooks/clerk/route.ts`:
```typescript
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET to .env.local');
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400,
    });
  }

  const eventType = evt.type;

  // Handle user.created event
  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name } = evt.data;

    const { error } = await supabaseAdmin
      .from('users')
      .insert({
        clerk_user_id: id,
        email: email_addresses[0]?.email_address || '',
        full_name: `${first_name || ''} ${last_name || ''}`.trim() || null,
      });

    if (error) {
      console.error('Error creating user in Supabase:', error);
      return new Response('Error creating user', { status: 500 });
    }
  }

  // Handle user.updated event
  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name } = evt.data;

    const { error } = await supabaseAdmin
      .from('users')
      .update({
        email: email_addresses[0]?.email_address || '',
        full_name: `${first_name || ''} ${last_name || ''}`.trim() || null,
      })
      .eq('clerk_user_id', id);

    if (error) {
      console.error('Error updating user in Supabase:', error);
    }
  }

  // Handle user.deleted event
  if (eventType === 'user.deleted') {
    const { id } = evt.data;

    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('clerk_user_id', id);

    if (error) {
      console.error('Error deleting user from Supabase:', error);
    }
  }

  return new Response('', { status: 200 });
}
```

Install svix:
```bash
npm install svix
```

### Step 6: Configure Webhook in Clerk Dashboard

1. Go to Clerk Dashboard → Webhooks
2. Add endpoint: `https://your-domain.com/api/webhooks/clerk`
3. Subscribe to events: `user.created`, `user.updated`, `user.deleted`
4. Copy webhook secret to `CLERK_WEBHOOK_SECRET` in `.env.local`

### Step 7: Create Auth Utilities

Create `lib/auth/server.ts`:
```typescript
import { auth } from '@clerk/nextjs';
import { createClient } from '@/lib/supabase/server';

export async function getCurrentUser() {
  const { userId } = auth();
  
  if (!userId) {
    return null;
  }

  const supabase = await createClient();
  
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_user_id', userId)
    .single();

  if (error || !user) {
    return null;
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
```

Create `lib/auth/client.ts`:
```typescript
import { useUser } from '@clerk/nextjs';

export function useCurrentUser() {
  const { user, isLoaded, isSignedIn } = useUser();
  
  return {
    user,
    isLoaded,
    isSignedIn,
  };
}
```

## Files to Create/Modify

**New Files:**
- `middleware.ts`
- `app/(auth)/layout.tsx`
- `app/(auth)/sign-in/[[...sign-in]]/page.tsx`
- `app/(auth)/sign-up/[[...sign-up]]/page.tsx`
- `app/api/webhooks/clerk/route.ts`
- `lib/auth/server.ts`
- `lib/auth/client.ts`

**Modified Files:**
- `app/layout.tsx`
- `.env.local`

## Testing

1. Start dev server: `npm run dev`
2. Visit `http://localhost:3000/sign-up`
3. Create test account
4. Verify:
   - ✅ User created in Clerk
   - ✅ User synced to Supabase users table (check via Supabase dashboard)
   - ✅ Redirected to /onboarding after signup
   - ✅ Sign out and sign back in works

## Acceptance Criteria

- ✅ Clerk configured in Next.js
- ✅ Sign-in and sign-up pages working
- ✅ Middleware protects routes
- ✅ Webhook syncs users to Supabase
- ✅ Auth utilities created
- ✅ Test user can sign up and appears in Supabase

## Next Task
Task 4: Basic Layout & Navigation
