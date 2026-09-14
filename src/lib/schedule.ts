export type HabitTaskSchedule = {
  schedule_type?: string | null
  schedule_date?: string | null
  schedule_days?: number[] | null
  schedule_dates?: number[] | null
  start_date?: string | null
  end_date?: string | null
}

function localDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function parseLocalDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  const [, year, month, day] = match
  return new Date(Number(year), Number(month) - 1, Number(day))
}

export function isHabitScheduledToday(task: HabitTaskSchedule, today = new Date()): boolean {
  const type = task.schedule_type
  const todayString = localDateString(today)
  const dayOfWeek = today.getDay()
  const dayOfMonth = today.getDate()

  switch (type) {
    case "daily":
      return true

    case "day":
      return !task.schedule_date || task.schedule_date === todayString

    case "weekly":
    case "week":
      return task.schedule_days?.length ? task.schedule_days.includes(dayOfWeek) : true

    case "monthly":
    case "month":
      return task.schedule_dates?.length ? task.schedule_dates.includes(dayOfMonth) : true

    case "yearly":
    case "year": {
      if (!task.schedule_date) return true
      const date = parseLocalDate(task.schedule_date)
      return !!date && date.getMonth() === today.getMonth() && date.getDate() === dayOfMonth
    }

    case "custom":
    case "daterange": {
      const start = task.start_date ? parseLocalDate(task.start_date) : null
      const end = task.end_date ? parseLocalDate(task.end_date) : null
      if (!start && !end) return true
      const current = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      if (start && current < start) return false
      if (end && current > end) return false
      return true
    }

    default:
      return true
  }
}
