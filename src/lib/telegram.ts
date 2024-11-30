// src/lib/telegram.ts
import TelegramBot from 'node-telegram-bot-api';
import crypto from 'crypto';

const bot = new TelegramBot(process.env.NEXT_PUBLIC_BOT_TOKEN!, { polling: false });

interface TelegramWebAppData {
  query_id: string;
  user?: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
  };
  auth_date: number;
  hash: string;
}

export const validateTelegramWebAppData = (data: TelegramWebAppData): boolean => {
  const botToken = process.env.NEXT_PUBLIC_BOT_TOKEN;
  
  if (!botToken) {
    console.error('Bot token not found');
    return false;
  }

  // Remove hash from the check
  const { hash, ...dataToCheck } = data;

  // Create a sorted array of key=value strings
  const checkString = Object.entries(dataToCheck)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  // Create a secret key from the bot token
  const secretKey = crypto
    .createHash('sha256')
    .update(botToken)
    .digest();

  // Calculate HMAC-SHA256 signature
  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(checkString)
    .digest('hex');

  // Compare the calculated signature with the provided hash
  return signature === hash;
};

export { bot };

// Helper function to get user data from Telegram
export const getTelegramUserData = async (userId: number) => {
  try {
    const chatMember = await bot.getChatMember('@your_channel_name', userId);
    return {
      isMember: chatMember.status !== 'left' && chatMember.status !== 'kicked',
      userData: chatMember.user
    };
  } catch (error) {
    console.error('Error checking user membership:', error);
    return {
      isMember: false,
      userData: null
    };
  }
};
