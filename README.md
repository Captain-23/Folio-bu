# strangers.log

> Anonymous journaling platform for college students powered by Next.js, Supabase, and Gemini AI.

## Quick Start

```bash
# 1. Create the project
git clone <repo> strangers-log
cd strangers-log

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase and Gemini credentials

# 4. Push schema to database
npm run db:push

# 5. Run locally
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **ORM**: Prisma
- **Auth**: NextAuth.js
- **AI**: Google Gemini (mood tagging, reflection, moderation)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Architecture

See `ARCHITECTURE.md` for detailed documentation on:

- Data models and relationships
- Authentication flow
- API design and privacy boundaries
- AI pipeline (async processing)
- Cron jobs (daily prompts, weekly reflections)

## Development

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run db:push     # Push Prisma schema to database
npm run db:studio   # Open Prisma Studio
```

## License

MIT
