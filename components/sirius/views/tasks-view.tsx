'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ListTodo, Plus, Check, X, Clock, AlertCircle, ChevronDown } from 'lucide-react'
import type { TaskItem } from '@/types/sirius'

const priorityColors: Record<string, string> = {
  urgent: '#F06E78',
  high: '#F4B85E',
  medium: '#6677FF',
  low: '#5FD39B',
}

const statusLabels: Record<string, string> = {
  pending: 'Bekliyor',
  in_progress: 'Devam ediyor',
  completed: 'Tamamlandı',
  cancelled: 'İptal edildi',
}

export function TasksView() {
  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [filter, setFilter] = useState('pending')
  const [showAdd, setShowAdd] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newPriority, setNewPriority] = useState('medium')

  const loadTasks = useCallback(() => {
    const url = filter === 'all' ? '/api/tasks' : `/api/tasks?status=${filter}`
    fetch(url)
      .then(r => r.json())
      .then((d: any) => setTasks(d?.tasks ?? []))
      .catch(() => {})
  }, [filter])

  useEffect(() => { loadTasks() }, [loadTasks])

  const addTask = async () => {
    if (!newTitle?.trim()) return
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle, priority: newPriority }),
    })
    setNewTitle('')
    setShowAdd(false)
    loadTasks()
  }

  const toggleStatus = async (task: TaskItem) => {
    const newStatus = task?.status === 'completed' ? 'pending' : 'completed'
    await fetch('/api/tasks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: task?.id, status: newStatus }),
    })
    loadTasks()
  }

  const deleteTask = async (id: string) => {
    await fetch(`/api/tasks?id=${id}`, { method: 'DELETE' })
    loadTasks()
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <ListTodo className="w-6 h-6 text-sirius-primary" /> Görevler
          </h1>
        </div>
        <button onClick={() => setShowAdd(true)} className="px-3 py-2 rounded-lg bg-sirius-primary/20 text-sirius-primary text-sm font-medium hover:bg-sirius-primary/30 flex items-center gap-1">
          <Plus className="w-4 h-4" /> Yeni Görev
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none">
        {['pending', 'in_progress', 'completed', 'all'].map((f: string) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              filter === f ? 'bg-sirius-primary/20 text-sirius-primary' : 'text-sirius-text-secondary hover:bg-white/5'
            }`}
          >
            {f === 'all' ? 'Tümü' : statusLabels[f] ?? f}
          </button>
        ))}
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="sirius-panel rounded-xl p-4 space-y-3">
            <input
              type="text"
              value={newTitle}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTitle(e?.target?.value ?? '')}
              placeholder="Görev başlığı..."
              className="w-full bg-transparent text-white text-sm outline-none placeholder:text-sirius-text-secondary/60"
              autoFocus
              onKeyDown={(e: React.KeyboardEvent) => { if (e?.key === 'Enter') addTask() }}
            />
            <div className="flex items-center gap-2">
              <select
                value={newPriority}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewPriority(e?.target?.value ?? 'medium')}
                className="bg-transparent text-xs text-sirius-text-secondary border border-[var(--sirius-border)] rounded-lg px-2 py-1 outline-none"
              >
                <option value="low" className="bg-[#0B1020]">Düşük</option>
                <option value="medium" className="bg-[#0B1020]">Orta</option>
                <option value="high" className="bg-[#0B1020]">Yüksek</option>
                <option value="urgent" className="bg-[#0B1020]">Acil</option>
              </select>
              <div className="flex-1" />
              <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 text-xs text-sirius-text-secondary hover:text-white">İptal</button>
              <button onClick={addTask} className="px-3 py-1.5 text-xs bg-sirius-primary text-white rounded-lg hover:bg-sirius-primary/80">Ekle</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task list */}
      <div className="space-y-2">
        {(tasks?.length ?? 0) === 0 && <p className="text-sirius-text-secondary text-sm text-center py-8">Görev bulunamadı.</p>}
        {(tasks ?? []).map((t: TaskItem, i: number) => (
          <motion.div
            key={t?.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="sirius-panel rounded-xl p-4 flex items-center gap-3 group hover:bg-white/5 transition-colors"
          >
            <button onClick={() => toggleStatus(t)} className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
              t?.status === 'completed' ? 'bg-sirius-success border-sirius-success' : 'border-[var(--sirius-border)] hover:border-sirius-primary'
            }`}>
              {t?.status === 'completed' && <Check className="w-3 h-3 text-white" />}
            </button>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${t?.status === 'completed' ? 'line-through text-sirius-text-secondary' : 'text-white'}`}>{t?.title ?? ''}</p>
            </div>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: priorityColors[t?.priority ?? 'medium'] ?? '#6677FF' }} />
            <button onClick={() => deleteTask(t?.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-sirius-error/20">
              <X className="w-3.5 h-3.5 text-sirius-error" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
