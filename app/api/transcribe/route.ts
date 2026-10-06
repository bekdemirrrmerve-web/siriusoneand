export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API anahtarı yapılandırılmamış' }, { status: 500 });
    }

    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    if (!audioFile) {
      return NextResponse.json({ error: 'Ses dosyası gerekli' }, { status: 400 });
    }

    // Forward to OpenAI Whisper
    const whisperForm = new FormData();
    whisperForm.append('file', audioFile, 'audio.webm');
    whisperForm.append('model', 'whisper-1');
    whisperForm.append('language', 'tr');

    const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}` },
      body: whisperForm,
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Whisper error:', errText);
      return NextResponse.json({ error: `Transkripsiyon başarısız: ${errText}` }, { status: 500 });
    }

    const data = await res.json();
    return NextResponse.json({ text: data?.text ?? '' });
  } catch (err: any) {
    console.error('transcribe error:', err);
    return NextResponse.json({ error: err?.message ?? 'Bilinmeyen hata' }, { status: 500 });
  }
}
