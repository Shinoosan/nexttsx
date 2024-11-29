// src/lib/types.ts
export interface User {
  userId: string;
  username: string;
  cardsProcessed: number;
  createdAt: Date;
  updatedAt: Date;
  lastSeen: Date;
}

export interface BotStats {
  totalCardsProcessed: number;
  totalUsers: number;
  updatedAt: Date;
}