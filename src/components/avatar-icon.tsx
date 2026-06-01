import type { AvatarId } from '@/lib/avatars'

type AvatarIconProps = {
  id: AvatarId
  className?: string
}

export function AvatarIcon({ id, className = 'w-full h-full' }: AvatarIconProps) {
  const common = `${className} block`

  switch (id) {
    case 'robot':
      return (
        <svg className={common} viewBox="0 0 64 64" fill="none" aria-hidden>
          <rect x="14" y="18" width="36" height="32" fill="#b8c4d4" stroke="#1e1b16" strokeWidth="3" />
          <rect x="20" y="26" width="10" height="8" fill="#4fc3f7" stroke="#1e1b16" strokeWidth="2" />
          <rect x="34" y="26" width="10" height="8" fill="#4fc3f7" stroke="#1e1b16" strokeWidth="2" />
          <rect x="26" y="40" width="12" height="4" fill="#865046" stroke="#1e1b16" strokeWidth="2" />
          <rect x="24" y="8" width="16" height="10" fill="#e8a598" stroke="#1e1b16" strokeWidth="3" />
        </svg>
      )
    case 'mushroom':
      return (
        <svg className={common} viewBox="0 0 64 64" fill="none" aria-hidden>
          <ellipse cx="32" cy="28" rx="22" ry="16" fill="#e57373" stroke="#1e1b16" strokeWidth="3" />
          <circle cx="22" cy="24" r="4" fill="#fff8f0" opacity="0.7" />
          <circle cx="40" cy="30" r="3" fill="#fff8f0" opacity="0.7" />
          <rect x="26" y="36" width="12" height="20" fill="#f4ede3" stroke="#1e1b16" strokeWidth="3" />
        </svg>
      )
    case 'star':
      return (
        <svg className={common} viewBox="0 0 64 64" fill="none" aria-hidden>
          <path
            d="M32 8 L38 26 L58 26 L42 38 L48 56 L32 44 L16 56 L22 38 L6 26 L26 26 Z"
            fill="#ffd54f"
            stroke="#1e1b16"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <circle cx="32" cy="30" r="6" fill="#fff8f0" opacity="0.5" />
        </svg>
      )
    case 'ghost':
      return (
        <svg className={common} viewBox="0 0 64 64" fill="none" aria-hidden>
          <path
            d="M16 48 V24 Q16 10 32 10 Q48 10 48 24 V48 L42 44 L36 48 L30 44 L24 48 L18 44 Z"
            fill="#e8e2f8"
            stroke="#1e1b16"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <circle cx="26" cy="28" r="4" fill="#1e1b16" />
          <circle cx="38" cy="28" r="4" fill="#1e1b16" />
        </svg>
      )
    case 'cactus':
      return (
        <svg className={common} viewBox="0 0 64 64" fill="none" aria-hidden>
          <rect x="26" y="16" width="12" height="36" fill="#81c784" stroke="#1e1b16" strokeWidth="3" />
          <rect x="14" y="28" width="12" height="8" fill="#81c784" stroke="#1e1b16" strokeWidth="3" />
          <rect x="38" y="22" width="12" height="8" fill="#81c784" stroke="#1e1b16" strokeWidth="3" />
          <rect x="20" y="50" width="24" height="6" fill="#805533" stroke="#1e1b16" strokeWidth="2" />
        </svg>
      )
    case 'moon':
      return (
        <svg className={common} viewBox="0 0 64 64" fill="none" aria-hidden>
          <path
            d="M40 12 A22 22 0 1 0 44 48 A16 16 0 1 1 40 12 Z"
            fill="#b39ddb"
            stroke="#1e1b16"
            strokeWidth="3"
          />
          <circle cx="36" cy="24" r="3" fill="#fff8f0" opacity="0.4" />
        </svg>
      )
    case 'crystal':
      return (
        <svg className={common} viewBox="0 0 64 64" fill="none" aria-hidden>
          <path
            d="M32 6 L48 24 L40 58 L24 58 L16 24 Z"
            fill="#80deea"
            stroke="#1e1b16"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path d="M32 6 L32 58 M16 24 L48 24" stroke="#1e1b16" strokeWidth="2" opacity="0.35" />
        </svg>
      )
    case 'cloud':
      return (
        <svg className={common} viewBox="0 0 64 64" fill="none" aria-hidden>
          <ellipse cx="24" cy="36" rx="14" ry="12" fill="#fff8f0" stroke="#1e1b16" strokeWidth="3" />
          <ellipse cx="40" cy="34" rx="16" ry="14" fill="#fff8f0" stroke="#1e1b16" strokeWidth="3" />
          <ellipse cx="32" cy="28" rx="18" ry="14" fill="#e3f2fd" stroke="#1e1b16" strokeWidth="3" />
        </svg>
      )
    default:
      return null
  }
}
