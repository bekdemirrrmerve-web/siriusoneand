export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    return Response.json({ notifications: notifications ?? [] })
  } catch (err: any) {
    return Response.json({ error: err?.message ?? 'Hata' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    await prisma.notification.update({
      where: { id: body?.id },
      data: { read: true },
    })
    return Response.json({ success: true })
  } catch (err: any) {
    return Response.json({ error: err?.message ?? 'Hata' }, { status: 500 })
  }
}
