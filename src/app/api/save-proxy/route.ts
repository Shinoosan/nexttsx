// src/app/api/save-proxy/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';  // Use the shared prisma instance

export async function POST(request: Request) {
  try {
    const { proxy } = await request.json();

    // Validate proxy string
    if (!proxy || typeof proxy !== 'string') {
      return NextResponse.json(
        { message: 'Valid proxy string is required' },
        { status: 400 }
      );
    }

    // Create or update the proxy
    const updatedProxy = await prisma.proxy.upsert({
      where: { 
        proxy: proxy // Using proxy as unique identifier
      },
      update: { 
        isActive: true,
        updatedAt: new Date()
      },
      create: { 
        proxy: proxy,
        isActive: true
      },
    });

    return NextResponse.json({ 
      success: true, 
      proxy: updatedProxy 
    });
  } catch (error) {
    console.error('Failed to save proxy:', error);
    return NextResponse.json(
      { message: 'Failed to save proxy' },
      { status: 500 }
    );
  }
}