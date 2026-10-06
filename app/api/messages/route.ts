export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') ?? '50', 10)
    const messages = await prisma.message.findMany({
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 100),
    })
    return Response.json({ messages: (messages ?? []).reverse() })
  } catch (err: any) {
    return Response.json({ error: err?.message ?? 'Hata' }, { status: 500 })
  }
}
