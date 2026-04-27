"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard, BookOpen, Clock, BarChart2,
  Settings, Flame, LogOut, ChevronLeft, ChevronRight, Zap, X, Menu
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import ThemeToggle from "./ThemeToggle"
import { supabase } from "@/lib/supabase"

export const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", exact: true },
  { href: "/dashboard/notebooks", icon: BookOpen, label: "Notebooks" },
  { href: "/dashboard/time", icon: Clock, label: "Time Manager" },
  { href: "/dashboard/insights", icon: BarChart2, label: "Insights" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
]

interface SidebarProps {
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export default function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [xp, setXp] = useState(0)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed")
    if (saved === "true") setCollapsed(true)
  }, [])

  useEffect(() => {
    if (user?.id) {
      supabase.from("profiles").select("xp").eq("id", user.id).single()
        .then(({ data }) => { if (data) setXp(data.xp) })
    }
  }, [user?.id])

  const toggleCollapsed = () => {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem("sidebar-collapsed", String(next))
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/auth/login")
  }

  const handleNavClick = () => {
    if (isMobile && onMobileClose) onMobileClose()
  }

  const isActive = (item: typeof navItems[0]) => {
    if (item.exact) return pathname === item.href
    return pathname.startsWith(item.href)
  }

  const level = Math.floor(xp / 100) + 1
  const xpProgress = xp % 100
  const userInitial = user?.email?.[0]?.toUpperCase() ?? "U"

  const isCollapsed = isMobile ? false : collapsed
  const sidebarWidth = isCollapsed ? "72px" : "260px"

  // Mobile drawer
  if (isMobile) {
    if (!mobileOpen) return null
    return (
      <>
        <div
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 45,
          }}
          onClick={onMobileClose}
        />
        <aside
          className="animate-slide-in-left"
          style={{
            position: "fixed", left: 0, top: 0, bottom: 0,
            width: "280px", zIndex: 50,
            background: "var(--bg-secondary)",
            borderRight: "1px solid var(--border-subtle)",
            display: "flex", flexDirection: "column",
            overflowY: "auto",
          }}
        >
          <SidebarContent
            collapsed={false}
            hoveredItem={hoveredItem}
            setHoveredItem={setHoveredItem}
            isActive={isActive}
            handleSignOut={handleSignOut}
            handleNavClick={handleNavClick}
            toggleCollapsed={() => { if (onMobileClose) onMobileClose() }}
            user={user}
            userInitial={userInitial}
            level={level}
            xp={xp}
            xpProgress={xpProgress}
            isMobile={true}
            onClose={onMobileClose}
          />
        </aside>
      </>
    )
  }

  // Desktop sidebar
  return (
    <aside
      className="desktop-sidebar"
      style={{
        width: sidebarWidth,
        transition: "width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "fixed", left: 0, top: 0, height: "100vh",
        zIndex: 40, overflow: "hidden",
        background: "var(--bg-secondary)",
        borderRight: "1px solid var(--border-subtle)",
        display: "flex", flexDirection: "column",
      }}
    >
      <SidebarContent
        collapsed={isCollapsed}
        hoveredItem={hoveredItem}
        setHoveredItem={setHoveredItem}
        isActive={isActive}
        handleSignOut={handleSignOut}
        handleNavClick={handleNavClick}
        toggleCollapsed={toggleCollapsed}
        user={user}
        userInitial={userInitial}
        level={level}
        xp={xp}
        xpProgress={xpProgress}
        isMobile={false}
      />
    </aside>
  )
}

function SidebarContent({ collapsed, hoveredItem, setHoveredItem, isActive, handleSignOut, handleNavClick, toggleCollapsed, user, userInitial, level, xp, xpProgress, isMobile, onClose }: any) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%" }}>
      {/* Logo */}
      <div style={{
        height: "64px", display: "flex", alignItems: "center",
        justifyContent: collapsed ? "center" : "space-between",
        padding: "0 16px",
        borderBottom: "1px solid var(--border-subtle)",
        flexShrink: 0,
      }}>
        {!collapsed && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "linear-gradient(135deg, #e8a83a, #c8901e)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Flame size={16} color="#0a0a0b" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ color: "var(--text-primary)", fontWeight: 800, fontSize: "13px", letterSpacing: "-0.01em" }}>HABIT FORGE</div>
              <div style={{ color: "var(--text-tertiary)", fontSize: "9px", letterSpacing: "0.08em", fontWeight: 600 }}>PREMIUM</div>
            </div>
          </div>
        )}
        {collapsed && (
          <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "linear-gradient(135deg, #e8a83a, #c8901e)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Flame size={16} color="#0a0a0b" strokeWidth={2.5} />
          </div>
        )}
        {!collapsed && (
          <button
            onClick={isMobile ? onClose : toggleCollapsed}
            style={{ width: "28px", height: "28px", borderRadius: "8px", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-secondary)", transition: "all 0.2s ease", flexShrink: 0 }}
          >
            {isMobile ? <X size={14} /> : <ChevronLeft size={14} />}
          </button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
        {collapsed && (
          <button
            onClick={toggleCollapsed}
            style={{ width: "100%", height: "34px", borderRadius: "8px", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-secondary)", marginBottom: "8px", transition: "all 0.2s ease" }}
          >
            <ChevronRight size={14} />
          </button>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {navItems.map(item => {
            const active = isActive(item)
            return (
              <div key={item.href} style={{ position: "relative" }}
                onMouseEnter={() => setHoveredItem(item.href)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <Link
                  href={item.href}
                  onClick={handleNavClick}
                  style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    padding: collapsed ? "10px 0" : "9px 12px",
                    justifyContent: collapsed ? "center" : "flex-start",
                    borderRadius: "10px", textDecoration: "none",
                    transition: "all 0.15s ease",
                    background: active ? "linear-gradient(135deg, rgba(232,168,58,0.15), rgba(232,168,58,0.08))" : "transparent",
                    border: active ? "1px solid rgba(232,168,58,0.25)" : "1px solid transparent",
                    color: active ? "var(--gold)" : "var(--text-secondary)",
                    fontWeight: active ? 600 : 500, fontSize: "13.5px",
                  }}
                >
                  {active && !collapsed && (
                    <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: "3px", height: "55%", background: "var(--gold)", borderRadius: "0 3px 3px 0" }} />
                  )}
                  <item.icon size={18} strokeWidth={active ? 2.5 : 2} style={{ flexShrink: 0, marginLeft: active && !collapsed ? "6px" : "0" }} />
                  {!collapsed && <span style={{ flex: 1 }}>{item.label}</span>}
                  {!collapsed && active && <div style={{ width: "6px", height: "6px", borderRadius: "99px", background: "var(--gold)" }} />}
                </Link>
                {collapsed && hoveredItem === item.href && (
                  <div style={{ position: "absolute", left: "calc(100% + 12px)", top: "50%", transform: "translateY(-50%)", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", color: "var(--text-primary)", padding: "6px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, whiteSpace: "nowrap", zIndex: 100, boxShadow: "0 4px 16px rgba(0,0,0,0.3)", pointerEvents: "none" }}>
                    {item.label}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </nav>

      {/* Bottom */}
      <div style={{ padding: "12px 10px", borderTop: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", gap: "8px", flexShrink: 0 }}>
        {!collapsed && (
          <div style={{ padding: "10px 12px", background: "var(--bg-elevated)", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <Zap size={11} color="var(--gold)" />
                <span style={{ color: "var(--text-secondary)", fontSize: "11px", fontWeight: 600 }}>LEVEL {level}</span>
              </div>
              <span style={{ color: "var(--gold)", fontSize: "11px", fontWeight: 700 }}>{xp} XP</span>
            </div>
            <div style={{ height: "4px", background: "var(--border-subtle)", borderRadius: "99px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${xpProgress}%`, background: "linear-gradient(90deg, var(--gold), var(--gold-light))", borderRadius: "99px", transition: "width 0.5s ease" }} />
            </div>
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between", padding: "4px 8px" }}>
          {!collapsed && <span style={{ color: "var(--text-tertiary)", fontSize: "11px" }}>Theme</span>}
          <ThemeToggle />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: collapsed ? "8px 0" : "8px 10px", justifyContent: collapsed ? "center" : "flex-start", background: "var(--bg-elevated)", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "linear-gradient(135deg, rgba(232,168,58,0.3), rgba(232,168,58,0.1))", border: "1px solid rgba(232,168,58,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontWeight: 800, fontSize: "13px", color: "var(--gold)" }}>
            {userInitial}
          </div>
          {!collapsed && (
            <>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: "var(--text-primary)", fontSize: "12px", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "130px" }}>
                  {user?.email?.split("@")[0]}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "1px" }}>
                  <div className="status-dot active" />
                  <span style={{ color: "var(--emerald)", fontSize: "10px", fontWeight: 600 }}>ACTIVE</span>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                style={{ width: "28px", height: "28px", borderRadius: "8px", background: "transparent", border: "1px solid transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-tertiary)", transition: "all 0.2s ease", flexShrink: 0 }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.1)"; (e.currentTarget as HTMLElement).style.color = "#ef4444" }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--text-tertiary)" }}
              >
                <LogOut size={14} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
