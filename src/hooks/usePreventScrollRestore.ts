// hooks/usePreventScrollRestore.ts
import { useEffect } from 'react';

export const usePreventScrollRestore = () => {
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    
    window.scrollTo(0, 0);
  }, []);
};