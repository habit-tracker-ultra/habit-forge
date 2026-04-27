"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Eye, EyeOff, Flame, UserPlus, ArrowLeft, CheckCircle2 } from "lucide-react"

export default function SignupPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    if (password.length < 6) { setError("Password must be at least 6 characters"); setLoading(false); return }
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } })
    if (error) { setError(error.message); setLoading(false) }
    else setSuccess(true)
  }

  if (success) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <div className="animate-fade-in" style={{ background: "var(--bg-card)", border: "1px solid rgba(74,222,128,0.3)", borderRadius: "20px", padding: "48px 32px", textAlign: "center", maxWidth: "400px", width: "100%" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "20px", background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <CheckCircle2 size={32} style={{ color: "var(--emerald)" }} />
          </div>
          <h2 style={{ color: "var(--text-primary)", fontWeight: 800, fontSize: "20px", marginBottom: "8px" }}>Account Created!</h2>
          <p style={{ color: "var(--text-tertiary)", fontSize: "13px", marginBottom: "28px", lineHeight: "1.6" }}>
            Check your email to confirm your account, then sign in to start building habits.
          </p>
          <button onClick={() => router.push("/auth/login")} className="hf-btn-gold" style={{ width: "100%", padding: "12px", fontSize: "14px" }}>
            Go to Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "-200px", left: "50%", transform: "translateX(-50%)", width: "600px", height: "400px", background: "radial-gradient(ellipse, rgba(232,168,58,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: "400px" }} className="animate-fade-in">
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
          <p style={{ color: "var(--text-tertiary)", fontSize: "13px" }}>Start building unstoppable habits today.</p>
        </div>

        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "20px", padding: "32px", boxShadow: "0 24px 64px rgba(0,0,0,0.3)" }}>
          <h2 style={{ color: "var(--text-primary)", fontWeight: 800, fontSize: "20px", letterSpacing: "-0.02em", marginBottom: "6px" }}>Create account</h2>
          <p style={{ color: "var(--text-tertiary)", fontSize: "12px", marginBottom: "24px" }}>Join thousands building better habits</p>

          {error && (
            <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "10px", padding: "10px 14px", marginBottom: "16px", color: "#ef4444", fontSize: "12px" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSignup}>
            <div style={{ marginBottom: "14px" }}>
              <label style={{ color: "var(--text-secondary)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", display: "block", marginBottom: "6px" }}>FULL NAME</label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your name" required style={{ width: "100%", padding: "11px 14px", borderRadius: "10px", fontSize: "13px" }} />
            </div>
            <div style={{ marginBottom: "14px" }}>
              <label style={{ color: "var(--text-secondary)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", display: "block", marginBottom: "6px" }}>EMAIL</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required style={{ width: "100%", padding: "11px 14px", borderRadius: "10px", fontSize: "13px" }} />
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ color: "var(--text-secondary)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", display: "block", marginBottom: "6px" }}>PASSWORD</label>
              <div style={{ position: "relative" }}>
                <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" required style={{ width: "100%", padding: "11px 44px 11px 14px", borderRadius: "10px", fontSize: "13px" }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)", display: "flex", alignItems: "center" }}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="hf-btn-gold"
              style={{ width: "100%", padding: "12px", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              {loading ? <div style={{ width: "18px", height: "18px", border: "2px solid #0a0a0b", borderTopColor: "transparent", borderRadius: "99px", animation: "spin 0.6s linear infinite" }} /> : <><UserPlus size={16} /> Create Account</>}
            </button>
          </form>

          <div style={{ borderTop: "1px solid var(--border-subtle)", marginTop: "24px", paddingTop: "20px", textAlign: "center" }}>
            <span style={{ color: "var(--text-tertiary)", fontSize: "12px" }}>Already have an account? </span>
            <Link href="/auth/login" style={{ color: "var(--gold)", fontSize: "12px", fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <ArrowLeft size={12} /> Sign in
            </Link>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
