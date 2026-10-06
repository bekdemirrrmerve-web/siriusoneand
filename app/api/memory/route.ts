export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const type = url.searchParams.get('type')
    const search = url.searchParams.get('search')
    const where: any = {}
    if (type) where.type = type
    if (search) where.content = { contains: search }
    const memories = await prisma.memory.findMany({
      where,
      orderBy: { importance: 'desc' },
      take: 50,
    })
    return Response.json({ memories: memories ?? [] })
  } catch (err: any) {
    return Response.json({ error: err?.message ?? 'Hata' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const memory = await prisma.memory.create({
      data: {
        content: body?.content ?? '',
        type: body?.type ?? 'conversation_memory',
        entities: body?.entities ?? [],
        source: body?.source ?? 'manual',
        confidence: body?.confidence ?? 0.9,
        importance: body?.importance ?? 5,
      }
    })
    return Response.json({ memory })
  } catch (err: any) {
    return Response.json({ error: err?.message ?? 'Hata' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const memory = await prisma.memory.update({
      where: { id: body?.id },
      data: {
        ...(body?.content && { content: body.content }),
        ...(body?.type && { type: body.type }),
        ...(body?.entities && { entities: body.entities }),
        ...(body?.importance !== undefined && { importance: body.importance }),
      }
    })
    return Response.json({ memory })
  } catch (err: any) {
    return Response.json({ error: err?.message ?? 'Hata' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id') ?? ''
    await prisma.memory.delete({ where: { id } })
    return Response.json({ success: true })
  } catch (err: any) {
    return Response.json({ error: err?.message ?? 'Hata' }, { status: 500 })
  }
}
