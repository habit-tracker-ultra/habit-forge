"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/context/AuthContext"
import { Award, TrendingUp, Target, Clock, Flame, Star, Zap, BarChart2 } from "lucide-react"
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

type FilterType = "week" | "month" | "all"
const XP_PER_LEVEL = 100

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: "10px", padding: "10px 14px", boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}>
        <p style={{ color: "var(--text-tertiary)", fontSize: "11px", marginBottom: "4px" }}>{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color, fontSize: "13px", fontWeight: 700 }}>
            {p.name}: {p.value}{p.name === "rate" || p.name === "Completion" ? "%" : p.name === "hours" ? "h" : "d"}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function InsightsPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [tasks, setTasks] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [timeLogs, setTimeLogs] = useState<any[]>([])
  const [timeCategories, setTimeCategories] = useState<any[]>([])
  const [filter, setFilter] = useState<FilterType>("week")
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [profileRes, tasksRes, logsRes, timeLogsRes, timeCatsRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user?.id).single(),
      supabase.from("tasks").select("*").eq("is_active", true),
      supabase.from("logs").select("*").order("log_date", { ascending: true }),
      supabase.from("time_logs").select("*").order("log_date", { ascending: true }),
      supabase.from("time_categories").select("*"),
    ])
    if (profileRes.data) setProfile(profileRes.data)
    if (tasksRes.data) setTasks(tasksRes.data)
    if (logsRes.data) setLogs(logsRes.data)
    if (timeLogsRes.data) setTimeLogs(timeLogsRes.data)
    if (timeCatsRes.data) setTimeCategories(timeCatsRes.data)
    setLoading(false)
  }, [user?.id])

  useEffect(() => { fetchData() }, [fetchData])

  const getFilteredLogs = (logsData: any[]) => {
    const now = new Date()
    const cutoff = new Date()
    if (filter === "week") cutoff.setDate(now.getDate() - 7)
    else if (filter === "month") cutoff.setDate(now.getDate() - 30)
    else return logsData
    return logsData.filter(l => new Date(l.log_date) >= cutoff)
  }

  const filteredLogs = getFilteredLogs(logs)
  const currentXP = profile?.xp ?? 0
  const currentLevel = Math.floor(currentXP / XP_PER_LEVEL) + 1
  const xpInCurrentLevel = currentXP % XP_PER_LEVEL
  const xpProgress = (xpInCurrentLevel / XP_PER_LEVEL) * 100
  const totalCompleted = filteredLogs.filter(l => l.completed).length
  const completionRate = filteredLogs.length > 0 ? Math.round((totalCompleted / filteredLogs.length) * 100) : 0
  const bestStreak = tasks.reduce((max, t) => Math.max(max, t.longest_streak ?? 0), 0)
  const totalHours = timeLogs.reduce((sum, l) => sum + Number(l.hours_logged ?? 0), 0)

  const completionChartData = (() => {
    const days = filter === "week" ? 7 : filter === "month" ? 30 : 14
    return Array.from({ length: days }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (days - 1 - i))
      const dateStr = date.toISOString().split("T")[0]
      const dayLogs = logs.filter(l => l.log_date === dateStr)
      const completed = dayLogs.filter(l => l.completed).length
      const total = dayLogs.length
      return {
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        rate: total > 0 ? Math.round((completed / total) * 100) : 0,
        completed,
      }
    })
  })()

  const pieChartData = timeCategories.map(cat => {
    const catLogs = timeLogs.filter(l => l.category_id === cat.id)
    const total = catLogs.reduce((sum, l) => sum + Number(l.hours_logged ?? 0), 0)
    return { name: cat.name, value: parseFloat(total.toFixed(1)), color: cat.color, icon: cat.icon }
  }).filter(d => d.value > 0)

  const taskBarData = tasks.map(t => ({
    name: t.title.length > 10 ? t.title.substring(0, 10) + "…" : t.title,
    Current: t.streak ?? 0,
    Best: t.longest_streak ?? 0,
  })).slice(0, 8)

  const weeklyHoursData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    const dateStr = date.toISOString().split("T")[0]
    const dayHours = timeLogs.filter(l => l.log_date === dateStr).reduce((sum, l) => sum + Number(l.hours_logged ?? 0), 0)
    return {
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      hours: parseFloat(dayHours.toFixed(1)),
    }
  })

  if (loading) {
    return (
      <div style={{ padding: "32px", textAlign: "center", paddingTop: "120px" }}>
        <div style={{ color: "var(--gold)", fontSize: "14px", fontWeight: 600, letterSpacing: "0.06em" }} className="animate-pulse">
          LOADING INSIGHTS...
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: "32px", maxWidth: "1400px" }} className="animate-fade-in">

      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ color: "var(--text-primary)", fontWeight: 800, fontSize: "26px", letterSpacing: "-0.03em", marginBottom: "4px" }}>
          Insights
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
          Performance analytics and progress tracking
        </p>
      </div>

      {/* Level Card */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(232,168,58,0.1) 0%, var(--bg-card) 50%, rgba(74,222,128,0.05) 100%)",
          border: "1px solid var(--border-gold)",
          borderRadius: "20px",
          padding: "28px 32px",
          marginBottom: "24px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background Pattern */}
        <div style={{ position: "absolute", right: "-40px", top: "-40px", width: "200px", height: "200px", borderRadius: "99px", background: "rgba(232,168,58,0.04)", pointerEvents: "none" }} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "56px", height: "56px", borderRadius: "16px",
                background: "linear-gradient(135deg, rgba(232,168,58,0.3), rgba(232,168,58,0.1))",
                border: "1px solid rgba(232,168,58,0.4)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Star size={24} style={{ color: "var(--gold)" }} strokeWidth={2} />
            </div>
            <div>
              <div style={{ color: "var(--text-tertiary)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", marginBottom: "4px" }}>
                CURRENT RANK
              </div>
              <div style={{ color: "var(--gold)", fontWeight: 900, fontSize: "36px", letterSpacing: "-0.04em", lineHeight: 1 }}>
                LVL {currentLevel}
              </div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "var(--text-tertiary)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", marginBottom: "4px" }}>
              TOTAL XP
            </div>
            <div style={{ color: "var(--text-primary)", fontWeight: 800, fontSize: "28px", letterSpacing: "-0.03em" }}>
              {currentXP.toLocaleString()}
            </div>
            <div style={{ color: "var(--text-tertiary)", fontSize: "11px", marginTop: "2px" }}>
              {XP_PER_LEVEL - xpInCurrentLevel} XP until Level {currentLevel + 1}
            </div>
          </div>
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ color: "var(--text-tertiary)", fontSize: "11px" }}>Level {currentLevel}</span>
            <span style={{ color: "var(--gold)", fontSize: "11px", fontWeight: 700 }}>
              {xpInCurrentLevel} / {XP_PER_LEVEL} XP
            </span>
            <span style={{ color: "var(--text-tertiary)", fontSize: "11px" }}>Level {currentLevel + 1}</span>
          </div>
          <div style={{ height: "8px", background: "var(--bg-secondary)", borderRadius: "99px", overflow: "hidden", border: "1px solid var(--border-subtle)" }}>
            <div
              style={{
                height: "100%",
                width: `${xpProgress}%`,
                background: "linear-gradient(90deg, #e8a83a, #f0bc5e, #e8a83a)",
                backgroundSize: "200% 100%",
                borderRadius: "99px",
                transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                animation: "shimmer 2s infinite linear",
              }}
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "28px" }}>
        {[
          { label: "COMPLETION RATE", value: `${completionRate}%`, icon: Target, color: "#4ade80", sub: `${filter} period` },
          { label: "BEST STREAK", value: `${bestStreak}d`, icon: Flame, color: "#e8a83a", sub: "all time record" },
          { label: "HOURS TRACKED", value: `${totalHours.toFixed(0)}h`, icon: Clock, color: "#60a5fa", sub: "total logged" },
          { label: "HABITS DONE", value: totalCompleted.toString(), icon: Award, color: "#a78bfa", sub: `in selected period` },
        ].map(stat => (
          <div key={stat.label} className="hf-card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <span style={{ color: "var(--text-tertiary)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em" }}>
                {stat.label}
              </span>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: `${stat.color}15`, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${stat.color}25` }}>
                <stat.icon size={15} style={{ color: stat.color }} />
              </div>
            </div>
            <div style={{ color: "var(--text-primary)", fontWeight: 800, fontSize: "28px", letterSpacing: "-0.03em", marginBottom: "3px" }}>
              {stat.value}
            </div>
            <div style={{ color: "var(--text-tertiary)", fontSize: "11px" }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "24px", background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "12px", padding: "4px", width: "fit-content" }}>
        {(["week", "month", "all"] as FilterType[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "7px 18px", borderRadius: "8px", fontSize: "12px", fontWeight: 600,
              cursor: "pointer", transition: "all 0.15s ease", border: "none",
              background: filter === f ? "var(--gold)" : "transparent",
              color: filter === f ? "#0a0a0b" : "var(--text-secondary)",
              letterSpacing: "0.02em",
            }}
          >
            {f === "week" ? "7 Days" : f === "month" ? "30 Days" : "All Time"}
          </button>
        ))}
      </div>

      {/* Charts Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px", marginBottom: "16px" }}>

        {/* Completion Trend */}
        <div className="hf-card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(74,222,128,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <TrendingUp size={15} style={{ color: "var(--emerald)" }} />
            </div>
            <div>
              <div style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "14px" }}>Completion Trend</div>
              <div style={{ color: "var(--text-tertiary)", fontSize: "11px" }}>Daily habit completion rate</div>
            </div>
          </div>
          {completionChartData.some(d => d.rate > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={completionChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fill: "var(--text-tertiary)", fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: "var(--text-tertiary)", fontSize: 10 }} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="rate" stroke="#4ade80" strokeWidth={2.5} dot={{ fill: "#4ade80", r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: "#4ade80" }} name="Completion" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: "200px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <TrendingUp size={32} style={{ color: "var(--border-default)" }} />
              <span style={{ color: "var(--text-tertiary)", fontSize: "12px" }}>Complete habits to see your trend</span>
            </div>
          )}
        </div>

        {/* Time Distribution */}
        <div className="hf-card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(232,168,58,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Clock size={15} style={{ color: "var(--gold)" }} />
            </div>
            <div>
              <div style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "14px" }}>Time Distribution</div>
              <div style={{ color: "var(--text-tertiary)", fontSize: "11px" }}>Hours by category</div>
            </div>
          </div>
          {pieChartData.length > 0 ? (
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <ResponsiveContainer width="55%" height={200}>
                <PieChart>
                  <Pie data={pieChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="value">
                    {pieChartData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                {pieChartData.map((entry, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "99px", background: entry.color, flexShrink: 0 }} />
                    <span style={{ color: "var(--text-secondary)", fontSize: "11px", flex: 1 }}>{entry.name}</span>
                    <span style={{ color: "var(--text-primary)", fontSize: "11px", fontWeight: 700 }}>{entry.value}h</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ height: "200px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <Clock size={32} style={{ color: "var(--border-default)" }} />
              <span style={{ color: "var(--text-tertiary)", fontSize: "12px" }}>Log time to see distribution</span>
            </div>
          )}
        </div>

        {/* Streak Chart */}
        <div className="hf-card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(232,168,58,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Flame size={15} style={{ color: "var(--gold)" }} />
            </div>
            <div>
              <div style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "14px" }}>Habit Streaks</div>
              <div style={{ color: "var(--text-tertiary)", fontSize: "11px" }}>Current vs best streaks</div>
            </div>
          </div>
          {taskBarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={taskBarData} barGap={3} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" tick={{ fill: "var(--text-tertiary)", fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: "var(--text-tertiary)", fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Current" fill="#4ade80" radius={[4, 4, 0, 0]} name="Current" />
                <Bar dataKey="Best" fill="#e8a83a" radius={[4, 4, 0, 0]} name="Best" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: "200px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <Flame size={32} style={{ color: "var(--border-default)" }} />
              <span style={{ color: "var(--text-tertiary)", fontSize: "12px" }}>Build streaks to see data</span>
            </div>
          )}
        </div>

        {/* Weekly Hours */}
        <div className="hf-card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(96,165,250,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BarChart2 size={15} style={{ color: "#60a5fa" }} />
            </div>
            <div>
              <div style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "14px" }}>Daily Hours</div>
              <div style={{ color: "var(--text-tertiary)", fontSize: "11px" }}>Last 7 days logged</div>
            </div>
          </div>
          {weeklyHoursData.some(d => d.hours > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyHoursData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" tick={{ fill: "var(--text-tertiary)", fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: "var(--text-tertiary)", fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="hours" radius={[4, 4, 0, 0]} name="Hours">
                  {weeklyHoursData.map((entry, index) => (
                    <Cell key={index} fill={entry.hours >= 8 ? "#4ade80" : entry.hours >= 4 ? "#e8a83a" : "#60a5fa"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: "200px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <BarChart2 size={32} style={{ color: "var(--border-default)" }} />
              <span style={{ color: "var(--text-tertiary)", fontSize: "12px" }}>Log hours to see daily pattern</span>
            </div>
          )}
        </div>
      </div>

      {/* Top Habits Table */}
      {tasks.length > 0 && (
        <div className="hf-card" style={{ overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(232,168,58,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Award size={15} style={{ color: "var(--gold)" }} />
            </div>
            <div>
              <div style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "14px" }}>Top Performing Habits</div>
              <div style={{ color: "var(--text-tertiary)", fontSize: "11px" }}>Ranked by current streak</div>
            </div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--bg-elevated)" }}>
                {["RANK", "HABIT", "STREAK", "BEST", "XP REWARD"].map((h, i) => (
                  <th key={h} style={{ padding: "10px 20px", color: "var(--text-tertiary)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textAlign: i === 0 ? "center" : i > 1 ? "center" : "left" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tasks.sort((a, b) => (b.streak ?? 0) - (a.streak ?? 0)).slice(0, 6).map((task, index) => (
                <tr
                  key={task.id}
                  style={{
                    borderTop: "1px solid var(--border-subtle)",
                    background: index === 0 ? "rgba(232,168,58,0.03)" : "transparent",
                    transition: "background 0.15s ease",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--bg-elevated)" }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = index === 0 ? "rgba(232,168,58,0.03)" : "transparent" }}
                >
                  <td style={{ padding: "14px 20px", textAlign: "center" }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      width: "24px", height: "24px", borderRadius: "6px", fontSize: "11px", fontWeight: 800,
                      background: index === 0 ? "rgba(232,168,58,0.15)" : index === 1 ? "rgba(156,163,175,0.1)" : index === 2 ? "rgba(180,120,60,0.1)" : "var(--bg-elevated)",
                      color: index === 0 ? "var(--gold)" : index === 1 ? "#9ca3af" : index === 2 ? "#b4783c" : "var(--text-tertiary)",
                    }}>
                      {index + 1}
                    </span>
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <span style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "13px" }}>{task.title}</span>
                  </td>
                  <td style={{ padding: "14px 20px", textAlign: "center" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "#4ade80", fontWeight: 700, fontSize: "13px" }}>
                      <Flame size={12} /> {task.streak ?? 0}d
                    </span>
                  </td>
                  <td style={{ padding: "14px 20px", textAlign: "center" }}>
                    <span style={{ color: "var(--gold)", fontWeight: 700, fontSize: "13px" }}>
                      {task.longest_streak ?? 0}d
                    </span>
                  </td>
                  <td style={{ padding: "14px 20px", textAlign: "center" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", color: "#a78bfa", fontWeight: 700, fontSize: "12px", background: "rgba(167,139,250,0.1)", padding: "3px 10px", borderRadius: "99px", border: "1px solid rgba(167,139,250,0.2)" }}>
                      <Zap size={10} /> {task.xp_reward} XP
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  )
}
