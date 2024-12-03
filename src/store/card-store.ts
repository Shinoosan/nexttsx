// store/card-store.ts
import { create } from 'zustand';

type Gate = 'Shopii' | 'Zoura' | 'Stripe';
type Section = 'LIVES' | 'DEAD';

// Add TelegramWebAppUser type from your types.d.ts
type TelegramUser = TelegramWebAppUser;

export type CardResult = {
  card: string;
  status: 'LIVE' | 'DEAD';
  message: string;
  details: {
    status: string;
    gateway: string;
    bank: string;
    timeTaken: string;
    cardType?: string;
    country?: string;
    statusMessage?: string;
  };
};

interface CardStore {
  // Existing properties
  inputText: string;
  formattedCards: string[];
  processedCount: number;
  isProcessing: boolean;
  processingCard: string | null;
  liveCards: CardResult[];
  deadCards: CardResult[];
  activeSection: Section;
  currentGate: Gate;
  
  // Add Telegram user properties
  telegramUser: TelegramUser | null;
  
  // Existing actions
  setInputText: (text: string) => void;
  setFormattedCards: (cards: string[]) => void;
  setProcessedCount: (count: number) => void;
  setIsProcessing: (isProcessing: boolean) => void;
  setProcessingCard: (card: string | null) => void;
  addLiveCard: (result: CardResult) => void;
  addDeadCard: (result: CardResult) => void;
  setActiveSection: (section: Section) => void;
  setCurrentGate: (gate: Gate) => void;
  clearCards: () => void;
  
  // Add Telegram user action
  setTelegramUser: (user: TelegramUser) => void;
}

export const useCardStore = create<CardStore>((set) => ({
  // Existing state
  inputText: '',
  formattedCards: [],
  processedCount: 0,
  isProcessing: false,
  processingCard: null,
  liveCards: [],
  deadCards: [],
  activeSection: 'LIVES',
  currentGate: 'Stripe',
  
  // Add Telegram user state
  telegramUser: null,
  
  // Existing actions
  setInputText: (text) => set({ inputText: text }),
  setFormattedCards: (cards) => set({ formattedCards: cards }),
  setProcessedCount: (count) => set({ processedCount: count }),
  setIsProcessing: (isProcessing) => set({ isProcessing }),
  setProcessingCard: (card) => set({ processingCard: card }),
  addLiveCard: (result) => set((state) => ({ liveCards: [result, ...state.liveCards] })),
  addDeadCard: (result) => set((state) => ({ deadCards: [result, ...state.deadCards] })),
  setActiveSection: (section) => set({ activeSection: section }),
  setCurrentGate: (gate) => set({ currentGate: gate }),
  clearCards: () => set({ liveCards: [], deadCards: [] }),
  
  // Add Telegram user action
  setTelegramUser: (user) => set({ telegramUser: user }),
}));
