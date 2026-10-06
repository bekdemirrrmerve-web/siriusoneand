export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const search = url.searchParams.get('search')
    const where: any = {}
    if (search) where.name = { contains: search }
    const contacts = await prisma.contact.findMany({ where, orderBy: { name: 'asc' } })
    return Response.json({ contacts: contacts ?? [] })
  } catch (err: any) {
    return Response.json({ error: err?.message ?? 'Hata' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const contact = await prisma.contact.create({
      data: {
        name: body?.name ?? '',
        phone: body?.phone ?? null,
        email: body?.email ?? null,
        relationship: body?.relationship ?? null,
        notes: body?.notes ?? null,
      }
    })
    return Response.json({ contact })
  } catch (err: any) {
    return Response.json({ error: err?.message ?? 'Hata' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id') ?? ''
    await prisma.contact.delete({ where: { id } })
    return Response.json({ success: true })
  } catch (err: any) {
    return Response.json({ error: err?.message ?? 'Hata' }, { status: 500 })
  }
}
