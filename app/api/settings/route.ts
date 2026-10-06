export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const settings = await prisma.setting.findMany()
    const obj: Record<string, any> = {}
    for (const s of settings ?? []) {
      try { obj[s?.key ?? ''] = JSON.parse(s?.value ?? '{}') } catch { obj[s?.key ?? ''] = s?.value }
    }
    return Response.json({ settings: obj })
  } catch (err: any) {
    return Response.json({ error: err?.message ?? 'Hata' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const key = body?.key ?? ''
    const value = typeof body?.value === 'string' ? body.value : JSON.stringify(body?.value ?? '')
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    })
    return Response.json({ success: true })
  } catch (err: any) {
    return Response.json({ error: err?.message ?? 'Hata' }, { status: 500 })
  }
}
