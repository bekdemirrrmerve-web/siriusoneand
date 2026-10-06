export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const start = url.searchParams.get('start')
    const end = url.searchParams.get('end')
    const where: any = {}
    if (start) where.startTime = { ...(where.startTime ?? {}), gte: new Date(start) }
    if (end) where.startTime = { ...(where.startTime ?? {}), lte: new Date(end) }
    const events = await prisma.event.findMany({ where, orderBy: { startTime: 'asc' } })
    return Response.json({ events: events ?? [] })
  } catch (err: any) {
    return Response.json({ error: err?.message ?? 'Hata' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const event = await prisma.event.create({
      data: {
        title: body?.title ?? 'Etkinlik',
        description: body?.description ?? null,
        startTime: new Date(body?.startTime),
        endTime: new Date(body?.endTime),
        location: body?.location ?? null,
        color: body?.color ?? '#6677FF',
        allDay: body?.allDay ?? false,
      }
    })
    return Response.json({ event })
  } catch (err: any) {
    return Response.json({ error: err?.message ?? 'Hata' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const event = await prisma.event.update({
      where: { id: body?.id },
      data: {
        ...(body?.title && { title: body.title }),
        ...(body?.description !== undefined && { description: body.description }),
        ...(body?.startTime && { startTime: new Date(body.startTime) }),
        ...(body?.endTime && { endTime: new Date(body.endTime) }),
        ...(body?.location !== undefined && { location: body.location }),
        ...(body?.color && { color: body.color }),
      }
    })
    return Response.json({ event })
  } catch (err: any) {
    return Response.json({ error: err?.message ?? 'Hata' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id') ?? ''
    await prisma.event.delete({ where: { id } })
    return Response.json({ success: true })
  } catch (err: any) {
    return Response.json({ error: err?.message ?? 'Hata' }, { status: 500 })
  }
}
