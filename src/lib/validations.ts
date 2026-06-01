// Zod schemas for all API input validation.
// Every API route validates its input against these before touching the DB.

import { z } from 'zod'
import { isAvatarId } from './avatars'
import { BENNETT_EMAIL_ERROR, isBennettEmail, normalizeEmail } from './bennett-email'
import { COMMUNITY_RULES_REQUIRED_ERROR } from './community-rules'

export const BennettEmailSchema = z
  .string()
  .email('Invalid email address')
  .transform(normalizeEmail)
  .refine(isBennettEmail, { message: BENNETT_EMAIL_ERROR })

export const RegisterSchema = z.object({
  email: BennettEmailSchema,
  password: z.string().min(8, 'Password must be at least 8 characters'),
  acceptedCommunityRules: z.literal(true, {
    errorMap: () => ({ message: COMMUNITY_RULES_REQUIRED_ERROR }),
  }),
})

export const OnboardingSchema = z.object({
  pseudonym: z
    .string()
    .trim()
    .min(1, 'Enter a display name')
    .max(32, 'Display name must be at most 32 characters'),
  avatarId: z.string().refine(isAvatarId, { message: 'Choose one of the 8 character avatars' }),
})

export const CreateEntrySchema = z.object({
  content: z
    .string()
    .min(1, 'Entry cannot be empty')
    .max(1000, 'Entry cannot exceed 1000 characters'),
})

export type RegisterInput = z.infer<typeof RegisterSchema>
export type CreateEntryInput = z.infer<typeof CreateEntrySchema>
