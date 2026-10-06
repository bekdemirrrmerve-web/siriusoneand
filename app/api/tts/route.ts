import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Seslendirilecek metin bulunamadı.' },
        { status: 400 }
      )
    }

    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            'GEMINI_API_KEY tanımlı değil. .env dosyasına Gemini API anahtarını ekleyin.',
        },
        { status: 500 }
      )
    }

    const voice = process.env.GEMINI_TTS_VOICE || 'Aoede'

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash-tts:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text,
                  speech_metadata: {
                    style:
                      'Türkçe konuş. Sıcak, doğal, samimi, empatik ve akıcı bir kadın sesiyle konuş.',
                  },
                },
              ],
            },
          ],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                voice,
              },
            },
          },
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error('Gemini ses oluşturamadı:', data)

      return NextResponse.json(
        {
          error:
            data?.error?.message ||
            'Gemini ses oluşturulamadı. API anahtarını ve Gemini erişimini kontrol et.',
        },
        { status: response.status }
      )
    }

    const audioBase64 =
      data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data

    if (!audioBase64) {
      console.error('Gemini ses verisi bulunamadı:', data)

      return NextResponse.json(
        { error: 'Gemini ses verisi döndürmedi.' },
        { status: 500 }
      )
    }

    const audioBuffer = Buffer.from(audioBase64, 'base64')

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Length': audioBuffer.length.toString(),
        'Cache-Control': 'no-store',
      },
    })
  } catch (error: any) {
    console.error('TTS hatası:', error)

    return NextResponse.json(
      {
        error: error?.message || 'Ses oluşturulurken beklenmeyen hata oluştu.',
      },
      { status: 500 }
    )
  }
}