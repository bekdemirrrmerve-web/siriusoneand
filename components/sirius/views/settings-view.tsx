'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Settings, Palette, User, Volume2, Brain, Calendar, Phone, Bell, Shield, Puzzle, Code, Sparkles, ChevronRight, Save } from 'lucide-react'
import { toast } from 'sonner'

type SettingsTab = 'appearance' | 'avatar' | 'voice' | 'ai_models' | 'memory' | 'calendar' | 'calls' | 'notifications' | 'privacy'

const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: 'appearance', label: 'Görünüm', icon: Palette },
  { id: 'avatar', label: 'Avatar', icon: User },
  { id: 'voice', label: 'Ses', icon: Volume2 },
  { id: 'ai_models', label: 'AI Modelleri', icon: Brain },
  { id: 'memory', label: 'Hafıza', icon: Brain },
  { id: 'privacy', label: 'Gizlilik', icon: Shield },
]

const aiProviders = [
  { id: 'abacus', name: 'Abacus AI (Varsayılan)', models: ['gpt-5.4-mini', 'gpt-5.4', 'claude-sonnet-5', 'gemini-3.8-flash'] },
  { id: 'openai', name: 'OpenAI', models: ['gpt-4o', 'gpt-4o-mini'] },
  { id: 'anthropic', name: 'Anthropic', models: ['claude-3.5-sonnet', 'claude-3-haiku'] },
  { id: 'google', name: 'Google', models: ['gemini-pro', 'gemini-flash'] },
  { id: 'deepseek', name: 'DeepSeek', models: ['deepseek-v3'] },
  { id: 'groq', name: 'Groq', models: ['llama-3.1-70b'] },
  { id: 'openrouter', name: 'OpenRouter', models: ['auto'] },
  { id: 'ollama', name: 'Ollama (Lokal)', models: ['llama3', 'mistral'] },
]

export function SettingsView() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance')
  const [settings, setSettings] = useState<Record<string, any>>({})

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then((d: any) => setSettings(d?.settings ?? {})).catch(() => {})
  }, [])

  const saveSetting = async (key: string, value: any) => {
    await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key, value }) })
    setSettings(prev => ({ ...(prev ?? {}), [key]: value }))
    toast.success('Ayar kaydedildi')
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <h1 className="font-display text-2xl font-bold text-white tracking-tight flex items-center gap-2 mb-6">
        <Settings className="w-6 h-6 text-sirius-text-secondary" /> Ayarlar
      </h1>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="hidden md:block w-48 space-y-0.5">
          {tabs.map((t) => {
            const Icon = t.icon
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id)} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === t.id ? 'bg-sirius-primary/15 text-sirius-primary' : 'text-sirius-text-secondary hover:bg-white/5 hover:text-white'
              }`}><Icon className="w-4 h-4" />{t.label}</button>
            )
          })}
        </div>

        {/* Mobile tabs */}
        <div className="md:hidden w-full">
          <div className="flex gap-2 overflow-x-auto scrollbar-none mb-4">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                activeTab === t.id ? 'bg-sirius-primary/20 text-sirius-primary' : 'text-sirius-text-secondary'
              }`}>{t.label}</button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4">
          {activeTab === 'appearance' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <h2 className="text-lg font-semibold text-white">Görünüm</h2>
              <div className="sirius-panel rounded-xl p-4 space-y-4">
                <div>
                  <label className="text-sm text-sirius-text-secondary mb-2 block">Tema</label>
                  <div className="flex gap-2">
                    {['midnight', 'dark', 'light'].map((theme: string) => (
                      <button key={theme} onClick={() => saveSetting('theme', theme)} className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        (settings?.theme ?? 'midnight') === theme ? 'border-sirius-primary bg-sirius-primary/15 text-sirius-primary' : 'border-[var(--sirius-border)] text-sirius-text-secondary hover:bg-white/5'
                      }`}>{theme === 'midnight' ? 'Gece Yarısı' : theme === 'dark' ? 'Karanlık' : 'Aydınlık'}</button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'avatar' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <h2 className="text-lg font-semibold text-white">Avatar</h2>
              <div className="sirius-panel rounded-xl p-4 space-y-4">
                <div>
                  <label className="text-sm text-sirius-text-secondary mb-2 block">Avatar Stili</label>
                  <div className="flex gap-2">
                    {['orb', 'female', 'male'].map((style: string) => (
                      <button key={style} onClick={() => saveSetting('avatar_style', style)} className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                        (settings?.avatar_style ?? 'orb') === style ? 'border-sirius-primary bg-sirius-primary/15 text-sirius-primary' : 'border-[var(--sirius-border)] text-sirius-text-secondary hover:bg-white/5'
                      }`}>{style === 'orb' ? 'Orb' : style === 'female' ? 'Kadın' : 'Erkek'}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-sirius-text-secondary mb-2 block">Animasyon Yoğunluğu</label>
                  <input type="range" min="0" max="100" value={settings?.animation_intensity ?? 70} onChange={(e: React.ChangeEvent<HTMLInputElement>) => saveSetting('animation_intensity', parseInt(e?.target?.value ?? '70'))} className="w-full accent-sirius-primary" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white">Avatarı Kapat</span>
                  <button onClick={() => saveSetting('avatar_disabled', !(settings?.avatar_disabled ?? false))} className={`w-10 h-5 rounded-full transition-colors ${
                    settings?.avatar_disabled ? 'bg-sirius-primary' : 'bg-white/20'
                  }`}>
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings?.avatar_disabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'voice' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <h2 className="text-lg font-semibold text-white">Ses Ayarları</h2>
              <div className="sirius-panel rounded-xl p-4 space-y-4">
                <div>
                  <label className="text-sm text-sirius-text-secondary mb-2 block">STT Sağlayıcı</label>
                  <select value={settings?.stt_provider ?? 'web_speech'} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => saveSetting('stt_provider', e?.target?.value)} className="w-full bg-transparent text-white text-sm border border-[var(--sirius-border)] rounded-lg px-3 py-2 outline-none">
                    <option value="web_speech" className="bg-[#0B1020]">Web Speech API (Varsayılan)</option>
                    <option value="deepgram" className="bg-[#0B1020]">Deepgram</option>
                    <option value="whisper" className="bg-[#0B1020]">OpenAI Whisper</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-sirius-text-secondary mb-2 block">TTS Sağlayıcı</label>
                  <select value={settings?.tts_provider ?? 'web_speech'} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => saveSetting('tts_provider', e?.target?.value)} className="w-full bg-transparent text-white text-sm border border-[var(--sirius-border)] rounded-lg px-3 py-2 outline-none">
                    <option value="web_speech" className="bg-[#0B1020]">Web Speech API (Varsayılan)</option>
                    <option value="elevenlabs" className="bg-[#0B1020]">ElevenLabs</option>
                    <option value="cartesia" className="bg-[#0B1020]">Cartesia</option>
                    <option value="openai" className="bg-[#0B1020]">OpenAI TTS</option>
                    <option value="azure" className="bg-[#0B1020]">Azure TTS</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-sirius-text-secondary mb-2 block">Konuşma Hızı</label>
                  <input type="range" min="0.5" max="2" step="0.1" value={settings?.voice_speed ?? 1} onChange={(e: React.ChangeEvent<HTMLInputElement>) => saveSetting('voice_speed', parseFloat(e?.target?.value ?? '1'))} className="w-full accent-sirius-primary" />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'ai_models' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <h2 className="text-lg font-semibold text-white">AI Model Ayarları</h2>
              {aiProviders.map((provider) => (
                <div key={provider.id} className="sirius-panel rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-sirius-primary" />
                      <span className="text-sm font-medium text-white">{provider.name}</span>
                    </div>
                    {(settings?.ai_provider ?? 'abacus') === provider.id && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-sirius-success/20 text-sirius-success">Aktif</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {provider.models.map((model: string) => (
                      <button
                        key={model}
                        onClick={() => saveSetting('ai_provider', provider.id)}
                        className={`px-2.5 py-1 rounded-md text-xs ${
                          (settings?.ai_provider ?? 'abacus') === provider.id && (settings?.ai_model ?? provider.models[0]) === model
                            ? 'bg-sirius-primary/20 text-sirius-primary'
                            : 'bg-white/5 text-sirius-text-secondary hover:bg-white/10'
                        }`}
                      >{model}</button>
                    ))}
                  </div>
                  {provider.id !== 'abacus' && (
                    <input
                      type="password"
                      placeholder="API Key..."
                      className="mt-3 w-full bg-transparent text-xs text-white border border-[var(--sirius-border)] rounded-lg px-3 py-1.5 outline-none placeholder:text-sirius-text-secondary/40"
                      value={settings?.[`${provider.id}_api_key`] ?? ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => saveSetting(`${provider.id}_api_key`, e?.target?.value ?? '')}
                    />
                  )}
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'memory' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <h2 className="text-lg font-semibold text-white">Hafıza Ayarları</h2>
              <div className="sirius-panel rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white">Otomatik Hafıza Kaydetme</span>
                  <button onClick={() => saveSetting('auto_memory', !(settings?.auto_memory ?? true))} className={`w-10 h-5 rounded-full transition-colors ${
                    (settings?.auto_memory ?? true) ? 'bg-sirius-primary' : 'bg-white/20'
                  }`}><div className={`w-4 h-4 rounded-full bg-white transition-transform ${(settings?.auto_memory ?? true) ? 'translate-x-5' : 'translate-x-0.5'}`} /></button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'privacy' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <h2 className="text-lg font-semibold text-white">Gizlilik</h2>
              <div className="sirius-panel rounded-xl p-4 space-y-4">
                <button className="w-full text-left text-sm text-white hover:text-sirius-primary py-2">Hafızayı Dışa Aktar (JSON)</button>
                <button className="w-full text-left text-sm text-sirius-error hover:text-sirius-error/80 py-2">Tüm Hafızayı Sil</button>
                <button className="w-full text-left text-sm text-sirius-error hover:text-sirius-error/80 py-2">Tüm Sohbetleri Sil</button>
                <button className="w-full text-left text-sm text-sirius-error hover:text-sirius-error/80 py-2">Arama Kayıtlarını Sil</button>
                <div className="flex items-center justify-between pt-2 border-t border-[var(--sirius-border)]">
                  <span className="text-sm text-white">Arama Transkriptlerini Sakla</span>
                  <button onClick={() => saveSetting('save_transcripts', !(settings?.save_transcripts ?? true))} className={`w-10 h-5 rounded-full transition-colors ${
                    (settings?.save_transcripts ?? true) ? 'bg-sirius-primary' : 'bg-white/20'
                  }`}><div className={`w-4 h-4 rounded-full bg-white transition-transform ${(settings?.save_transcripts ?? true) ? 'translate-x-5' : 'translate-x-0.5'}`} /></button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
