'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Send } from 'lucide-react'
import type { AvatarState } from '@/types/sirius'

export function ChatInput({
  onSend,
  avatarState,
  setAvatarState,
  compact = false,
}: {
  onSend: (msg: string) => void
  avatarState: AvatarState
  setAvatarState: (state: AvatarState) => void
  compact?: boolean
}) {
  const [text, setText] = useState('')
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<any>(null)
  const isStartingRef = useRef(false)

  const handleSend = useCallback((messageToSend?: string) => {
    const message = (messageToSend ?? text).trim()

    if (!message || avatarState === 'thinking' || avatarState === 'speaking' || avatarState === 'working') {
      return
    }

    recognitionRef.current?.stop?.()
    setIsListening(false)
    setText('')
    onSend(message)
  }, [text, avatarState, onSend])

  const startListening = useCallback(() => {
    if (isListening || isStartingRef.current) return

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      alert('Bu tarayıcı ses tanımayı desteklemiyor. Google Chrome kullanmalısın.')
      return
    }

    isStartingRef.current = true

    const recognition = new SpeechRecognition()
    recognition.lang = 'tr-TR'
    recognition.interimResults = true
    recognition.continuous = false
    recognition.maxAlternatives = 1

    recognitionRef.current = recognition

    recognition.onstart = () => {
      isStartingRef.current = false
      setIsListening(true)
      setAvatarState('listening')
    }

    recognition.onresult = (event: any) => {
      let finalText = ''
      let liveText = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const spokenText = result?.[0]?.transcript ?? ''

        if (result.isFinal) {
          finalText += spokenText
        } else {
          liveText += spokenText
        }
      }

      setText(finalText || liveText)

      if (finalText.trim()) {
        recognition.stop()
        setIsListening(false)
        setAvatarState('thinking')
        handleSend(finalText)
      }
    }

    recognition.onend = () => {
      isStartingRef.current = false
      setIsListening(false)

      if (avatarState === 'listening') {
        setAvatarState('idle')
      }
    }

    recognition.onerror = (event: any) => {
      isStartingRef.current = false
      setIsListening(false)

      if (event?.error !== 'aborted' && event?.error !== 'no-speech') {
        console.error('Mikrofon hatası:', event?.error)
      }

      setAvatarState('idle')
    }

    try {
      recognition.start()
    } catch {
      isStartingRef.current = false
    }
  }, [isListening, avatarState, setAvatarState, handleSend])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop?.()
    setIsListening(false)
    setAvatarState('idle')
  }, [setAvatarState])

  const toggleVoice = useCallback(() => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }, [isListening, startListening, stopListening])

  useEffect(() => {
    const restartConversation = () => {
      window.setTimeout(() => {
        startListening()
      }, 350)
    }

    window.addEventListener('sirius-start-listening', restartConversation)

    return () => {
      window.removeEventListener('sirius-start-listening', restartConversation)
      recognitionRef.current?.stop?.()
    }
  }, [startListening])

  return (
    <div className={`relative w-full ${compact ? '' : 'max-w-xl mx-auto'}`}>
      <div className="sirius-panel rounded-2xl flex items-center gap-2 px-4 py-3">
        <input
          type="text"
          value={text}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setText(event.target.value)}
          onKeyDown={(event: React.KeyboardEvent) => {
            if (event.key === 'Enter') handleSend()
          }}
          placeholder="Sirius'a yaz veya konuş..."
          className="flex-1 bg-transparent text-sm text-white placeholder:text-sirius-text-secondary/60 outline-none"
        />

        <button
          onClick={() => handleSend()}
          disabled={!text.trim() || isListening}
          className="p-2 rounded-lg hover:bg-sirius-primary/20 text-sirius-primary disabled:opacity-30 transition-all"
          aria-label="Mesajı gönder"
        >
          <Send className="w-4 h-4" />
        </button>

        <button
          onClick={toggleVoice}
          disabled={avatarState === 'thinking' || avatarState === 'speaking' || avatarState === 'working'}
          className={`p-2 rounded-lg transition-all disabled:opacity-30 ${
            isListening
              ? 'bg-sirius-primary text-white sirius-glow'
              : 'hover:bg-sirius-primary/20 text-sirius-primary'
          }`}
          aria-label={isListening ? 'Mikrofonu kapat' : 'Mikrofonu aç'}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>
      </div>

      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute -bottom-6 left-0 right-0 text-center"
          >
            <span className="text-xs text-sirius-accent animate-pulse">
              Dinliyorum, konuşabilirsin...
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}