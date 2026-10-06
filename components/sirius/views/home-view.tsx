'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { CalendarDays, Brain, Phone, ListTodo, Sparkles, Mic, Send, Paperclip } from 'lucide-react'
import { SiriusAvatar } from '../avatar/sirius-avatar'
import { RightSidebar } from '../right-sidebar'
import { ChatInput } from '../chat/chat-input'
import type { NavItem, AvatarState } from '@/types/sirius'

const quickCards = [
  { id: 'today' as NavItem, label: 'Bugün', icon: CalendarDays, color: '#6677FF' },
  { id: 'memory' as NavItem, label: 'Hafıza', icon: Brain, color: '#8C63FF' },
  { id: 'calls' as NavItem, label: 'Aramalar', icon: Phone, color: '#55B8FF' },
  { id: 'tasks' as NavItem, label: 'Görevler', icon: ListTodo, color: '#5FD39B' },
]

const quickActions = [
  'Günümü özetle',
  'Bugün ne var?',
  'Birini ara',
  'Hatırlatıcı ekle',
  'Akşamımı planla',
  'Beni ne biliyorsun?',
]

export function HomeView({ onNavigate, avatarState, setAvatarState }: {
  onNavigate: (nav: NavItem) => void
  avatarState: AvatarState
  setAvatarState: (state: AvatarState) => void
}) {
  const handleSend = useCallback((msg: string) => {
    // Navigate to chat with initial message
    onNavigate('chat')
  }, [onNavigate])

  return (
    <div className="flex h-full">
      {/* Main Center */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 min-h-0">
        {/* Avatar */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <SiriusAvatar state={avatarState} size="lg" />
        </motion.div>

        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-center"
        >
          <h1 className="font-display text-2xl md:text-3xl font-bold text-white tracking-tight">
            Günaydın, <span className="text-sirius-primary">Merve</span>
          </h1>
          <p className="mt-2 text-sirius-text-secondary text-sm md:text-base max-w-md">
            Planlamana, hatırlamana ve organize olmana yardımcı olmak için buradayım.
          </p>
        </motion.div>

        {/* Quick Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-xl"
        >
          {quickCards.map((card) => {
            const Icon = card.icon
            return (
              <button
                key={card.id}
                onClick={() => onNavigate(card.id)}
                className="sirius-panel rounded-xl p-4 flex flex-col items-center gap-2 hover:bg-white/5 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${card.color}20` }}>
                  <Icon className="w-5 h-5" style={{ color: card.color }} />
                </div>
                <span className="text-sm font-medium text-white">{card.label}</span>
              </button>
            )
          })}
        </motion.div>

        {/* Chat Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 w-full max-w-xl"
        >
          <ChatInput onSend={handleSend} avatarState={avatarState} setAvatarState={setAvatarState} />
        </motion.div>

        {/* Quick action chips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 flex flex-wrap justify-center gap-2 max-w-xl"
        >
          {quickActions.map((action: string) => (
            <button
              key={action}
              onClick={() => handleSend(action)}
              className="px-3 py-1.5 rounded-full text-xs font-medium text-sirius-text-secondary border border-[var(--sirius-border)] hover:bg-sirius-primary/10 hover:text-sirius-primary hover:border-sirius-primary/30 transition-all"
            >
              {action}
            </button>
          ))}
        </motion.div>
      </div>

      {/* Right Sidebar - desktop only */}
      <div className="hidden xl:block">
        <RightSidebar />
      </div>
    </div>
  )
}
