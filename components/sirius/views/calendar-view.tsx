'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { CalendarDays, Plus, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useMounted } from '@/components/client-only'
import type { EventItem } from '@/types/sirius'

const DAYS_TR = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']
const MONTHS_TR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']

// SSR-safe initial date
const INITIAL_DATE = new Date(Date.UTC(2026, 8, 29))

export function CalendarView() {
  const mounted = useMounted()
  const [events, setEvents] = useState<EventItem[]>([])
  const [currentDate, setCurrentDate] = useState(INITIAL_DATE)
  const [view, setView] = useState<'month' | 'week' | 'day'>('month')
  const [showAdd, setShowAdd] = useState(false)
  const [newEvent, setNewEvent] = useState({ title: '', date: '', time: '09:00' })

  const loadEvents = useCallback(() => {
    const y = currentDate.getFullYear()
    const m = currentDate.getMonth()
    const start = new Date(y, m, 1).toISOString()
    const end = new Date(y, m + 1, 0, 23, 59).toISOString()
    fetch(`/api/events?start=${start}&end=${end}`)
      .then(r => r.json())
      .then((d: any) => setEvents(d?.events ?? []))
      .catch(() => {})
  }, [currentDate])

  useEffect(() => { setCurrentDate(new Date()) }, [])
  useEffect(() => { loadEvents() }, [loadEvents])

  const addEvent = async () => {
    if (!newEvent?.title?.trim() || !newEvent?.date) return
    const startTime = new Date(`${newEvent.date}T${newEvent.time}:00`)
    const endTime = new Date(startTime.getTime() + 3600000)
    await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newEvent.title, startTime: startTime.toISOString(), endTime: endTime.toISOString() }),
    })
    setShowAdd(false)
    setNewEvent({ title: '', date: '', time: '09:00' })
    loadEvents()
  }

  const y = currentDate.getFullYear()
  const m = currentDate.getMonth()
  const firstDay = new Date(y, m, 1)
  const lastDay = new Date(y, m + 1, 0)
  const startOffset = (firstDay.getDay() + 6) % 7
  const daysInMonth = lastDay.getDate()
  const today = new Date()

  const getEventsForDay = (day: number): EventItem[] => {
    return (events ?? []).filter((e: EventItem) => {
      const d = new Date(e?.startTime)
      return d.getDate() === day && d.getMonth() === m && d.getFullYear() === y
    })
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <CalendarDays className="w-6 h-6 text-sirius-primary" /> Takvim
        </h1>
        <button onClick={() => setShowAdd(true)} className="px-3 py-2 rounded-lg bg-sirius-primary/20 text-sirius-primary text-sm font-medium hover:bg-sirius-primary/30 flex items-center gap-1">
          <Plus className="w-4 h-4" /> Yeni Etkinlik
        </button>
      </div>

      {/* View tabs */}
      <div className="flex items-center gap-4">
        <div className="flex gap-1 sirius-panel rounded-lg p-1">
          {(['day', 'week', 'month'] as const).map((v: 'day' | 'week' | 'month') => (
            <button key={v} onClick={() => setView(v)} className={`px-3 py-1.5 rounded-md text-xs font-medium ${
              view === v ? 'bg-sirius-primary/20 text-sirius-primary' : 'text-sirius-text-secondary hover:text-white'
            }`}>
              {v === 'day' ? 'Gün' : v === 'week' ? 'Hafta' : 'Ay'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentDate(new Date(y, m - 1, 1))} className="p-1.5 rounded-lg hover:bg-white/5 text-sirius-text-secondary">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-white min-w-[120px] text-center">{MONTHS_TR[m]} {y}</span>
          <button onClick={() => setCurrentDate(new Date(y, m + 1, 1))} className="p-1.5 rounded-lg hover:bg-white/5 text-sirius-text-secondary">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Add form */}
      {showAdd && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="sirius-panel rounded-xl p-4 space-y-3">
          <input type="text" value={newEvent.title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewEvent(prev => ({ ...(prev ?? {}), title: e?.target?.value ?? '' }))} placeholder="Etkinlik adı..." className="w-full bg-transparent text-white text-sm outline-none placeholder:text-sirius-text-secondary/60" autoFocus />
          <div className="flex gap-2">
            <input type="date" value={newEvent.date} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewEvent(prev => ({ ...(prev ?? {}), date: e?.target?.value ?? '' }))} className="bg-transparent text-xs text-sirius-text-secondary border border-[var(--sirius-border)] rounded-lg px-2 py-1.5 outline-none" />
            <input type="time" value={newEvent.time} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewEvent(prev => ({ ...(prev ?? {}), time: e?.target?.value ?? '09:00' }))} className="bg-transparent text-xs text-sirius-text-secondary border border-[var(--sirius-border)] rounded-lg px-2 py-1.5 outline-none" />
            <div className="flex-1" />
            <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 text-xs text-sirius-text-secondary">İptal</button>
            <button onClick={addEvent} className="px-3 py-1.5 text-xs bg-sirius-primary text-white rounded-lg">Ekle</button>
          </div>
        </motion.div>
      )}

      {/* Month grid */}
      {view === 'month' && (
        <div className="sirius-panel rounded-xl overflow-hidden">
          <div className="grid grid-cols-7 border-b border-[var(--sirius-border)]">
            {DAYS_TR.map((d: string) => (
              <div key={d} className="py-2 text-center text-xs font-medium text-sirius-text-secondary">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {Array.from({ length: startOffset }).map((_: unknown, i: number) => (
              <div key={`e-${i}`} className="min-h-[80px] border-b border-r border-[var(--sirius-border)] opacity-30" />
            ))}
            {Array.from({ length: daysInMonth }).map((_: unknown, i: number) => {
              const day = i + 1
              const isToday = day === today.getDate() && m === today.getMonth() && y === today.getFullYear()
              const dayEvents = getEventsForDay(day)
              return (
                <div key={day} className={`min-h-[80px] p-1.5 border-b border-r border-[var(--sirius-border)] hover:bg-white/5 transition-colors ${
                  isToday ? 'bg-sirius-primary/5' : ''
                }`}>
                  <span className={`text-xs font-medium inline-flex items-center justify-center w-6 h-6 rounded-full ${
                    isToday ? 'bg-sirius-primary text-white' : 'text-sirius-text-secondary'
                  }`}>{day}</span>
                  {(dayEvents ?? []).slice(0, 2).map((ev: EventItem) => (
                    <div key={ev?.id} className="mt-0.5 px-1 py-0.5 rounded text-[10px] truncate" style={{ backgroundColor: `${ev?.color ?? '#6677FF'}20`, color: ev?.color ?? '#6677FF' }}>
                      {ev?.title ?? ''}
                    </div>
                  ))}
                  {(dayEvents?.length ?? 0) > 2 && <span className="text-[10px] text-sirius-text-secondary">+{(dayEvents?.length ?? 0) - 2}</span>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Day view */}
      {view === 'day' && (
        <div className="sirius-panel rounded-xl p-4 space-y-2">
          {Array.from({ length: 14 }).map((_: unknown, i: number) => {
            const hour = i + 7
            const hourEvents = (events ?? []).filter((e: EventItem) => {
              const d = new Date(e?.startTime)
              return d.getHours() === hour && d.getDate() === currentDate.getDate()
            })
            return (
              <div key={hour} className="flex gap-3 py-2 border-b border-[var(--sirius-border)]/30">
                <span className="text-xs text-sirius-text-secondary w-10 shrink-0">{String(hour).padStart(2, '0')}:00</span>
                <div className="flex-1">
                  {(hourEvents ?? []).map((ev: EventItem) => (
                    <div key={ev?.id} className="px-2 py-1 rounded text-xs" style={{ backgroundColor: `${ev?.color ?? '#6677FF'}20`, color: ev?.color ?? '#6677FF' }}>{ev?.title ?? ''}</div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Week view */}
      {view === 'week' && (
        <div className="sirius-panel rounded-xl p-4">
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }).map((_: unknown, i: number) => {
              const d = new Date(currentDate)
              const dayOfWeek = (currentDate.getDay() + 6) % 7
              d.setDate(currentDate.getDate() - dayOfWeek + i)
              const dayEvents = (events ?? []).filter((e: EventItem) => {
                const ed = new Date(e?.startTime)
                return ed.getDate() === d.getDate() && ed.getMonth() === d.getMonth()
              })
              return (
                <div key={i} className="text-center space-y-1">
                  <p className="text-xs text-sirius-text-secondary">{DAYS_TR[i]}</p>
                  <p className="text-sm font-medium text-white">{d.getDate()}</p>
                  {(dayEvents ?? []).map((ev: EventItem) => (
                    <div key={ev?.id} className="px-1 py-0.5 rounded text-[10px] truncate" style={{ backgroundColor: `${ev?.color ?? '#6677FF'}20`, color: ev?.color ?? '#6677FF' }}>{ev?.title ?? ''}</div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
