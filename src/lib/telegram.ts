// src/lib/telegram.ts
import WebApp from '@twa-dev/sdk';
import crypto from 'crypto';

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

// Initialize WebApp
export const initTelegramApp = () => {
  if (!WebApp.isInitialized) {
    WebApp.init();
  }
  return WebApp;
};

// Get current user data from WebApp
export const getCurrentUser = () => {
  const webApp = initTelegramApp();
  return webApp.initDataUnsafe?.user;
};

// Validate Telegram WebApp data
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

// API calls for bot interactions
export const getTelegramUserData = async (userId: number) => {
  try {
    const response = await fetch('/api/telegram/user-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }

    return await response.json();
  } catch (error) {
    console.error('Error checking user membership:', error);
    return {
      isMember: false,
      userData: null
    };
  }
};

// Helper function to send messages through the bot
export const sendMessage = async (chatId: number, message: string) => {
  try {
    const response = await fetch('/api/telegram/send-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ chatId, message }),
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// WebApp specific methods
export const closeWebApp = () => {
  const webApp = initTelegramApp();
  webApp.close();
};

export const showAlert = (message: string) => {
  const webApp = initTelegramApp();
  webApp.showAlert(message);
};

export const showConfirm = (message: string) => {
  const webApp = initTelegramApp();
  return webApp.showConfirm(message);
};
