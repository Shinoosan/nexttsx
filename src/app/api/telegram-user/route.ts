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

    const user = await prisma.webAppUser.upsert({
      where: {
        id: userData.id,
      },
      update: {
        isBot: userData.is_bot || false,
        firstName: userData.first_name,
        lastName: userData.last_name || null,
        username: userData.username || null,
        languageCode: userData.language_code || null,
        isPremium: userData.is_premium || false,
        addedToAttachmentMenu: userData.added_to_attachment_menu || false,
        allowsWriteToPm: userData.allows_write_to_pm || false,
        photoUrl: userData.photo_url || null,
      },
      create: {
        id: userData.id,
        isBot: userData.is_bot || false,
        firstName: userData.first_name,
        lastName: userData.last_name || null,
        username: userData.username || null,
        languageCode: userData.language_code || null,
        isPremium: userData.is_premium || false,
        addedToAttachmentMenu: userData.added_to_attachment_menu || false,
        allowsWriteToPm: userData.allows_write_to_pm || false,
        photoUrl: userData.photo_url || null,
      },
    });

    return NextResponse.json(user);
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
  const userId = searchParams.get('id');

  if (!userId) {
    return NextResponse.json(
      { error: 'User ID is required' },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.webAppUser.findUnique({
      where: {
        id: parseInt(userId),
      },
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