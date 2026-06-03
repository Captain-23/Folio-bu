// Zod schemas for all API input validation.
// Every API route validates its input against these before touching the DB.

import { ModAction, ReportStatus, TargetType } from '@prisma/client'
import { z } from 'zod'
import { isAvatarId } from './avatars'
import { BENNETT_EMAIL_ERROR, isBennettEmail, normalizeEmail } from './bennett-email'
import { COMMUNITY_RULES_REQUIRED_ERROR } from './community-rules'

export const BennettEmailSchema = z
  .string()
  .email('Invalid email address')
  .transform(normalizeEmail)
  .refine(isBennettEmail, { message: BENNETT_EMAIL_ERROR })

export const RegisterSchema = z
  .object({
    email: BennettEmailSchema,
    password: z.string().min(8, 'Password must be at least 8 characters'),
    alias: z
      .string()
      .trim()
      .min(1, 'Enter an alias')
      .max(32, 'Alias must be at most 32 characters')
      .optional(),
    avatarId: z
      .string()
      .refine(isAvatarId, { message: 'Choose one of the 8 character avatars' })
      .optional(),
    agreedToRules: z.literal(true).optional(),
    acceptedCommunityRules: z.literal(true).optional(),
  })
  .refine((data) => data.agreedToRules === true || data.acceptedCommunityRules === true, {
    message: COMMUNITY_RULES_REQUIRED_ERROR,
    path: ['agreedToRules'],
  })
  .refine((data) => Boolean(data.alias) === Boolean(data.avatarId), {
    message: 'Provide both alias and avatar, or set them up in onboarding',
    path: ['alias'],
  })

export const LoginSchema = z.object({
  email: BennettEmailSchema,
  password: z.string().min(1, 'Password is required'),
})

const VerifySignupSendSchema = z
  .object({
    purpose: z.literal('signup'),
    email: BennettEmailSchema,
    password: z.string().min(8, 'Password must be at least 8 characters'),
    agreedToRules: z.literal(true).optional(),
    acceptedCommunityRules: z.literal(true).optional(),
    alias: z.string().trim().min(1).max(32).optional(),
    avatarId: z.string().optional(),
  })
  .refine((data) => data.agreedToRules === true || data.acceptedCommunityRules === true, {
    message: COMMUNITY_RULES_REQUIRED_ERROR,
    path: ['agreedToRules'],
  })

const VerifyLoginSendSchema = z.object({
  purpose: z.literal('login'),
  email: BennettEmailSchema,
  password: z.string().min(1, 'Password is required'),
})

export const VerifySendSchema = z.union([VerifySignupSendSchema, VerifyLoginSendSchema])

export const VerifyConfirmSchema = z.object({
  email: BennettEmailSchema,
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Enter the 6-digit code from your email'),
  purpose: z.enum(['signup', 'login']),
})

export const OnboardingSchema = z.object({
  pseudonym: z
    .string()
    .trim()
    .min(1, 'Enter a display name')
    .max(32, 'Display name must be at most 32 characters'),
  avatarId: z.string().refine(isAvatarId, { message: 'Choose one of the 8 character avatars' }),
})

export const UpdateProfileSchema = z.object({
  avatarId: z.string().refine(isAvatarId, { message: 'Choose one of the 8 character avatars' }),
  bio: z.string().trim().max(240, 'Bio must be at most 240 characters').optional(),
})

export const CreateEntrySchema = z.object({
  content: z
    .string()
    .min(1, 'Entry cannot be empty')
    .max(1000, 'Entry cannot exceed 1000 characters'),
  imageUrl: z
    .string()
    .max(500)
    .refine((url) => url.startsWith('/uploads/entries/'), {
      message: 'Image must be uploaded through the journal editor',
    })
    .optional(),
})

export const UpdateEntrySchema = z.object({
  content: z
    .string()
    .min(1, 'Entry cannot be empty')
    .max(1000, 'Entry cannot exceed 1000 characters'),
})

export const CreateCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(500, 'Comment cannot exceed 500 characters'),
})

export const UpdateReportStatusSchema = z.object({
  status: z.nativeEnum(ReportStatus).refine(
    (s) => s === 'reviewed' || s === 'actioned' || s === 'dismissed',
    { message: 'Status must be reviewed, actioned, or dismissed' }
  ),
})

export const ModerationActionSchema = z.object({
  targetType: z.nativeEnum(TargetType),
  targetId: z.string().min(1),
  action: z.nativeEnum(ModAction),
  reason: z.string().trim().max(500).optional(),
})

export type RegisterInput = z.infer<typeof RegisterSchema>
export type CreateEntryInput = z.infer<typeof CreateEntrySchema>
