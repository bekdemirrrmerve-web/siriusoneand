'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { AvatarState } from '@/types/sirius'

const stateLabels: Record<AvatarState, string> = {
  idle: '',
  listening: 'Dinliyor...',
  thinking: 'Düşünüyor...',
  speaking: 'Konuşuyor...',
  working: 'Çalışıyor...',
  calling: 'Arıyor...',
  success: 'Tamamlandı!',
  concerned: '',
  happy: '',
}

const stateColors: Record<AvatarState, string> = {
  idle: '#6677FF',
  listening: '#55B8FF',
  thinking: '#8C63FF',
  speaking: '#6677FF',
  working: '#F4B85E',
  calling: '#5FD39B',
  success: '#5FD39B',
  concerned: '#F4B85E',
  happy: '#6677FF',
}

export function SiriusAvatar({
  state,
  size = 'lg',
}: {
  state: AvatarState
  size?: 'sm' | 'md' | 'lg'
}) {
  const sizeMap = { sm: 80, md: 140, lg: 220 }
  const dim = sizeMap[size] ?? 220
  const color = stateColors[state] ?? '#6677FF'
  const isSpeaking = state === 'speaking'

  return (
    <div className="relative flex flex-col items-center">
      <motion.div
        className="absolute rounded-full"
        style={{
          width: dim + 42,
          height: dim + 42,
          top: -21,
          left: -21,
          background: `radial-gradient(circle, ${color}35 0%, transparent 70%)`,
        }}
        animate={{
          scale: isSpeaking ? [1, 1.08, 1] : state === 'listening' ? [1, 1.04, 1] : [1, 1.02, 1],
          opacity: state === 'idle' ? 0.55 : 0.9,
        }}
        transition={{
          duration: isSpeaking ? 0.8 : 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="relative z-10 overflow-hidden rounded-full border-2"
        style={{
          width: dim,
          height: dim,
          borderColor: `${color}99`,
          boxShadow: `0 0 30px ${color}55`,
        }}
        animate={{
          scale: isSpeaking ? [1, 1.015, 1] : 1,
        }}
        transition={{
          duration: 0.8,
          repeat: isSpeaking ? Infinity : 0,
          ease: 'easeInOut',
        }}
      >
        <img
          src="/lyra-avatar.jpg.jpeg"
          alt="Sirius avatar"
          className="h-full w-full object-cover"
        />

        <motion.div
          className="absolute inset-x-0 bottom-0 h-1/3"
          style={{
            background: 'linear-gradient(to top, rgba(5, 8, 18, 0.42), transparent)',
          }}
          animate={{
            opacity: isSpeaking ? [0.2, 0.48, 0.2] : 0,
          }}
          transition={{
            duration: 0.45,
            repeat: isSpeaking ? Infinity : 0,
            ease: 'easeInOut',
          }}
        />

        <motion.div
          className="absolute left-1/2 top-[69%] z-20 rounded-full bg-black/65"
          style={{
            width: dim * 0.115,
            marginLeft: -(dim * 0.115) / 2,
          }}
          animate={{
            height: isSpeaking ? [2, dim * 0.07, dim * 0.03, dim * 0.08, 2] : 2,
            opacity: isSpeaking ? 0.72 : 0,
          }}
          transition={{
            duration: 0.45,
            repeat: isSpeaking ? Infinity : 0,
            ease: 'easeInOut',
          }}
        />
      </motion.div>

      <AnimatePresence mode="wait">
        {stateLabels[state] && (
          <motion.div
            key={state}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="mt-4 flex items-center gap-2"
          >
            {(state === 'listening' || state === 'speaking') && (
              <VoiceWave color={color} active={isSpeaking} />
            )}
            <span className="text-sm font-medium" style={{ color }}>
              {stateLabels[state]}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function VoiceWave({ color, active }: { color: string; active: boolean }) {
  return (
    <div className="flex h-4 items-center gap-[2px]">
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full"
          style={{ backgroundColor: color }}
          animate={{
            height: active ? [4, 14 + i * 2, 4] : [4, 8, 4],
          }}
          transition={{
            duration: active ? 0.6 : 1.2,
            repeat: Infinity,
            delay: i * 0.1,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}