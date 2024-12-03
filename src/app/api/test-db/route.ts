// src/app/api/test-db/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const user = await prisma.user.upsert({
      where: {
        telegramId: 'test123'
      },
      update: {
        cardsProcessed: { increment: 1 }
      },
      create: {
        telegramId: 'test123',
        firstName: 'Test', // Required field
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
      }
    });

    // Create default settings if they don't exist
    const existingSettings = await prisma.settings.findUnique({
      where: {
        userId: user.id
      }
    });

    if (!existingSettings) {
      await prisma.settings.create({
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

    // Return user with settings
    const userWithSettings = await prisma.user.findUnique({
      where: {
        id: user.id
      },
      include: {
        settings: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Database test successful',
      user: userWithSettings
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}