// components/ui/animated-button.tsx
import { motion } from "framer-motion";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface AnimatedButtonProps {
  onClick: () => void;
  disabled?: boolean;
  variant?: "default" | "destructive" | "outline";
  isProcessing?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function AnimatedButton({
  onClick,
  disabled,
  variant = "default",
  isProcessing,
  children,
  className,
}: AnimatedButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="relative"
    >
      <Button
        onClick={onClick}
        disabled={disabled}
        variant={variant}
        className={cn(
          "relative overflow-hidden",
          isProcessing && "animate-pulse",
          className
        )}
      >
        {isProcessing && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        )}
        {children}
      </Button>
    </motion.div>
  );
}