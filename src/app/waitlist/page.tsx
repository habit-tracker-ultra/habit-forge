"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { Flame, ArrowRight, CheckCircle2, BarChart2, Zap, Shield, Clock, Target } from "lucide-react"

export default function WaitlistPage() {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError("")
    const { error: err } = await supabase.from("waitlist").insert({ email: email.trim(), name: name.trim() || null })
    if (err) { setError(err.message.includes("duplicate") ? "This email is already on the waitlist!" : err.message); setLoading(false) }
    else { setSuccess(true); setEmail(""); setName("") }
  }

  const features = [
    { icon: Target, label: "Smart Habit Tracking", desc: "Binary & quantitative habits with custom schedules", color: "#4ade80" },
    { icon: Flame, label: "1-Day Buffer Streaks", desc: "Never lose your streak with our intelligent buffer system", color: "#e8a83a" },
    { icon: BarChart2, label: "Live Analytics", desc: "Charts, trends, and insights to keep you on track", color: "#60a5fa" },
    { icon: Clock, label: "Time Management", desc: "Dual-engine time tracker with Excel & list views", color: "#a78bfa" },
    { icon: Zap, label: "XP Gamification", desc: "Level up as you build better habits each day", color: "#f472b6" },
    { icon: Shield, label: "Secure & Private", desc: "Your data is encrypted and never shared", color: "#34d399" },
  ]

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", position: "relative", overflow: "hidden" }}>

      {/* Background Effects */}
      <div style={{ position: "fixed", top: "-300px", left: "50%", transform: "translateX(-50%)", width: "800px", height: "600px", background: "radial-gradient(ellipse, rgba(232,168,58,0.06) 0%, transparent 65%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: "-200px", right: "-100px", width: "500px", height: "500px", background: "radial-gradient(ellipse, rgba(74,222,128,0.04) 0%, transparent 65%)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}>

        {/* Nav */}
        <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 0", borderBottom: "1px solid var(--border-subtle)", marginBottom: "80px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #e8a83a, #c8901e)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Flame size={18} color="#0a0a0b" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ color: "var(--text-primary)", fontWeight: 900, fontSize: "15px", letterSpacing: "-0.02em" }}>HABIT FORGE</div>
              <div style={{ color: "var(--text-tertiary)", fontSize: "9px", letterSpacing: "0.1em", fontWeight: 600 }}>PREMIUM</div>
            </div>
          </div>
          <Link href="/auth/login"
            style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)", fontSize: "13px", fontWeight: 600, textDecoration: "none", padding: "8px 16px", borderRadius: "10px", border: "1px solid var(--border-default)", transition: "all 0.15s ease", background: "var(--bg-card)" }}>
            Sign In <ArrowRight size={14} />
          </Link>
        </nav>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: "80px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(232,168,58,0.1)", border: "1px solid rgba(232,168,58,0.25)", borderRadius: "99px", padding: "6px 16px", marginBottom: "24px" }}>
            <div className="status-dot active" />
            <span style={{ color: "var(--gold)", fontSize: "12px", fontWeight: 700, letterSpacing: "0.04em" }}>NOW IN BETA — JOIN THE WAITLIST</span>
          </div>

          <h1 style={{ color: "var(--text-primary)", fontWeight: 900, fontSize: "clamp(40px, 6vw, 72px)", letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: "20px" }}>
            Build Habits That<br />
            <span style={{ background: "linear-gradient(135deg, #e8a83a, #f0bc5e)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Actually Stick
            </span>
          </h1>

          <p style={{ color: "var(--text-secondary)", fontSize: "18px", lineHeight: 1.65, maxWidth: "560px", margin: "0 auto 40px", fontWeight: 400 }}>
            The premium habit tracking platform built for high performers. Streaks, analytics, time tracking, and gamification — all in one place.
          </p>

          {/* Signup Form */}
          <div style={{ maxWidth: "440px", margin: "0 auto" }}>
            {success ? (
              <div
                className="animate-fade-in"
                style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.25)", borderRadius: "16px", padding: "28px", textAlign: "center" }}
              >
                <CheckCircle2 size={36} style={{ color: "var(--emerald)", marginBottom: "12px" }} />
                <div style={{ color: "var(--text-primary)", fontWeight: 800, fontSize: "18px", marginBottom: "8px" }}>
                  You&apos;re on the list!
                </div>
                <p style={{ color: "var(--text-tertiary)", fontSize: "13px", lineHeight: 1.6, marginBottom: "20px" }}>
                  We&apos;ll notify you when Habit Forge launches. Get ready to build unstoppable habits.
                </p>
                <Link href="/auth/login"
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--gold)", fontSize: "13px", fontWeight: 700, textDecoration: "none" }}>
                  Access Early Beta <ArrowRight size={13} />
                </Link>
              </div>
            ) : (
              <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "20px", padding: "28px", boxShadow: "0 24px 64px rgba(0,0,0,0.3)" }}>
                <form onSubmit={handleSignup}>
                  <div style={{ marginBottom: "12px" }}>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name (optional)"
                      style={{ width: "100%", padding: "11px 14px", borderRadius: "10px", fontSize: "13px" }} />
                  </div>
                  <div style={{ marginBottom: "16px" }}>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required
                      style={{ width: "100%", padding: "11px 14px", borderRadius: "10px", fontSize: "13px" }} />
                  </div>
                  {error && <div style={{ color: "#ef4444", fontSize: "12px", marginBottom: "12px", textAlign: "left" }}>{error}</div>}
                  <button type="submit" disabled={loading} className="hf-btn-gold"
                    style={{ width: "100%", padding: "13px", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                    {loading ? <div style={{ width: "18px", height: "18px", border: "2px solid #0a0a0b", borderTopColor: "transparent", borderRadius: "99px", animation: "spin 0.6s linear infinite" }} /> : <>Join the Waitlist <ArrowRight size={16} /></>}
                  </button>
                </form>
                <p style={{ color: "var(--text-tertiary)", fontSize: "11px", textAlign: "center", marginTop: "12px" }}>
                  No spam. Unsubscribe anytime.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        <div style={{ marginBottom: "80px" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <div style={{ color: "var(--text-tertiary)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", marginBottom: "8px" }}>EVERYTHING YOU NEED</div>
            <h2 style={{ color: "var(--text-primary)", fontWeight: 800, fontSize: "32px", letterSpacing: "-0.03em" }}>
              Built for the 1%
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
            {features.map(feature => (
              <div
                key={feature.label}
                className="hf-card"
                style={{ padding: "24px" }}
              >
                <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: `${feature.color}15`, border: `1px solid ${feature.color}25`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "14px" }}>
                  <feature.icon size={20} style={{ color: feature.color }} strokeWidth={1.75} />
                </div>
                <div style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "14px", marginBottom: "6px" }}>{feature.label}</div>
                <div style={{ color: "var(--text-tertiary)", fontSize: "12px", lineHeight: 1.6 }}>{feature.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ borderTop: "1px solid var(--border-subtle)", padding: "28px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "24px", height: "24px", borderRadius: "7px", background: "linear-gradient(135deg, #e8a83a, #c8901e)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Flame size={12} color="#0a0a0b" />
            </div>
            <span style={{ color: "var(--text-tertiary)", fontSize: "12px" }}>© 2025 Habit Forge. All rights reserved.</span>
          </div>
          <Link href="/auth/login" style={{ color: "var(--text-tertiary)", fontSize: "12px", textDecoration: "none", fontWeight: 600 }}>
            Sign In →
          </Link>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
