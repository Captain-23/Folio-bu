// Gemini AI helper.
// All AI features funnel through this file.
// Each function has a dedicated prompt and returns a typed result.
// All calls wrap in try/catch — failures return null gracefully.

import { GoogleGenerativeAI } from '@google/generative-ai'

const GEMINI_MODEL = 'gemini-1.5-flash'
const apiKey = process.env.GEMINI_API_KEY
const model = apiKey
  ? new GoogleGenerativeAI(apiKey).getGenerativeModel({ model: GEMINI_MODEL })
  : null

// Allowed mood values — must match the Prisma Mood enum exactly
const MOODS = ['happy', 'sad', 'stress', 'grateful', 'anxious'] as const
type MoodType = (typeof MOODS)[number]

// ─── MODERATION ───────────────────────────────────────────────────────────────
// Returns { safe: true } or { safe: false, reason: string }
export async function moderateEntry(content: string): Promise<{ safe: boolean; reason?: string }> {
  if (!model) return { safe: true }

  try {
    const prompt = `
You are a content moderation system for a college anonymous journaling app.
Review the following journal entry and respond with ONLY one of:
- "SAFE"
- "FLAGGED: <brief reason>" (for self-harm, hate speech, explicit content, or threats)

Do not explain. Do not add anything else. Just SAFE or FLAGGED: reason.

Entry: "${content}"
`.trim()

    const result = await model.generateContent(prompt)
    const text = result.response.text().trim()

    if (text === 'SAFE') return { safe: true }
    if (text.startsWith('FLAGGED:')) return { safe: false, reason: text.replace('FLAGGED: ', '') }

    return { safe: true } // default to safe if response is unexpected
  } catch {
    return { safe: true } // on error, don't block the entry — let admin review later
  }
}

// ─── MOOD TAGGING ─────────────────────────────────────────────────────────────
// Returns one mood string from the allowed list, or null on failure.
export async function tagMood(content: string): Promise<MoodType | null> {
  if (!model) return null

  try {
    const prompt = `
You are a mood classifier for a college journaling app.
Read the journal entry and respond with EXACTLY ONE word from this list:
happy, sad, stress, grateful, anxious

No punctuation. No explanation. Just the single word.

Entry: "${content}"
`.trim()

    const result = await model.generateContent(prompt)
    const mood = result.response.text().trim().toLowerCase() as MoodType

    return MOODS.includes(mood) ? mood : null
  } catch {
    return null
  }
}

// ─── EMPATHY REFLECTION ───────────────────────────────────────────────────────
// Returns a 1-2 sentence warm reflection, or null on failure.
export async function generateReflection(content: string): Promise<string | null> {
  if (!model) return null

  try {
    const prompt = `
You are a warm, non-judgemental voice responding to a college student's anonymous journal entry.
Write 1-2 sentences that:
- Acknowledge what they shared without minimising it
- Feel human and empathetic, not clinical
- Never give advice, never suggest therapy, never use the word "valid"
- Are under 40 words total

Respond with ONLY the reflection. No intro, no quotes, no label.

Journal entry: "${content}"
`.trim()

    const result = await model.generateContent(prompt)
    return result.response.text().trim() || null
  } catch {
    return null
  }
}

// ─── DAILY PROMPT ─────────────────────────────────────────────────────────────
// Returns a single journaling question under 15 words.
export async function generateDailyPrompt(): Promise<string | null> {
  if (!model) return null

  try {
    const day = new Date().toLocaleDateString('en-US', { weekday: 'long' })
    const prompt = `
Generate ONE journaling prompt for college students on a ${day}.
Rules:
- Open-ended question only
- Under 15 words
- Thoughtful and introspective
- No clichés
- No quotation marks

Respond with ONLY the question.
`.trim()

    const result = await model.generateContent(prompt)
    return result.response.text().trim() || null
  } catch {
    return null
  }
}

// ─── WEEKLY REFLECTION ────────────────────────────────────────────────────────
// Takes an array of entry strings, returns a poetic weekly summary.
export async function generateWeeklyReflection(entries: string[]): Promise<string | null> {
  if (entries.length < 2) return null
  if (!model) return null

  try {
    const entriesText = entries.map((e, i) => `Entry ${i + 1}: "${e}"`).join('\n')
    const prompt = `
You are writing a private, poetic end-of-week reflection for a college student
based on their anonymous journal entries from this week.

Write 3-4 sentences that:
- Capture the emotional arc of their week
- Feel warm and literary, not clinical
- Notice patterns or shifts in feeling
- End on something quietly hopeful

Respond with ONLY the reflection. No labels, no quotes.

${entriesText}
`.trim()

    const result = await model.generateContent(prompt)
    return result.response.text().trim() || null
  } catch {
    return null
  }
}
