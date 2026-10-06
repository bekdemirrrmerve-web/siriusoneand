export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const where: any = {}
    if (status) where.status = status
    const tasks = await prisma.task.findMany({ where, orderBy: { createdAt: 'desc' } })
    return Response.json({ tasks: tasks ?? [] })
  } catch (err: any) {
    return Response.json({ error: err?.message ?? 'Hata' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const task = await prisma.task.create({
      data: {
        title: body?.title ?? 'Görev',
        description: body?.description ?? null,
        priority: body?.priority ?? 'medium',
        category: body?.category ?? 'general',
        dueDate: body?.dueDate ? new Date(body.dueDate) : null,
        recurrence: body?.recurrence ?? null,
        reminder: body?.reminder ? new Date(body.reminder) : null,
        createdFromConversation: body?.createdFromConversation ?? false,
      }
    })
    return Response.json({ task })
  } catch (err: any) {
    return Response.json({ error: err?.message ?? 'Hata' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const task = await prisma.task.update({
      where: { id: body?.id },
      data: {
        ...(body?.title && { title: body.title }),
        ...(body?.description !== undefined && { description: body.description }),
        ...(body?.priority && { priority: body.priority }),
        ...(body?.status && { status: body.status }),
        ...(body?.category && { category: body.category }),
        ...(body?.dueDate !== undefined && { dueDate: body.dueDate ? new Date(body.dueDate) : null }),
      }
    })
    return Response.json({ task })
  } catch (err: any) {
    return Response.json({ error: err?.message ?? 'Hata' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id') ?? ''
    await prisma.task.delete({ where: { id } })
    return Response.json({ success: true })
  } catch (err: any) {
    return Response.json({ error: err?.message ?? 'Hata' }, { status: 500 })
  }
}
