import type { Role } from '@prisma/client'

/** Fields safe to return in any API response. Never include email or password. */
export type SafeUser = {
  alias: string | null
  avatarId: string | null
  bio: string | null
  role: Role
}

type UserForSafeSerialize = {
  alias: string | null
  avatarId: string | null
  bio: string | null
  role: Role
}

export function safeUser(user: UserForSafeSerialize): SafeUser {
  return {
    alias: user.alias,
    avatarId: user.avatarId,
    bio: user.bio,
    role: user.role,
  }
}
