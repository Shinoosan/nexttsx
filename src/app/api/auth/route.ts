import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateTelegramWebAppData } from '@/lib/telegram';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
}

interface InitData {
  query_id: string;
  user: TelegramUser;
  auth_date: number;
  hash: string;
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { initData } = data;

    if (!initData) {
      return NextResponse.json({ error: 'No init data provided' }, { status: 400 });
    }

    let parsedInitData: InitData;
    try {
      // Handle both string and object cases
      parsedInitData = typeof initData === 'string' ? JSON.parse(initData) : initData;
    } catch (e) {
      return NextResponse.json({ error: 'Invalid init data format' }, { status: 400 });
    }

    // Validate Telegram WebApp data
    const isValid = validateTelegramWebAppData(parsedInitData);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 });
    }

    const { user } = parsedInitData;

    if (!user) {
      return NextResponse.json({ error: 'No user data' }, { status: 400 });
    }

    // Create or update user in database with error handling
    try {
      const dbUser = await prisma.user.upsert({
        where: {
          telegramId: user.id.toString()
        },
        update: {
          username: user.username || null,
          firstName: user.first_name,
          lastName: user.last_name || null,
          photoUrl: user.photo_url || null,
        },
        create: {
          telegramId: user.id.toString(),
          username: user.username || null,
          firstName: user.first_name,
          lastName: user.last_name || null,
          photoUrl: user.photo_url || null,
          settings: {
            create: {
              theme: 'light',
              language: user.language_code || 'en',
              notifications: true,
            }
          }
        },
        include: {
          settings: true
        }
      });

      return NextResponse.json({
        success: true,
        user: {
          ...dbUser,
          isNewUser: dbUser.createdAt === dbUser.lastLoginAt
        }
      });

    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to create or update user' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
