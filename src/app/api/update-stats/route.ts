// src/app/api/update-stats/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

const StatsUpdateSchema = z.object({
  userId: z.string().min(1),
  processedCount: z.number().int().positive()
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = StatsUpdateSchema.safeParse(body);
    
    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validatedData.error.issues },
        { status: 400 }
      );
    }

    const { userId, processedCount } = validatedData.data;

    const updatedUser = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const user = await tx.user.upsert({
        where: { 
          telegramId: userId.toString() 
        },
        update: {
          cardsProcessed: { increment: processedCount },
          lastLoginAt: new Date(),
        },
        create: {
          telegramId: userId.toString(),
          firstName: 'Unknown', // Required field
          lastName: null,
          username: null,
          languageCode: 'en',
          photoUrl: null,
          isPremium: false,
          isBot: false,
          allowsWriteToPm: false,
          cardsProcessed: processedCount,
          liveCards: 0,
          deadCards: 0,
          lastLoginAt: new Date(),
        },
        select: {
          id: true,
          telegramId: true,
          firstName: true,
          cardsProcessed: true,
          liveCards: true,
          deadCards: true,
          lastLoginAt: true,
        }
      });

      // Create default settings if they don't exist
      const existingSettings = await tx.settings.findUnique({
        where: { userId: user.id }
      });

      if (!existingSettings) {
        await tx.settings.create({
          data: {
            userId: user.id,
            theme: 'light',
            language: 'en',
            notifications: true,
            autoProcess: false,
            defaultGate: 'stripe',
          },
        });
      }

      // Update global stats
      const globalStats = await tx.globalStats.upsert({
        where: { id: 'global' },
        update: {
          totalCardsProcessed: { increment: processedCount },
          updatedAt: new Date(),
        },
        create: {
          id: 'global',
          totalCardsProcessed: processedCount,
          updatedAt: new Date(),
        },
        select: {
          totalCardsProcessed: true,
          updatedAt: true,
        }
      });

      return { user, globalStats };
    });

    return NextResponse.json({ 
      success: true, 
      data: updatedUser 
    });

  } catch (error) {
    console.error('Stats update error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}