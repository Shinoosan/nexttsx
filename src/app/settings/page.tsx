import { Suspense } from 'react';
import { ClientLayout } from '@/components/ClientLayout';

const LoadingScreen = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export default function SettingsPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <ClientLayout defaultView="settings" />
    </Suspense>
  );
}