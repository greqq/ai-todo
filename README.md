# AI-Powered Goal Achievement Platform

A modern, AI-powered productivity application that helps you achieve your goals, not just check off tasks. Built with Next.js, TypeScript, and Claude AI.

## Features

### Core Functionality
- **AI-Powered Daily Planning**: Get personalized daily task suggestions based on your goals, energy levels, and calendar
- **Goal Management**: Set and track long-term goals with milestone tracking and progress visualization
- **Energy Tracking**: Log your energy levels throughout the day to optimize task scheduling
- **Smart Task Scheduling**: AI recommends the best time for tasks based on your energy patterns
- **Interactive Chat**: Discuss your goals and get coaching through an AI-powered chat interface
- **Calendar Integration**: Visualize tasks and energy patterns in day, week, and month views
- **Analytics Dashboard**: Track your progress with comprehensive analytics and insights

### AI-Powered Features
- Daily task generation using Eisenhower Matrix (Urgent/Important quadrants)
- Intelligent task prioritization based on goals and energy levels
- Evening reflection prompts and morning planning sessions
- Weekly summary generation with insights and recommendations
- Email notifications for daily and weekly summaries

### User Experience
- Clean, modern UI with dark/light mode support
- Responsive design for mobile and desktop
- Real-time updates and optimistic UI
- Intuitive onboarding with AI-guided interview or quick setup
- Privacy-focused with GDPR compliance (data export and deletion)

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Backend
- **Authentication**: Clerk
- **Database**: Supabase (PostgreSQL)
- **AI**: Anthropic Claude (Sonnet 4 & Haiku 3.5)
- **Email**: Resend
- **Webhooks**: Svix (for Clerk)

### Development
- **Testing**: Jest + React Testing Library
- **Linting**: ESLint
- **Type Checking**: TypeScript

## Getting Started

### Prerequisites
- Node.js 20+ and npm
- Supabase account
- Clerk account
- Anthropic API key
- Resend account (for emails)

### Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Anthropic AI
ANTHROPIC_API_KEY=your_anthropic_api_key

# Resend Email
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=your_verified_email@domain.com

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Cron Secret (for scheduled tasks)
CRON_SECRET=your_random_secret_string
```

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-todo-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up your database:
   - Create a Supabase project
   - Run the database migrations (see `Database Schema` section)
   - Set up Row Level Security policies

4. Configure authentication:
   - Create a Clerk application
   - Enable email/password authentication
   - Set up webhooks to sync users with Supabase

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Schema

The application uses the following main tables:

- **users**: User profiles and preferences
- **goals**: Long-term goals with milestones
- **tasks**: Daily tasks linked to goals
- **energy_logs**: Energy level tracking
- **reflections**: Evening reflections
- **daily_plans**: Morning planning sessions
- **weekly_summaries**: AI-generated weekly summaries
- **ai_usage**: Cost and usage tracking for AI operations
- **calendar_events**: User calendar events
- **time_blocks**: Scheduled time blocks

See the Supabase migrations in your project for detailed schema definitions.

## Project Structure

```
ai-todo-app/
├── app/                      # Next.js app directory
│   ├── (auth)/              # Authentication pages
│   ├── (dashboard)/         # Main app pages
│   ├── api/                 # API routes
│   │   ├── ai/             # AI-powered endpoints
│   │   ├── cron/           # Scheduled tasks
│   │   └── ...             # Other API routes
│   └── ...
├── components/              # React components
│   ├── ui/                 # Base UI components
│   ├── dashboard/          # Dashboard components
│   ├── tasks/              # Task-related components
│   ├── energy/             # Energy tracking components
│   └── ...
├── lib/                    # Utility functions and helpers
│   ├── ai/                # AI-related utilities
│   ├── supabase/          # Database utilities
│   ├── auth/              # Authentication utilities
│   └── ...
├── __tests__/             # Test files
│   ├── lib/               # Unit tests for utilities
│   ├── components/        # Component tests
│   └── api/               # API route tests
└── public/                # Static assets
```

## Testing

Run tests with:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Coverage

The project includes tests for:
- Utility functions (cn, AI helpers, energy helpers)
- React components (Button, etc.)
- API routes (examples provided)

### Writing Tests

Tests are located in the `__tests__` directory, mirroring the source structure. Use:
- `@testing-library/react` for component tests
- `@testing-library/jest-dom` for DOM assertions
- Mock external dependencies (Clerk, Supabase, Anthropic)

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

## Key Features Explained

### Daily Task Generation

The AI analyzes:
- Your active goals and their priorities
- Your energy patterns and peak productivity times
- Your available tasks (backlog)
- Eisenhower Matrix quadrants (Urgent/Important)
- Recommended time blocks based on task complexity

### Energy Tracking

Track your energy levels throughout the day to:
- Identify peak productivity times
- Schedule challenging tasks during high-energy periods
- Understand what energizes or drains you
- Optimize your daily routine

### Goal Milestones

Break down large goals into achievable milestones:
- Set target dates for each milestone
- Track progress automatically
- Get AI suggestions for next steps
- Visualize progress over time

### Evening Reflections

Daily reflection prompts help you:
- Celebrate wins
- Identify what worked and what didn't
- Plan improvements for tomorrow
- Build self-awareness over time

## API Routes

### Public Routes
- `POST /api/webhooks/clerk` - Clerk user sync webhook

### Protected Routes (Require Authentication)

#### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create a new task
- `PATCH /api/tasks/[id]` - Update a task
- `DELETE /api/tasks/[id]` - Delete a task
- `POST /api/tasks/[id]/complete` - Mark task as complete

#### Goals
- `GET /api/goals` - Get all goals
- `POST /api/goals` - Create a new goal
- `PATCH /api/goals/[id]` - Update a goal
- `DELETE /api/goals/[id]` - Delete a goal

#### AI Endpoints
- `POST /api/ai/generate-daily-tasks` - Generate daily task suggestions
- `POST /api/ai/accept-daily-tasks` - Accept and create suggested tasks
- `POST /api/ai/chat` - Chat with AI coach
- `POST /api/ai/interview` - Onboarding interview
- `POST /api/ai/complete-onboarding` - Process onboarding responses

#### Analytics
- `GET /api/analytics/tasks` - Get task analytics
- `GET /api/analytics/goals` - Get goal progress

#### Email (Cron Jobs)
- `POST /api/cron/send-daily-summaries` - Send daily email summaries
- `POST /api/cron/send-weekly-summaries` - Send weekly email summaries

## AI Cost Tracking

The application tracks AI usage and costs:
- Input/output token counts
- Estimated costs per operation
- Per-user usage tracking
- Operation type categorization

See `lib/ai/cost-tracking.ts` for implementation details.

## Security & Privacy

- User authentication via Clerk
- Row-level security in Supabase
- API route protection with auth middleware
- GDPR compliance features:
  - Data export (`/api/user/export`)
  - Account deletion (`/api/user/delete`)
- Webhook signature verification

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Configure environment variables
4. Deploy

### Environment Variables for Production

Ensure all environment variables are set in your production environment:
- Update `NEXT_PUBLIC_APP_URL` to your production domain
- Use production keys for Clerk, Supabase, Anthropic, and Resend
- Set a secure `CRON_SECRET` for scheduled tasks

### Cron Jobs

Set up cron jobs in Vercel:
- Daily summaries: `0 18 * * *` (6 PM daily)
- Weekly summaries: `0 17 * * 0` (5 PM Sundays)

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is private and proprietary.

## Support

For issues or questions:
- Open an issue on GitHub
- Contact the development team

## Roadmap

See `TODO.md` for planned features and improvements.

### Upcoming Features
- Calendar integration with Google Calendar
- Task dependency handling
- More sophisticated energy pattern learning
- Mobile app (React Native)
- Team collaboration features
- Habit tracking
- Pomodoro timer integration

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- AI powered by [Anthropic Claude](https://www.anthropic.com/)
- Authentication by [Clerk](https://clerk.com/)
- Database by [Supabase](https://supabase.com/)

---

Made with ❤️ for productivity enthusiasts
