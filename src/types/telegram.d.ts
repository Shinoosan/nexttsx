interface TelegramWebApp {
  WebApp: {
    ready(): void;
    expand(): void;
    initDataUnsafe?: {
      user?: {
        id: number;
        first_name: string;
        last_name?: string;
        username?: string;
        language_code?: string;
      };
    };
  };
}

interface Window {
  Telegram: TelegramWebApp;
}