'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Search, Plus, Trash2, Edit3, Save, X, Tag } from 'lucide-react'
import type { MemoryItem } from '@/types/sirius'

const typeLabels: Record<string, string> = {
  profile: 'Profil',
  preferences: 'Tercihler',
  people: 'Kişiler',
  projects: 'Projeler',
  places: 'Yerler',
  habits: 'Alışkanlıklar',
  tasks: 'Görevler',
  goals: 'Hedefler',
  important_dates: 'Önemli Tarihler',
  conversation_memory: 'Konuşma Hafızası',
  episodic_memory: 'Anılar',
}

const typeColors: Record<string, string> = {
  profile: '#6677FF',
  preferences: '#8C63FF',
  people: '#55B8FF',
  projects: '#5FD39B',
  places: '#F4B85E',
  habits: '#F06E78',
  tasks: '#6677FF',
  goals: '#8C63FF',
  important_dates: '#55B8FF',
  conversation_memory: '#5FD39B',
  episodic_memory: '#F4B85E',
}

export function MemoryView() {
  const [memories, setMemories] = useState<MemoryItem[]>([])
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newType, setNewType] = useState('conversation_memory')

  const loadMemories = useCallback(() => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (filterType) params.set('type', filterType)
    fetch(`/api/memory?${params.toString()}`)
      .then(r => r.json())
      .then((d: any) => setMemories(d?.memories ?? []))
      .catch(() => {})
  }, [search, filterType])

  useEffect(() => { loadMemories() }, [loadMemories])

  const addMemory = async () => {
    if (!newContent?.trim()) return
    await fetch('/api/memory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newContent, type: newType }),
    })
    setNewContent('')
    setShowAdd(false)
    loadMemories()
  }

  const updateMemory = async (id: string) => {
    await fetch('/api/memory', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, content: editContent }),
    })
    setEditId(null)
    loadMemories()
  }

  const deleteMemory = async (id: string) => {
    await fetch(`/api/memory?id=${id}`, { method: 'DELETE' })
    loadMemories()
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Brain className="w-6 h-6 text-sirius-secondary" /> Hafıza
        </h1>
        <button onClick={() => setShowAdd(true)} className="px-3 py-2 rounded-lg bg-sirius-secondary/20 text-sirius-secondary text-sm font-medium hover:bg-sirius-secondary/30 flex items-center gap-1">
          <Plus className="w-4 h-4" /> Ekle
        </button>
      </div>

      {/* Search */}
      <div className="sirius-panel rounded-xl flex items-center gap-2 px-4 py-2.5">
        <Search className="w-4 h-4 text-sirius-text-secondary" />
        <input
          type="text"
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e?.target?.value ?? '')}
          placeholder="Hafızada ara..."
          className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-sirius-text-secondary/60"
        />
      </div>

      {/* Type filter */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
        <button onClick={() => setFilterType('')} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
          !filterType ? 'bg-sirius-secondary/20 text-sirius-secondary' : 'text-sirius-text-secondary hover:bg-white/5'
        }`}>Tümü</button>
        {Object.entries(typeLabels).map(([key, label]: [string, string]) => (
          <button key={key} onClick={() => setFilterType(key)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
            filterType === key ? 'bg-sirius-secondary/20 text-sirius-secondary' : 'text-sirius-text-secondary hover:bg-white/5'
          }`}>{label}</button>
        ))}
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="sirius-panel rounded-xl p-4 space-y-3">
            <textarea value={newContent} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewContent(e?.target?.value ?? '')} placeholder="Hatırlanacak bilgi..." className="w-full bg-transparent text-white text-sm outline-none placeholder:text-sirius-text-secondary/60 min-h-[60px] resize-none" autoFocus />
            <div className="flex items-center gap-2">
              <select value={newType} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewType(e?.target?.value ?? 'conversation_memory')} className="bg-transparent text-xs text-sirius-text-secondary border border-[var(--sirius-border)] rounded-lg px-2 py-1 outline-none">
                {Object.entries(typeLabels).map(([key, label]: [string, string]) => (<option key={key} value={key} className="bg-[#0B1020]">{label}</option>))}
              </select>
              <div className="flex-1" />
              <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 text-xs text-sirius-text-secondary">İptal</button>
              <button onClick={addMemory} className="px-3 py-1.5 text-xs bg-sirius-secondary text-white rounded-lg">Kaydet</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Memory list */}
      <div className="space-y-2">
        {(memories?.length ?? 0) === 0 && <p className="text-sirius-text-secondary text-sm text-center py-8">Hafıza kaydı bulunamadı.</p>}
        {(memories ?? []).map((mem: MemoryItem, i: number) => (
          <motion.div
            key={mem?.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="sirius-panel rounded-xl p-4 group"
          >
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: typeColors[mem?.type ?? ''] ?? '#6677FF' }} />
              <div className="flex-1 min-w-0">
                {editId === mem?.id ? (
                  <div className="space-y-2">
                    <textarea value={editContent} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditContent(e?.target?.value ?? '')} className="w-full bg-transparent text-white text-sm outline-none min-h-[40px] resize-none" autoFocus />
                    <div className="flex gap-1">
                      <button onClick={() => updateMemory(mem?.id)} className="p-1 rounded hover:bg-sirius-success/20"><Save className="w-3.5 h-3.5 text-sirius-success" /></button>
                      <button onClick={() => setEditId(null)} className="p-1 rounded hover:bg-white/10"><X className="w-3.5 h-3.5 text-sirius-text-secondary" /></button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-white">{mem?.content ?? ''}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: `${typeColors[mem?.type ?? ''] ?? '#6677FF'}20`, color: typeColors[mem?.type ?? ''] ?? '#6677FF' }}>
                    {typeLabels[mem?.type ?? ''] ?? mem?.type ?? ''}
                  </span>
                  {(mem?.entities?.length ?? 0) > 0 && (mem?.entities ?? []).map((e: string) => (
                    <span key={e} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-sirius-text-secondary flex items-center gap-0.5">
                      <Tag className="w-2.5 h-2.5" />{e}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => { setEditId(mem?.id); setEditContent(mem?.content ?? '') }} className="p-1 rounded hover:bg-white/10"><Edit3 className="w-3.5 h-3.5 text-sirius-text-secondary" /></button>
                <button onClick={() => deleteMemory(mem?.id)} className="p-1 rounded hover:bg-sirius-error/20"><Trash2 className="w-3.5 h-3.5 text-sirius-error" /></button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
