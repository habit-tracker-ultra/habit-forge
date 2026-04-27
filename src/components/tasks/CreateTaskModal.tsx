"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/context/AuthContext"
import { X, Plus, CheckSquare, BarChart2, Zap, Calendar } from "lucide-react"

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export default function CreateTaskModal({ notebooks, onClose, onCreated }: any) {
  const { user } = useAuth()
  
  // Basic Info
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [notebookId, setNotebookId] = useState("")
  
  // Task Type
  const [taskType, setTaskType] = useState<"binary" | "number">("binary")
  const [customTarget, setCustomTarget] = useState(1)
  const [unit, setUnit] = useState("")
  
  // Schedule Type
  const [scheduleType, setScheduleType] = useState<"day" | "week" | "month" | "year" | "daterange">("week")
  
  // Day only (for "day" type)
  const [dayOnlyDate, setDayOnlyDate] = useState(new Date().toISOString().split("T")[0])
  
  // Week (for "week" type)
  const [selectedDays, setSelectedDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6])
  
  // Month (for "month" type)
  const [monthDates, setMonthDates] = useState<number[]>(Array.from({ length: 28 }, (_, i) => i + 1))
  const [showAllMonthDates, setShowAllMonthDates] = useState(false)
  
  // Year (for "year" type)
  const [yearDate, setYearDate] = useState(new Date().toISOString().split("T")[0])
  
  // Date Range (for "daterange" type)
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0])
  const [endDate, setEndDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0])
  
  // Other
  const [xpReward, setXpReward] = useState(10)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const toggleDay = (day: number) => {
    setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])
  }

  const toggleMonthDate = (date: number) => {
    setMonthDates(prev => prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date])
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    setError("")

    let scheduleData: any = {}

    if (scheduleType === "day") {
      scheduleData = { schedule_type: "day", schedule_date: dayOnlyDate }
    } else if (scheduleType === "week") {
      scheduleData = { schedule_type: "week", schedule_days: selectedDays }
    } else if (scheduleType === "month") {
      scheduleData = { schedule_type: "month", schedule_dates: monthDates }
    } else if (scheduleType === "year") {
      scheduleData = { schedule_type: "year", schedule_date: yearDate }
    } else if (scheduleType === "daterange") {
      scheduleData = { schedule_type: "daterange", start_date: startDate, end_date: endDate }
    }

    const { error } = await supabase.from("tasks").insert({
      user_id: user?.id,
      notebook_id: notebookId || null,
      title: title.trim(),
      description: description.trim(),
      task_type: taskType,
      target_value: taskType === "number" ? customTarget : 1,
      unit: taskType === "number" ? (unit.trim() || null) : null,
      xp_reward: xpReward,
      ...scheduleData,
    })

    if (error) {
      setError(error.message)
      setSaving(false)
    } else {
      onCreated()
      onClose()
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: "16px",
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="animate-fade-in hf-modal"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-default)",
          borderRadius: "20px",
          width: "100%",
          maxWidth: "520px",
          boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
          overflow: "hidden",
          maxHeight: "90vh",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Sticky Header */}
        <div
          style={{
            padding: "24px 28px 20px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
            position: "sticky",
            top: 0,
            background: "var(--bg-card)",
            zIndex: 10,
          }}
        >
          <div>
            <h2 style={{ color: "var(--text-primary)", fontWeight: 800, fontSize: "18px", letterSpacing: "-0.02em" }}>
              Create Habit
            </h2>
            <p style={{ color: "var(--text-tertiary)", fontSize: "12px", marginTop: "2px" }}>
              Set up a new habit with custom scheduling
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-default)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--text-secondary)",
              transition: "all 0.15s ease",
              flexShrink: 0,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.1)"; (e.currentTarget as HTMLElement).style.color = "#ef4444" }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "var(--bg-elevated)"; (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)" }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Scrollable Content */}
        <form
          onSubmit={handleCreate}
          style={{
            padding: "24px 28px",
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {error && (
            <div
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: "10px",
                padding: "10px 14px",
                marginBottom: "16px",
                color: "#ef4444",
                fontSize: "12px",
              }}
            >
              {error}
            </div>
          )}

          {/* Title */}
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                color: "var(--text-secondary)",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.06em",
                display: "block",
                marginBottom: "6px",
              }}
            >
              HABIT NAME *
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Morning Meditation"
              required
              style={{
                width: "100%",
                padding: "11px 14px",
                borderRadius: "10px",
                fontSize: "13px",
              }}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ color: "var(--text-secondary)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", display: "block", marginBottom: "6px" }}>
              DESCRIPTION
            </label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Optional description"
              style={{ width: "100%", padding: "11px 14px", borderRadius: "10px", fontSize: "13px" }}
            />
          </div>

          {/* Notebook */}
          {notebooks?.length > 0 && (
            <div style={{ marginBottom: "16px" }}>
              <label style={{ color: "var(--text-secondary)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", display: "block", marginBottom: "6px" }}>
                NOTEBOOK
              </label>
              <select
                value={notebookId}
                onChange={e => setNotebookId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  borderRadius: "10px",
                  fontSize: "13px",
                }}
              >
                <option value="">No Notebook</option>
                {notebooks.map((nb: any) => (
                  <option key={nb.id} value={nb.id}>
                    {nb.icon} {nb.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Task Type */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ color: "var(--text-secondary)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", display: "block", marginBottom: "10px" }}>
              TRACKING TYPE *
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {[
                { key: "binary", icon: CheckSquare, label: "Yes/No", desc: "Simple done/not done" },
                { key: "number", icon: BarChart2, label: "Number", desc: "Track any number" },
              ].map(type => (
                <button
                  key={type.key}
                  type="button"
                  onClick={() => setTaskType(type.key as any)}
                  style={{
                    padding: "14px",
                    borderRadius: "12px",
                    textAlign: "left",
                    cursor: "pointer",
                    background: taskType === type.key ? "rgba(232,168,58,0.1)" : "var(--bg-secondary)",
                    border: taskType === type.key ? "2px solid var(--gold)" : "1px solid var(--border-default)",
                    transition: "all 0.15s ease",
                  }}
                >
                  <type.icon
                    size={18}
                    style={{
                      color: taskType === type.key ? "var(--gold)" : "var(--text-tertiary)",
                      marginBottom: "6px",
                    }}
                  />
                  <div
                    style={{
                      color: taskType === type.key ? "var(--text-primary)" : "var(--text-secondary)",
                      fontWeight: 700,
                      fontSize: "13px",
                    }}
                  >
                    {type.label}
                  </div>
                  <div
                    style={{
                      color: "var(--text-tertiary)",
                      fontSize: "11px",
                      marginTop: "2px",
                    }}
                  >
                    {type.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Number Target (if number type) */}
          {taskType === "number" && (
            <div style={{ marginBottom: "16px" }}>
              <label style={{ color: "var(--text-secondary)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", display: "block", marginBottom: "6px" }}>
                DAILY TARGET (Optional)
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <input
                  type="number"
                  value={customTarget}
                  onChange={e => setCustomTarget(Number(e.target.value))}
                  placeholder="e.g. 30"
                  min={1}
                  style={{ width: "100%", padding: "11px 14px", borderRadius: "10px", fontSize: "13px" }}
                />
                <input
                  type="text"
                  value={unit}
                  onChange={e => setUnit(e.target.value)}
                  placeholder="e.g. pages, mins, km"
                  style={{ width: "100%", padding: "11px 14px", borderRadius: "10px", fontSize: "13px" }}
                />
              </div>
              <p style={{ color: "var(--text-tertiary)", fontSize: "11px", marginTop: "6px" }}>
                Set a target to track progress. Leave empty for unlimited logging.
              </p>
            </div>
          )}

          {/* Schedule Type */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ color: "var(--text-secondary)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", display: "block", marginBottom: "10px" }}>
              WHEN DO YOU WANT TO DO THIS? *
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px", marginBottom: "12px" }}>
              {[
                { key: "day", label: "Today Only" },
                { key: "week", label: "Weekly" },
                { key: "month", label: "Monthly" },
                { key: "year", label: "Yearly" },
                { key: "daterange", label: "Date Range", span: 2 },
              ].map(s => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setScheduleType(s.key as any)}
                  style={{
                    gridColumn: (s as any).span ? `span ${(s as any).span}` : "span 1",
                    padding: "10px",
                    borderRadius: "10px",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    border: "none",
                    background: scheduleType === s.key ? "var(--gold)" : "var(--bg-secondary)",
                    color: scheduleType === s.key ? "#0a0a0b" : "var(--text-secondary)",
                    transition: "all 0.15s ease",
                    letterSpacing: "0.02em",
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Day Only */}
            {scheduleType === "day" && (
              <div style={{ padding: "12px", background: "var(--bg-secondary)", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
                <label style={{ color: "var(--text-tertiary)", fontSize: "10px", fontWeight: 700, display: "block", marginBottom: "6px" }}>SELECT DATE</label>
                <input
                  type="date"
                  value={dayOnlyDate}
                  onChange={e => setDayOnlyDate(e.target.value)}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", fontSize: "12px" }}
                />
              </div>
            )}

            {/* Weekly */}
            {scheduleType === "week" && (
              <div style={{ padding: "12px", background: "var(--bg-secondary)", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
                <label style={{ color: "var(--text-tertiary)", fontSize: "10px", fontWeight: 700, display: "block", marginBottom: "8px" }}>PICK DAYS</label>
                <div style={{ display: "flex", gap: "4px" }}>
                  {DAYS.map((day, i) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(i)}
                      style={{
                        flex: 1,
                        padding: "6px 2px",
                        borderRadius: "8px",
                        fontSize: "10px",
                        fontWeight: 700,
                        cursor: "pointer",
                        border: "none",
                        background: selectedDays.includes(i) ? "var(--gold)" : "var(--bg-elevated)",
                        color: selectedDays.includes(i) ? "#0a0a0b" : "var(--text-tertiary)",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Monthly */}
            {scheduleType === "month" && (
              <div style={{ padding: "12px", background: "var(--bg-secondary)", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                  <label style={{ color: "var(--text-tertiary)", fontSize: "10px", fontWeight: 700 }}>PICK DATES (1-31)</label>
                  <button
                    type="button"
                    onClick={() => setShowAllMonthDates(!showAllMonthDates)}
                    style={{
                      fontSize: "10px",
                      color: "var(--gold)",
                      fontWeight: 700,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    {showAllMonthDates ? "Hide" : "Show All"}
                  </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "3px", maxHeight: showAllMonthDates ? "200px" : "80px", overflowY: "auto" }}>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(date => (
                    <button
                      key={date}
                      type="button"
                      onClick={() => toggleMonthDate(date)}
                      style={{
                        padding: "5px",
                        borderRadius: "6px",
                        fontSize: "10px",
                        fontWeight: 700,
                        cursor: "pointer",
                        border: "none",
                        background: monthDates.includes(date) ? "var(--gold)" : "var(--bg-elevated)",
                        color: monthDates.includes(date) ? "#0a0a0b" : "var(--text-tertiary)",
                        transition: "all 0.1s ease",
                      }}
                    >
                      {date}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Yearly */}
            {scheduleType === "year" && (
              <div style={{ padding: "12px", background: "var(--bg-secondary)", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
                <label style={{ color: "var(--text-tertiary)", fontSize: "10px", fontWeight: 700, display: "block", marginBottom: "6px" }}>SELECT MONTH & DAY</label>
                <input
                  type="date"
                  value={yearDate}
                  onChange={e => setYearDate(e.target.value)}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", fontSize: "12px" }}
                />
              </div>
            )}

            {/* Date Range */}
            {scheduleType === "daterange" && (
              <div style={{ padding: "12px", background: "var(--bg-secondary)", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
                <label style={{ color: "var(--text-tertiary)", fontSize: "10px", fontWeight: 700, display: "block", marginBottom: "6px" }}>FROM</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", fontSize: "12px", marginBottom: "10px" }}
                />
                <label style={{ color: "var(--text-tertiary)", fontSize: "10px", fontWeight: 700, display: "block", marginBottom: "6px" }}>TO</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", fontSize: "12px" }}
                />
              </div>
            )}
          </div>

          {/* XP Reward */}
          <div style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <label style={{ color: "var(--text-secondary)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em" }}>
                XP REWARD
              </label>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "var(--gold)", fontWeight: 800, fontSize: "13px" }}>
                <Zap size={12} /> {xpReward} XP
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={50}
              step={5}
              value={xpReward}
              onChange={e => setXpReward(Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--gold)" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-tertiary)", fontSize: "10px", marginTop: "3px" }}>
              <span>5 XP</span>
              <span>50 XP</span>
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: "10px", marginTop: "auto" }}>
            <button
              type="button"
              onClick={onClose}
              className="hf-btn-ghost"
              style={{ flex: 1, padding: "12px", fontSize: "13px" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="hf-btn-gold"
              style={{
                flex: 2,
                padding: "12px",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              {saving ? (
                "Creating..."
              ) : (
                <>
                  <Plus size={15} />
                  Create Habit
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
