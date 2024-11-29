import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { User } from 'lucide-react';

interface ProfileViewProps {
  telegramUserId: string;
  processedCount: number;
}

export default function ProfileView({ telegramUserId, processedCount }: ProfileViewProps) {
  return (
    <motion.div
      key="profile-view"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-4"
    >
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6 text-foreground">Profile</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-medium">Telegram User</p>
              <p className="text-sm text-muted-foreground">ID: {telegramUserId || 'Not connected'}</p>
            </div>
          </div>
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Cards Processed: {processedCount}
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}