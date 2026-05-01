"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Zap, TrendingUp, Clock } from "lucide-react"

export default function LandingPage() {
  const [showWaitlist, setShowWaitlist] = useState(false)
  const [waitlistEmail, setWaitlistEmail] = useState("")
  const [waitlistName, setWaitlistName] = useState("")

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Waitlist:", { waitlistName, waitlistEmail })
    setShowWaitlist(false)
    setWaitlistEmail("")
    setWaitlistName("")
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", position: "relative", overflow: "hidden" }}>
      {/* Background Glow */}
      <div style={{ position: "absolute", top: "-200px", left: "50%", transform: "translateX(-50%)", width: "800px", height: "500px", background: "radial-gradient(ellipse, rgba(232,168,58,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 40px", borderBottom: "1px solid var(--border-subtle)", position: "relative", zIndex: 10 }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "linear-gradient(135deg, #e8a83a, #c8901e)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(232,168,58,0.25)", overflow: "hidden" }}>
            <img src="/logo.png" alt="Habit Forge" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div>
            <div style={{ color: "var(--text-primary)", fontWeight: 900, fontSize: "18px" }}>HABIT FORGE</div>
            <div style={{ color: "var(--text-tertiary)", fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em" }}>PREMIUM</div>
          </div>
        </div>

        {/* Auth Buttons */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Link href="/auth/login" style={{ padding: "10px 20px", background: "transparent", border: "1px solid var(--border-default)", borderRadius: "10px", color: "var(--text-primary)", textDecoration: "none", fontWeight: 600, fontSize: "13px", transition: "all 0.2s ease", cursor: "pointer" }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--gold)"; e.currentTarget.style.color = "var(--gold)" }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-default)"; e.currentTarget.style.color = "var(--text-primary)" }}>
            Sign In
          </Link>
          <Link href="/auth/signup" className="hf-btn-gold" style={{ padding: "10px 20px", fontSize: "13px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}>
            Sign Up <ArrowRight size={13} />
          </Link>
          <button onClick={() => setShowWaitlist(true)} style={{ padding: "10px 16px", background: "transparent", border: "1px solid var(--border-default)", borderRadius: "10px", color: "var(--text-secondary)", textDecoration: "none", fontWeight: 500, fontSize: "12px", transition: "all 0.2s ease", cursor: "pointer" }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--gold)"; e.currentTarget.style.color = "var(--gold)" }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-default)"; e.currentTarget.style.color = "var(--text-secondary)" }}>
            Waitlist
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 70px)", padding: "60px 40px", textAlign: "center", position: "relative", zIndex: 5 }}>
        {/* Badge */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 16px", background: "rgba(232,168,58,0.1)", border: "1px solid rgba(232,168,58,0.2)", borderRadius: "99px", marginBottom: "32px" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "99px", background: "#4ade80" }} />
          <span style={{ color: "var(--gold)", fontSize: "12px", fontWeight: 600 }}>NOW IN BETA</span>
        </div>

        {/* Heading */}
        <h1 style={{ fontSize: "64px", fontWeight: 900, color: "var(--text-primary)", marginBottom: "24px", lineHeight: "1.2", maxWidth: "900px", letterSpacing: "-0.02em" }}>
          Build Habits That <span style={{ background: "linear-gradient(135deg, #e8a83a, #f0bc5e)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Actually Stick</span>
        </h1>

        {/* Subheading */}
        <p style={{ fontSize: "18px", color: "var(--text-secondary)", marginBottom: "40px", maxWidth: "700px", lineHeight: "1.6" }}>
          The premium habit tracking platform built for high performers. Streaks, analytics, time tracking, and gamification — all in one place.
        </p>

        {/* CTA Buttons */}
        <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap", marginBottom: "60px" }}>
          <Link href="/auth/signup" className="hf-btn-gold" style={{ padding: "14px 32px", fontSize: "15px", fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px", minWidth: "200px", justifyContent: "center" }}>
            Get Started Free <ArrowRight size={16} />
          </Link>
          <Link href="/auth/login" style={{ padding: "14px 32px", background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "10px", color: "var(--text-primary)", textDecoration: "none", fontSize: "15px", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "8px", minWidth: "200px", justifyContent: "center", transition: "all 0.2s ease", cursor: "pointer" }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--gold)"; e.currentTarget.style.background = "var(--bg-elevated)" }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-default)"; e.currentTarget.style.background = "var(--bg-card)" }}>
            Sign In <ArrowRight size={16} />
          </Link>
        </div>

        {/* Features Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "24px", maxWidth: "1000px", width: "100%" }}>
          {[
            { icon: Zap, title: "Instant Habits", desc: "Create and track habits in seconds" },
            { icon: TrendingUp, title: "Real Analytics", desc: "Track progress with powerful insights" },
            { icon: Clock, title: "Time Tracking", desc: "Manage your most valuable resource" },
          ].map((feature, i) => (
            <div key={i} style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "16px", padding: "24px", textAlign: "center" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(232,168,58,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <feature.icon size={24} color="var(--gold)" strokeWidth={1.5} />
              </div>
              <h3 style={{ color: "var(--text-primary)", fontSize: "16px", fontWeight: 700, marginBottom: "8px" }}>{feature.title}</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Waitlist Modal */}
      {showWaitlist && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px", backdropFilter: "blur(4px)" }}>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "20px", padding: "40px", maxWidth: "500px", width: "100%", boxShadow: "0 24px 64px rgba(0,0,0,0.3)" }}>
            <h2 style={{ color: "var(--text-primary)", fontSize: "24px", fontWeight: 800, marginBottom: "12px" }}>Join the Waitlist</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "24px" }}>Be the first to access exclusive features and early beta access.</p>

            <form onSubmit={handleWaitlistSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", color: "var(--text-secondary)", fontSize: "12px", fontWeight: 600, marginBottom: "8px" }}>NAME (Optional)</label>
                <input type="text" value={waitlistName} onChange={(e) => setWaitlistName(e.target.value)} placeholder="Your name" style={{ width: "100%", padding: "12px 14px", background: "var(--bg-secondary)", border: "1px solid var(--border-default)", borderRadius: "10px", color: "var(--text-primary)", fontSize: "13px", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", color: "var(--text-secondary)", fontSize: "12px", fontWeight: 600, marginBottom: "8px" }}>EMAIL</label>
                <input type="email" value={waitlistEmail} onChange={(e) => setWaitlistEmail(e.target.value)} placeholder="you@example.com" required style={{ width: "100%", padding: "12px 14px", background: "var(--bg-secondary)", border: "1px solid var(--border-default)", borderRadius: "10px", color: "var(--text-primary)", fontSize: "13px", boxSizing: "border-box" }} />
              </div>

              <button type="submit" className="hf-btn-gold" style={{ width: "100%", padding: "12px", fontSize: "14px", fontWeight: 700 }}>
                Join the Waitlist
              </button>

              <button type="button" onClick={() => setShowWaitlist(false)} style={{ width: "100%", padding: "12px", background: "transparent", border: "1px solid var(--border-default)", borderRadius: "10px", color: "var(--text-secondary)", fontSize: "14px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s ease" }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--text-primary)"; e.currentTarget.style.color = "var(--text-primary)" }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-default)"; e.currentTarget.style.color = "var(--text-secondary)" }}>
                Close
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}