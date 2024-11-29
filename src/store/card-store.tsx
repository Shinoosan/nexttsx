import { create } from 'zustand';

export interface CardResult {
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
}

interface CardStore {
  inputText: string;
  formattedCards: string[];
  processedCount: number;
  isProcessing: boolean;
  processingCard: string | null;
  liveCards: CardResult[];
  deadCards: CardResult[];
  activeSection: 'LIVES' | 'DEAD';
  currentGate: string;
  
  // Actions
  setInputText: (text: string) => void;
  setFormattedCards: (cards: string[]) => void;
  setProcessedCount: (count: number) => void;
  setIsProcessing: (isProcessing: boolean) => void;
  setProcessingCard: (card: string | null) => void;
  addLiveCard: (result: CardResult) => void;
  addDeadCard: (result: CardResult) => void;
  setActiveSection: (section: 'LIVES' | 'DEAD') => void;
  setCurrentGate: (gate: string) => void;
  clearCards: () => void;
}

export const useCardStore = create<CardStore>((set) => ({
  inputText: '',
  formattedCards: [],
  processedCount: 0,
  isProcessing: false,
  processingCard: null,
  liveCards: [],
  deadCards: [],
  activeSection: 'LIVES',
  currentGate: 'Shopii',

  // Actions
  setInputText: (text) => set({ inputText: text }),
  
  setFormattedCards: (cards) => set({ formattedCards: cards }),
  
  setProcessedCount: (count) => set({ processedCount: count }),
  
  setIsProcessing: (isProcessing) => set({ isProcessing }),
  
  setProcessingCard: (card) => set({ processingCard: card }),
  
  addLiveCard: (result) => set((state) => ({
    liveCards: [result, ...state.liveCards]
  })),
  
  addDeadCard: (result) => set((state) => ({
    deadCards: [result, ...state.deadCards]
  })),
  
  setActiveSection: (section) => set({ activeSection: section }),
  
  setCurrentGate: (gate) => set({ currentGate: gate }),
  
  clearCards: () => set({
    liveCards: [],
    deadCards: [],
    processedCount: 0
  }),
}));