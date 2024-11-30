// src/app/api/get-proxy/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

    return NextResponse.json({ proxy: proxyDoc.proxy });
  } catch (error) {
    console.error('Failed to fetch proxy:', error);
    return NextResponse.json(
      { error: 'Failed to fetch proxy' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
