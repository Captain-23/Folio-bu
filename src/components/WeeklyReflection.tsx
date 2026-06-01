'use client'

// WeeklyReflection component — displays AI-generated weekly summary.

interface WeeklyReflectionProps {
  reflection: string
}

export default function WeeklyReflection({ reflection }: WeeklyReflectionProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Your week in reflection</h2>
      <p className="text-gray-800 leading-relaxed">{reflection}</p>
    </div>
  )
}
