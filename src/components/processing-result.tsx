// components/processing-result.tsx
import { Card } from './ui/card';
import { motion } from 'framer-motion';

interface ProcessingResultProps {
  card: string;
  result: string;
  status: 'success' | 'error';
}

export const ProcessingResult = ({ card, result, status }: ProcessingResultProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-2"
    >
      <Card className={`p-4 ${
        status === 'success' 
          ? 'bg-green-50 dark:bg-green-900/20' 
          : 'bg-red-50 dark:bg-red-900/20'
      }`}>
        <div className="text-sm font-mono">{card}</div>
        <div className={`text-sm mt-1 ${
          status === 'success' 
            ? 'text-green-600 dark:text-green-400' 
            : 'text-red-600 dark:text-red-400'
        }`}>
          {result}
        </div>
      </Card>
    </motion.div>
  );
};