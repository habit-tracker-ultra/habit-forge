"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Eye, EyeOff, Flame, LogIn, ArrowRight } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else router.push("/dashboard")
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-primary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Glow */}
      <div style={{ position: "absolute", top: "-200px", left: "50%", transform: "translateX(-50%)", width: "600px", height: "400px", background: "radial-gradient(ellipse, rgba(232,168,58,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: "400px" }} className="animate-fade-in">

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "14px", background: "linear-gradient(135deg, #e8a83a, #c8901e)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(232,168,58,0.25)" }}>
              <Flame size={22} color="#0a0a0b" strokeWidth={2.5} />
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ color: "var(--text-primary)", fontWeight: 900, fontSize: "20px", letterSpacing: "-0.03em" }}>HABIT FORGE</div>
              <div style={{ color: "var(--text-tertiary)", fontSize: "10px", letterSpacing: "0.1em", fontWeight: 600 }}>PREMIUM</div>
            </div>
          </div>
          <p style={{ color: "var(--text-tertiary)", fontSize: "13px" }}>Forge your habits. Build your legacy.</p>
        </div>

        {/* Card */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "20px", padding: "32px", boxShadow: "0 24px 64px rgba(0,0,0,0.3)" }}>
          <h2 style={{ color: "var(--text-primary)", fontWeight: 800, fontSize: "20px", letterSpacing: "-0.02em", marginBottom: "6px" }}>
            Welcome back
          </h2>
          <p style={{ color: "var(--text-tertiary)", fontSize: "12px", marginBottom: "24px" }}>
            Sign in to continue your streak
          </p>

          {error && (
            <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "10px", padding: "10px 14px", marginBottom: "16px", color: "#ef4444", fontSize: "12px" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: "14px" }}>
              <label style={{ color: "var(--text-secondary)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", display: "block", marginBottom: "6px" }}>EMAIL</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required style={{ width: "100%", padding: "11px 14px", borderRadius: "10px", fontSize: "13px" }} />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label style={{ color: "var(--text-secondary)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em" }}>PASSWORD</label>
                <Link href="/auth/forgot-password" style={{ color: "var(--gold)", fontSize: "11px", fontWeight: 600, textDecoration: "none", hover: { opacity: 0.8 } }}>
                  Forgot?
                </Link>
              </div>
              <div style={{ position: "relative" }}>
                <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required style={{ width: "100%", padding: "11px 44px 11px 14px", borderRadius: "10px", fontSize: "13px" }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)", display: "flex", alignItems: "center" }}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="hf-btn-gold"
              style={{ width: "100%", padding: "12px", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              {loading ? <div style={{ width: "18px", height: "18px", border: "2px solid #0a0a0b", borderTopColor: "transparent", borderRadius: "99px", animation: "spin 0.6s linear infinite" }} /> : <><LogIn size={16} /> Sign In</>}
            </button>
          </form>

          <div style={{ borderTop: "1px solid var(--border-subtle)", marginTop: "24px", paddingTop: "20px", textAlign: "center" }}>
            <span style={{ color: "var(--text-tertiary)", fontSize: "12px" }}>New to Habit Forge? </span>
            <Link href="/auth/signup" style={{ color: "var(--gold)", fontSize: "12px", fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}>
              Create account <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
