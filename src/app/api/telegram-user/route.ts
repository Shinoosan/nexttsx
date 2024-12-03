// src/app/api/telegram-user/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

interface TelegramWebAppUser {
  id: number;
  is_bot?: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  added_to_attachment_menu?: boolean;
  allows_write_to_pm?: boolean;
  photo_url?: string;
}

export async function POST(request: Request) {
  try {
    const userData: TelegramWebAppUser = await request.json();

    const user = await prisma.user.upsert({
      where: {
        telegramId: userData.id.toString(), // Convert to string as per schema
      },
      update: {
        isBot: userData.is_bot || false,
        firstName: userData.first_name,
        lastName: userData.last_name || null,
        username: userData.username || null,
        languageCode: userData.language_code || 'en',
        isPremium: userData.is_premium || false,
        allowsWriteToPm: userData.allows_write_to_pm || false,
        photoUrl: userData.photo_url || null,
        lastLoginAt: new Date(),
      },
      create: {
        telegramId: userData.id.toString(),
        isBot: userData.is_bot || false,
        firstName: userData.first_name,
        lastName: userData.last_name || null,
        username: userData.username || null,
        languageCode: userData.language_code || 'en',
        isPremium: userData.is_premium || false,
        allowsWriteToPm: userData.allows_write_to_pm || false,
        photoUrl: userData.photo_url || null,
        cardsProcessed: 0,
        liveCards: 0,
        deadCards: 0,
      },
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
          language: userData.language_code || 'en',
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

    return NextResponse.json(userWithSettings);
  } catch (error) {
    console.error('Error saving Telegram user:', error);
    return NextResponse.json(
      { error: 'Failed to save user data' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const telegramId = searchParams.get('id');

  if (!telegramId) {
    return NextResponse.json(
      { error: 'Telegram ID is required' },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        telegramId: telegramId.toString(),
      },
      include: {
        settings: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching Telegram user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    );
  }
}