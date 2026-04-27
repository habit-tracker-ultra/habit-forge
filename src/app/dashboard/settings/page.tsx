"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/context/AuthContext"
import { User, Bell, Shield, Palette, Save, CheckCircle2, Zap } from "lucide-react"

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [fullName, setFullName] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      supabase.from("profiles").select("*").eq("id", user.id).single()
        .then(({ data }) => {
          if (data) { setProfile(data); setFullName(data.full_name || "") }
          setLoading(false)
        })
    }
  }, [user?.id])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await supabase.from("profiles").update({ full_name: fullName }).eq("id", user?.id)
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const sections = [
    { icon: User, label: "Profile", color: "var(--gold)", active: true },
    { icon: Bell, label: "Notifications", color: "#60a5fa", active: false },
    { icon: Palette, label: "Appearance", color: "#a78bfa", active: false },
    { icon: Shield, label: "Security", color: "#4ade80", active: false },
  ]

  return (
    <div style={{ padding: "32px", maxWidth: "900px" }} className="animate-fade-in">
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ color: "var(--text-primary)", fontWeight: 800, fontSize: "26px", letterSpacing: "-0.03em", marginBottom: "4px" }}>Settings</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>Manage your account and preferences</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: "24px" }}>
        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {sections.map(section => (
            <button
              key={section.label}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "10px 14px", borderRadius: "10px", cursor: "pointer",
                background: section.active ? `${section.color}12` : "transparent",
                border: section.active ? `1px solid ${section.color}25` : "1px solid transparent",
                color: section.active ? section.color : "var(--text-secondary)",
                fontWeight: section.active ? 600 : 500, fontSize: "13px",
                transition: "all 0.15s ease", textAlign: "left", width: "100%",
                opacity: section.active ? 1 : 0.6,
              }}
            >
              <section.icon size={16} />
              {section.label}
              {!section.active && <span style={{ marginLeft: "auto", fontSize: "10px", color: "var(--text-tertiary)", fontWeight: 600 }}>SOON</span>}
            </button>
          ))}
        </div>

        {/* Content */}
        <div>
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px", color: "var(--text-tertiary)" }}>Loading...</div>
          ) : (
            <div className="hf-card" style={{ padding: "28px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px", paddingBottom: "20px", borderBottom: "1px solid var(--border-subtle)" }}>
                <div
                  style={{
                    width: "56px", height: "56px", borderRadius: "16px",
                    background: "linear-gradient(135deg, rgba(232,168,58,0.3), rgba(232,168,58,0.1))",
                    border: "1px solid rgba(232,168,58,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 900, fontSize: "22px", color: "var(--gold)",
                  }}
                >
                  {user?.email?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "15px" }}>
                    {profile?.full_name || "User"}
                  </div>
                  <div style={{ color: "var(--text-tertiary)", fontSize: "12px" }}>{user?.email}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                    <div className="status-dot active" />
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", color: "var(--gold)", fontSize: "11px", fontWeight: 700 }}>
                      <Zap size={10} /> Level {Math.floor((profile?.xp ?? 0) / 100) + 1} · {profile?.xp ?? 0} XP
                    </span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSave}>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ color: "var(--text-secondary)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", display: "block", marginBottom: "6px" }}>FULL NAME</label>
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name"
                    style={{ width: "100%", padding: "11px 14px", borderRadius: "10px", fontSize: "13px" }} />
                </div>

                <div style={{ marginBottom: "24px" }}>
                  <label style={{ color: "var(--text-secondary)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", display: "block", marginBottom: "6px" }}>EMAIL ADDRESS</label>
                  <input type="email" value={user?.email || ""} disabled
                    style={{ width: "100%", padding: "11px 14px", borderRadius: "10px", fontSize: "13px", opacity: 0.5, cursor: "not-allowed" }} />
                  <p style={{ color: "var(--text-tertiary)", fontSize: "11px", marginTop: "4px" }}>Email cannot be changed</p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <button type="submit" disabled={saving} className="hf-btn-gold"
                    style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", fontSize: "13px" }}>
                    {saving ? "Saving..." : saved ? <><CheckCircle2 size={15} /> Saved!</> : <><Save size={15} /> Save Changes</>}
                  </button>
                </div>
              </form>

              <div style={{ marginTop: "32px", paddingTop: "24px", borderTop: "1px solid var(--border-subtle)" }}>
                <div style={{ color: "var(--text-tertiary)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", marginBottom: "12px" }}>DANGER ZONE</div>
                <button
                  onClick={() => { if (confirm("Are you sure you want to sign out?")) signOut() }}
                  style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    padding: "9px 16px", borderRadius: "10px", fontSize: "13px",
                    background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                    color: "#ef4444", cursor: "pointer", fontWeight: 600,
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.15)" }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.08)" }}
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
