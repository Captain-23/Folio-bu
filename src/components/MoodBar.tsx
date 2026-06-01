'use client'

// MoodBar component — displays aggregated mood distribution.

interface MoodBarProps {
  moods: Array<{ mood: string; percentage: number; count: number }>
  total: number
}

export default function MoodBar({ moods, total }: MoodBarProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">Campus mood (24h)</h2>
      <div className="space-y-3">
        {moods.map((m) => (
          <div key={m.mood}>
            <div className="flex justify-between mb-1">
              <span className="text-sm text-gray-700 capitalize">{m.mood}</span>
              <span className="text-sm text-gray-500">{m.percentage}%</span>
            </div>
            <div className="bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full"
                style={{ width: `${m.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-4">{total} entries in the last 24 hours</p>
    </div>
  )
}
