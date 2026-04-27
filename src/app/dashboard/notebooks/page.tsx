"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/context/AuthContext"
import { Plus, BookOpen, Trash2, ChevronRight, FolderOpen, Search } from "lucide-react"

export default function NotebooksPage() {
  const { user } = useAuth()
  const [notebooks, setNotebooks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [color, setColor] = useState("#e8a83a")
  const [icon, setIcon] = useState("📓")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [taskCounts, setTaskCounts] = useState<Record<string, number>>({})

  const colors = [
    { value: "#e8a83a", label: "Gold" },
    { value: "#4ade80", label: "Emerald" },
    { value: "#60a5fa", label: "Blue" },
    { value: "#f472b6", label: "Pink" },
    { value: "#a78bfa", label: "Purple" },
    { value: "#fb923c", label: "Orange" },
    { value: "#34d399", label: "Teal" },
    { value: "#f87171", label: "Red" },
  ]

  const icons = ["📓", "💪", "🧠", "❤️", "🎯", "⭐", "📚", "🏃", "💤", "🎨", "💼", "🌱"]

  useEffect(() => { fetchNotebooks() }, [])

  const fetchNotebooks = async () => {
    setLoading(true)
    const { data } = await supabase.from("notebooks").select("*").order("created_at", { ascending: false })
    if (data) {
      setNotebooks(data)
      const counts: Record<string, number> = {}
      await Promise.all(data.map(async (nb) => {
        const { count } = await supabase.from("tasks").select("*", { count: "exact", head: true }).eq("notebook_id", nb.id)
        counts[nb.id] = count ?? 0
      }))
      setTaskCounts(counts)
    }
    setLoading(false)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setError("")
    const { error } = await supabase.from("notebooks").insert({
      user_id: user?.id, name: name.trim(), description: description.trim(), color, icon,
    })
    if (error) { setError(error.message); setSaving(false) }
    else {
      setName(""); setDescription(""); setColor("#e8a83a"); setIcon("📓")
      setShowModal(false); fetchNotebooks()
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this notebook? Tasks will be unassigned.")) return
    await supabase.from("notebooks").delete().eq("id", id)
    fetchNotebooks()
  }

  const filtered = notebooks.filter(nb =>
    nb.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ padding: "32px", maxWidth: "1400px" }} className="animate-fade-in">

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "32px" }}>
        <div>
          <h1 style={{ color: "var(--text-primary)", fontWeight: 800, fontSize: "26px", letterSpacing: "-0.03em", marginBottom: "4px" }}>
            Notebooks
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
            Organize your habits into focused collections
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="hf-btn-gold" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", fontSize: "13px" }}>
          <Plus size={16} strokeWidth={2.5} />
          New Notebook
        </button>
      </div>

      {/* Search */}
      {notebooks.length > 0 && (
        <div style={{ position: "relative", marginBottom: "24px", maxWidth: "320px" }}>
          <Search size={14} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search notebooks..."
            style={{ width: "100%", padding: "9px 14px 9px 36px", borderRadius: "10px", fontSize: "13px" }}
          />
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-tertiary)" }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="hf-card" style={{ padding: "80px 40px", textAlign: "center" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "18px", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <FolderOpen size={28} style={{ color: "var(--text-tertiary)" }} />
          </div>
          <div style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "16px", marginBottom: "8px" }}>
            {search ? "No Notebooks Found" : "No Notebooks Yet"}
          </div>
          <div style={{ color: "var(--text-tertiary)", fontSize: "13px", marginBottom: "24px" }}>
            {search ? "Try a different search term." : "Create your first notebook to organize habits."}
          </div>
          {!search && (
            <button onClick={() => setShowModal(true)} className="hf-btn-gold" style={{ padding: "10px 24px", fontSize: "13px" }}>
              Create Notebook
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
          {filtered.map((notebook) => (
            <div
              key={notebook.id}
              className="hf-card"
              style={{ padding: "24px", cursor: "pointer", position: "relative", overflow: "hidden" }}
            >
              {/* Color Accent */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: notebook.color, borderRadius: "16px 16px 0 0" }} />

              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
                <div
                  style={{
                    width: "48px", height: "48px", borderRadius: "14px",
                    background: `${notebook.color}15`,
                    border: `1px solid ${notebook.color}30`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "22px",
                  }}
                >
                  {notebook.icon}
                </div>
                <button
                  onClick={() => handleDelete(notebook.id)}
                  style={{
                    width: "30px", height: "30px", borderRadius: "8px",
                    background: "transparent", border: "1px solid transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", color: "var(--text-tertiary)",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.1)"
                    ;(e.currentTarget as HTMLElement).style.borderColor = "rgba(239,68,68,0.2)"
                    ;(e.currentTarget as HTMLElement).style.color = "#ef4444"
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = "transparent"
                    ;(e.currentTarget as HTMLElement).style.borderColor = "transparent"
                    ;(e.currentTarget as HTMLElement).style.color = "var(--text-tertiary)"
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <h3 style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "15px", marginBottom: "4px", letterSpacing: "-0.01em" }}>
                {notebook.name}
              </h3>
              {notebook.description && (
                <p style={{ color: "var(--text-tertiary)", fontSize: "12px", marginBottom: "16px" }}>
                  {notebook.description}
                </p>
              )}

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "12px", borderTop: "1px solid var(--border-subtle)", marginTop: notebook.description ? "0" : "16px" }}>
                <span style={{ color: "var(--text-tertiary)", fontSize: "11px", fontWeight: 600 }}>
                  {taskCounts[notebook.id] ?? 0} HABITS
                </span>
                <ChevronRight size={14} style={{ color: "var(--text-tertiary)" }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "16px" }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}
        >
          <div
            className="animate-fade-in"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "20px", padding: "32px", width: "100%", maxWidth: "460px", boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
              <div>
                <h2 style={{ color: "var(--text-primary)", fontWeight: 800, fontSize: "18px", letterSpacing: "-0.02em" }}>
                  New Notebook
                </h2>
                <p style={{ color: "var(--text-tertiary)", fontSize: "12px", marginTop: "2px" }}>
                  Group related habits together
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="hf-btn-ghost"
                style={{ width: "32px", height: "32px", padding: "0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}
              >
                ×
              </button>
            </div>

            {error && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", padding: "10px 14px", marginBottom: "16px", color: "#ef4444", fontSize: "12px" }}>
                {error}
              </div>
            )}

            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ color: "var(--text-secondary)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", display: "block", marginBottom: "6px" }}>NAME *</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Morning Routine" required style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", fontSize: "13px" }} />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ color: "var(--text-secondary)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", display: "block", marginBottom: "6px" }}>DESCRIPTION</label>
                <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional description" style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", fontSize: "13px" }} />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ color: "var(--text-secondary)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", display: "block", marginBottom: "8px" }}>ICON</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {icons.map(i => (
                    <button key={i} type="button" onClick={() => setIcon(i)}
                      style={{ width: "38px", height: "38px", borderRadius: "10px", fontSize: "18px", border: icon === i ? "2px solid var(--gold)" : "1px solid var(--border-default)", background: icon === i ? "var(--gold-glow)" : "var(--bg-elevated)", cursor: "pointer", transition: "all 0.15s ease" }}>
                      {i}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={{ color: "var(--text-secondary)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", display: "block", marginBottom: "8px" }}>COLOR</label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {colors.map(c => (
                    <button key={c.value} type="button" onClick={() => setColor(c.value)}
                      style={{ width: "28px", height: "28px", borderRadius: "99px", background: c.value, border: color === c.value ? "3px solid var(--text-primary)" : "2px solid transparent", cursor: "pointer", transition: "all 0.15s ease", boxShadow: color === c.value ? `0 0 0 2px ${c.value}` : "none" }}>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button type="button" onClick={() => setShowModal(false)} className="hf-btn-ghost" style={{ flex: 1, padding: "11px", fontSize: "13px" }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="hf-btn-gold" style={{ flex: 1, padding: "11px", fontSize: "13px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                  {saving ? "Creating..." : <><Plus size={14} /> Create</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
