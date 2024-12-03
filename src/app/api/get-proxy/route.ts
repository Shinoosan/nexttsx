// src/app/api/save-proxy/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { proxy, userId } = await request.json();

    if (!proxy || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const updatedProxy = await prisma.proxy.upsert({
      where: {
        userId_value: {
          userId,
          value: proxy,
        },
      },
      update: {
        isActive: true,
        lastUsed: new Date(),
      },
      create: {
        userId,
        value: proxy,
        isActive: true,
        lastUsed: new Date(),
      },
    });

    return NextResponse.json({ success: true, proxy: updatedProxy });
  } catch (error) {
    console.error('Failed to save proxy:', error);
    return NextResponse.json(
      { error: 'Failed to save proxy' },
      { status: 500 }
    );
  }
}