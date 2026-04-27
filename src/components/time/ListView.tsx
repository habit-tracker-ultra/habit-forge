"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/context/AuthContext"
import { Plus, Trash2, Clock } from "lucide-react"

interface Category {
  id: string
  name: string
  color: string
  icon: string
}

interface TimeLog {
  id: string
  category_id: string
  log_date: string
  hours_logged: number
  notes: string | null
}

interface ListViewProps {
  categories: Category[]
  logs: TimeLog[]
  selectedDate: string
  onUpdated: () => void
  onAddCategory: () => void
}

export default function ListView({ categories, logs, selectedDate, onUpdated, onAddCategory }: ListViewProps) {
  const { user } = useAuth()
  const [saving, setSaving] = useState<string | null>(null)
  const [newHours, setNewHours] = useState<Record<string, string>>({})
  const [newNotes, setNewNotes] = useState<Record<string, string>>({})

  const getLog = (categoryId: string) =>
    logs.find((l) => l.category_id === categoryId)

  const handleSave = async (categoryId: string) => {
    const hours = parseFloat(newHours[categoryId] || "0")
    if (isNaN(hours) || hours < 0) return
    setSaving(categoryId)

    const existingLog = getLog(categoryId)

    if (existingLog) {
      await supabase.from("time_logs").update({
        hours_logged: hours,
        notes: newNotes[categoryId] || null,
      }).eq("id", existingLog.id)
    } else {
      await supabase.from("time_logs").insert({
        user_id: user?.id,
        category_id: categoryId,
        log_date: selectedDate,
        hours_logged: hours,
        notes: newNotes[categoryId] || null,
        view_type: "list",
      })
    }

    setSaving(null)
    onUpdated()
  }

  const handleDelete = async (categoryId: string) => {
    const log = getLog(categoryId)
    if (!log) return
    await supabase.from("time_logs").delete().eq("id", log.id)
    setNewHours((prev) => ({ ...prev, [categoryId]: "" }))
    setNewNotes((prev) => ({ ...prev, [categoryId]: "" }))
    onUpdated()
  }

  const totalHours = logs.reduce((sum, l) => sum + Number(l.hours_logged), 0)

  return (
    <div>
      {/* Total Bar */}
      {logs.length > 0 && (
        <div className="bg-[#e8a83a]/10 border border-[#e8a83a]/20 rounded-xl p-4 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#e8a83a]" />
            <span className="text-white font-medium">Total Hours Today</span>
          </div>
          <span className="text-[#e8a83a] font-bold text-xl">{totalHours.toFixed(1)}h</span>
        </div>
      )}

      {/* Category Rows */}
      <div className="space-y-3">
        {categories.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">No categories yet. Add one to start tracking!</p>
            <button
              onClick={onAddCategory}
              className="bg-[#e8a83a] text-black font-bold px-5 py-2.5 rounded-xl hover:bg-[#d4952a] transition-all"
            >
              Add Category
            </button>
          </div>
        ) : (
          categories.map((cat) => {
            const log = getLog(cat.id)
            const currentHours = newHours[cat.id] !== undefined
              ? newHours[cat.id]
              : log ? String(log.hours_logged) : ""
            const currentNotes = newNotes[cat.id] !== undefined
              ? newNotes[cat.id]
              : log?.notes || ""

            return (
              <div
                key={cat.id}
                className="bg-[#171310] rounded-xl p-4 border border-white/5 hover:border-[#e8a83a]/10 transition-all"
              >
                <div className="flex items-center gap-4">
                  {/* Category Info */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                    style={{ backgroundColor: `${cat.color}20`, border: `1px solid ${cat.color}40` }}
                  >
                    {cat.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm">{cat.name}</p>
                    {log && (
                      <p className="text-gray-500 text-xs">{Number(log.hours_logged).toFixed(1)}h logged</p>
                    )}
                  </div>

                  {/* Hours Input */}
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={currentHours}
                      onChange={(e) => setNewHours((prev) => ({ ...prev, [cat.id]: e.target.value }))}
                      placeholder="0.0"
                      min="0"
                      step="0.5"
                      className="w-20 bg-[#0e0b08] border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#e8a83a] transition-colors text-center"
                    />
                    <span className="text-gray-500 text-sm">hrs</span>
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={() => handleSave(cat.id)}
                    disabled={saving === cat.id}
                    className="bg-[#e8a83a] text-black font-bold px-4 py-2 rounded-lg text-sm hover:bg-[#d4952a] transition-all disabled:opacity-50"
                  >
                    {saving === cat.id ? "..." : "Save"}
                  </button>

                  {/* Delete Button */}
                  {log && (
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="text-gray-600 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Notes */}
                <div className="mt-3 ml-14">
                  <input
                    type="text"
                    value={currentNotes}
                    onChange={(e) => setNewNotes((prev) => ({ ...prev, [cat.id]: e.target.value }))}
                    placeholder="Add a note (optional)"
                    className="w-full bg-[#0e0b08] border border-gray-700 rounded-lg px-3 py-2 text-white text-xs placeholder-gray-600 focus:outline-none focus:border-[#e8a83a] transition-colors"
                  />
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
