// Generates a random, permanent alias for each new user.
// The alias is assigned once at registration and never changes.
// Format: [Adjective][Animal]#[4-digit number]  →  "StormyOwl#4821"

const ADJECTIVES = [
  'Stormy',
  'Silent',
  'Velvet',
  'Hollow',
  'Silver',
  'Misty',
  'Crimson',
  'Golden',
  'Faded',
  'Lunar',
  'Quiet',
  'Distant',
  'Amber',
  'Frozen',
  'Wandering',
  'Restless',
  'Calm',
  'Heavy',
  'Bright',
  'Pale',
]

const ANIMALS = [
  'Owl',
  'Fox',
  'Crow',
  'Loon',
  'Wolf',
  'Hawk',
  'Heron',
  'Moth',
  'Lynx',
  'Crane',
  'Raven',
  'Deer',
  'Bear',
  'Swan',
  'Finch',
  'Mole',
  'Vole',
  'Kite',
  'Wren',
  'Dove',
]

export function generateAlias(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)]
  const num = String(Math.floor(Math.random() * 9000) + 1000) // 1000–9999
  return `${adj}${animal}#${num}`
}
