export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

const SYSTEM_PROMPT = `Sen SIRIUS ONE, Merve'nin kişisel AI asistanısın. Premium, zarif, empatik ve yardımsever bir asistansın.

Kurallar:
- Türkçe konuş, samimi ama profesyonel ol
- Kısa ve öz cevaplar ver, gereksiz uzatma
- Kullanıcının duygusal durumuna uygun tepki ver
- Gerektiğinde araçları kullan (takvim, görev, hafıza, kişiler)
- Kullanıcı bilgileri: İsim: Merve, Şehir: İstanbul
- Tarih/saat bilgisi gerektiğinde bugünün tarihini kullan

Kullanılabilir Araçlar (gerektiğinde JSON formatında çağır):
- calendar.get_events: Takvim etkinliklerini getir
- calendar.create_event: Yeni etkinlik oluştur {title, date, time, duration}
- task.create: Görev oluştur {title, description, priority, dueDate}
- task.list: Görevleri listele
- memory.search: Hafızada ara {query}
- memory.add: Hafızaya ekle {content, type, entities}
- contacts.search: Kişilerde ara {query}
- notification.create: Bildirim oluştur {title, body}

Bir araç kullanman gerekiyorsa, cevabının başına [TOOL:tool_name:params_json] formatında ekle.
Örnek: [TOOL:calendar.create_event:{"title":"Toplantı","date":"2026-09-30","time":"09:00"}]
Araç çağrısından sonra kullanıcıya sonucu açıkla.`

async function getRecentMemories(): Promise<string> {
  try {
    const memories = await prisma.memory.findMany({
      orderBy: { importance: 'desc' },
      take: 10,
    })
    if ((memories?.length ?? 0) === 0) return ''
    return '\n\nHafızadaki bilgiler:\n' + (memories ?? []).map((m: any) => `- [${m?.type}] ${m?.content}`).join('\n')
  } catch { return '' }
}

async function executeToolCall(toolStr: string): Promise<string> {
  try {
    const match = toolStr?.match?.(/\[TOOL:(\w+\.\w+):(.+?)\]/)
    if (!match) return ''
    const [, toolName, paramsStr] = match
    const params = JSON.parse(paramsStr ?? '{}')

    switch (toolName) {
      case 'calendar.create_event': {
        const startTime = new Date(`${params?.date ?? ''}T${params?.time ?? '09:00'}:00`)
        const endTime = new Date(startTime.getTime() + ((params?.duration ?? 60) * 60000))
        const event = await prisma.event.create({
          data: {
            title: params?.title ?? 'Etkinlik',
            description: params?.description ?? null,
            startTime,
            endTime,
            location: params?.location ?? null,
          }
        })
        return `Takvime eklendi: ${event?.title} - ${startTime.toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })}`
      }
      case 'task.create': {
        const task = await prisma.task.create({
          data: {
            title: params?.title ?? 'Görev',
            description: params?.description ?? null,
            priority: params?.priority ?? 'medium',
            dueDate: params?.dueDate ? new Date(params.dueDate) : null,
            createdFromConversation: true,
          }
        })
        return `Görev oluşturuldu: ${task?.title}`
      }
      case 'memory.add': {
        await prisma.memory.create({
          data: {
            content: params?.content ?? '',
            type: params?.type ?? 'conversation_memory',
            entities: params?.entities ?? [],
            source: 'conversation',
          }
        })
        return `Hafızaya kaydedildi.`
      }
      case 'memory.search': {
        const memories = await prisma.memory.findMany({
          where: { content: { contains: params?.query ?? '' } },
          take: 5,
        })
        return (memories?.length ?? 0) > 0
          ? 'Bulunan anılar: ' + (memories ?? []).map((m: any) => m?.content).join('; ')
          : 'Hafızada bu konuyla ilgili bir şey bulunamadı.'
      }
      case 'calendar.get_events': {
        const now = new Date()
        const events = await prisma.event.findMany({
          where: { startTime: { gte: now } },
          orderBy: { startTime: 'asc' },
          take: 10,
        })
        return (events?.length ?? 0) > 0
          ? 'Yaklaşan etkinlikler: ' + (events ?? []).map((e: any) => `${e?.title} - ${new Date(e?.startTime).toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })}`).join('; ')
          : 'Yaklaşan etkinlik yok.'
      }
      case 'task.list': {
        const tasks = await prisma.task.findMany({
          where: { status: { in: ['pending', 'in_progress'] } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        })
        return (tasks?.length ?? 0) > 0
          ? 'Görevler: ' + (tasks ?? []).map((t: any) => `${t?.title} (${t?.priority})`).join('; ')
          : 'Aktif görev yok.'
      }
      case 'contacts.search': {
        const contacts = await prisma.contact.findMany({
          where: { name: { contains: params?.query ?? '' } },
          take: 5,
        })
        return (contacts?.length ?? 0) > 0
          ? 'Bulunan kişiler: ' + (contacts ?? []).map((c: any) => `${c?.name} (${c?.relationship ?? 'kişi'})`).join('; ')
          : 'Kişi bulunamadı.'
      }
      case 'notification.create': {
        await prisma.notification.create({
          data: {
            title: params?.title ?? 'Bildirim',
            body: params?.body ?? '',
            type: 'reminder',
          }
        })
        return 'Bildirim oluşturuldu.'
      }
      default:
        return `Araç bulunamadı: ${toolName}`
    }
  } catch (err: any) {
    return `Araç hatası: ${err?.message ?? 'bilinmeyen hata'}`
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const userMessage = body?.message ?? ''

    // Kullanıcı mesajını kaydet
    await prisma.message.create({ data: { role: 'user', content: userMessage } })

    // Bağlamı hazırla
    const memoryContext = await getRecentMemories()
    const recentMessages = await prisma.message.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    })
    const history = (recentMessages ?? []).reverse().map((m: any) => ({
      role: m?.role === 'user' ? 'user' : 'assistant',
      content: m?.content ?? '',
    }))

    const todayStr = new Date().toLocaleDateString('tr-TR', { timeZone: 'Europe/Istanbul', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

    const geminiKey = process.env.GEMINI_API_KEY
    if (!geminiKey) {
      throw new Error('GEMINI_API_KEY tanımlı değil. .env dosyasını kontrol et.')
    }

    const systemText = SYSTEM_PROMPT + memoryContext + `\n\nBugün: ${todayStr}`

    const contents = [
      ...history.map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      })),
      { role: 'user', parts: [{ text: userMessage }] },
    ]

    // Önce bu model denenir, bulunamazsa yedekler kullanılır
    const requestedModel = process.env.GEMINI_CHAT_MODEL || 'gemini-3.8-flash'
    const candidateModels = [requestedModel, 'gemini-2.5-flash', 'gemini-2.0-flash'].filter(
      (m, i, arr) => m && arr.indexOf(m) === i
    )

    let response: Response | null = null

    for (const model of candidateModels) {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemText }] },
            contents,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1500,
            },
          }),
        }
      )

      if (res.ok) {
        response = res
        break
      }

      if (res.status === 404) {
        // Model bulunamadı, sıradakini dene
        continue
      }

      const errorText = await res.text()
      console.error('Gemini API gerçek hata:', res.status, errorText)
      throw new Error(`Gemini API hatası ${res.status}: ${errorText.slice(0, 500)}`)
    }

    if (!response) {
      throw new Error('Gemini modeli bulunamadı. GEMINI_CHAT_MODEL ayarını kontrol et.')
    }

    const upstream: Response = response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        const reader = upstream.body?.getReader()
        const decoder = new TextDecoder()
        let fullContent = ''
        let partialRead = ''

        try {
          while (reader) {
            const { done, value } = await reader.read()
            if (done) break
            partialRead += decoder.decode(value, { stream: true })
            const lines = partialRead.split('\n')
            partialRead = lines.pop() ?? ''
            for (const rawLine of lines) {
              const line = rawLine.trim()
              if (!line.startsWith('data: ')) continue
              const data = line.slice(6)
              if (data === '[DONE]') continue
              try {
                const parsed = JSON.parse(data)
                const parts = parsed?.candidates?.[0]?.content?.parts ?? []
                const chunk = parts.map((p: any) => p?.text ?? '').join('')
                if (chunk) {
                  fullContent += chunk
                  const toolMatch = fullContent?.match?.(/\[TOOL:[\w.]+:\{.*?\}\]/)
                  if (toolMatch) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'activity', text: 'İşlem yapılıyor...' })}\n\n`))
                  } else {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'content', text: chunk })}\n\n`))
                  }
                }
              } catch {}
            }
          }

          // Araç çağrısı varsa çalıştır
          const toolMatch = fullContent?.match?.(/\[TOOL:[\w.]+:\{.*?\}\]/)
          if (toolMatch) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'tool', text: 'Araç çalıştırılıyor...' })}\n\n`))
            const toolResult = await executeToolCall(toolMatch[0])
            const cleanContent = fullContent?.replace?.(toolMatch[0], '')?.trim?.()
            const finalContent = cleanContent ? cleanContent + (toolResult ? `\n\n✅ ${toolResult}` : '') : toolResult
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'content', text: `\n\n✅ ${toolResult}` })}\n\n`))
            fullContent = finalContent ?? ''
          }

          // Asistan cevabını kaydet
          if (fullContent) {
            await prisma.message.create({ data: { role: 'assistant', content: fullContent } })
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        } catch (err: any) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'content', text: 'Bir hata oluştu: ' + (err?.message ?? '') })}\n\n`))
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (err: any) {
    console.error('Chat API hatası:', err?.message ?? err)
    return Response.json({ error: err?.message ?? 'Bilinmeyen hata' }, { status: 500 })
  }
}