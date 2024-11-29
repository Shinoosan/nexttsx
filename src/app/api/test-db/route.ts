// app/api/test-db/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Test connection by creating a test user
    const testUser = await prisma.user.upsert({
      where: {
        telegramId: 'test123'
      },
      update: {
        cardsProcessed: { increment: 1 }
      },
      create: {
        telegramId: 'test123',
        cardsProcessed: 0
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful',
      user: testUser 
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}