import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const cwd = process.cwd()
  const envPath = path.join(cwd, '.env')
  const envTxtPath = path.join(cwd, '.env.txt')

  const result: any = {
    cwd,
    envFileExists: false,
    envTxtExists: false,
    envFileKeys: [] as string[],
    geminiLinePreview: null as string | null,
    keyLoaded: false,
    keyPreview: null as string | null,
    ttsProvider: process.env.TTS_PROVIDER ?? null,
    geminiTest: null as any,
  }

  try {
    result.envFileExists = fs.existsSync(envPath)
    result.envTxtExists = fs.existsSync(envTxtPath)

    if (result.envFileExists) {
      const content = fs.readFileSync(envPath, 'utf8')
      const lines = content
        .split('\n')
        .map((l: string) => l.trim())
        .filter((l: string) => l.length > 0 && !l.startsWith('#'))

      result.envFileKeys = lines.map((l: string) => {
        const eq = l.indexOf('=')
        return eq > -1 ? l.slice(0, eq).trim() : l
      })

      const geminiLine = lines.find((l: string) => l.startsWith('GEMINI_API_KEY'))
      if (geminiLine) {
        const value = geminiLine.split('=').slice(1).join('=').trim()
        result.geminiLinePreview = 'GEMINI_API_KEY=' + value.slice(0, 6) + '...'
      }
    }
  } catch (e: any) {
    result.envReadError = e?.message ?? 'okunamadi'
  }

  const key = process.env.GEMINI_API_KEY
  result.keyLoaded = !!key
  if (key) {
    result.keyPreview = key.slice(0, 6) + '... (uzunluk: ' + key.length + ')'

    try {
      const res = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models?key=' + key
      )
      const text = await res.text()
      result.geminiTest = {
        durum: res.status === 200 ? 'BASARILI ✅' : 'HATA ❌',
        httpStatus: res.status,
        detay: text.slice(0, 300),
      }
    } catch (e: any) {
      result.geminiTest = { durum: 'BAGLANTI HATASI ❌', detay: e?.message ?? '' }
    }
  }

  return NextResponse.json(result, {
    headers: { 'Cache-Control': 'no-store' },
  })
}