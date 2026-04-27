"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, BookOpen, Clock, BarChart2, Settings } from "lucide-react"

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Home", exact: true },
  { href: "/dashboard/notebooks", icon: BookOpen, label: "Habits" },
  { href: "/dashboard/time", icon: Clock, label: "Time" },
  { href: "/dashboard/insights", icon: BarChart2, label: "Insights" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
]

export default function BottomNav() {
  const pathname = usePathname()

  const isActive = (item: typeof navItems[0]) => {
    if (item.exact) return pathname === item.href
    return pathname.startsWith(item.href)
  }

  return (
    <nav className="bottom-nav">
      {navItems.map(item => {
        const active = isActive(item)
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              flex: 1,
              padding: "8px 4px",
              textDecoration: "none",
              borderRadius: "10px",
              transition: "all 0.15s ease",
              color: active ? "var(--gold)" : "var(--text-tertiary)",
              position: "relative",
            }}
          >
            {active && (
              <div
                style={{
                  position: "absolute",
                  top: "4px",
                  width: "20px",
                  height: "2px",
                  borderRadius: "99px",
                  background: "var(--gold)",
                }}
              />
            )}
            <item.icon
              size={20}
              strokeWidth={active ? 2.5 : 1.75}
              style={{ color: active ? "var(--gold)" : "var(--text-tertiary)" }}
            />
            <span
              style={{
                fontSize: "10px",
                fontWeight: active ? 700 : 500,
                letterSpacing: "0.02em",
              }}
            >
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
