'use client'

// Composer component — form for writing a new journal entry.

export default function Composer() {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">Write an entry</h2>
      <textarea
        placeholder="What's on your mind?"
        className="w-full border border-gray-300 rounded p-3 mb-4 focus:outline-none focus:border-purple-500"
        rows={5}
      />
      <button className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700">
        Post
      </button>
    </div>
  )
}
