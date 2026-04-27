"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/context/AuthContext"
import CreateTaskModal from "@/components/tasks/CreateTaskModal"
import TaskCard from "@/components/tasks/TaskCard"
import { Plus, Target, Flame, Zap, Calendar, TrendingUp } from "lucide-react"

export default function DashboardPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [notebooks, setNotebooks] = useState<any[]>([])
  const [profile, setProfile] = useState<any>({ xp: 0, level: 1 })
  const [loading, setLoading] = useState(true)
  const [showCreateTask, setShowCreateTask] = useState(false)

  const today = new Date()
  const todayStr = today.toISOString().split("T")[0]
  const dayOfWeek = today.getDay()

  const greeting = () => {
    const hour = today.getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 17) return "Good Afternoon"
    return "Good Evening"
  }

  const todayFormatted = today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [tasksRes, logsRes, notebooksRes, profileRes] = await Promise.all([
      supabase.from("tasks").select("*").eq("is_active", true).order("created_at"),
      supabase.from("logs").select("*").eq("log_date", todayStr),
      supabase.from("notebooks").select("*"),
      supabase.from("profiles").select("xp, level").eq("id", user?.id).single(),
    ])
    if (tasksRes.data) setTasks(tasksRes.data)
    if (logsRes.data) setLogs(logsRes.data)
    if (notebooksRes.data) setNotebooks(notebooksRes.data)
    if (profileRes.data) setProfile(profileRes.data)
    setLoading(false)
  }, [todayStr, user?.id])

  useEffect(() => { fetchData() }, [fetchData])

  const todaysTasks = tasks.filter(task => {
    if (task.schedule_type === "daily") return true
    return task.schedule_days?.includes(dayOfWeek)
  })

  const completedCount = todaysTasks.filter(task => logs.find(l => l.task_id === task.id)?.completed).length
  const completionRate = todaysTasks.length > 0 ? Math.round((completedCount / todaysTasks.length) * 100) : 0
  const totalStreak = tasks.reduce((sum, t) => sum + (t.streak || 0), 0)
  const level = Math.floor((profile?.xp ?? 0) / 100) + 1

  return (
    <div className="hf-page animate-fade-in">

      {/* Header */}
      <div
        className="hf-page-header"
        style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px" }}
      >
        <div>
          <h1 style={{ color: "var(--text-primary)", fontWeight: 800, fontSize: "clamp(20px, 4vw, 26px)", letterSpacing: "-0.03em", marginBottom: "4px" }}>
            {greeting()} 👋
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
            {todayFormatted} &nbsp;·&nbsp;
            <span style={{ color: "var(--gold)", fontWeight: 600 }}>Level {level}</span>
          </p>
        </div>
        <button
          onClick={() => setShowCreateTask(true)}
          className="hf-btn-gold"
          style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px", fontSize: "13px", whiteSpace: "nowrap" }}
        >
          <Plus size={16} strokeWidth={2.5} />
          Add Habit
        </button>
      </div>

      {/* Stats */}
      <div className="hf-grid-4" style={{ marginBottom: "20px" }}>
        {[
          { label: "TODAY", value: `${completedCount}/${todaysTasks.length}`, sub: `${completionRate}% done`, icon: Target, color: "#4ade80" },
          { label: "STREAK", value: `${totalStreak}d`, sub: "combined", icon: Flame, color: "#e8a83a" },
          { label: "TOTAL XP", value: `${profile?.xp ?? 0}`, sub: `Level ${level}`, icon: Zap, color: "#a78bfa" },
          { label: "DATE", value: today.getDate().toString(), sub: today.toLocaleDateString("en-US", { month: "short", year: "numeric" }), icon: Calendar, color: "#60a5fa" },
        ].map(stat => (
          <div key={stat.label} className="hf-card" style={{ padding: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
              <span style={{ color: "var(--text-tertiary)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em" }}>{stat.label}</span>
              <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: `${stat.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <stat.icon size={13} style={{ color: stat.color }} />
              </div>
            </div>
            <div style={{ color: "var(--text-primary)", fontWeight: 800, fontSize: "clamp(18px, 3vw, 24px)", letterSpacing: "-0.02em", marginBottom: "2px" }}>
              {stat.value}
            </div>
            <div style={{ color: "var(--text-tertiary)", fontSize: "11px" }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Progress */}
      {todaysTasks.length > 0 && (
        <div className="hf-card" style={{ padding: "16px 20px", marginBottom: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <TrendingUp size={14} style={{ color: "var(--gold)" }} />
              <span style={{ color: "var(--text-secondary)", fontSize: "13px", fontWeight: 600 }}>Daily Progress</span>
            </div>
            <span style={{ color: completionRate === 100 ? "var(--emerald)" : "var(--gold)", fontWeight: 800, fontSize: "14px" }}>
              {completionRate}%
            </span>
          </div>
          <div style={{ height: "6px", background: "var(--border-subtle)", borderRadius: "99px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${completionRate}%`, background: completionRate === 100 ? "linear-gradient(90deg, #4ade80, #22c55e)" : "linear-gradient(90deg, #e8a83a, #f0bc5e)", borderRadius: "99px", transition: "width 0.6s ease" }} />
          </div>
          {completionRate === 100 && (
            <div style={{ color: "var(--emerald)", fontSize: "11px", fontWeight: 700, marginTop: "8px", textAlign: "center", letterSpacing: "0.04em" }}>
              ✦ ALL HABITS COMPLETE ✦
            </div>
          )}
        </div>
      )}

      {/* Tasks */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <h2 style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "15px", letterSpacing: "-0.01em" }}>
              Today&apos;s Habits
            </h2>
            {todaysTasks.length > 0 && (
              <span style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)", color: "var(--text-secondary)", padding: "2px 8px", borderRadius: "99px", fontSize: "11px", fontWeight: 600 }}>
                {todaysTasks.length}
              </span>
            )}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-tertiary)", fontSize: "13px" }}>
            Loading habits...
          </div>
        ) : todaysTasks.length === 0 ? (
          <div className="hf-card" style={{ padding: "48px 32px", textAlign: "center" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <Target size={22} style={{ color: "var(--text-tertiary)" }} />
            </div>
            <div style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "15px", marginBottom: "6px" }}>No Habits Scheduled</div>
            <div style={{ color: "var(--text-tertiary)", fontSize: "13px", marginBottom: "20px" }}>
              Create your first habit and start building momentum.
            </div>
            <button onClick={() => setShowCreateTask(true)} className="hf-btn-gold" style={{ padding: "10px 24px", fontSize: "13px" }}>
              Create First Habit
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {todaysTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                log={logs.find(l => l.task_id === task.id) ?? null}
                onUpdated={fetchData}
              />
            ))}
          </div>
        )}
      </div>

      {showCreateTask && (
        <CreateTaskModal
          notebooks={notebooks}
          onClose={() => setShowCreateTask(false)}
          onCreated={fetchData}
        />
      )}
    </div>
  )
}
