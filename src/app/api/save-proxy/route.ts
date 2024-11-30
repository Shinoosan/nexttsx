// src/app/api/save-proxy/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { proxy } = await request.json();

    // Example: Extract user ID from headers (adjust authentication as needed)
    const userId = request.headers.get('user-id');
    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }

    // Update or create the proxy for the user
    const updatedProxy = await prisma.userProxy.upsert({
      where: { userId },
      update: { proxy },
      create: { userId, proxy },
    });

    return NextResponse.json({ success: true, proxy: updatedProxy });
  } catch (error) {
    console.error('Failed to save proxy:', error);
    return NextResponse.json(
      { message: 'Failed to save proxy' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
