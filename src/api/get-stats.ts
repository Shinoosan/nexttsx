// app/api/get-stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// You can also use revalidate if you want to cache for a specific duration
// export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    // Get userId from searchParams
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Fetch user stats
    const user = await prisma.user.findUnique({
      where: { telegramId: userId },
      select: { cardsProcessed: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Fetch global stats
    const [totalCardsProcessed, totalUsers] = await Promise.all([
      prisma.user.aggregate({
        _sum: { cardsProcessed: true },
      }),
      prisma.user.count(),
    ]);

    // Return combined stats
    return NextResponse.json({
      user,
      global: {
        totalCardsProcessed: totalCardsProcessed._sum.cardsProcessed || 0,
        totalUsers,
      },
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function POST() {
  return methodNotAllowed();
}

export async function PUT() {
  return methodNotAllowed();
}

export async function DELETE() {
  return methodNotAllowed();
}

// Helper function for method not allowed response
function methodNotAllowed() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}