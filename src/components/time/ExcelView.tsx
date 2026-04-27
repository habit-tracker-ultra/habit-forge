"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/context/AuthContext"
import { Plus, Save, Trash2 } from "lucide-react"

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

interface ExcelRow {
  categoryId: string
  hours: string
  notes: string
}

interface ExcelViewProps {
  categories: Category[]
  logs: TimeLog[]
  selectedDate: string
  onUpdated: () => void
  onAddCategory: () => void
}

export default function ExcelView({ categories, logs, selectedDate, onUpdated, onAddCategory }: ExcelViewProps) {
  const { user } = useAuth()
  const [rows, setRows] = useState<ExcelRow[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const initialRows = categories.map((cat) => {
      const log = logs.find((l) => l.category_id === cat.id)
      return {
        categoryId: cat.id,
        hours: log ? String(log.hours_logged) : "",
        notes: log?.notes || "",
      }
    })
    setRows(initialRows)
  }, [categories, logs])

  const updateRow = (categoryId: string, field: "hours" | "notes", value: string) => {
    setRows((prev) =>
      prev.map((row) =>
        row.categoryId === categoryId ? { ...row, [field]: value } : row
      )
    )
  }

  const handleSaveAll = async () => {
    setSaving(true)

    for (const row of rows) {
      const hours = parseFloat(row.hours || "0")
      if (isNaN(hours) || hours < 0) continue

      const existingLog = logs.find((l) => l.category_id === row.categoryId)

      if (existingLog) {
        await supabase.from("time_logs").update({
          hours_logged: hours,
          notes: row.notes || null,
        }).eq("id", existingLog.id)
      } else if (hours > 0) {
        await supabase.from("time_logs").insert({
          user_id: user?.id,
          category_id: row.categoryId,
          log_date: selectedDate,
          hours_logged: hours,
          notes: row.notes || null,
          view_type: "excel",
        })
      }
    }

    setSaving(false)
    onUpdated()
  }

  const handleClearRow = async (categoryId: string) => {
    const log = logs.find((l) => l.category_id === categoryId)
    if (log) {
      await supabase.from("time_logs").delete().eq("id", log.id)
    }
    setRows((prev) =>
      prev.map((row) =>
        row.categoryId === categoryId ? { ...row, hours: "", notes: "" } : row
      )
    )
    onUpdated()
  }

  const totalHours = rows.reduce((sum, row) => sum + (parseFloat(row.hours) || 0), 0)
  const avgHours = rows.filter((r) => parseFloat(r.hours) > 0).length > 0
    ? totalHours / rows.filter((r) => parseFloat(r.hours) > 0).length
    : 0

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No categories yet. Add one to start tracking!</p>
        <button
          onClick={onAddCategory}
          className="bg-[#e8a83a] text-black font-bold px-5 py-2.5 rounded-xl hover:bg-[#d4952a] transition-all"
        >
          Add Category
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Excel Table */}
      <div className="overflow-x-auto rounded-xl border border-white/5">
        <table className="w-full">
          <thead>
            <tr className="bg-[#0e0b08] border-b border-white/5">
              <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium w-8">#</th>
              <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Category</th>
              <th className="text-center px-4 py-3 text-gray-400 text-sm font-medium w-32">Hours</th>
              <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Notes</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const cat = categories.find((c) => c.id === row.categoryId)
              if (!cat) return null
              const hours = parseFloat(row.hours) || 0

              return (
                <tr
                  key={row.categoryId}
                  className={`border-b border-white/5 transition-all ${
                    hours > 0 ? "bg-[#e8a83a]/5" : "bg-[#171310]"
                  } hover:bg-[#e8a83a]/5`}
                >
                  <td className="px-4 py-3 text-gray-600 text-sm">{index + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{cat.icon}</span>
                      <span className="text-white text-sm font-medium">{cat.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={row.hours}
                      onChange={(e) => updateRow(row.categoryId, "hours", e.target.value)}
                      placeholder="0.0"
                      min="0"
                      step="0.5"
                      className="w-full bg-[#0e0b08] border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#e8a83a] transition-colors text-center"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={row.notes}
                      onChange={(e) => updateRow(row.categoryId, "notes", e.target.value)}
                      placeholder="Notes..."
                      className="w-full bg-[#0e0b08] border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#e8a83a] transition-colors"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleClearRow(row.categoryId)}
                      className="text-gray-600 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>

          {/* Summary Rows */}
          <tfoot>
            <tr className="bg-[#0e0b08] border-t-2 border-[#e8a83a]/20">
              <td colSpan={2} className="px-4 py-3 text-[#e8a83a] font-bold text-sm text-right">
                TOTAL
              </td>
              <td className="px-4 py-3 text-center">
                <span className="text-[#e8a83a] font-bold">{totalHours.toFixed(1)}h</span>
              </td>
              <td colSpan={2}></td>
            </tr>
            <tr className="bg-[#0e0b08]">
              <td colSpan={2} className="px-4 py-3 text-blue-400 font-bold text-sm text-right">
                AVERAGE
              </td>
              <td className="px-4 py-3 text-center">
                <span className="text-blue-400 font-bold">{avgHours.toFixed(1)}h</span>
              </td>
              <td colSpan={2}></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Save All Button */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="flex items-center gap-2 bg-[#e8a83a] hover:bg-[#d4952a] text-black font-bold px-6 py-3 rounded-xl transition-all disabled:opacity-50"
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save All
            </>
          )}
        </button>
      </div>
    </div>
  )
}
