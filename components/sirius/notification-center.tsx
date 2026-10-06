'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { X, Bell, Check } from 'lucide-react'
import type { NotificationItem } from '@/types/sirius'

export function NotificationCenter({ onClose }: { onClose: () => void }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/notifications')
      .then(r => r.json())
      .then((d: any) => setNotifications(d?.notifications ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const markRead = async (id: string) => {
    await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setNotifications(prev => prev?.map((n: NotificationItem) => n?.id === id ? { ...(n ?? {}), read: true } as NotificationItem : n) ?? [])
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed right-0 top-0 bottom-0 w-full max-w-sm z-50 sirius-panel border-l border-[var(--sirius-border)] flex flex-col"
      style={{ background: 'var(--sirius-bg-mid)' }}
    >
      <div className="flex items-center justify-between p-4 border-b border-[var(--sirius-border)]">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-sirius-primary" />
          <h2 className="font-display font-semibold text-white">Bildirimler</h2>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-sirius-text-secondary">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {loading && <p className="text-sirius-text-secondary text-sm p-4">Yükleniyor...</p>}
        {!loading && (notifications?.length ?? 0) === 0 && <p className="text-sirius-text-secondary text-sm p-4">Henüz bildirim yok.</p>}
        {(notifications ?? []).map((n: NotificationItem) => (
          <div key={n?.id} className={`p-3 rounded-lg border border-[var(--sirius-border)] ${n?.read ? 'opacity-60' : ''}`} style={{ background: 'var(--sirius-panel)' }}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-white">{n?.title ?? ''}</p>
                <p className="text-xs text-sirius-text-secondary mt-1">{n?.body ?? ''}</p>
              </div>
              {!n?.read && (
                <button onClick={() => markRead(n?.id)} className="p-1 rounded hover:bg-white/10">
                  <Check className="w-4 h-4 text-sirius-success" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
