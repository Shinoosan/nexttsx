// src/components/processing-status.tsx
import { motion } from "framer-motion"

interface ProcessingStatusProps {
  total: number
  processed: number
  isProcessing: boolean
  currentCard: string | null
}

export function ProcessingStatus({
  total,
  processed,
  isProcessing,
  currentCard,
}: ProcessingStatusProps) {
  const progress = total > 0 ? Math.min((processed / total) * 100, 100) : 0;
  const remainingCards = Math.max(total - processed, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full space-y-2"
    >
      <div className="flex flex-col gap-1">
        <div className="flex justify-between text-sm text-muted-foreground">
          <motion.div
            key={`processed-${processed}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Processed: {processed} / {total}
          </motion.div>
          <motion.div
            key={`progress-${progress}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {progress.toFixed(1)}%
          </motion.div>
        </div>

        {isProcessing && currentCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-muted-foreground text-center"
          >
            Checking: {currentCard}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}