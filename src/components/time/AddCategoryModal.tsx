"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/context/AuthContext"
import { X, Plus } from "lucide-react"

interface AddCategoryModalProps {
  onClose: () => void
  onCreated: () => void
}

const COLORS = ["#e8a83a", "#4ade80", "#60a5fa", "#f472b6", "#a78bfa", "#fb923c", "#34d399", "#f87171"]
const ICONS = ["⏱️", "💼", "📚", "🏃", "🧘", "💪", "🎨", "🎵", "💻", "🍳", "🌿", "✈️"]

export default function AddCategoryModal({ onClose, onCreated }: AddCategoryModalProps) {
  const { user } = useAuth()
  const [name, setName] = useState("")
  const [color, setColor] = useState("#e8a83a")
  const [icon, setIcon] = useState("⏱️")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setError("")

    const { error } = await supabase.from("time_categories").insert({
      user_id: user?.id,
      name: name.trim(),
      color,
      icon,
    })

    if (error) {
      setError(error.message)
      setSaving(false)
    } else {
      onCreated()
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#171310] rounded-2xl p-8 border border-[#e8a83a]/20 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Add Category</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 mb-4 text-red-300 text-sm">❌ {error}</div>
        )}

        <form onSubmit={handleCreate} className="space-y-5">
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Category Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Deep Work, Exercise, Reading"
              required
              className="w-full bg-[#0e0b08] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#e8a83a] transition-colors"
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-2 block">Icon</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                    icon === i
                      ? "bg-[#e8a83a]/20 border border-[#e8a83a]"
                      : "bg-[#0e0b08] border border-gray-700 hover:border-gray-500"
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-2 block">Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-all ${
                    color === c ? "ring-2 ring-white ring-offset-2 ring-offset-[#171310]" : ""
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-[#e8a83a] hover:bg-[#d4952a] text-black font-bold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Add Category
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
