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

    // Update existing proxy
    const updatedProxy = await prisma.proxy.updateMany({
      where: {
        userId,
        value: proxy,
      },
      data: {
        isActive: true,
        lastUsed: new Date(),
      },
    });

    // If no existing proxy found, create a new one
    if (updatedProxy.count === 0) {
      await prisma.proxy.create({
        data: {
          userId,
          value: proxy,
          isActive: true,
          lastUsed: new Date(),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save proxy:', error);
    return NextResponse.json(
      { error: 'Failed to save proxy' },
      { status: 500 }
    );
  }
}