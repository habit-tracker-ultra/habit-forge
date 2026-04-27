"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/context/AuthContext"
import { Plus, Clock, List, Table, ChevronLeft, ChevronRight, Save, Trash2, Search } from "lucide-react"

export default function TimePage() {
  const { user } = useAuth()
  const [view, setView] = useState<"list" | "excel">("list")
  const [categories, setCategories] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [catName, setCatName] = useState("")
  const [catColor, setCatColor] = useState("#e8a83a")
  const [catIcon, setCatIcon] = useState("⏱️")
  const [saving, setSaving] = useState(false)
  const [hours, setHours] = useState<Record<string, string>>({})
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [savingRow, setSavingRow] = useState<string | null>(null)
  const [savingAll, setSavingAll] = useState(false)

  const COLORS = ["#e8a83a", "#4ade80", "#60a5fa", "#f472b6", "#a78bfa", "#fb923c", "#34d399", "#f87171"]
  const ICONS = ["⏱️", "💼", "📚", "🏃", "🧘", "💪", "🎨", "🎵", "💻", "🍳", "🌿", "✈️"]

  const changeDate = (days: number) => {
    const date = new Date(selectedDate)
    date.setDate(date.getDate() + days)
    setSelectedDate(date.toISOString().split("T")[0])
  }

  const isToday = selectedDate === new Date().toISOString().split("T")[0]

  const formattedDate = new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric"
  })

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [catsRes, logsRes] = await Promise.all([
      supabase.from("time_categories").select("*").order("created_at"),
      supabase.from("time_logs").select("*").eq("log_date", selectedDate),
    ])
    if (catsRes.data) setCategories(catsRes.data)
    if (logsRes.data) {
      setLogs(logsRes.data)
      const h: Record<string, string> = {}
      const n: Record<string, string> = {}
      catsRes.data?.forEach(cat => {
        const log = logsRes.data?.find(l => l.category_id === cat.id)
        h[cat.id] = log ? String(log.hours_logged) : ""
        n[cat.id] = log?.notes || ""
      })
      setHours(h)
      setNotes(n)
    }
    setLoading(false)
  }, [selectedDate])

  useEffect(() => { fetchData() }, [fetchData])

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!catName.trim()) return
    setSaving(true)
    await supabase.from("time_categories").insert({ user_id: user?.id, name: catName.trim(), color: catColor, icon: catIcon })
    setCatName(""); setSaving(false); setShowAddCategory(false); fetchData()
  }

  const handleSaveRow = async (catId: string) => {
    const h = parseFloat(hours[catId] || "0")
    if (isNaN(h)) return
    setSavingRow(catId)
    const existing = logs.find(l => l.category_id === catId)
    if (existing) {
      await supabase.from("time_logs").update({ hours_logged: h, notes: notes[catId] || null }).eq("id", existing.id)
    } else if (h > 0) {
      await supabase.from("time_logs").insert({ user_id: user?.id, category_id: catId, log_date: selectedDate, hours_logged: h, notes: notes[catId] || null, view_type: view })
    }
    setSavingRow(null); fetchData()
  }

  const handleSaveAll = async () => {
    setSavingAll(true)
    for (const cat of categories) await handleSaveRow(cat.id)
    setSavingAll(false)
  }

  const handleDeleteLog = async (catId: string) => {
    const log = logs.find(l => l.category_id === catId)
    if (log) await supabase.from("time_logs").delete().eq("id", log.id)
    setHours(prev => ({ ...prev, [catId]: "" }))
    setNotes(prev => ({ ...prev, [catId]: "" }))
    fetchData()
  }

  const totalHours = logs.reduce((sum, l) => sum + Number(l.hours_logged), 0)
  const loggedCount = logs.length

  return (
    <div style={{ padding: "32px", maxWidth: "1400px" }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "32px" }}>
        <div>
          <h1 style={{ color: "var(--text-primary)", fontWeight: 800, fontSize: "26px", letterSpacing: "-0.03em", marginBottom: "4px" }}>
            Time Manager
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
            Track how you allocate your time each day
          </p>
        </div>
        <button onClick={() => setShowAddCategory(true)} className="hf-btn-gold" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", fontSize: "13px" }}>
          <Plus size={16} strokeWidth={2.5} />
          Add Category
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "TOTAL HOURS", value: `${totalHours.toFixed(1)}h`, color: "var(--gold)" },
          { label: "CATEGORIES LOGGED", value: loggedCount.toString(), color: "var(--emerald)" },
          { label: "TOTAL CATEGORIES", value: categories.length.toString(), color: "#60a5fa" },
        ].map(s => (
          <div key={s.label} className="hf-card" style={{ padding: "20px" }}>
            <div style={{ color: "var(--text-tertiary)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", marginBottom: "8px" }}>{s.label}</div>
            <div style={{ color: s.color, fontWeight: 800, fontSize: "28px", letterSpacing: "-0.03em" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Date Navigator */}
      <div className="hf-card" style={{ padding: "14px 20px", marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button
          onClick={() => changeDate(-1)}
          className="hf-btn-ghost"
          style={{ width: "36px", height: "36px", padding: "0", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <ChevronLeft size={16} />
        </button>
        <div style={{ textAlign: "center" }}>
          <div style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "14px" }}>{formattedDate}</div>
          {isToday && <div style={{ color: "var(--emerald)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.06em", marginTop: "2px" }}>TODAY</div>}
        </div>
        <button
          onClick={() => changeDate(1)}
          disabled={isToday}
          className="hf-btn-ghost"
          style={{ width: "36px", height: "36px", padding: "0", display: "flex", alignItems: "center", justifyContent: "center", opacity: isToday ? 0.3 : 1 }}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* View Toggle */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        {[
          { key: "list", icon: List, label: "List View" },
          { key: "excel", icon: Table, label: "Excel View" },
        ].map(v => (
          <button
            key={v.key}
            onClick={() => setView(v.key as "list" | "excel")}
            style={{
              display: "flex", alignItems: "center", gap: "7px",
              padding: "8px 16px", borderRadius: "10px", fontSize: "12px", fontWeight: 600,
              cursor: "pointer", transition: "all 0.15s ease",
              background: view === v.key ? "var(--gold)" : "var(--bg-card)",
              color: view === v.key ? "#0a0a0b" : "var(--text-secondary)",
              border: view === v.key ? "1px solid transparent" : "1px solid var(--border-default)",
            }}
          >
            <v.icon size={14} />
            {v.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-tertiary)" }}>Loading...</div>
      ) : categories.length === 0 ? (
        <div className="hf-card" style={{ padding: "80px 40px", textAlign: "center" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "18px", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Clock size={28} style={{ color: "var(--text-tertiary)" }} />
          </div>
          <div style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "16px", marginBottom: "8px" }}>No Categories Yet</div>
          <div style={{ color: "var(--text-tertiary)", fontSize: "13px", marginBottom: "24px" }}>Add a category to start tracking time.</div>
          <button onClick={() => setShowAddCategory(true)} className="hf-btn-gold" style={{ padding: "10px 24px", fontSize: "13px" }}>Add Category</button>
        </div>
      ) : view === "list" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {/* Total Bar */}
          {totalHours > 0 && (
            <div style={{ background: "rgba(232,168,58,0.06)", border: "1px solid rgba(232,168,58,0.2)", borderRadius: "12px", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Clock size={14} style={{ color: "var(--gold)" }} />
                <span style={{ color: "var(--text-secondary)", fontSize: "12px", fontWeight: 600 }}>Total Logged Today</span>
              </div>
              <span style={{ color: "var(--gold)", fontWeight: 800, fontSize: "18px" }}>{totalHours.toFixed(1)}h</span>
            </div>
          )}

          {categories.map(cat => {
            const logged = logs.find(l => l.category_id === cat.id)
            return (
              <div key={cat.id} className="hf-card" style={{ padding: "16px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: `${cat.color}15`, border: `1px solid ${cat.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>
                    {cat.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "13px" }}>{cat.name}</div>
                    {logged && <div style={{ color: "var(--text-tertiary)", fontSize: "11px" }}>{Number(logged.hours_logged).toFixed(1)}h logged</div>}
                  </div>
                  <input
                    type="number"
                    value={hours[cat.id] || ""}
                    onChange={e => setHours(prev => ({ ...prev, [cat.id]: e.target.value }))}
                    placeholder="0.0"
                    min="0" step="0.5"
                    style={{ width: "80px", padding: "8px 10px", borderRadius: "8px", fontSize: "13px", textAlign: "center" }}
                  />
                  <span style={{ color: "var(--text-tertiary)", fontSize: "12px" }}>hrs</span>
                  <button
                    onClick={() => handleSaveRow(cat.id)}
                    disabled={savingRow === cat.id}
                    className="hf-btn-gold"
                    style={{ padding: "8px 14px", fontSize: "12px" }}
                  >
                    {savingRow === cat.id ? "..." : "Save"}
                  </button>
                  {logged && (
                    <button
                      onClick={() => handleDeleteLog(cat.id)}
                      style={{ width: "30px", height: "30px", borderRadius: "8px", background: "transparent", border: "none", cursor: "pointer", color: "var(--text-tertiary)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s ease" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#ef4444" }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--text-tertiary)" }}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
                <div style={{ marginTop: "10px", marginLeft: "54px" }}>
                  <input
                    type="text"
                    value={notes[cat.id] || ""}
                    onChange={e => setNotes(prev => ({ ...prev, [cat.id]: e.target.value }))}
                    placeholder="Add a note..."
                    style={{ width: "100%", padding: "7px 12px", borderRadius: "8px", fontSize: "12px" }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="hf-card" style={{ overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-elevated)" }}>
                {["#", "Category", "Hours", "Notes", ""].map(h => (
                  <th key={h} style={{ padding: "12px 16px", color: "var(--text-tertiary)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.06em", textAlign: h === "Hours" ? "center" : "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, index) => {
                const logged = logs.find(l => l.category_id === cat.id)
                const h = parseFloat(hours[cat.id] || "0")
                return (
                  <tr key={cat.id} style={{ borderBottom: "1px solid var(--border-subtle)", background: h > 0 ? "rgba(232,168,58,0.03)" : "transparent", transition: "background 0.15s ease" }}>
                    <td style={{ padding: "12px 16px", color: "var(--text-tertiary)", fontSize: "12px" }}>{index + 1}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "16px" }}>{cat.icon}</span>
                        <span style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "13px" }}>{cat.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <input
                        type="number"
                        value={hours[cat.id] || ""}
                        onChange={e => setHours(prev => ({ ...prev, [cat.id]: e.target.value }))}
                        placeholder="0.0"
                        min="0" step="0.5"
                        style={{ width: "90px", padding: "7px 10px", borderRadius: "8px", fontSize: "13px", textAlign: "center" }}
                      />
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <input
                        type="text"
                        value={notes[cat.id] || ""}
                        onChange={e => setNotes(prev => ({ ...prev, [cat.id]: e.target.value }))}
                        placeholder="Notes..."
                        style={{ width: "100%", padding: "7px 12px", borderRadius: "8px", fontSize: "12px" }}
                      />
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      {logged && (
                        <button
                          onClick={() => handleDeleteLog(cat.id)}
                          style={{ width: "28px", height: "28px", borderRadius: "8px", background: "transparent", border: "none", cursor: "pointer", color: "var(--text-tertiary)", display: "flex", alignItems: "center", justifyContent: "center" }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#ef4444" }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--text-tertiary)" }}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: "2px solid var(--border-default)", background: "var(--bg-elevated)" }}>
                <td colSpan={2} style={{ padding: "12px 16px", color: "var(--gold)", fontSize: "11px", fontWeight: 800, letterSpacing: "0.06em", textAlign: "right" }}>TOTAL</td>
                <td style={{ padding: "12px 16px", textAlign: "center", color: "var(--gold)", fontWeight: 800, fontSize: "15px" }}>
                  {Object.values(hours).reduce((sum, h) => sum + (parseFloat(h) || 0), 0).toFixed(1)}h
                </td>
                <td colSpan={2}></td>
              </tr>
              <tr style={{ background: "var(--bg-elevated)" }}>
                <td colSpan={2} style={{ padding: "10px 16px", color: "#60a5fa", fontSize: "11px", fontWeight: 800, letterSpacing: "0.06em", textAlign: "right" }}>AVERAGE</td>
                <td style={{ padding: "10px 16px", textAlign: "center", color: "#60a5fa", fontWeight: 700, fontSize: "13px" }}>
                  {(() => {
                    const filled = Object.values(hours).filter(h => parseFloat(h) > 0)
                    return filled.length > 0
                      ? (filled.reduce((s, h) => s + parseFloat(h), 0) / filled.length).toFixed(1) + "h"
                      : "—"
                  })()}
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
          <div style={{ padding: "16px 20px", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "flex-end" }}>
            <button onClick={handleSaveAll} disabled={savingAll} className="hf-btn-gold" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", fontSize: "13px" }}>
              {savingAll ? "Saving..." : <><Save size={14} /> Save All</>}
            </button>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddCategory && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "16px" }}
          onClick={e => { if (e.target === e.currentTarget) setShowAddCategory(false) }}
        >
          <div
            className="animate-fade-in"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "20px", padding: "32px", width: "100%", maxWidth: "440px", boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
              <div>
                <h2 style={{ color: "var(--text-primary)", fontWeight: 800, fontSize: "18px", letterSpacing: "-0.02em" }}>Add Category</h2>
                <p style={{ color: "var(--text-tertiary)", fontSize: "12px", marginTop: "2px" }}>Create a new time tracking category</p>
              </div>
              <button onClick={() => setShowAddCategory(false)} className="hf-btn-ghost" style={{ width: "32px", height: "32px", padding: "0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>×</button>
            </div>

            <form onSubmit={handleAddCategory}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ color: "var(--text-secondary)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", display: "block", marginBottom: "6px" }}>CATEGORY NAME *</label>
                <input type="text" value={catName} onChange={e => setCatName(e.target.value)} placeholder="e.g. Deep Work" required style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", fontSize: "13px" }} />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ color: "var(--text-secondary)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", display: "block", marginBottom: "8px" }}>ICON</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {ICONS.map(i => (
                    <button key={i} type="button" onClick={() => setCatIcon(i)}
                      style={{ width: "38px", height: "38px", borderRadius: "10px", fontSize: "18px", border: catIcon === i ? "2px solid var(--gold)" : "1px solid var(--border-default)", background: catIcon === i ? "var(--gold-glow)" : "var(--bg-elevated)", cursor: "pointer", transition: "all 0.15s ease" }}>
                      {i}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={{ color: "var(--text-secondary)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", display: "block", marginBottom: "8px" }}>COLOR</label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setCatColor(c)}
                      style={{ width: "28px", height: "28px", borderRadius: "99px", background: c, border: catColor === c ? "3px solid var(--text-primary)" : "2px solid transparent", cursor: "pointer", transition: "all 0.15s ease", boxShadow: catColor === c ? `0 0 0 2px ${c}` : "none" }}>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button type="button" onClick={() => setShowAddCategory(false)} className="hf-btn-ghost" style={{ flex: 1, padding: "11px", fontSize: "13px" }}>Cancel</button>
                <button type="submit" disabled={saving} className="hf-btn-gold" style={{ flex: 1, padding: "11px", fontSize: "13px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                  {saving ? "Adding..." : <><Plus size={14} /> Add</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
