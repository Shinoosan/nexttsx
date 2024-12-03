// src/types/telegram.d.ts

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  allows_write_to_pm?: boolean;
  added_to_attachment_menu?: boolean;
}

export interface TelegramChat {
  id: number;
  type: 'group' | 'supergroup' | 'channel';
  title: string;
  username?: string;
  photo_url?: string;
}

export interface TelegramInitData {
  query_id?: string;
  user?: TelegramUser;
  receiver?: TelegramUser;
  chat?: TelegramChat;
  chat_type?: 'sender' | 'private' | 'group' | 'supergroup' | 'channel';
  chat_instance?: string;
  start_param?: string;
  can_send_after?: number;
  auth_date: number;
  hash: string;
}

export interface TelegramWebApp {
  initDataUnsafe: TelegramInitData;
  initData: string;
  ready: () => void;
  expand: () => void;
}

declare global {
  interface Window {
    Telegram: {
      WebApp: TelegramWebApp;
    }
  }
}

declare module '@twa-dev/types' {
  export interface WebAppUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    is_premium?: boolean;
    // Add any other fields that might be needed
  }
}

declare module '@twa-dev/sdk' {
  interface WebApp {
    isReady: boolean;
    ready: () => void;
    initDataUnsafe: {
      user?: WebAppUser;
    };
  }
  const WebApp: WebApp;
  export default WebApp;
}
