export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'ElevenLabs API anahtarı yapılandırılmamış' }, { status: 500 });
    }

    const body = await request.json();
    const text = body?.text;
    if (!text) {
      return NextResponse.json({ error: 'Metin gerekli' }, { status: 400 });
    }

    // Get voice ID from DB
    const setting = await prisma.voiceSetting.findUnique({ where: { id: 'default' } });
    const voiceId = setting?.voiceId;

    if (!voiceId) {
      return NextResponse.json({ error: 'Ses klonu henüz oluşturulmamış. Lütfen önce ses kurulumu yapın.' }, { status: 400 });
    }

    // Request TTS from ElevenLabs
    const ttsRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
          style: 0.3,
        },
      }),
    });

    if (!ttsRes.ok) {
      const errText = await ttsRes.text();
      console.error('ElevenLabs TTS error:', errText);
      return NextResponse.json({ error: `TTS başarısız: ${errText}` }, { status: 500 });
    }

    // Stream audio back
    const audioStream = ttsRes.body;
    if (!audioStream) {
      return NextResponse.json({ error: 'Ses verisi alınamadı' }, { status: 500 });
    }

    return new Response(audioStream, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err: any) {
    console.error('speak error:', err);
    return NextResponse.json({ error: err?.message ?? 'Bilinmeyen hata' }, { status: 500 });
  }
}
