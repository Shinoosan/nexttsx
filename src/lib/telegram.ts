// src/lib/telegram.ts
import TelegramBot from 'node-telegram-bot-api';

const bot = new TelegramBot(process.env.NEXT_PUBLIC_BOT_TOKEN!, { polling: false });

export { bot };
