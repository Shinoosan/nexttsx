// src/app/api/save-proxy/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(request: Request) {
  try {
    const { proxy } = await request.json();
    const { db } = await connectToDatabase();
    
    // You'll need to implement user authentication and get the user ID
    const userId = request.headers.get('user-id');

    await db.collection('userProxies').updateOne(
      { userId },
      { $set: { proxy } },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to save proxy' },
      { status: 500 }
    );
  }
}