// src/app/api/get-proxy/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    const proxyDoc = await db.collection('proxies').findOne(
      { isActive: true },
      { sort: { updatedAt: -1 } }
    );

    if (!proxyDoc) {
      return NextResponse.json(
        { error: 'No active proxy found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ proxy: proxyDoc.proxy });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch proxy' },
      { status: 500 }
    );
  }
}