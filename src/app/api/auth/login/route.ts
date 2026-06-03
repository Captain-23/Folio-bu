import { NextRequest, NextResponse } from 'next/server'

/** @deprecated Use POST /api/auth/verify/send then /api/auth/verify/confirm */
export async function POST(_req: NextRequest) {
  return NextResponse.json(
    {
      error: 'Email verification required',
      hint: 'Use POST /api/auth/verify/send with purpose "login", then /api/auth/verify/confirm',
    },
    { status: 400 }
  )
}
