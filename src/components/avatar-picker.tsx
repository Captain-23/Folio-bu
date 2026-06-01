'use client'

import { AVATARS, type AvatarId } from '@/lib/avatars'
import { AvatarIcon } from '@/components/avatar-icon'

type AvatarPickerProps = {
  value: AvatarId | null
  onChange: (id: AvatarId) => void
}

export function AvatarPicker({ value, onChange }: AvatarPickerProps) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {AVATARS.map((avatar) => {
        const selected = value === avatar.id
        return (
          <button
            key={avatar.id}
            type="button"
            onClick={() => onChange(avatar.id)}
            aria-pressed={selected}
            aria-label={avatar.label}
            className={`flex flex-col items-center gap-2 p-2 border-2 border-on-background transition-all ${
              selected
                ? 'bg-primary-container shadow-[4px_4px_0px_0px_#653d1e] -translate-x-[1px] -translate-y-[1px]'
                : 'bg-surface shadow-[2px_2px_0px_0px_#805533] hover:bg-surface-container-high'
            }`}
          >
            <div className="w-12 h-12">
              <AvatarIcon id={avatar.id} />
            </div>
            <span className="font-label-sm text-label-sm text-on-background text-center leading-tight">
              {avatar.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
