// components/ui/toaster.tsx
"use client"

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"
import { AnimatePresence, motion } from "framer-motion"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider duration={1500}>
      <AnimatePresence mode="popLayout">
        {toasts.map(function ({ id, title, description, action, ...props }) {
          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 50, scale: 0.3 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.5 }}
              transition={{
                opacity: { duration: 0.3 },
                y: { type: "spring", stiffness: 200, damping: 30 },
                scale: { duration: 0.4 }
              }}
            >
              <Toast {...props} className="group">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  className="grid gap-1"
                >
                  {title && (
                    <ToastTitle className="text-sm font-semibold">
                      {title}
                    </ToastTitle>
                  )}
                  {description && (
                    <ToastDescription className="text-xs opacity-90">
                      {description}
                    </ToastDescription>
                  )}
                </motion.div>
                {action}
                <ToastClose className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                <motion.div
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{ duration: 4, ease: "linear" }}
                  className="absolute bottom-0 left-0 right-0 h-1 bg-foreground/20 origin-left"
                />
              </Toast>
            </motion.div>
          )
        })}
      </AnimatePresence>
      <ToastViewport className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:right-0 sm:top-auto sm:bottom-0 sm:flex-col md:max-w-[420px]" />
    </ToastProvider>
  )
}