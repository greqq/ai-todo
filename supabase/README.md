# Supabase Database Setup

## Running the Database Schema

To set up the database tables, indexes, functions, and Row Level Security policies:

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/dbycavryzqsvazxtuuis

2. Navigate to the **SQL Editor** in the left sidebar

3. Click **New Query**

4. Copy the entire contents of `migrations/00001_initial_schema.sql`

5. Paste it into the SQL Editor

6. Click **Run** or press `Ctrl+Enter` (Mac: `Cmd+Enter`)

7. Wait for the query to complete - you should see "Success. No rows returned"

## What Gets Created

This migration creates:

### Tables (8 total):
- `users` - User profiles and preferences
- `goals` - User goals with hierarchy support  
- `milestones` - Goal milestones
- `tasks` - Tasks with AI categorization
- `backlog_items` - Ideas and future tasks
- `daily_reflections` - Daily review entries
- `energy_logs` - Energy tracking over time
- `weekly_summaries` - Weekly analytics

### Database Features:
- **Indexes** - Optimized for common queries
- **Functions** - Goal progress calculation
- **Triggers** - Auto-update timestamps and goal progress
- **Row Level Security (RLS)** - User data isolation

## Verifying the Setup

After running the migration, you can verify it worked by:

1. Go to the **Table Editor** in Supabase
2. You should see all 8 tables listed
3. Each table should show "RLS enabled"

## Testing the Connection

Once the schema is created, test the connection by running the Next.js dev server and visiting:

```
http://localhost:3000/api/test-db
```

You should see:
```json
{
  "success": true,
  "message": "Database connection successful",
  "data": []
}
```

## Regenerating TypeScript Types (Optional)

If you need to regenerate the TypeScript types after modifying the schema:

```bash
npx supabase gen types typescript --project-id dbycavryzqsvazxtuuis > types/supabase-generated.ts
```

Then update `types/supabase.ts` to export from the generated file.
