"use client"

import { useTheme } from "@/context/ThemeContext"
import { Sun, Moon } from "lucide-react"

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
      style={{
        width: "44px",
        height: "24px",
        borderRadius: "99px",
        background: theme === "dark"
          ? "rgba(232,168,58,0.15)"
          : "rgba(232,168,58,0.9)",
        border: theme === "dark"
          ? "1px solid rgba(232,168,58,0.3)"
          : "1px solid rgba(232,168,58,1)",
        position: "relative",
        cursor: "pointer",
        transition: "all 0.25s ease",
        display: "flex",
        alignItems: "center",
        padding: "2px",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: "18px",
          height: "18px",
          borderRadius: "99px",
          background: theme === "dark"
            ? "var(--gold)"
            : "#fff",
          transform: theme === "dark" ? "translateX(0px)" : "translateX(20px)",
          transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
        }}
      >
        {theme === "dark" ? (
          <Moon size={10} color="#0a0a0b" strokeWidth={2.5} />
        ) : (
          <Sun size={10} color="var(--gold)" strokeWidth={2.5} />
        )}
      </div>
    </button>
  )
}
