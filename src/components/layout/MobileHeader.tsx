"use client"

import { Flame, Menu } from "lucide-react"

interface MobileHeaderProps {
  onMenuOpen: () => void
  title?: string
}

export default function MobileHeader({ onMenuOpen, title }: MobileHeaderProps) {
  return (
    <header
      className="mobile-header"
      style={{
        display: "none",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 16px",
        borderBottom: "1px solid var(--border-subtle)",
        background: "var(--bg-secondary)",
        position: "sticky",
        top: 0,
        zIndex: 30,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "linear-gradient(135deg, #e8a83a, #c8901e)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Flame size={14} color="#0a0a0b" strokeWidth={2.5} />
        </div>
        <span style={{ color: "var(--text-primary)", fontWeight: 800, fontSize: "13px", letterSpacing: "-0.01em" }}>
          {title || "HABIT FORGE"}
        </span>
      </div>
      <button
        onClick={onMenuOpen}
        style={{ width: "36px", height: "36px", borderRadius: "10px", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-secondary)" }}
      >
        <Menu size={18} />
      </button>

      <style>{`
        @media (max-width: 768px) {
          .mobile-header { display: flex !important; }
        }
      `}</style>
    </header>
  )
}
