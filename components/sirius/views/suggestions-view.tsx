'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Lightbulb, Check, X, Clock, Phone, ListTodo, Calendar } from 'lucide-react'
import type { SuggestionItem } from '@/types/sirius'

const demoSuggestions: SuggestionItem[] = [
  { id: '1', text: 'Saat 11:30\'da 45 dakikalık boş vaktin var. Bir şey planlamak ister misin?', type: 'free_slot' },
  { id: '2', text: 'Bu görevi üç kere erteleydin. Bugün tamamlasan nasıl olur?', type: 'postponed_task' },
  { id: '3', text: 'Bu hafta babanı aramadın. Bir ara aramak ister misin?', type: 'call_reminder' },
  { id: '4', text: 'Yarınki müşteri sunumuna hazırlık yapman gerekiyor.', type: 'preparation' },
  { id: '5', text: 'Salı günleri genelde içerik çekimi yapıyorsun. Bu hafta da planlayacak mısın?', type: 'habit' },
]

const typeIcons: Record<string, React.ElementType> = {
  free_slot: Clock,
  postponed_task: ListTodo,
  call_reminder: Phone,
  preparation: Calendar,
  habit: Lightbulb,
}

export function SuggestionsView() {
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>(demoSuggestions)

  const handleAction = (id: string, accepted: boolean) => {
    setSuggestions(prev => (prev ?? []).map((s: SuggestionItem) => s?.id === id ? { ...(s ?? {}), accepted } as SuggestionItem : s))
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Lightbulb className="w-6 h-6 text-sirius-warning" /> Akıllı Öneriler
        </h1>
        <p className="text-sirius-text-secondary text-sm mt-1">Sirius sana yardımcı olabilecek öneriler sunuyor.</p>
      </div>

      <div className="space-y-3">
        {(suggestions ?? []).map((s: SuggestionItem, i: number) => {
          const Icon = typeIcons[s?.type ?? ''] ?? Lightbulb
          return (
            <motion.div
              key={s?.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`sirius-panel rounded-xl p-4 flex items-start gap-3 ${
                s?.accepted === true ? 'opacity-50' : s?.accepted === false ? 'opacity-30' : ''
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-sirius-warning/15 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-sirius-warning" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-white">{s?.text ?? ''}</p>
                {s?.accepted === undefined && (
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => handleAction(s?.id, true)} className="px-3 py-1.5 rounded-lg bg-sirius-success/20 text-sirius-success text-xs font-medium flex items-center gap-1 hover:bg-sirius-success/30">
                      <Check className="w-3 h-3" /> Kabul Et
                    </button>
                    <button onClick={() => handleAction(s?.id, false)} className="px-3 py-1.5 rounded-lg bg-white/5 text-sirius-text-secondary text-xs font-medium flex items-center gap-1 hover:bg-white/10">
                      <X className="w-3 h-3" /> Yoksay
                    </button>
                  </div>
                )}
                {s?.accepted === true && <p className="text-xs text-sirius-success mt-2">Kabul edildi ✓</p>}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
