// app/api/auth/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateTelegramWebAppData } from '@/lib/telegram';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { initData } = data;

    // Validate Telegram WebApp data
    const isValid = validateTelegramWebAppData(initData);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 });
    }

    const telegramData = JSON.parse(initData);
    const { user } = telegramData;

    if (!user) {
      return NextResponse.json({ error: 'No user data' }, { status: 400 });
    }

    // Create or update user in database
    const dbUser = await prisma.user.upsert({
      where: { telegramId: user.id.toString() },
      update: {
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        photoUrl: user.photo_url,
      },
      create: {
        telegramId: user.id.toString(),
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        photoUrl: user.photo_url,
        settings: {
          create: {} // Creates default settings
        }
      },
      include: {
        settings: true
      }
    });

    return NextResponse.json({ user: dbUser });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}