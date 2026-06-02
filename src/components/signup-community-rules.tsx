'use client'

import { useEffect, useState } from 'react'
import {
  COMMUNITY_RULES,
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
  const [ruleChecks, setRuleChecks] = useState<boolean[]>(() => COMMUNITY_RULES.map(() => false))

  useEffect(() => {
    if (!checked) {
      setRuleChecks(COMMUNITY_RULES.map(() => false))
    }
  }, [checked])

  const handleRuleToggle = (index: number, nextChecked: boolean) => {
    const nextRuleChecks = [...ruleChecks]
    nextRuleChecks[index] = nextChecked
    setRuleChecks(nextRuleChecks)
    onChange(nextRuleChecks.every(Boolean))
  }

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
            ? 'max-h-64 overflow-y-auto pr-2 space-y-3 font-body-md text-body-md text-on-surface-variant'
            : 'max-h-64 overflow-y-auto pr-2 space-y-3 text-sm text-gray-600'
        }
      >
        {COMMUNITY_RULES.map((rule, index) => (
          <li key={rule} className="list-none">
            <label
              className={
                isPixel
                  ? 'flex items-start gap-3 cursor-pointer font-body-md text-body-md text-on-surface-variant'
                  : 'flex items-start gap-3 cursor-pointer text-sm text-gray-700'
              }
            >
              <input
                type="checkbox"
                checked={ruleChecks[index]}
                onChange={(e) => handleRuleToggle(index, e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-primary border-2 border-on-background"
              />
              <span>{rule}</span>
            </label>
          </li>
        ))}
      </ul>
      <label
        className={
          isPixel
            ? 'font-label-sm text-label-sm text-on-surface-variant'
            : 'text-xs text-gray-600'
        }
      >
        Accounts are only created once all boxes are checked.
      </label>
    </div>
  )
}
