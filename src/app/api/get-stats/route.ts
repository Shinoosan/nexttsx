// src/app/api/get-stats/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    
    const { db } = await connectToDatabase();
    
    const userStats = await db.collection('users').findOne(
      { userId },
      { projection: { cardsProcessed: 1, username: 1 } }
    );

    const globalStats = await db.collection('botStats').findOne({ _id: 'global' });

    return NextResponse.json({
      user: userStats,
      global: globalStats
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}