import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';

interface ProcessingResultProps {
  card: string;
  result: string;
  status: 'success' | 'error';
}

export function ProcessingResult({ card, result, status }: ProcessingResultProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className={`p-4 ${
        status === 'success' 
          ? 'border-green-500 bg-green-50/10' 
          : 'border-red-500 bg-red-50/10'
      }`}>
        <pre className={`text-sm font-mono whitespace-pre-wrap break-all ${
          status === 'success'
            ? 'text-green-600 dark:text-green-400'
            : 'text-red-600 dark:text-red-400'
        }`}>
          {card}
          {'\n'}
          {result}
        </pre>
      </Card>
    </motion.div>
  );
}