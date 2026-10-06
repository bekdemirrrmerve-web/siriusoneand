'use client'

import { Home, MessageSquare, CalendarDays, ListTodo, Phone, Brain, Lightbulb, Users, Settings, Sparkles, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NavItem } from '@/types/sirius'

const navItems: { id: NavItem; label: string; icon: React.ElementType }[] = [
  { id: 'home', label: 'Ana Sayfa', icon: Home },
  { id: 'chat', label: 'Sohbet', icon: MessageSquare },
  { id: 'today', label: 'Bugün', icon: Sun },
  { id: 'calendar', label: 'Takvim', icon: CalendarDays },
  { id: 'tasks', label: 'Görevler', icon: ListTodo },
  { id: 'calls', label: 'Aramalar', icon: Phone },
  { id: 'memory', label: 'Hafıza', icon: Brain },
  { id: 'suggestions', label: 'Öneriler', icon: Lightbulb },
]

const bottomItems: { id: NavItem; label: string; icon: React.ElementType }[] = [
  { id: 'contacts', label: 'Kişiler', icon: Users },
  { id: 'settings', label: 'Ayarlar', icon: Settings },
]

export function DesktopSidebar({ activeNav, onNavigate, onNotifications }: {
  activeNav: NavItem
  onNavigate: (nav: NavItem) => void
  onNotifications: () => void
}) {
  return (
    <aside className="w-[230px] h-screen flex flex-col border-r border-[var(--sirius-border)]" style={{ background: 'var(--sirius-panel)' }}>
      {/* Logo */}
      <div className="px-5 py-6 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-sirius-primary/20 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-sirius-primary" />
        </div>
        <span className="font-display font-bold text-lg tracking-tight text-white">SIRIUS <span className="text-sirius-primary">ONE</span></span>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeNav === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-fast',
                isActive
                  ? 'bg-sirius-primary/15 text-sirius-primary'
                  : 'text-sirius-text-secondary hover:bg-white/5 hover:text-white'
              )}
            >
              <Icon className="w-[18px] h-[18px]" />
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-4 space-y-0.5">
        <div className="border-t border-[var(--sirius-border)] mb-2" />
        {bottomItems.map((item) => {
          const Icon = item.icon
          const isActive = activeNav === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-fast',
                isActive
                  ? 'bg-sirius-primary/15 text-sirius-primary'
                  : 'text-sirius-text-secondary hover:bg-white/5 hover:text-white'
              )}
            >
              <Icon className="w-[18px] h-[18px]" />
              {item.label}
            </button>
          )
        })}
        {/* User profile */}
        <div className="mt-3 flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sirius-primary to-sirius-secondary flex items-center justify-center text-white text-xs font-bold">M</div>
          <div>
            <p className="text-sm font-medium text-white">Merve</p>
            <p className="text-xs text-sirius-text-secondary">Çevrimiçi</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
