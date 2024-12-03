'use client';

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

function NotFoundContent() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950">
      <Card className="w-[90%] max-w-md p-6 space-y-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h1 className="text-2xl font-bold">Page Not Found</h1>
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex justify-center">
          <Link href="/">
            <Button variant="default" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

// Export with dynamic to disable SSR
export default dynamic(() => Promise.resolve(NotFoundContent), {
  ssr: false,
  loading: () => (
    <div className="min-h-[100dvh] flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  ),
});