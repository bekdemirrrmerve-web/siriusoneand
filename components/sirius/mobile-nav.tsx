'use client'

import { Home, MessageSquare, Sun, Phone, Brain } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NavItem } from '@/types/sirius'

const mobileNavItems: { id: NavItem; label: string; icon: React.ElementType }[] = [
  { id: 'home', label: 'Ana Sayfa', icon: Home },
  { id: 'chat', label: 'Sohbet', icon: MessageSquare },
  { id: 'today', label: 'Bugün', icon: Sun },
  { id: 'calls', label: 'Aramalar', icon: Phone },
  { id: 'memory', label: 'Hafıza', icon: Brain },
]

export function MobileNav({ activeNav, onNavigate }: {
  activeNav: NavItem
  onNavigate: (nav: NavItem) => void
}) {
  return (
    <nav className="flex items-center justify-around py-2 border-t border-[var(--sirius-border)]" style={{ background: 'var(--sirius-panel)' }}>
      {mobileNavItems.map((item) => {
        const Icon = item.icon
        const isActive = activeNav === item.id
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={cn(
              'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors text-xs',
              isActive ? 'text-sirius-primary' : 'text-sirius-text-secondary'
            )}
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
