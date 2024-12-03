import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const ProxyUpdateSchema = z.object({
  telegramId: z.string().min(1),
  proxy: z.string().min(1)
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = ProxyUpdateSchema.safeParse(body);
    
    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validatedData.error.issues },
        { status: 400 }
      );
    }

    const { telegramId, proxy } = validatedData.data;

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // First, ensure user exists
      const user = await tx.user.upsert({
        where: { telegramId },
        update: {
          lastLoginAt: new Date(),
        },
        create: {
          telegramId,
          firstName: 'Unknown',
          lastName: null,
          username: null,
          languageCode: 'en',
          photoUrl: null,
          isPremium: false,
          isBot: false,
          allowsWriteToPm: false,
          cardsProcessed: 0,
          liveCards: 0,
          deadCards: 0,
        },
      });

      // Then, update or create proxy
      const updatedProxy = await tx.proxy.upsert({
        where: { 
          userId: user.id 
        },
        update: {
          value: proxy,
          lastUsed: new Date(),
        },
        create: {
          userId: user.id,
          value: proxy,
          lastUsed: new Date(),
        },
      });

      return {
        user,
        proxy: updatedProxy
      };
    });

    return NextResponse.json({ 
      success: true, 
      data: result 
    });

  } catch (error) {
    console.error('Failed to update proxy:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update proxy',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const telegramId = searchParams.get('telegramId');

    if (!telegramId) {
      return NextResponse.json(
        { error: 'Telegram ID is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { telegramId },
      include: {
        proxy: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user.proxy
    });

  } catch (error) {
    console.error('Failed to fetch proxy:', error);
    return NextResponse.json(
      { error: 'Failed to fetch proxy' },
      { status: 500 }
    );
  }
}