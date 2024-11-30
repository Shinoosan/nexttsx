import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    // Parse search parameters
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    // Fetch user-specific stats
    const userStats = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        cardsProcessed: true,
        liveCards: true,
        deadCards: true,
        username: true,
      },
    });

    if (!userStats) {
      return NextResponse.json(
        { error: 'User stats not found' },
        { status: 404 }
      );
    }

    // Fetch global stats
    const globalStats = await prisma.globalStats.findUnique({
      where: { id: 'global' },
    });

    return NextResponse.json({
      user: userStats,
      global: globalStats || null,
    });
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
