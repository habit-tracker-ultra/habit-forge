"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { calculateStreak, getStreakColor } from "@/lib/streak"
import { isHabitScheduledToday } from "@/lib/schedule"
import { CheckCircle2, Circle, Minus, Plus, BookOpen, Flame, Zap, ChevronDown, ChevronUp } from "lucide-react"

export default function TaskCard({ task, log, onUpdated }: any) {
  const [loading, setLoading] = useState(false)
  const [value, setValue] = useState(log?.value_logged ?? 0)
  const [showJournal, setShowJournal] = useState(false)
  const [journalNote, setJournalNote] = useState(log?.journal_note ?? "")
  const [savingNote, setSavingNote] = useState(false)

  const today = new Date().toISOString().split("T")[0]
  const isCompleted = log?.completed ?? false

  const streakStatus = isCompleted ? "perfect" : (
    task.streak > 0 && !task.buffer_used ? "buffer" :
    task.streak === 0 && task.last_logged_at ? "broken" : "none"
  )
  const streakColor = getStreakColor(streakStatus)

  if (!isHabitScheduledToday(task)) {
    return (
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "14px", padding: "14px 16px", opacity: 0.4, display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ width: "18px", height: "18px", borderRadius: "99px", background: "var(--border-default)" }} />
        <div>
          <div style={{ color: "var(--text-tertiary)", fontSize: "13px", fontWeight: 500 }}>{task.title}</div>
          <div style={{ color: "var(--text-tertiary)", fontSize: "10px", marginTop: "2px" }}>Not scheduled for today</div>
        </div>
      </div>
    )
  }

  const updateXp = async (userId: string, delta: number) => {
    if (!delta) return
    const { data: profile } = await supabase.from("profiles").select("xp").eq("id", userId).single()
    if (!profile) return
    await supabase.from("profiles").update({ xp: Math.max(0, (profile.xp ?? 0) + delta) }).eq("id", userId)
  }

  const updateTaskStreak = async (completed: boolean) => {
    const streakResult = calculateStreak(
      completed ? task.last_logged_at : today,
      task.streak,
      task.longest_streak,
      task.buffer_used,
      completed
    )

    await supabase.from("tasks").update({
      streak: streakResult.streak,
      longest_streak: streakResult.longestStreak,
      buffer_used: streakResult.bufferUsed,
      last_logged_at: completed ? today : task.last_logged_at,
    }).eq("id", task.id)

    return streakResult
  }

  const handleBinaryToggle = async () => {
    setLoading(true)
    const newCompleted = !isCompleted
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      return
    }

    const { error: logError } = log
      ? await supabase.from("logs").update({ completed: newCompleted, value_logged: newCompleted ? 1 : 0 }).eq("id", log.id)
      : await supabase.from("logs").insert({ user_id: user.id, task_id: task.id, log_date: today, completed: newCompleted, value_logged: newCompleted ? 1 : 0 })

    if (!logError) {
      if (newCompleted) {
        await updateTaskStreak(true)
        if (!isCompleted) await updateXp(user.id, task.xp_reward ?? 0)
      } else if (isCompleted) {
        await supabase.from("tasks").update({
          streak: Math.max(0, task.streak - 1),
          last_logged_at: task.last_logged_at,
        }).eq("id", task.id)
        await updateXp(user.id, -(task.xp_reward ?? 0))
      }
    }

    setLoading(false)
    onUpdated()
  }

  const handleQuantitativeUpdate = async (newValue: number) => {
    if (newValue < 0 || loading) return
    setValue(newValue)
    setLoading(true)
    const isNowCompleted = task.target_value > 0 ? newValue >= task.target_value : newValue > 0
    const wasCompleted = isCompleted
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      return
    }

    const { error: logError } = log
      ? await supabase.from("logs").update({ completed: isNowCompleted, value_logged: newValue }).eq("id", log.id)
      : await supabase.from("logs").insert({ user_id: user.id, task_id: task.id, log_date: today, completed: isNowCompleted, value_logged: newValue })

    if (!logError) {
      if (isNowCompleted && !wasCompleted) {
        await updateTaskStreak(true)
        await updateXp(user.id, task.xp_reward ?? 0)
      } else if (!isNowCompleted && wasCompleted) {
        await supabase.from("tasks").update({ streak: Math.max(0, task.streak - 1) }).eq("id", task.id)
        await updateXp(user.id, -(task.xp_reward ?? 0))
      }
    }

    setLoading(false)
    onUpdated()
  }

  const handleSaveNote = async () => {
    setSavingNote(true)
    if (log) await supabase.from("logs").update({ journal_note: journalNote }).eq("id", log.id)
    setSavingNote(false)
    setShowJournal(false)
  }

  return (
    <div style={{ background: isCompleted ? "rgba(74,222,128,0.04)" : "var(--bg-card)", border: isCompleted ? "1px solid rgba(74,222,128,0.2)" : "1px solid var(--border-subtle)", borderRadius: "14px", padding: "16px 20px", transition: "all 0.2s ease", opacity: loading ? 0.7 : 1 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
        <button onClick={task.task_type === "binary" ? handleBinaryToggle : undefined} disabled={loading} aria-label={isCompleted ? `Mark ${task.title} incomplete` : `Mark ${task.title} complete`} style={{ background: "none", border: "none", cursor: task.task_type === "binary" ? "pointer" : "default", padding: "2px", flexShrink: 0, marginTop: "1px", transition: "transform 0.15s ease" }}>
          {isCompleted ? <CheckCircle2 size={22} style={{ color: "var(--emerald)" }} strokeWidth={2.5} /> : <Circle size={22} style={{ color: "var(--text-tertiary)" }} strokeWidth={1.5} />}
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <span style={{ color: isCompleted ? "var(--text-tertiary)" : "var(--text-primary)", fontWeight: 600, fontSize: "14px", textDecoration: isCompleted ? "line-through" : "none" }}>{task.title}</span>
            {task.streak > 0 && <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", padding: "2px 8px", borderRadius: "99px", fontSize: "10px", fontWeight: 700, background: `${streakColor}15`, border: `1px solid ${streakColor}30`, color: streakColor }}><Flame size={9} />{task.streak}d</span>}
          </div>

          {task.description && <p style={{ color: "var(--text-tertiary)", fontSize: "12px", marginBottom: "8px" }}>{task.description}</p>}

          {task.task_type === "number" && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <button onClick={() => handleQuantitativeUpdate(value - 1)} disabled={loading || value <= 0} aria-label={`Decrease ${task.title}`} style={{ width: "28px", height: "28px", borderRadius: "8px", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-secondary)" }}><Minus size={12} /></button>
              <div style={{ textAlign: "center", minWidth: "70px" }}>
                <span style={{ color: "var(--text-primary)", fontWeight: 800, fontSize: "16px" }}>{value}</span>
                {task.target_value > 0 && <span style={{ color: "var(--text-tertiary)", fontSize: "12px" }}>/{task.target_value}</span>}
                {task.unit && <span style={{ color: "var(--text-tertiary)", fontSize: "11px", marginLeft: "3px" }}>{task.unit}</span>}
              </div>
              <button onClick={() => handleQuantitativeUpdate(value + 1)} disabled={loading} aria-label={`Increase ${task.title}`} style={{ width: "28px", height: "28px", borderRadius: "8px", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-secondary)" }}><Plus size={12} /></button>
              {task.target_value > 0 && <div style={{ flex: 1, height: "4px", background: "var(--border-subtle)", borderRadius: "99px", overflow: "hidden" }}><div style={{ height: "100%", width: `${Math.min((value / task.target_value) * 100, 100)}%`, background: value >= task.target_value ? "linear-gradient(90deg, #4ade80, #22c55e)" : "linear-gradient(90deg, #e8a83a, #f0bc5e)", borderRadius: "99px" }} /></div>}
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", padding: "2px 8px", borderRadius: "99px", background: "rgba(232,168,58,0.08)", border: "1px solid rgba(232,168,58,0.2)", color: "var(--gold)", fontSize: "10px", fontWeight: 700 }}><Zap size={9} />{task.xp_reward} XP</span>
            {isCompleted && <button onClick={() => setShowJournal(!showJournal)} aria-expanded={showJournal} style={{ display: "inline-flex", alignItems: "center", gap: "3px", padding: "2px 8px", borderRadius: "99px", background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.2)", color: "#60a5fa", fontSize: "10px", fontWeight: 700, cursor: "pointer" }}><BookOpen size={9} />{log?.journal_note ? "View Note" : "Add Note"}{showJournal ? <ChevronUp size={9} /> : <ChevronDown size={9} />}</button>}
          </div>

          {showJournal && <div style={{ marginTop: "10px" }} className="animate-fade-in">
            <textarea value={journalNote} onChange={e => setJournalNote(e.target.value)} placeholder="Reflect on this habit..." rows={2} style={{ width: "100%", background: "var(--bg-secondary)", border: "1px solid var(--border-default)", borderRadius: "10px", padding: "10px 14px", color: "var(--text-primary)", fontSize: "12px", resize: "none", outline: "none", fontFamily: "inherit" }} />
            <div style={{ display: "flex", gap: "8px", marginTop: "6px", justifyContent: "flex-end" }}>
              <button onClick={() => setShowJournal(false)} className="hf-btn-ghost" style={{ padding: "5px 12px", fontSize: "11px" }}>Cancel</button>
              <button onClick={handleSaveNote} disabled={savingNote} className="hf-btn-gold" style={{ padding: "5px 14px", fontSize: "11px" }}>{savingNote ? "Saving..." : "Save"}</button>
            </div>
          </div>}
        </div>
      </div>
    </div>
  )
}
