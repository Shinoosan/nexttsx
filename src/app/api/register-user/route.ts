// src/app/api/register-user/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(req: Request) {
  try {
    const { userId, username } = await req.json();
    const { db } = await connectToDatabase();
    
    await db.collection('users').updateOne(
      { userId },
      { 
        $set: { 
          userId,
          username,
          lastSeen: new Date(),
          updatedAt: new Date()
        },
        $setOnInsert: { 
          createdAt: new Date(),
          cardsProcessed: 0
        }
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
}
