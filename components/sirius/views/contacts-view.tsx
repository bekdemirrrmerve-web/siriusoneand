'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Plus, Search, Phone, Mail, X, Edit3, Save } from 'lucide-react'
import type { ContactItem } from '@/types/sirius'

export function ContactsView() {
  const [contacts, setContacts] = useState<ContactItem[]>([])
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [newContact, setNewContact] = useState({ name: '', phone: '', email: '', relationship: '' })

  const load = useCallback(() => {
    const params = search ? `?search=${encodeURIComponent(search)}` : ''
    fetch(`/api/contacts${params}`).then(r => r.json()).then((d: any) => setContacts(d?.contacts ?? [])).catch(() => {})
  }, [search])

  useEffect(() => { load() }, [load])

  const add = async () => {
    if (!newContact?.name?.trim()) return
    await fetch('/api/contacts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newContact) })
    setNewContact({ name: '', phone: '', email: '', relationship: '' })
    setShowAdd(false)
    load()
  }

  const del = async (id: string) => {
    await fetch(`/api/contacts?id=${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Users className="w-6 h-6 text-sirius-primary" /> Kişiler
        </h1>
        <button onClick={() => setShowAdd(true)} className="px-3 py-2 rounded-lg bg-sirius-primary/20 text-sirius-primary text-sm font-medium hover:bg-sirius-primary/30 flex items-center gap-1"><Plus className="w-4 h-4" /> Yeni Kişi</button>
      </div>

      <div className="sirius-panel rounded-xl flex items-center gap-2 px-4 py-2.5">
        <Search className="w-4 h-4 text-sirius-text-secondary" />
        <input type="text" value={search} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e?.target?.value ?? '')} placeholder="Kişi ara..." className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-sirius-text-secondary/60" />
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="sirius-panel rounded-xl p-4 space-y-3">
            <input type="text" value={newContact.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewContact(p => ({ ...(p ?? {}), name: e?.target?.value ?? '' }))} placeholder="Adı soyadı..." className="w-full bg-transparent text-white text-sm outline-none placeholder:text-sirius-text-secondary/60" autoFocus />
            <input type="text" value={newContact.phone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewContact(p => ({ ...(p ?? {}), phone: e?.target?.value ?? '' }))} placeholder="Telefon..." className="w-full bg-transparent text-white text-sm outline-none placeholder:text-sirius-text-secondary/60" />
            <input type="text" value={newContact.relationship} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewContact(p => ({ ...(p ?? {}), relationship: e?.target?.value ?? '' }))} placeholder="İlişki (anne, arkadaş, kuaför...)" className="w-full bg-transparent text-white text-sm outline-none placeholder:text-sirius-text-secondary/60" />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 text-xs text-sirius-text-secondary">İptal</button>
              <button onClick={add} className="px-3 py-1.5 text-xs bg-sirius-primary text-white rounded-lg">Kaydet</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        {(contacts?.length ?? 0) === 0 && <p className="text-sirius-text-secondary text-sm text-center py-8">Kişi bulunamadı.</p>}
        {(contacts ?? []).map((c: ContactItem, i: number) => (
          <motion.div key={c?.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="sirius-panel rounded-xl p-4 flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sirius-primary to-sirius-secondary flex items-center justify-center text-white font-bold text-sm">{(c?.name ?? '?')[0]?.toUpperCase?.() ?? '?'}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">{c?.name ?? ''}</p>
              <p className="text-xs text-sirius-text-secondary">{c?.relationship ?? ''}{c?.phone ? ` • ${c.phone}` : ''}</p>
            </div>
            {c?.phone && <a href={`tel:${c.phone}`} className="p-1.5 rounded-lg hover:bg-sirius-accent/20"><Phone className="w-4 h-4 text-sirius-accent" /></a>}
            <button onClick={() => del(c?.id)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-sirius-error/20"><X className="w-3.5 h-3.5 text-sirius-error" /></button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
