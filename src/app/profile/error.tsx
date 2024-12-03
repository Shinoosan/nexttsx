'use client';

import { Card } from "@/components/ui/card";

export default function Error() {
  return (
    <div className="p-4">
      <Card className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Error</h2>
          <p className="text-muted-foreground">
            Failed to load profile data
          </p>
        </div>
      </Card>
    </div>
  );
} 