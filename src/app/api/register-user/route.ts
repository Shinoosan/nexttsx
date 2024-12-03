// src/app/api/register-user/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { telegramId, username, firstName, lastName, photoUrl, languageCode } = await req.json();
    
    // First, upsert the user
    const user = await prisma.user.upsert({
      where: { 
        telegramId
      },
      update: {
        username,
        firstName,
        lastName,
        photoUrl,
        languageCode,
        lastLoginAt: new Date(),
      },
      create: {
        telegramId,
        username,
        firstName,
        lastName: lastName || '',
        photoUrl,
        languageCode: languageCode || 'en',
        cardsProcessed: 0,
        liveCards: 0,
        deadCards: 0,
        isPremium: false,
        isBot: false,
        allowsWriteToPm: false,
      },
    });

    // Check if settings exist for this user
    const existingSettings = await prisma.settings.findUnique({
      where: {
        userId: user.id
      }
    });

    // Create settings if they don't exist
    if (!existingSettings) {
      await prisma.settings.create({
        data: {
          userId: user.id,
          theme: 'light',
          language: languageCode || 'en',
          notifications: true,
          autoProcess: false,
          defaultGate: 'stripe',
        },
      });
    }

    // Fetch user with settings
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
      user: userWithSettings 
    });
  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
}