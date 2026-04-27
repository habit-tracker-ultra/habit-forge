"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Plus, X, BookOpen, Clock, BarChart2, LayoutDashboard } from "lucide-react"

export default function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  if (!pathname.startsWith("/dashboard")) return null

  const actions = [
    { icon: LayoutDashboard, label: "Dashboard", color: "#4ade80", onClick: () => router.push("/dashboard") },
    { icon: BookOpen, label: "Notebooks", color: "#60a5fa", onClick: () => router.push("/dashboard/notebooks") },
    { icon: Clock, label: "Time Manager", color: "#a78bfa", onClick: () => router.push("/dashboard/time") },
    { icon: BarChart2, label: "Insights", color: "#f472b6", onClick: () => router.push("/dashboard/insights") },
  ]

  return (
    <div style={{ position: "fixed", bottom: "28px", right: "28px", zIndex: 40, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px" }}>

      {/* Action Buttons */}
      {isOpen && actions.map((action, i) => (
        <div
          key={action.label}
          className="animate-fade-in"
          style={{ display: "flex", alignItems: "center", gap: "10px", animationDelay: `${i * 50}ms` }}
        >
          <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: "8px", padding: "5px 10px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap", boxShadow: "0 4px 16px rgba(0,0,0,0.3)" }}>
            {action.label}
          </div>
          <button
            onClick={() => { action.onClick(); setIsOpen(false) }}
            style={{
              width: "44px", height: "44px", borderRadius: "12px",
              background: `${action.color}20`,
              border: `1px solid ${action.color}40`,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", transition: "all 0.2s ease",
              boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${action.color}30`; (e.currentTarget as HTMLElement).style.transform = "scale(1.1)" }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = `${action.color}20`; (e.currentTarget as HTMLElement).style.transform = "scale(1)" }}
          >
            <action.icon size={18} style={{ color: action.color }} />
          </button>
        </div>
      ))}

      {/* Main Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "52px", height: "52px", borderRadius: "14px",
          background: isOpen ? "var(--bg-elevated)" : "linear-gradient(135deg, var(--gold), var(--gold-dark))",
          border: isOpen ? "1px solid var(--border-default)" : "1px solid transparent",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
          boxShadow: isOpen ? "0 4px 16px rgba(0,0,0,0.2)" : "0 8px 24px rgba(232,168,58,0.35)",
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.05)" }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)" }}
      >
        {isOpen
          ? <X size={20} style={{ color: "var(--text-secondary)" }} />
          : <Plus size={22} color="#0a0a0b" strokeWidth={2.5} />
        }
      </button>
    </div>
  )
}
