// Maps avatarId to display properties for comment bubbles.
// Uses the first letter of the avatar label + themed colours.

type AvatarDisplay = {
  letter: string
  bg: string
  text: string
}

export const AVATAR_DISPLAY: Record<string, AvatarDisplay> = {
  robot:    { letter: 'R', bg: 'bg-primary-container',   text: 'text-on-primary-container' },
  mushroom: { letter: 'M', bg: 'bg-secondary-container', text: 'text-on-secondary-container' },
  star:     { letter: 'S', bg: 'bg-tertiary-container',  text: 'text-on-tertiary-container' },
  ghost:    { letter: 'G', bg: 'bg-surface-container-highest', text: 'text-on-surface' },
  cactus:   { letter: 'C', bg: 'bg-secondary-container', text: 'text-on-secondary-container' },
  moon:     { letter: 'M', bg: 'bg-primary-container',   text: 'text-on-primary-container' },
  crystal:  { letter: 'C', bg: 'bg-tertiary-container',  text: 'text-on-tertiary-container' },
  cloud:    { letter: 'C', bg: 'bg-surface-container-highest', text: 'text-on-surface' },
  _default: { letter: '?', bg: 'bg-surface-container-highest', text: 'text-on-surface' },
}
