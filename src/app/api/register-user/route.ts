// src/app/api/register-user/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { telegramId, username, firstName, lastName, photoUrl, languageCode } = await req.json();
    
    const user = await prisma.user.upsert({
      where: { 
        telegramId // Changed from userId to telegramId to match schema
      },
      update: {
        username,
        firstName,
        lastName,
        photoUrl,
        languageCode,
        lastLoginAt: new Date(), // Changed from lastSeen to lastLoginAt to match schema
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

    // Create default settings for new user if they don't exist
    if (!user.settings) {
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

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
}