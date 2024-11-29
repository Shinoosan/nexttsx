import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-switcher';

export default function SettingsView() {
  return (
    <motion.div
      key="settings-view"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-4"
    >
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6 text-foreground">Settings</h2>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Theme Mode</span>
          <ThemeToggle />
        </div>
      </Card>
    </motion.div>
  );
}