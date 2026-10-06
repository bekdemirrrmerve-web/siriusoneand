'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Cloud, Sun, Calendar, Lightbulb, Check, X } from 'lucide-react'
import type { EventItem, SuggestionItem } from '@/types/sirius'

const demoSuggestions: SuggestionItem[] = [
  { id: '1', text: 'Saat 11:30\'da bo\u015f vaktin var.', type: 'free_slot' },
  { id: '2', text: 'Babam\u0131 arasam m\u0131?', type: 'call_reminder' },
  { id: '3', text: 'Yar\u0131na haz\u0131rl\u0131k yap.', type: 'preparation' },
]

export function RightSidebar() {
  const [events, setEvents] = useState<EventItem[]>([])
  const [suggestions] = useState<SuggestionItem[]>(demoSuggestions)

  useEffect(() => {
    const today = new Date()
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString()
    fetch(`/api/events?start=${start}&end=${end}`)
      .then(r => r.json())
      .then((d: any) => setEvents(d?.events ?? []))
      .catch(() => {})
  }, [])

  const now = new Date()
  const dateStr = now.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Istanbul' })

  return (
    <aside className="w-[280px] h-full border-l border-[var(--sirius-border)] p-4 space-y-5 overflow-y-auto scrollbar-none" style={{ background: 'var(--sirius-panel)' }}>
      {/* Greeting / weather */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="sirius-panel rounded-xl p-4">
        <div className="flex items-center gap-2 text-sirius-text-secondary text-xs">
          <Sun className="w-4 h-4 text-sirius-warning" />
          <span>22°C • Açık</span>
        </div>
        <p className="mt-2 text-sm text-white font-medium">{dateStr}</p>
        <p className="text-xs text-sirius-text-secondary mt-1">İstanbul</p>
      </motion.div>

      {/* Today's Schedule */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-sirius-primary" />
          <h3 className="text-sm font-semibold text-white">Bugünkü Program</h3>
        </div>
        <div className="space-y-2">
          {(events?.length ?? 0) === 0 ? (
            <p className="text-xs text-sirius-text-secondary p-2">Bugün etkinlik yok.</p>
          ) : (
            (events ?? []).map((ev: EventItem) => {
              const time = new Date(ev?.startTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Istanbul' })
              return (
                <div key={ev?.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors">
                  <div className="w-1 h-8 rounded-full" style={{ backgroundColor: ev?.color ?? '#6677FF' }} />
                  <div>
                    <p className="text-sm text-white font-medium">{ev?.title ?? ''}</p>
                    <p className="text-xs text-sirius-text-secondary">{time}</p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Smart Suggestions */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-sirius-secondary" />
          <h3 className="text-sm font-semibold text-white">Akıllı Öneriler</h3>
        </div>
        <div className="space-y-2">
          {(suggestions ?? []).map((s: SuggestionItem) => (
            <div key={s?.id} className="sirius-panel rounded-lg p-3 flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-sirius-secondary mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-white">{s?.text ?? ''}</p>
                <div className="mt-2 flex gap-1">
                  <button className="p-1 rounded hover:bg-sirius-success/20"><Check className="w-3.5 h-3.5 text-sirius-success" /></button>
                  <button className="p-1 rounded hover:bg-white/10"><X className="w-3.5 h-3.5 text-sirius-text-secondary" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
