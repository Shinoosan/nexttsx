// src/app/api/register-user/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { userId, username } = await req.json();
    
    const user = await prisma.user.upsert({
      where: { userId },
      update: {
        username,
        lastSeen: new Date(),
        updatedAt: new Date(),
      },
      create: {
        userId,
        username,
        lastSeen: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        cardsProcessed: 0,
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
}
