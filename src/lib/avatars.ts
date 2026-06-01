// Non-human avatar options for onboarding (8 choices).

export const AVATAR_IDS = [
  'robot',
  'mushroom',
  'star',
  'ghost',
  'cactus',
  'moon',
  'crystal',
  'cloud',
] as const

export type AvatarId = (typeof AVATAR_IDS)[number]

export function isAvatarId(value: string): value is AvatarId {
  return (AVATAR_IDS as readonly string[]).includes(value)
}

export const AVATARS: { id: AvatarId; label: string }[] = [
  { id: 'robot', label: 'Copper Bot' },
  { id: 'mushroom', label: 'Forest Cap' },
  { id: 'star', label: 'Nova Sprite' },
  { id: 'ghost', label: 'Soft Wisp' },
  { id: 'cactus', label: 'Desert Spike' },
  { id: 'moon', label: 'Night Orb' },
  { id: 'crystal', label: 'Gem Shard' },
  { id: 'cloud', label: 'Drift Puff' },
]
