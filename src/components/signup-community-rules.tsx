'use client'

import {
  COMMUNITY_RULES,
  COMMUNITY_RULES_CHECKBOX_LABEL,
  COMMUNITY_RULES_HEADING,
} from '@/lib/community-rules'

type SignupCommunityRulesProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  variant?: 'pixel' | 'default'
}

export function SignupCommunityRules({
  checked,
  onChange,
  variant = 'pixel',
}: SignupCommunityRulesProps) {
  const isPixel = variant === 'pixel'

  return (
    <div
      className={
        isPixel
          ? 'border-2 border-on-background bg-surface-container-low p-4 flex flex-col gap-3'
          : 'border border-gray-200 bg-gray-50 rounded-lg p-4 flex flex-col gap-3'
      }
    >
      <p
        className={
          isPixel
            ? 'font-label-lg text-label-lg text-on-background uppercase'
            : 'text-sm font-semibold text-gray-800'
        }
      >
        {COMMUNITY_RULES_HEADING}
      </p>
      <ul
        className={
          isPixel
            ? 'list-disc pl-5 space-y-2 font-body-md text-body-md text-on-surface-variant'
            : 'list-disc pl-5 space-y-2 text-sm text-gray-600'
        }
      >
        {COMMUNITY_RULES.map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
      </ul>
      <label
        className={
          isPixel
            ? 'flex items-start gap-3 cursor-pointer font-label-sm text-label-sm text-on-background'
            : 'flex items-start gap-3 cursor-pointer text-sm text-gray-700'
        }
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-primary border-2 border-on-background"
        />
        <span>{COMMUNITY_RULES_CHECKBOX_LABEL}</span>
      </label>
    </div>
  )
}
