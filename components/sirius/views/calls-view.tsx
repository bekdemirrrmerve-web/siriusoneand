'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, PhoneCall, PhoneOff, Clock, Plus, User, MessageSquare, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import type { CallItem, ContactItem } from '@/types/sirius'

type CallTab = 'recent' | 'scheduled' | 'contacts' | 'ai_calls'

export function CallsView() {
  const [tab, setTab] = useState<CallTab>('recent')
  const [calls, setCalls] = useState<CallItem[]>([])
  const [contacts, setContacts] = useState<ContactItem[]>([])
  const [showNewCall, setShowNewCall] = useState(false)
  const [activeCall, setActiveCall] = useState<CallItem | null>(null)
  const [callPhase, setCallPhase] = useState<'idle' | 'ringing' | 'connected' | 'summary'>('idle')
  const [transcript, setTranscript] = useState<string[]>([])
  const [newCall, setNewCall] = useState({ contactName: '', phone: '', callReason: '', aiInstructions: '' })

  const loadData = useCallback(() => {
    fetch('/api/calls').then(r => r.json()).then((d: any) => setCalls(d?.calls ?? [])).catch(() => {})
    fetch('/api/contacts').then(r => r.json()).then((d: any) => setContacts(d?.contacts ?? [])).catch(() => {})
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const startCall = async () => {
    if (!newCall?.contactName?.trim()) return
    const res = await fetch('/api/calls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCall),
    })
    const data = await res.json()
    const call = data?.call
    if (call) {
      setActiveCall(call)
      setShowNewCall(false)
      simulateCall(call)
    }
  }

  const simulateCall = async (call: CallItem) => {
    setCallPhase('ringing')
    setTranscript([])
    await new Promise(r => setTimeout(r, 2000))

    setCallPhase('connected')
    await fetch('/api/calls', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: call?.id, status: 'in_progress', startedAt: new Date().toISOString() }) })

    const simLines = [
      { speaker: 'Sirius', text: `Merhaba, Merve adına arayan dijital asistan Sirius. ${call?.callReason ?? ''}` },
      { speaker: 'Karşı Taraf', text: 'Merhaba, nasıl yardımcı olabilirim?' },
      { speaker: 'Sirius', text: call?.aiInstructions ?? 'Bir randevu almak istiyoruz, müsait misiniz?' },
      { speaker: 'Karşı Taraf', text: 'Evet, cumartesi saat 14:30 uygun olur.' },
      { speaker: 'Sirius', text: 'Harika, teşekkür ederim. Merve\'ye ileteceğim. İyi günler.' },
    ]

    for (const line of simLines) {
      await new Promise(r => setTimeout(r, 1500))
      setTranscript(prev => [...(prev ?? []), `${line.speaker}: ${line.text}`])
    }

    await new Promise(r => setTimeout(r, 1000))
    setCallPhase('summary')

    const summary = 'Görüşme tamamlandı. Cumartesi 14:30 için randevu uygun.'
    const result = JSON.stringify({ status: 'completed', appointment: 'Cumartesi 14:30', action: 'Takvime eklensin mi?' })
    await fetch('/api/calls', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: call?.id, status: 'completed', summary, result, transcript: transcript.join('\n'), duration: 45, endedAt: new Date().toISOString() }),
    })
    loadData()
  }

  const endActiveCall = () => {
    setActiveCall(null)
    setCallPhase('idle')
    setTranscript([])
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-6">
      {/* Active call overlay */}
      <AnimatePresence>
        {activeCall && callPhase !== 'idle' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="sirius-panel rounded-2xl p-6 w-full max-w-md space-y-4" style={{ background: 'var(--sirius-bg-mid)' }}>
              {/* Header */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sirius-primary to-sirius-secondary flex items-center justify-center mx-auto mb-3">
                  <User className="w-8 h-8 text-white" />
                </div>
                <p className="text-white font-medium">{activeCall?.contactName ?? ''}</p>
                <p className="text-xs text-sirius-text-secondary">{activeCall?.phone ?? ''}</p>
                <p className="text-xs mt-1" style={{ color: callPhase === 'ringing' ? '#F4B85E' : callPhase === 'connected' ? '#5FD39B' : '#6677FF' }}>
                  {callPhase === 'ringing' ? 'Çalıyor...' : callPhase === 'connected' ? 'Bağlantı kuruldu' : 'Görüşme Özeti'}
                </p>
              </div>

              {/* Calling as */}
              {callPhase !== 'summary' && (
                <p className="text-[11px] text-center text-sirius-text-secondary">Merve adına arayan: <span className="text-sirius-primary">Sirius</span></p>
              )}

              {/* Transcript */}
              {(transcript?.length ?? 0) > 0 && (
                <div className="max-h-[200px] overflow-y-auto space-y-2 sirius-panel rounded-xl p-3">
                  {(transcript ?? []).map((line: string, i: number) => (
                    <motion.p key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-white">{line}</motion.p>
                  ))}
                  {callPhase === 'connected' && <Loader2 className="w-3 h-3 text-sirius-accent animate-spin" />}
                </div>
              )}

              {/* Summary */}
              {callPhase === 'summary' && (
                <div className="space-y-3">
                  <div className="sirius-panel rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-sirius-success" />
                      <span className="text-xs font-medium text-sirius-success">Tamamlandı</span>
                    </div>
                    <p className="text-sm text-white">Cumartesi 14:30 için randevu uygun.</p>
                    <p className="text-xs text-sirius-text-secondary mt-1">Aksiyon: Kullanıcı onayı gerekli</p>
                  </div>
                  <button className="w-full py-2 rounded-lg bg-sirius-primary/20 text-sirius-primary text-sm font-medium hover:bg-sirius-primary/30">
                    Takvime Ekle
                  </button>
                </div>
              )}

              {/* End call */}
              <button onClick={endActiveCall} className="w-full py-2.5 rounded-lg bg-sirius-error/20 text-sirius-error text-sm font-medium flex items-center justify-center gap-2 hover:bg-sirius-error/30">
                <PhoneOff className="w-4 h-4" />
                {callPhase === 'summary' ? 'Kapat' : 'Aramayı Sonlandır'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Phone className="w-6 h-6 text-sirius-accent" /> Aramalar
        </h1>
        <button onClick={() => setShowNewCall(true)} className="px-3 py-2 rounded-lg bg-sirius-accent/20 text-sirius-accent text-sm font-medium hover:bg-sirius-accent/30 flex items-center gap-1">
          <Plus className="w-4 h-4" /> Yeni Arama
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {([['recent', 'Son Aramalar'], ['scheduled', 'Planlanmış'], ['contacts', 'Kişiler'], ['ai_calls', 'AI Aramaları']] as const).map(([id, label]: readonly [CallTab, string]) => (
          <button key={id} onClick={() => setTab(id)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
            tab === id ? 'bg-sirius-accent/20 text-sirius-accent' : 'text-sirius-text-secondary hover:bg-white/5'
          }`}>{label}</button>
        ))}
      </div>

      {/* New call form */}
      <AnimatePresence>
        {showNewCall && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="sirius-panel rounded-xl p-4 space-y-3">
            <input type="text" value={newCall.contactName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCall(p => ({ ...(p ?? {}), contactName: e?.target?.value ?? '' }))} placeholder="Kişi adı..." className="w-full bg-transparent text-white text-sm outline-none placeholder:text-sirius-text-secondary/60" autoFocus />
            <input type="text" value={newCall.phone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCall(p => ({ ...(p ?? {}), phone: e?.target?.value ?? '' }))} placeholder="Telefon numarası..." className="w-full bg-transparent text-white text-sm outline-none placeholder:text-sirius-text-secondary/60" />
            <input type="text" value={newCall.callReason} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCall(p => ({ ...(p ?? {}), callReason: e?.target?.value ?? '' }))} placeholder="Arama nedeni..." className="w-full bg-transparent text-white text-sm outline-none placeholder:text-sirius-text-secondary/60" />
            <textarea value={newCall.aiInstructions} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewCall(p => ({ ...(p ?? {}), aiInstructions: e?.target?.value ?? '' }))} placeholder="AI talimatları (opsiyonel)..." className="w-full bg-transparent text-white text-sm outline-none placeholder:text-sirius-text-secondary/60 min-h-[40px] resize-none" />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowNewCall(false)} className="px-3 py-1.5 text-xs text-sirius-text-secondary">İptal</button>
              <button onClick={startCall} className="px-4 py-1.5 text-xs bg-sirius-accent text-white rounded-lg flex items-center gap-1"><PhoneCall className="w-3 h-3" /> Aramayı Başlat</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Call list */}
      <div className="space-y-2">
        {tab === 'contacts' ? (
          (contacts?.length ?? 0) === 0 ? <p className="text-sirius-text-secondary text-sm text-center py-8">Kişi bulunamadı.</p> :
          (contacts ?? []).map((c: ContactItem) => (
            <div key={c?.id} className="sirius-panel rounded-xl p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sirius-primary to-sirius-secondary flex items-center justify-center text-white text-sm font-bold">{(c?.name ?? '?')[0]}</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{c?.name ?? ''}</p>
                <p className="text-xs text-sirius-text-secondary">{c?.phone ?? ''} • {c?.relationship ?? ''}</p>
              </div>
              <button onClick={() => { setNewCall({ contactName: c?.name ?? '', phone: c?.phone ?? '', callReason: '', aiInstructions: '' }); setShowNewCall(true) }} className="p-2 rounded-lg hover:bg-sirius-accent/20"><PhoneCall className="w-4 h-4 text-sirius-accent" /></button>
            </div>
          ))
        ) : (
          (calls?.length ?? 0) === 0 ? <p className="text-sirius-text-secondary text-sm text-center py-8">Arama kaydı yok.</p> :
          (calls ?? []).filter((c: CallItem) => tab === 'ai_calls' ? true : tab === 'scheduled' ? c?.status === 'scheduled' : true).map((c: CallItem) => (
            <div key={c?.id} className="sirius-panel rounded-xl p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                c?.status === 'completed' ? 'bg-sirius-success/20' : c?.status === 'failed' ? 'bg-sirius-error/20' : 'bg-sirius-accent/20'
              }`}>
                {c?.status === 'completed' ? <CheckCircle className="w-4 h-4 text-sirius-success" /> : c?.status === 'failed' ? <AlertCircle className="w-4 h-4 text-sirius-error" /> : <Phone className="w-4 h-4 text-sirius-accent" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{c?.contactName ?? ''}</p>
                <p className="text-xs text-sirius-text-secondary">{c?.callReason ?? 'AI Arama'}</p>
              </div>
              {c?.summary && <MessageSquare className="w-4 h-4 text-sirius-text-secondary" />}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
