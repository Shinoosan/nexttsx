// src/app/api/telegram/user-data/route.ts
import TelegramBot from 'node-telegram-bot-api';

const bot = new TelegramBot(process.env.BOT_TOKEN!, { polling: false });

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    
    const chatMember = await bot.getChatMember('@your_channel_name', userId);
    
    return new Response(JSON.stringify({
      isMember: chatMember.status !== 'left' && chatMember.status !== 'kicked',
      userData: chatMember.user
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in user-data route:', error);
    return new Response(JSON.stringify({
      isMember: false,
      userData: null,
      error: 'Failed to fetch user data'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}