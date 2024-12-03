// src/app/api/auth/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateTelegramWebAppData } from '@/lib/telegram';
import { z } from 'zod'; // Add zod for validation

// Define schemas for validation
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
    // 1. Parse and validate request body
    const body = await req.json().catch(() => null);
    
    if (!body?.initData) {
      return NextResponse.json(
        { error: 'No init data provided' },
        { status: 400 }
      );
    }

    // 2. Parse and validate init data
    let parsedInitData: InitData;
    try {
      const rawInitData = typeof body.initData === 'string' 
        ? JSON.parse(body.initData) 
        : body.initData;
        
      // Validate against schema
      parsedInitData = InitDataSchema.parse(rawInitData);
    } catch (e) {
      console.error('Init data validation error:', e);
      return NextResponse.json(
        { error: 'Invalid init data format' },
        { status: 400 }
      );
    }

    // 3. Validate Telegram WebApp data
    const isValid = validateTelegramWebAppData(parsedInitData);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid authentication' },
        { status: 401 }
      );
    }

    // 4. Extract user data
    const { user } = parsedInitData;

    // 5. Database operation with error handling
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
          lastLoginAt: new Date(), // Update last login time
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
          // Include other related data as needed
          // subscriptions: true,
          // transactions: { take: 5, orderBy: { createdAt: 'desc' } },
        }
      });

      // 6. Prepare response data
      const responseData = {
        success: true,
        user: {
          ...dbUser,
          isNewUser: dbUser.createdAt.getTime() === dbUser.lastLoginAt.getTime(),
          // Add any computed properties
          hasCompletedOnboarding: Boolean(dbUser.settings),
          // Remove sensitive data
          createdAt: undefined,
          updatedAt: undefined,
        }
      };

      // 7. Set session or token if needed
      // const token = generateToken(dbUser.id);
      
      return NextResponse.json(responseData, {
        status: 200,
        headers: {
          // 'Set-Cookie': `token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict`,
        }
      });

    } catch (dbError) {
      console.error('Database error:', dbError);
      
      // Handle specific database errors
      if (dbError.code === 'P2002') {
        return NextResponse.json(
          { error: 'User already exists with different credentials' },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to create or update user' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Auth error:', error);
    
    // Log error for monitoring
    // await logger.error('Auth error', { error });
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' 
          ? (error as Error).message 
          : undefined
      },
      { status: 500 }
    );
  }
}

// Add GET method to check auth status
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'No authorization header' },
        { status: 401 }
      );
    }

    // Validate token/session
    // const userId = validateToken(authHeader);
    
    return NextResponse.json({
      authenticated: true,
      // user: await getUserData(userId)
    });

  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
}