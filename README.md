# Datalyst

A personal statistics tracking application with intelligent insights powered by data correlations.

## Features

- **Habit Tracking**: Track multiple habits with custom subvariables (numeric, scales, boolean, categorical)
- **Smart Dashboard**: Real-time streak tracking, completion rates, and consistency scores
- **Intelligent Insights**: Automatic correlation detection between your tracked variables
- **Data Visualization**: Interactive charts and graphs to visualize your progress
- **Secure Authentication**: Powered by Supabase Auth

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Statistics**: simple-statistics

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project

### Environment Setup

1. Clone the repository
2. Copy `.env.local.example` to `.env.local` (if exists) or create `.env.local`:

```env
DATABASE_URL="your-supabase-postgres-url"
NEXT_PUBLIC_SUPABASE_URL="your-supabase-project-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
```

3. Install dependencies:

```bash
npm install
```

4. Generate Prisma Client:

```bash
npx prisma generate
```

5. Push database schema to Supabase:

```bash
npx prisma db push
```

6. Run the development server:

```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── (app)/             # Protected app routes
│   │   ├── dashboard/     # Main dashboard
│   │   ├── data/          # Data visualization
│   │   ├── habits/        # Habit management
│   │   └── logs/          # Entry logs
│   ├── (auth)/            # Authentication routes
│   │   ├── login/
│   │   ├── register/
│   │   └── reset-password/
│   └── api/               # API routes
├── components/            # React components
│   ├── charts/           # Chart components
│   ├── data/             # Data visualization
│   ├── forms/            # Form components
│   ├── habits/           # Habit-related components
│   └── ui/               # UI primitives
├── lib/                  # Utilities and configurations
│   └── supabase/        # Supabase client utilities
├── services/            # Business logic services
├── stats/               # Statistical analysis modules
└── types/               # TypeScript type definitions
```

## Key Features

### Dashboard Metrics

- **Current Streak**: Consecutive days with at least one habit entry
- **Daily Progress**: Today's completion percentage
- **Weekly Completion**: 7-day rolling completion rate
- **Consistency Score**: Weighted consistency metric (recent days weighted more)

### Analytics

- **Correlation Detection**: Automatic detection of relationships between variables
- **Statistical Significance**: P-value calculations to ensure meaningful insights
- **Trend Analysis**: Identify improving or declining patterns
- **Personalized Recommendations**: Data-driven suggestions based on your patterns

## Development

### Database Migrations

When you make changes to the Prisma schema:

```bash
npx prisma db push
```

### Type Generation

Prisma types are automatically generated on `npm install` via the `postinstall` script.

## Deployment

This app is optimized for deployment on Vercel:

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
