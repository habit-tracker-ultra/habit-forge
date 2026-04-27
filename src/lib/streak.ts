// Streak Status Types
export type StreakStatus = "perfect" | "buffer" | "broken" | "none"

export interface StreakResult {
  streak: number
  longestStreak: number
  bufferUsed: boolean
  status: StreakStatus
}

export function calculateStreak(
  lastLoggedAt: string | null,
  currentStreak: number,
  longestStreak: number,
  bufferUsed: boolean,
  completed: boolean
): StreakResult {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // No previous log - fresh start
  if (!lastLoggedAt) {
    if (completed) {
      return {
        streak: 1,
        longestStreak: Math.max(1, longestStreak),
        bufferUsed: false,
        status: "perfect",
      }
    }
    return { streak: 0, longestStreak, bufferUsed: false, status: "none" }
  }

  const lastLog = new Date(lastLoggedAt)
  lastLog.setHours(0, 0, 0, 0)

  const diffDays = Math.floor(
    (today.getTime() - lastLog.getTime()) / (1000 * 60 * 60 * 24)
  )

  // Completed today
  if (completed) {
    if (diffDays <= 1) {
      // Consecutive day or same day
      const newStreak = diffDays === 0 ? currentStreak : currentStreak + 1
      return {
        streak: newStreak,
        longestStreak: Math.max(newStreak, longestStreak),
        bufferUsed: false,
        status: "perfect",
      }
    } else if (diffDays === 2 && !bufferUsed) {
      // Missed 1 day but buffer available - use it
      const newStreak = currentStreak + 1
      return {
        streak: newStreak,
        longestStreak: Math.max(newStreak, longestStreak),
        bufferUsed: true,
        status: "buffer",
      }
    } else {
      // Streak broken - start fresh
      return {
        streak: 1,
        longestStreak,
        bufferUsed: false,
        status: "perfect",
      }
    }
  }

  // Not completed - check if streak is broken
  if (diffDays === 1) {
    // Missed today but buffer not used yet
    if (!bufferUsed) {
      return {
        streak: currentStreak,
        longestStreak,
        bufferUsed: false,
        status: "buffer",
      }
    }
    // Buffer already used - streak broken
    return { streak: 0, longestStreak, bufferUsed: false, status: "broken" }
  }

  if (diffDays >= 2) {
    return { streak: 0, longestStreak, bufferUsed: false, status: "broken" }
  }

  return {
    streak: currentStreak,
    longestStreak,
    bufferUsed,
    status: currentStreak > 0 ? "perfect" : "none",
  }
}

export function getStreakColor(status: StreakStatus): string {
  switch (status) {
    case "perfect": return "#4ade80"  // Green
    case "buffer": return "#e8a83a"   // Gold
    case "broken": return "#ef4444"   // Red
    default: return "#6b7280"         // Gray
  }
}

export function getStreakEmoji(status: StreakStatus): string {
  switch (status) {
    case "perfect": return "🔥"
    case "buffer": return "⚡"
    case "broken": return "💔"
    default: return "⭕"
  }
}

export function getStreakLabel(status: StreakStatus): string {
  switch (status) {
    case "perfect": return "On Fire!"
    case "buffer": return "Buffer Used"
    case "broken": return "Streak Lost"
    default: return "Not Started"
  }
}
