// src/app/api/get-proxy/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Fetch the most recently updated active proxy
    const proxyDoc = await prisma.proxy.findFirst({
      where: {
        isActive: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    if (!proxyDoc) {
      return NextResponse.json(
        { error: 'No active proxy found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ proxy: proxyDoc.value });
  } catch (error) {
    console.error('Failed to fetch proxy:', error);
    return NextResponse.json(
      { error: 'Failed to fetch proxy' },
      { status: 500 }
    );
  }
}