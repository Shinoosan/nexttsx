import type { WebAppUser } from '@twa-dev/types';

interface WebAppType {
  initDataUnsafe: {
    user?: WebAppUser;
  };
}

let WebApp: WebAppType | null = null;

if (typeof window !== 'undefined') {
  // Using dynamic import instead of require
  import('@twa-dev/sdk').then((module) => {
    WebApp = module.default;
  });
}

export default WebApp; 