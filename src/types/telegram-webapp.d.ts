// types/telegram-web-app.d.ts
interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  initDataUnsafe: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
    };
    query_id?: string;
  };
}

declare global {
  interface Window {
    Telegram: {
      WebApp: TelegramWebApp;
    };
  }
}
