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

type ThemeParams = 'bg_color' | 'secondary_bg_color' | `#${string}`;

// Get current user data from WebApp
export const getCurrentUser = () => {
  return WebApp.initDataUnsafe?.user;
};

// Validate Telegram WebApp data
export const validateTelegramWebAppData = (data: TelegramWebAppData): boolean => {
  try {
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
      .map(([key, value]) => {
        if (typeof value === 'object') {
          return `${key}=${JSON.stringify(value)}`;
        }
        return `${key}=${value}`;
      })
      .join('\n');

    const secretKey = crypto
      .createHash('sha256')
      .update(botToken)
      .digest();

    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(checkString)
      .digest('hex');

    return signature === hash;
  } catch (error) {
    console.error('Error validating Telegram data:', error);
    return false;
  }
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
  WebApp.close();
};

export const showAlert = (message: string) => {
  WebApp.showAlert(message);
};

export const showConfirm = (message: string) => {
  return WebApp.showConfirm(message);
};

export const expandWebApp = () => {
  WebApp.expand();
};

export const setBackgroundColor = (color: ThemeParams) => {
  WebApp.setBackgroundColor(color);
};

export const setHeaderColor = (color: ThemeParams) => {
  WebApp.setHeaderColor(color);
};

export const enableClosingConfirmation = () => {
  WebApp.enableClosingConfirmation();
};

export const disableClosingConfirmation = () => {
  WebApp.disableClosingConfirmation();
};