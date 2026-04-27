"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Flame } from "lucide-react"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push("/dashboard")
      } else {
        router.push("/waitlist")
      }
    })
  }, [router])

  return (
    <main className="min-h-screen bg-[#0e0b08] flex items-center justify-center">
      <div className="flex items-center gap-3">
        <Flame className="w-8 h-8 text-[#e8a83a] animate-pulse" />
        <span className="text-[#e8a83a] text-2xl font-bold animate-pulse">
          Loading Habit Forge...
        </span>
      </div>
    </main>
  )
}
