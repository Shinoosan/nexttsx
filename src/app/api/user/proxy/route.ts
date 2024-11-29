import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { telegramId, proxy } = await request.json()

    const user = await prisma.user.upsert({
      where: { telegramId },
      update: {
        proxy,
        lastActive: new Date(),
      },
      create: {
        telegramId,
        proxy,
      },
    })

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error('Failed to update proxy:', error)
    return NextResponse.json(
      { error: 'Failed to update proxy' },
      { status: 500 }
    )
  }
}