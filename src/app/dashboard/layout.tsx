"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import Sidebar from "@/components/layout/Sidebar"
import BottomNav from "@/components/layout/BottomNav"
import MobileHeader from "@/components/layout/MobileHeader"
import FloatingActionButton from "@/components/FloatingActionButton"
import { Flame } from "lucide-react"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.push("/auth/login")
  }, [user, loading, router])

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)

    const saved = localStorage.getItem("sidebar-collapsed")
    setSidebarCollapsed(saved === "true")
    setMounted(true)

    const interval = setInterval(() => {
      const val = localStorage.getItem("sidebar-collapsed")
      setSidebarCollapsed(val === "true")
    }, 150)

    return () => {
      window.removeEventListener("resize", checkMobile)
      clearInterval(interval)
    }
  }, [])

  if (loading || !mounted) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #e8a83a, #c8901e)", display: "flex", alignItems: "center", justifyContent: "center" }} className="animate-pulse-gold">
            <Flame size={18} color="#0a0a0b" />
          </div>
          <div>
            <div style={{ color: "var(--gold)", fontWeight: 800, fontSize: "15px" }}>HABIT FORGE</div>
            <div style={{ color: "var(--text-tertiary)", fontSize: "10px", letterSpacing: "0.06em" }}>LOADING...</div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) return null

  const marginLeft = isMobile ? "0" : sidebarCollapsed ? "72px" : "260px"

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-primary)" }}>

      {/* Desktop Sidebar */}
      {!isMobile && <Sidebar />}

      {/* Mobile Sidebar Drawer */}
      {isMobile && (
        <Sidebar
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main
        className="main-content-with-sidebar"
        style={{
          flex: 1,
          marginLeft,
          transition: "margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          minHeight: "100vh",
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Mobile Header */}
        <MobileHeader onMenuOpen={() => setMobileMenuOpen(true)} />

        {/* Page Content */}
        <div style={{ flex: 1 }}>
          {children}
        </div>
      </main>

      {/* Bottom Navigation (Mobile) */}
      <BottomNav />

      {/* FAB (Desktop only) */}
      <div className="floating-action-button">
        <FloatingActionButton />
      </div>
    </div>
  )
}
