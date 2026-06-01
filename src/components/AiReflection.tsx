'use client'

// AiReflection component — displays AI-generated reflection for an entry.

interface AiReflectionProps {
  reflection: string
}

export default function AiReflection({ reflection }: AiReflectionProps) {
  return (
    <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
      <p className="text-sm text-purple-900 italic">{reflection}</p>
    </div>
  )
}
