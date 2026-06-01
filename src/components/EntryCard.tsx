'use client'

// EntryCard component — displays a single journal entry with mood and reflection.

interface EntryCardProps {
  id: string
  content: string
  mood?: string | null
  aiReflection?: string | null
  alias: string
  reactionsCount: number
  userReacted?: boolean
}

export default function EntryCard({
  id,
  content,
  mood,
  aiReflection,
  alias,
  reactionsCount,
  userReacted,
}: EntryCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm text-gray-500">posted by {alias}</p>
          {mood && <p className="text-xs text-purple-600 mt-1">Mood: {mood}</p>}
        </div>
      </div>

      <p className="text-gray-800 mb-4">{content}</p>

      {aiReflection && (
        <div className="bg-purple-50 rounded p-3 mb-4">
          <p className="text-sm text-purple-900 italic">{aiReflection}</p>
        </div>
      )}

      <button
        className={`text-sm px-3 py-2 rounded ${userReacted ? 'bg-purple-200' : 'bg-gray-200'}`}
      >
        ♥ Felt this ({reactionsCount})
      </button>
    </div>
  )
}
