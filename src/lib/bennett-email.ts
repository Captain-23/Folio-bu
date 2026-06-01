// Bennett University email restriction for auth.

export const BENNETT_EMAIL_DOMAIN = 'bennett.edu.in'

export const BENNETT_EMAIL_ERROR =
  'Only @bennett.edu.in email addresses are allowed'

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function isBennettEmail(email: string): boolean {
  const normalized = normalizeEmail(email)
  return normalized.endsWith(`@${BENNETT_EMAIL_DOMAIN}`)
}
