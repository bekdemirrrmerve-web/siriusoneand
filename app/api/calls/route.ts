export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const where: any = {}
    if (status) where.status = status
    const calls = await prisma.call.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { contact: true },
    })
    return Response.json({ calls: calls ?? [] })
  } catch (err: any) {
    return Response.json({ error: err?.message ?? 'Hata' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const call = await prisma.call.create({
      data: {
        contactName: body?.contactName ?? '',
        contactId: body?.contactId ?? null,
        phone: body?.phone ?? null,
        callReason: body?.callReason ?? null,
        aiInstructions: body?.aiInstructions ?? null,
        status: 'pending',
      }
    })
    return Response.json({ call })
  } catch (err: any) {
    return Response.json({ error: err?.message ?? 'Hata' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const call = await prisma.call.update({
      where: { id: body?.id },
      data: {
        ...(body?.status && { status: body.status }),
        ...(body?.transcript !== undefined && { transcript: body.transcript }),
        ...(body?.summary !== undefined && { summary: body.summary }),
        ...(body?.result !== undefined && { result: body.result }),
        ...(body?.duration !== undefined && { duration: body.duration }),
        ...(body?.startedAt && { startedAt: new Date(body.startedAt) }),
        ...(body?.endedAt && { endedAt: new Date(body.endedAt) }),
      }
    })
    return Response.json({ call })
  } catch (err: any) {
    return Response.json({ error: err?.message ?? 'Hata' }, { status: 500 })
  }
}
