import { NextResponse } from 'next/server';

// Add export config to disable automatic static optimization
export const dynamic = 'force-dynamic';
export const runtime = 'edge'; // Optional: Use edge runtime for better performance

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      throw new Error('Telegram bot token not configured');
    }

    // First, get user profile photos
    const photosResponse = await fetch(
      `https://api.telegram.org/bot${botToken}/getUserProfilePhotos?user_id=${userId}&limit=1`
    );
    const photosData = await photosResponse.json();

    if (!photosData.ok || !photosData.result.photos?.[0]?.[0]) {
      return NextResponse.json({ photoUrl: '' });
    }

    // Get file path
    const fileId = photosData.result.photos[0][0].file_id;
    const fileResponse = await fetch(
      `https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`
    );
    const fileData = await fileResponse.json();

    if (!fileData.ok || !fileData.result.file_path) {
      return NextResponse.json({ photoUrl: '' });
    }

    const photoUrl = `https://api.telegram.org/file/bot${botToken}/${fileData.result.file_path}`;
    return NextResponse.json({ photoUrl });
  } catch (error) {
    console.error('Error fetching user photo:', error);
    return NextResponse.json({ error: 'Failed to fetch user photo' }, { status: 500 });
  }
}