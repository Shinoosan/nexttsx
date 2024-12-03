'use client';

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import { ClientLayout } from "@/components/ClientLayout";
import { useEffect, useState } from "react";

export default function NotFound() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <ClientLayout defaultView="home">
      <main className="min-h-[100dvh] flex items-center justify-center p-4 bg-gradient-to-br from-background via-background/50 to-background">
        <Card className="w-full max-w-md p-6 space-y-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <h1 className="text-2xl font-bold">Page Not Found</h1>
            <p className="text-muted-foreground">
              The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
          </div>

          <div className="flex justify-center">
            <Button asChild>
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </Card>
      </main>
    </ClientLayout>
  );
}