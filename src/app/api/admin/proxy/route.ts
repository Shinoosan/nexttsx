// src/app/api/admin/proxy/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(req: Request) {
  try {
    const { proxy } = await req.json();
    const { db } = await connectToDatabase();
    
    await db.collection('proxies').insertOne({
      proxy,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to add proxy' },
      { status: 500 }
    );
  }
}