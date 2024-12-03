import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateTelegramWebAppData } from '@/lib/telegram';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

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
    // Input validation
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
    const isValid = validateTelegramWebAppData(parsedInitData);
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

    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle unique constraint violations
        if (e.code === 'P2002') {
          const target = (e.meta?.target as string[]) || [];
          return NextResponse.json({
            error: `Unique constraint violation on: ${target.join(', ')}`,
            code: 'P2002'
          }, { status: 409 });
        }
        
        // Handle foreign key constraint violations
        if (e.code === 'P2003') {
          return NextResponse.json({
            error: 'Foreign key constraint failed',
            code: 'P2003'
          }, { status: 400 });
        }

        // Handle record not found
        if (e.code === 'P2025') {
          return NextResponse.json({
            error: 'Record not found',
            code: 'P2025'
          }, { status: 404 });
        }
      }

      if (e instanceof Prisma.PrismaClientValidationError) {
        return NextResponse.json({
          error: 'Invalid data provided',
          code: 'VALIDATION_ERROR'
        }, { status: 400 });
      }

      if (e instanceof Prisma.PrismaClientInitializationError) {
        console.error('Database initialization error:', e);
        return NextResponse.json({
          error: 'Service temporarily unavailable',
          code: 'DB_INIT_ERROR'
        }, { status: 503 });
      }

      // Log unknown errors
      console.error('Unexpected database error:', e);
      return NextResponse.json({
        error: 'Internal server error',
        code: 'UNKNOWN_ERROR',
        message: process.env.NODE_ENV === 'development' ? e.message : undefined
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      code: 'AUTH_ERROR',
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
      return NextResponse.json({
        error: 'No authorization header',
        code: 'UNAUTHORIZED'
      }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true
    });

  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({
      error: 'Authentication failed',
      code: 'AUTH_ERROR',
      message: process.env.NODE_ENV === 'development' 
        ? error instanceof Error ? error.message : 'Unknown error'
        : undefined
    }, { status: 401 });
  }
}