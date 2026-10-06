'use client'

import { motion } from 'framer-motion'
import type { AvatarState } from '@/types/sirius'

// Expressions mapped to orb visual changes
const expressionConfig: Record<AvatarState, { eyeScale: number; mouthWidth: number; pupilY: number; browY: number }> = {
  idle:      { eyeScale: 1,   mouthWidth: 0,  pupilY: 0, browY: 0 },
  listening: { eyeScale: 1.1, mouthWidth: 0,  pupilY: -1, browY: -1 },
  thinking:  { eyeScale: 0.8, mouthWidth: 0,  pupilY: 2, browY: -2 },
  speaking:  { eyeScale: 1,   mouthWidth: 8,  pupilY: 0, browY: 0 },
  working:   { eyeScale: 0.9, mouthWidth: 2,  pupilY: 1, browY: -1 },
  calling:   { eyeScale: 1,   mouthWidth: 4,  pupilY: 0, browY: 0 },
  success:   { eyeScale: 1.1, mouthWidth: 10, pupilY: -1, browY: -2 },
  concerned: { eyeScale: 1.05, mouthWidth: 3, pupilY: 1, browY: 2 },
  happy:     { eyeScale: 1.15, mouthWidth: 12, pupilY: -1, browY: -2 },
}

export function SiriusOrb({ state, size, color }: { state: AvatarState; size: number; color: string }) {
  const expr = expressionConfig[state] ?? expressionConfig.idle
  const cx = size / 2
  const cy = size / 2
  const r = size * 0.38

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="relative z-10"
      animate={{ scale: state === 'speaking' ? [1, 1.02, 1] : 1 }}
      transition={{ duration: 1.5, repeat: state === 'speaking' ? Infinity : 0, ease: 'easeInOut' }}
    >
      <defs>
        <radialGradient id="orbGrad" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="60%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor="#050812" stopOpacity="0.9" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Main orb */}
      <motion.circle
        cx={cx}
        cy={cy}
        r={r}
        fill="url(#orbGrad)"
        stroke={color}
        strokeWidth={1.5}
        strokeOpacity={0.4}
        filter="url(#glow)"
        animate={{ scale: state === 'speaking' ? [1, 1.04, 1] : 1 }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
        transition={{ duration: 1, repeat: state === 'speaking' ? Infinity : 0, ease: 'easeInOut' }}
      />

      {/* Inner ring */}
      <circle cx={cx} cy={cy} r={r * 0.7} fill="none" stroke={color} strokeWidth={0.5} strokeOpacity={0.2} />

      {/* Eyes */}
      <motion.g animate={{ scaleY: expr.eyeScale }} style={{ transformOrigin: `${cx}px ${cy - r * 0.15}px` }}>
        {/* Left eye */}
        <motion.ellipse
          cx={cx - r * 0.22}
          cy={cy - r * 0.15}
          rx={r * 0.07}
          ry={r * 0.09}
          fill={color}
          animate={{
            scaleY: [1, 1, 0.1, 1, 1],
          }}
          transition={{ duration: 4, repeat: Infinity, times: [0, 0.45, 0.48, 0.51, 1] }}
        />
        {/* Right eye */}
        <motion.ellipse
          cx={cx + r * 0.22}
          cy={cy - r * 0.15}
          rx={r * 0.07}
          ry={r * 0.09}
          fill={color}
          animate={{
            scaleY: [1, 1, 0.1, 1, 1],
          }}
          transition={{ duration: 4, repeat: Infinity, times: [0, 0.45, 0.48, 0.51, 1] }}
        />
      </motion.g>

      {/* Mouth */}
      {expr.mouthWidth > 0 && (
        <motion.path
          d={`M ${cx - expr.mouthWidth} ${cy + r * 0.2} Q ${cx} ${cy + r * 0.2 + expr.mouthWidth * 0.6} ${cx + expr.mouthWidth} ${cy + r * 0.2}`}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Breathing animation ring */}
      <motion.circle
        cx={cx}
        cy={cy}
        r={r + 8}
        fill="none"
        stroke={color}
        strokeWidth={0.5}
        strokeOpacity={0.15}
        animate={{ scale: [1, 1.08, 1] }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.svg>
  )
}
