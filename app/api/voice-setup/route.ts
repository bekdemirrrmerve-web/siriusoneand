export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export async function POST() {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ status: 'not_configured', message: 'ElevenLabs API anahtarı henüz ayarlanmamış' });
    }

    // Check if voice already exists in DB
    const existing = await prisma.voiceSetting.findUnique({ where: { id: 'default' } });
    if (existing?.voiceId) {
      // Verify voice still exists on ElevenLabs
      const checkRes = await fetch(`https://api.elevenlabs.io/v1/voices/${existing.voiceId}`, {
        headers: { 'xi-api-key': apiKey },
      });
      if (checkRes.ok) {
        return NextResponse.json({ voiceId: existing.voiceId, status: 'exists' });
      }
    }

    // Read the WAV file
    const wavPath = path.join(process.cwd(), 'public', 'Merve_Voice_Test.wav');
    if (!fs.existsSync(wavPath)) {
      return NextResponse.json({ error: 'Ses dosyası bulunamadı' }, { status: 404 });
    }

    const wavBuffer = fs.readFileSync(wavPath);
    const blob = new Blob([wavBuffer], { type: 'audio/wav' });

    // Create voice clone via ElevenLabs API
    const formData = new FormData();
    formData.append('name', 'Merve');
    formData.append('description', 'Sirius One AI asistan sesi - Merve');
    formData.append('files', blob, 'Merve_Voice_Test.wav');

    const cloneRes = await fetch('https://api.elevenlabs.io/v1/voices/add', {
      method: 'POST',
      headers: { 'xi-api-key': apiKey },
      body: formData,
    });

    if (!cloneRes.ok) {
      const errText = await cloneRes.text();
      console.error('ElevenLabs clone error:', errText);
      return NextResponse.json({ error: `Ses klonlama başarısız: ${errText}` }, { status: 500 });
    }

    const cloneData = await cloneRes.json();
    const voiceId = cloneData?.voice_id;

    if (!voiceId) {
      return NextResponse.json({ error: 'Voice ID alınamadı' }, { status: 500 });
    }

    // Save to DB
    await prisma.voiceSetting.upsert({
      where: { id: 'default' },
      update: { voiceId },
      create: { id: 'default', voiceId, voiceName: 'Merve' },
    });

    return NextResponse.json({ voiceId, status: 'created' });
  } catch (err: any) {
    console.error('voice-setup error:', err);
    return NextResponse.json({ error: err?.message ?? 'Bilinmeyen hata' }, { status: 500 });
  }
}
