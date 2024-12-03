// src/app/api/telegram/send-message/route.ts
import TelegramBot from 'node-telegram-bot-api';

const bot = new TelegramBot(process.env.BOT_TOKEN!, { polling: false });

export async function POST(request: Request) {
  try {
    const { chatId, message } = await request.json();
    
    await bot.sendMessage(chatId, message);
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in send-message route:', error);
    return new Response(JSON.stringify({
      error: 'Failed to send message'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}