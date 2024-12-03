import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateTelegramWebAppData } from '@/lib/telegram';
import { z } from 'zod';
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

// Schema definitions
const TelegramUserSchema = z.object({
  id: z.number(),
  first_name: z.string(),
  last_name: z.string().optional(),
  username: z.string().optional(),
  photo_url: z.string().url().optional(),
  language_code: z.string().optional(),
});

const InitDataSchema = z.object({
  query_id: z.string(),
  user: TelegramUserSchema,
  auth_date: z.number(),
  hash: z.string(),
});

type TelegramUser = z.infer<typeof TelegramUserSchema>;
type InitData = z.infer<typeof InitDataSchema>;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    
    if (!body?.initData) {
      return NextResponse.json(
        { error: 'No init data provided' },
        { status: 400 }
      );
    }

    // Parse and validate init data
    let parsedInitData: InitData;
    try {
      const rawInitData = typeof body.initData === 'string' 
        ? JSON.parse(body.initData) 
        : body.initData;
        
      parsedInitData = InitDataSchema.parse(rawInitData);
    } catch (e) {
      console.error('Init data validation error:', e);
      return NextResponse.json(
        { error: 'Invalid init data format' },
        { status: 400 }
      );
    }

    // Validate Telegram data
    const isValid = await validateTelegramWebAppData(body.initData);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid authentication' },
        { status: 401 }
      );
    }

    const { user } = parsedInitData;

    try {
      const dbUser = await prisma.user.upsert({
        where: {
          telegramId: user.id.toString(),
        },
        update: {
          username: user.username ?? null,
          firstName: user.first_name,
          lastName: user.last_name ?? null,
          photoUrl: user.photo_url ?? null,
          lastLoginAt: new Date(),
        },
        create: {
          telegramId: user.id.toString(),
          username: user.username ?? null,
          firstName: user.first_name,
          lastName: user.last_name ?? null,
          photoUrl: user.photo_url ?? null,
          settings: {
            create: {
              theme: 'light',
              language: user.language_code ?? 'en',
              notifications: true,
            }
          }
        },
        include: {
          settings: true,
        }
      });

      return NextResponse.json({
        success: true,
        user: {
          ...dbUser,
          isNewUser: dbUser.createdAt.getTime() === dbUser.lastLoginAt.getTime(),
          hasCompletedOnboarding: Boolean(dbUser.settings),
        }
      });

    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          return NextResponse.json(
            { error: 'User already exists with different credentials' },
            { status: 409 }
          );
        }
      }

      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create or update user' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' 
        ? error instanceof Error ? error.message : 'Unknown error'
        : undefined
    }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'No authorization header' },
        { status: 401 }
      );
    }

    // Extract token from Bearer header
    const token = authHeader.replace('Bearer ', '');
    
    // Validate token (implement your token validation logic)
    const isValidToken = token && token.length > 0;
    
    if (!isValidToken) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      message: 'Token is valid'
    });

  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { 
        error: 'Authentication failed',
        message: process.env.NODE_ENV === 'development' 
          ? error instanceof Error ? error.message : 'Unknown error'
          : undefined
      },
      { status: 401 }
    );
  }
}

// Helper function to handle errors consistently
function handleError(error: unknown, defaultMessage: string) {
  console.error(error);
  const errorMessage = error instanceof Error ? error.message : defaultMessage;
  return NextResponse.json(
    { 
      error: defaultMessage,
      message: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    },
    { status: 500 }
  );
}