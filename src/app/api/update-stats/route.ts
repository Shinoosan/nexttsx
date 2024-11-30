import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { Prisma, PrismaClientKnownRequestError } from '@prisma/client';

// Define validation schema
const StatsUpdateSchema = z.object({
  userId: z.string().min(1),
  processedCount: z.number().int().positive()
});

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await request.json();
    
    // Validate the input
    const validatedData = StatsUpdateSchema.safeParse(body);
    
    if (!validatedData.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input', 
          details: validatedData.error.issues 
        },
        { status: 400 }
      );
    }

    const { userId, processedCount } = validatedData.data;

    // Add transaction to ensure data consistency
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
          cardsProcessed: processedCount,
          lastLoginAt: new Date(),
        },
        select: {
          telegramId: true,
          cardsProcessed: true,
          lastLoginAt: true,
        }
      });

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
    
    // Specific error handling
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: error.issues 
        },
        { status: 400 }
      );
    }

    if (error instanceof PrismaClientKnownRequestError) {
      return NextResponse.json({
        error: 'Database error',
        code: error.code,
        message: error.message
      }, { status: 500 });
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
