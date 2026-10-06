'use client'

import { useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { DesktopSidebar } from './desktop-sidebar'
import { MobileNav } from './mobile-nav'
import { HomeView } from './views/home-view'
import { ChatView } from './views/chat-view'
import { TodayView } from './views/today-view'
import { CalendarView } from './views/calendar-view'
import { TasksView } from './views/tasks-view'
import { CallsView } from './views/calls-view'
import { MemoryView } from './views/memory-view'
import { SuggestionsView } from './views/suggestions-view'
import { ContactsView } from './views/contacts-view'
import { SettingsView } from './views/settings-view'
import { NotificationCenter } from './notification-center'
import type { NavItem, AvatarState } from '@/types/sirius'

export function SiriusApp() {
  const [activeNav, setActiveNav] = useState<NavItem>('home')
  const [avatarState, setAvatarState] = useState<AvatarState>('idle')
  const [showNotifications, setShowNotifications] = useState(false)

  const handleNavigate = useCallback((nav: NavItem) => {
    setActiveNav(nav)
  }, [])

  const renderView = () => {
    switch (activeNav) {
      case 'home': return <HomeView onNavigate={handleNavigate} avatarState={avatarState} setAvatarState={setAvatarState} />
      case 'chat': return <ChatView avatarState={avatarState} setAvatarState={setAvatarState} />
      case 'today': return <TodayView onNavigate={handleNavigate} />
      case 'calendar': return <CalendarView />
      case 'tasks': return <TasksView />
      case 'calls': return <CallsView />
      case 'memory': return <MemoryView />
      case 'suggestions': return <SuggestionsView />
      case 'contacts': return <ContactsView />
      case 'settings': return <SettingsView />
      default: return <HomeView onNavigate={handleNavigate} avatarState={avatarState} setAvatarState={setAvatarState} />
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--sirius-bg-deep)]">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <DesktopSidebar activeNav={activeNav} onNavigate={handleNavigate} onNotifications={() => setShowNotifications(true)} />
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-[var(--sirius-border)]" style={{ background: 'var(--sirius-panel)' }}>
          <button onClick={() => setShowNotifications(true)} className="text-sirius-text-secondary">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
          </button>
          <span className="font-display font-bold text-lg tracking-tight text-white">SIRIUS <span className="text-sirius-primary">ONE</span></span>
          <button onClick={() => setShowNotifications(!showNotifications)} className="relative text-sirius-text-secondary">
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
          </button>
        </div>

        {/* View */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeNav}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mobile Bottom Nav */}
        <div className="lg:hidden">
          <MobileNav activeNav={activeNav} onNavigate={handleNavigate} />
        </div>
      </main>

      {/* Notification Center */}
      <AnimatePresence>
        {showNotifications && <NotificationCenter onClose={() => setShowNotifications(false)} />}
      </AnimatePresence>
    </div>
  )
}
