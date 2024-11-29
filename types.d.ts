// types.d.ts
interface Window {
    Telegram: {
      WebApp: {
        ready(): void;
        expand(): void;
      };
    };
  }