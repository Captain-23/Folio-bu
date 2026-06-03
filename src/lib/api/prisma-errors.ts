import { Prisma } from '@prisma/client'

export function getPrismaErrorMessage(error: unknown): string | null {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2022') {
      return 'Database schema is out of date. Run prisma/add-email-verification.sql on your database.'
    }
    if (error.code === 'P2021') {
      return 'Database table missing. Apply pending Prisma migrations.'
    }
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return 'Cannot reach the database. Check DATABASE_URL in .env and that Supabase is running.'
  }

  return null
}
