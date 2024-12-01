import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { proxy } = await req.json();

    // Insert a new proxy into the database
    await prisma.proxy.create({
      data: {
        proxy,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to add proxy:', error);
    return NextResponse.json(
      { error: 'Failed to add proxy' },
      { status: 500 }
    );
  }
}
