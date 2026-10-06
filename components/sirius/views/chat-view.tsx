'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Bot, User, Loader2, Mic, MicOff } from 'lucide-react'
import { SiriusAvatar } from '../avatar/sirius-avatar'
import { ChatInput } from '../chat/chat-input'
import type { AvatarState, ChatMessage } from '@/types/sirius'

// Sesli okumadan komut etiketlerini, işaretleri ve emojileri temizle
function stripForSpeech(text: string): string {
  return (text ?? '')
    .replace(/\[TOOL:[\s\S]*?\]/g, '')
    .replace(/[*_`#>]/g, '')
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function ChatView({ avatarState, setAvatarState }: {
  avatarState: AvatarState
  setAvatarState: (state: AvatarState) => void
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [activityText, setActivityText] = useState('')
  const [liveMode, setLiveMode] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [interim, setInterim] = useState('')

  const scrollRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const recognitionRef = useRef<any>(null)
  const liveModeRef = useRef(false)
  const busyRef = useRef(false)
  const startListeningRef = useRef<() => void>(() => {})
  const onVoiceTranscriptRef = useRef<(text: string) => void>(() => {})

  // Load messages on mount
  useEffect(() => {
    fetch('/api/messages?limit=50')
      .then(r => r.json())
      .then((d: any) => setMessages(d?.messages ?? []))
      .catch(() => {})
  }, [])

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current?.scrollHeight ?? 0, behavior: 'smooth' })
  }, [messages, interim])

  // ---- Gemini TTS ile seslendirme (olmazsa tarayıcı sesi) ----
  const speak = useCallback(async (raw: string): Promise<void> => {
    const text = stripForSpeech(raw).slice(0, 800)
    if (!text) return
    setIsSpeaking(true)
    setAvatarState('speaking')
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, input: text }),
      })
      if (!res.ok) throw new Error('Ses servisi yanıt vermedi.')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      await new Promise<void>((resolve, reject) => {
        const audio = new Audio(url)
        audioRef.current = audio
        audio.onended = () => { URL.revokeObjectURL(url); resolve() }
        audio.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Ses çalınamadı')) }
        audio.play().catch(() => reject(new Error('Ses başlatılamadı')))
      })
    } catch {
      try {
        await new Promise<void>((resolve) => {
          const u = new SpeechSynthesisUtterance(text)
          u.lang = 'tr-TR'
          u.rate = 1.0
          u.onend = () => resolve()
          u.onerror = () => resolve()
          window.speechSynthesis.speak(u)
        })
      } catch {}
    } finally {
      setIsSpeaking(false)
    }
  }, [setAvatarState])

  // ---- Mesaj gönderme (yazılı ve sesli ortak yol) ----
  const handleSend = useCallback(async (text: string) => {
    if (busyRef.current) return
    busyRef.current = true
    setIsStreaming(true)
    setAvatarState('thinking')
    setActivityText('')

    // Konuşurken mikrofonu sustur
    try { recognitionRef.current?.abort?.() } catch {}
    try { audioRef.current?.pause?.() } catch {}

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    }
    setMessages(prev => [...(prev ?? []), userMsg])

    const assistantMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString(),
    }
    setMessages(prev => [...(prev ?? []), assistantMsg])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })

      if (!res?.ok) throw new Error('API hatası')

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''
      let partialRead = ''

      setAvatarState('speaking')

      while (reader) {
        const { done, value } = await reader.read()
        if (done) break
        partialRead += decoder.decode(value, { stream: true })
        const lines = partialRead.split('\n')
        partialRead = lines.pop() ?? ''
        for (const line of lines) {
          if (line?.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue
            try {
              const parsed = JSON.parse(data)
              if (parsed?.type === 'activity') {
                setActivityText(parsed?.text ?? '')
                setAvatarState('working')
              } else if (parsed?.type === 'content') {
                fullContent += parsed?.text ?? ''
                setMessages(prev => {
                  const arr = [...(prev ?? [])]
                  const last = arr[arr.length - 1]
                  if (last) arr[arr.length - 1] = { ...(last ?? {}), content: fullContent } as ChatMessage
                  return arr
                })
                setAvatarState('speaking')
                setActivityText('')
              } else if (parsed?.type === 'tool') {
                setActivityText(parsed?.text ?? '')
                setAvatarState('working')
              }
            } catch {}
          }
        }
      }

      // Cevabı sesli oku (bitmesini bekle, sonra tekrar dinlemeye dön)
      if (fullContent) {
        await speak(fullContent)
      }
      setAvatarState('idle')
    } catch (err: any) {
      setMessages(prev => {
        const arr = [...(prev ?? [])]
        const last = arr[arr.length - 1]
        if (last) arr[arr.length - 1] = { ...(last ?? {}), content: 'Üzgünüm, bir hata oluştu. Lütfen tekrar dene.' } as ChatMessage
        return arr
      })
      setAvatarState('concerned')
      setTimeout(() => setAvatarState('idle'), 2000)
    } finally {
      setIsStreaming(false)
      setActivityText('')
      busyRef.current = false
      if (liveModeRef.current) {
        setTimeout(() => startListeningRef.current(), 400)
      }
    }
  }, [setAvatarState, speak])

  // ---- Dinlemeyi başlat ----
  const startListening = useCallback(() => {
    if (!liveModeRef.current || busyRef.current) return
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return
    try { recognitionRef.current?.abort?.() } catch {}

    const rec = new SR()
    rec.lang = 'tr-TR'
    rec.continuous = false
    rec.interimResults = true
    rec.maxAlternatives = 1

    rec.onstart = () => setIsListening(true)

    rec.onresult = (e: any) => {
      let interimText = ''
      let finalText = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i]
        if (r.isFinal) finalText += r[0].transcript
        else interimText += r[0].transcript
      }
      setInterim(interimText)
      if (finalText && finalText.trim()) {
        setInterim('')
        onVoiceTranscriptRef.current(finalText.trim())
      }
    }

    rec.onerror = (e: any) => {
      if (e?.error === 'not-allowed' || e?.error === 'service-not-allowed') {
        liveModeRef.current = false
        setLiveMode(false)
      }
    }

    rec.onend = () => {
      setIsListening(false)
      setInterim('')
      // Sessizlik sonrası döngüyü canlı tut
      if (liveModeRef.current && !busyRef.current) {
        setTimeout(() => startListeningRef.current(), 300)
      }
    }

    recognitionRef.current = rec
    try { rec.start() } catch {}
  }, [])

  useEffect(() => {
    startListeningRef.current = startListening
  }, [startListening])

  useEffect(() => {
    onVoiceTranscriptRef.current = (text: string) => {
      handleSend(text)
    }
  }, [handleSend])

  // ---- Canlı konuşma aç/kapat ----
  const toggleLive = useCallback(() => {
    if (liveModeRef.current) {
      liveModeRef.current = false
      setLiveMode(false)
      try { recognitionRef.current?.abort?.() } catch {}
      try { window.speechSynthesis?.cancel() } catch {}
      try { audioRef.current?.pause?.() } catch {}
      setIsListening(false)
      setInterim('')
      setAvatarState('idle')
    } else {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (!SR) {
        alert('Bu tarayıcı canlı sesli konuşmayı desteklemiyor. Chrome veya Edge kullan.')
        return
      }
      liveModeRef.current = true
      setLiveMode(true)
      busyRef.current = false
      startListeningRef.current()
    }
  }, [setAvatarState])

  const statusText = isListening
    ? 'Dinliyorum...'
    : isStreaming
      ? (activityText || 'Düşünüyor...')
      : isSpeaking
        ? 'Konuşuyorum...'
        : ''

  return (
    <div className="flex flex-col h-full">
      {/* Avatar alanı */}
      <div className="flex items-center justify-center py-4 border-b border-[var(--sirius-border)]" style={{ background: 'var(--sirius-panel)' }}>
        <SiriusAvatar state={avatarState} size="sm" />
        {activityText && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="ml-3 text-xs text-sirius-accent flex items-center gap-1"
          >
            <Loader2 className="w-3 h-3 animate-spin" />
            {activityText}
          </motion.span>
        )}
      </div>

      {/* Mesajlar */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-none">
        {(messages?.length ?? 0) === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-sirius-text-secondary">
            <Bot className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-sm">Sirius ile sohbete başla</p>
          </div>
        )}
        {(messages ?? []).map((msg: ChatMessage) => (
          <motion.div
            key={msg?.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg?.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
              msg?.role === 'user'
                ? 'bg-gradient-to-br from-sirius-primary to-sirius-secondary'
                : 'bg-sirius-primary/20'
            }`}>
              {msg?.role === 'user' ? <User className="w-3.5 h-3.5 text-white" /> : <Bot className="w-3.5 h-3.5 text-sirius-primary" />}
            </div>
            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
              msg?.role === 'user'
                ? 'bg-sirius-primary text-white rounded-tr-md'
                : 'sirius-panel text-white rounded-tl-md'
            }`}>
              {msg?.content || (
                <span className="flex items-center gap-1 text-sirius-text-secondary">
                  <Loader2 className="w-3 h-3 animate-spin" /> Düşünüyor...
                </span>
              )}
            </div>
          </motion.div>
        ))}
        {interim && (
          <div className="flex justify-end">
            <div className="max-w-[75%] px-4 py-2.5 rounded-2xl text-sm italic opacity-60 bg-sirius-primary/20 text-white rounded-tr-md">
              {interim}
            </div>
          </div>
        )}
      </div>

      {/* Canlı konuşma çubuğu */}
      <div className="flex flex-col items-center gap-2 pt-3 border-t border-[var(--sirius-border)]" style={{ background: 'var(--sirius-bg-mid)' }}>
        {statusText && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs ${
              isListening ? 'bg-green-500/15 text-green-300' : 'bg-sirius-primary/15 text-sirius-accent'
            }`}
          >
            {isListening && <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />}
            {statusText}
          </motion.div>
        )}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={toggleLive}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium border transition-colors ${
            liveMode
              ? 'bg-red-500/20 text-red-300 border-red-500/40'
              : 'bg-sirius-primary/20 text-sirius-primary border-sirius-primary/40 hover:bg-sirius-primary/30'
          }`}
        >
          {liveMode ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          {liveMode ? 'Konuşmayı bitir' : 'Canlı konuşmayı başlat'}
        </motion.button>
      </div>

      {/* Yazılı giriş */}
      <div className="p-4" style={{ background: 'var(--sirius-bg-mid)' }}>
        <ChatInput onSend={handleSend} avatarState={avatarState} setAvatarState={setAvatarState} compact />
      </div>
    </div>
  )
}