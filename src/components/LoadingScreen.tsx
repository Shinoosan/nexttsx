// src/components/LoadingScreen.tsx
'use client';

import { Loader2 } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}