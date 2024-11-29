'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { GateSelector } from '@/components/gate-selector';
import { AnimatedButton } from '@/components/ui/animated-button';
import { ProcessingStatus } from '@/components/processing-status';
import { ProcessingResult } from '@/components/processing-result';
import { useInterval } from '@/hooks/use-interval';
import { toast } from '@/components/ui/use-toast';
import { cardService } from '@/services/api';
import { useCardStore } from '@/store/card-store';
import { useState } from 'react';

interface HomeViewProps {
  telegramUserId: string;
  proxy: string | null;
  onProcessedCountChange: (count: number) => void;
}

const GATES = ['Shopii', 'Zoura', 'Stripe'] as const;
type Gate = typeof GATES[number];

export default function HomeView({ telegramUserId, proxy, onProcessedCountChange }: HomeViewProps) {
  const {
    inputText,
    formattedCards,
    processedCount,
    isProcessing,
    processingCard,
    liveCards,
    deadCards,
    activeSection,
    currentGate,
    setInputText,
    setFormattedCards,
    setProcessedCount,
    setIsProcessing,
    setProcessingCard,
    addLiveCard,
    addDeadCard,
    setActiveSection,
    setCurrentGate,
    clearCards,
  } = useCardStore();

  useInterval(
    () => {
      void processNextBatch();
    },
    isProcessing ? 200 : null
  );

  let isProcessingRequest = false;

  const removeProcessedCard = (processedCard: string) => {
    const updatedFormattedCards = formattedCards.filter(card => card !== processedCard);
    setFormattedCards(updatedFormattedCards);
    const updatedText = updatedFormattedCards.join('\n');
    setInputText(updatedText);
  };

  const processNextBatch = async () => {
    if (isProcessingRequest || formattedCards.length === 0) {
      setIsProcessing(false);
      setProcessingCard(null);
      return;
    }

    isProcessingRequest = true;

    try {
      const card = formattedCards[0];
      setProcessingCard(card);

      const effectiveProxy = proxy || process.env.NEXT_PUBLIC_DEFAULT_PROXY;

      if (!effectiveProxy) {
        throw new Error('No proxy available and no default proxy configured');
      }

      removeProcessedCard(card);

      const effectiveTelegramId = telegramUserId || '1';

      const response = await cardService.checkSingleCard({
        card,
        gate: currentGate,
        proxy: effectiveProxy,
        telegramId: effectiveTelegramId,
      });

      const result = {
        card,
        status: response.status === 'LIVE' ? 'LIVE' : 'DEAD',
        message: response.message,
        details: {
          status: response.status,
          gateway: currentGate,
          bank: response.details?.bank || 'Unknown',
          timeTaken: response.details?.timeTaken || '0s',
          cardType: response.details?.cardType,
          country: response.details?.country,
          statusMessage: response.details?.statusMessage
        }
      } satisfies CardResult;

      if (response.status === 'LIVE') {
        addLiveCard(result);
      } else {
        addDeadCard(result);
      }

      const newCount = processedCount + 1;
      setProcessedCount(newCount);
      onProcessedCountChange(newCount);

      await cardService.updateStats(effectiveTelegramId, 1);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      const errorResult = {
        card: formattedCards[0],
        status: 'DEAD' as const,
        message: errorMessage,
        details: {
          status: 'ERROR',
          gateway: 'Error',
          bank: 'Unknown',
          timeTaken: '0s'
        }
      } satisfies CardResult;

      addDeadCard(errorResult);
      const newCount = processedCount + 1;
      setProcessedCount(newCount);
      onProcessedCountChange(newCount);
    } finally {
      isProcessingRequest = false;
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text');
    formatCards(text);
  };

  const formatCards = (text: string) => {
    const cardPattern = /^(\d{15,16})\|([1-9]|0[1-9]|1[0-2])\|(20\d{2}|\d{2})\|(\d{3,4})$/gm;
    const matches = Array.from(new Set(text.matchAll(cardPattern)));

    if (matches.length === 0) {
      toast({
        variant: "warning",
        title: "No cards found",
        description: "Format: 1234...|MM|YYYY|CVV",
      });
      return;
    }

    const formattedText = matches.map(match => match[0]).join('\n');
    setInputText(formattedText);
    setFormattedCards(matches.map(match => match[0]));

    toast({
      variant: "party",
      title: `${matches.length} cards found`,
      description: "Cards formatted and ready!",
    });
  };

  const handleStartProcessing = () => {
    if (!telegramUserId) {
      console.warn('Telegram user ID not found, using default ID: 1');
    }

    cardService.clearProcessedCards();
    setIsProcessing(true);
    setProcessedCount(0);
    clearCards();
    toast({
      variant: "loading",
      title: "Starting checker",
      description: `Processing ${formattedCards.length} cards`,
    });
  };

  const handleStopProcessing = () => {
    cardService.clearQueue();
    setIsProcessing(false);
    setProcessingCard(null);
    toast({
      variant: "destructive",
      title: "Checker stopped",
      description: `Processed ${processedCount}/${formattedCards.length} cards`,
    });
  };



interface ProcessingResultProps {
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

const ProcessingResult: React.FC<CardResult> = ({ card, status, details }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const copyInfo = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent expanding when clicking copy button
    const info = `${card}
Status: ${status}
Message: ${details.statusMessage?.replace('/strong>', '') || 'N/A'}
Gateway: ${details.gateway}
Type: ${details.cardType?.replace('/strong>', '') || 'N/A'}
Bank: ${details.bank.replace('/strong>', '')}
Country: ${details.country?.replace('/strong>', '') || 'N/A'}
Time: ${details.timeTaken}
Checked by Shino Webapp`;

    navigator.clipboard.writeText(info);
    toast({
      variant: "info",
      title: "Copied to clipboard",
      description: "Card details saved",
      duration: 2000,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mb-2"
    >
      <Card 
        className={`p-4 cursor-pointer ${
          status === 'LIVE' 
            ? 'bg-green-50 dark:bg-green-900/20' 
            : 'bg-red-50 dark:bg-red-900/20'
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="space-y-1.5">
          {/* Header with status, copy button, and expand icon */}
          <div className="flex justify-between items-center">
            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              status === 'LIVE'
                ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
            }`}>
              {status}
            </div>

            <div className="flex items-center gap-2">
              {/* Copy Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={copyInfo}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <svg 
                  className="w-4 h-4 text-gray-500"
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" 
                  />
                </svg>
              </motion.button>

              {/* Expand/Collapse icon */}
              <motion.svg 
                animate={{ rotate: isExpanded ? 180 : 0 }}
                className="w-4 h-4 text-gray-500"
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </motion.svg>
            </div>
          </div>

          <div className="font-mono text-sm">
            {card}
          </div>

          {details.statusMessage && (
            <div>
              <span className="font-semibold">Message:</span> {details.statusMessage.replace('/strong>', '')}
            </div>
          )}

          <div>
            <span className="font-semibold">Gateway:</span> {details.gateway}
          </div>

          {/* Expandable content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-1 pt-2 border-t border-gray-200 dark:border-gray-700"
              >
                {details.cardType && (
                  <div>
                    <span className="font-semibold">Type:</span> {details.cardType.replace('/strong>', '')}
                  </div>
                )}

                <div>
                  <span className="font-semibold">Bank:</span> {details.bank.replace('/strong>', '')}
                </div>

                {details.country && (
                  <div>
                    <span className="font-semibold">Country:</span> {details.country.replace('/strong>', '')}
                  </div>
                )}

                <div>
                  <span className="font-semibold">Time:</span> {details.timeTaken}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </motion.div>
  );
};

  return (
    <motion.div
      key="home-view"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="px-4"
    >
      <Card className="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-xl">
        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-2xl font-bold mb-6 text-foreground text-center"
        >
          Shino Webapp
        </motion.h2>

        <motion.div
          initial={{ height: 0 }}
          animate={{ height: "auto" }}
          transition={{ duration: 0.3 }}
        >
          <textarea
            className="w-full h-32 p-4 rounded-xl mb-6 bg-background text-foreground border focus:ring-2 focus:ring-primary outline-none resize-none transition-colors duration-200 font-mono"
            placeholder="Paste anything we will extract your cards"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onPaste={handlePaste}
          />
        </motion.div>

        <div className="space-y-6">
          <GateSelector 
            gates={GATES}
            currentGate={currentGate}
            onGateChange={setCurrentGate as (gate: string) => void}
          />
          
          <div className="flex flex-col items-center gap-6">
            <div className="flex justify-center gap-4">
              {!isProcessing ? (
                <AnimatedButton
                  onClick={handleStartProcessing}
                  disabled={formattedCards.length === 0}
                  className="w-32 h-12 text-lg font-medium"
                >
                  Start
                </AnimatedButton>
              ) : (
                <>
                  <AnimatedButton
                    onClick={() => {}}
                    disabled={true}
                    isProcessing={true}
                    className="w-32 h-12 text-lg font-medium"
                  >
                    Processing...
                  </AnimatedButton>
                  
                  <AnimatedButton
                    onClick={handleStopProcessing}
                    variant="destructive"
                    className="w-32 h-12 text-lg font-medium"
                  >
                    Stop
                  </AnimatedButton>
                </>
              )}
            </div>

            {formattedCards.length > 0 && (
              <ProcessingStatus
                total={formattedCards.length}
                processed={processedCount}
                isProcessing={isProcessing}
                currentCard={processingCard}
              />
            )}
          </div>
        </div>

        {/* Results Section */}
        <div className="mt-6">
          <div className="flex rounded-lg overflow-hidden border">
            <button
              onClick={() => setActiveSection('LIVES')}
              className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
                activeSection === 'LIVES'
                  ? 'bg-green-500 text-white'
                  : 'bg-background text-muted-foreground hover:bg-green-500/10'
              }`}
            >
              LIVES ({liveCards.length})
            </button>
            <button
              onClick={() => setActiveSection('DEAD')}
              className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
                activeSection === 'DEAD'
                  ? 'bg-red-500 text-white'
                  : 'bg-background text-muted-foreground hover:bg-red-500/10'
              }`}
            >
              DEAD ({deadCards.length})
            </button>
          </div>

          <div className="mt-4 space-y-2 max-h-[50vh] overflow-y-auto">
            <AnimatePresence mode="popLayout">
              {(activeSection === 'LIVES' ? liveCards : deadCards).map((result, index) => (
                <ProcessingResult
                  key={`${result.card}-${index}`}
                  {...result}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}