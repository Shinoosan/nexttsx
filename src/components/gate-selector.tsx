// gate-selector.tsx
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface GateSelectorProps {
  gates: readonly string[];
  currentGate: string;
  onGateChange: (gate: string) => void;
}

export function GateSelector({
  gates,
  currentGate,
  onGateChange,
}: GateSelectorProps) {
  const [currentGateIndex, setCurrentGateIndex] = useState(
    gates.indexOf(currentGate)
  );

  useEffect(() => {
    onGateChange(gates[currentGateIndex]);
  }, [currentGateIndex, gates, onGateChange]);

  const handlePrevious = () => {
    setCurrentGateIndex((prev) =>
      prev - 1 < 0 ? gates.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentGateIndex((prev) => (prev + 1) % gates.length);
  };

  return (
    <div className="flex items-center justify-center gap-4 mt-4">
      <Button
        variant="outline"
        size="icon"
        onClick={handlePrevious}
        className="w-8 h-8 p-0"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="min-w-[100px] text-center font-medium">
        {gates[currentGateIndex]}
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={handleNext}
        className="w-8 h-8 p-0"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}