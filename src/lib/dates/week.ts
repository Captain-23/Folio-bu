/** Monday 00:00:00 of the week containing `date` (schema: weekStart is ISO week start). */
export function getWeekStartMonday(date = new Date()): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const daysSinceMonday = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - daysSinceMonday)
  return d
}
