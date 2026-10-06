'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, ListTodo, Phone, Plus, ChevronRight } from 'lucide-react'
import type { EventItem, TaskItem, NavItem } from '@/types/sirius'

export function TodayView({ onNavigate }: { onNavigate: (nav: NavItem) => void }) {
  const [events, setEvents] = useState<EventItem[]>([])
  const [tasks, setTasks] = useState<TaskItem[]>([])

  useEffect(() => {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString()
    fetch(`/api/events?start=${start}&end=${end}`)
      .then(r => r.json())
      .then((d: any) => setEvents(d?.events ?? []))
      .catch(() => {})
    fetch('/api/tasks?status=pending')
      .then(r => r.json())
      .then((d: any) => setTasks((d?.tasks ?? []).slice(0, 5)))
      .catch(() => {})
  }, [])

  const now = new Date()
  const dateStr = now.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Istanbul' })

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold text-white tracking-tight">Bugün</h1>
        <p className="text-sirius-text-secondary text-sm mt-1">{dateStr}</p>
      </motion.div>

      {/* Schedule */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-sirius-primary" />
            <h2 className="text-sm font-semibold text-white">Program</h2>
          </div>
          <button onClick={() => onNavigate('calendar')} className="text-xs text-sirius-primary flex items-center gap-1 hover:underline">
            Tümünü gör <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        {(events?.length ?? 0) === 0 ? (
          <div className="sirius-panel rounded-xl p-6 text-center">
            <p className="text-sirius-text-secondary text-sm">Bugün planlanmış etkinlik yok.</p>
            <button onClick={() => onNavigate('calendar')} className="mt-3 text-xs text-sirius-primary hover:underline">Etkinlik ekle</button>
          </div>
        ) : (
          <div className="space-y-2">
            {(events ?? []).map((ev: EventItem, i: number) => {
              const time = new Date(ev?.startTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Istanbul' })
              return (
                <motion.div
                  key={ev?.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="sirius-panel rounded-xl p-4 flex items-center gap-4 hover:bg-white/5 transition-colors"
                >
                  <div className="w-1 h-10 rounded-full shrink-0" style={{ backgroundColor: ev?.color ?? '#6677FF' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{ev?.title ?? ''}</p>
                    {ev?.location && <p className="text-xs text-sirius-text-secondary mt-0.5">{ev.location}</p>}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-sirius-text-secondary">
                    <Clock className="w-3 h-3" />
                    <span>{time}</span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>

      {/* Tasks */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListTodo className="w-4 h-4 text-sirius-success" />
            <h2 className="text-sm font-semibold text-white">Görevler</h2>
          </div>
          <button onClick={() => onNavigate('tasks')} className="text-xs text-sirius-primary flex items-center gap-1 hover:underline">
            Tümünü gör <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        {(tasks?.length ?? 0) === 0 ? (
          <div className="sirius-panel rounded-xl p-6 text-center">
            <p className="text-sirius-text-secondary text-sm">Aktif görev yok.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {(tasks ?? []).map((t: TaskItem, i: number) => (
              <motion.div
                key={t?.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className="sirius-panel rounded-xl p-4 flex items-center gap-3"
              >
                <div className={`w-2 h-2 rounded-full ${
                  t?.priority === 'urgent' ? 'bg-sirius-error' :
                  t?.priority === 'high' ? 'bg-sirius-warning' :
                  'bg-sirius-success'
                }`} />
                <span className="text-sm text-white flex-1">{t?.title ?? ''}</span>
                {t?.dueDate && <span className="text-xs text-sirius-text-secondary">{new Date(t.dueDate).toLocaleDateString('tr-TR', { timeZone: 'Europe/Istanbul' })}</span>}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
