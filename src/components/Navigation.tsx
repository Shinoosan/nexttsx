// src/components/Navigation.tsx
'use client';

import { Home, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

type ViewType = 'home' | 'profile' | 'settings';

interface NavigationProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  processedCount: number;
}

export function Navigation({ currentView, onViewChange, processedCount }: NavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t">
      <div className="flex justify-around items-center p-4">
        <Button
          variant={currentView === 'home' ? 'default' : 'ghost'}
          size="icon"
          onClick={() => onViewChange('home')}
        >
          <Home className="h-5 w-5" />
        </Button>
        
        <Button
          variant={currentView === 'profile' ? 'default' : 'ghost'}
          size="icon"
          onClick={() => onViewChange('profile')}
        >
          <User className="h-5 w-5" />
        </Button>
        
        <Button
          variant={currentView === 'settings' ? 'default' : 'ghost'}
          size="icon"
          onClick={() => onViewChange('settings')}
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </nav>
  );
}