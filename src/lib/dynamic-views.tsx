'use client';

import dynamic from 'next/dynamic';

const LoadingScreen = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

export const dynamicViews = {
  HomeView: dynamic(
    () => import('@/components/views/home-view'),
    {
      loading: () => <LoadingScreen />,
      ssr: false
    }
  ),

  ProfileView: dynamic(
    () => import('@/components/views/profile-view'),
    {
      loading: () => <LoadingScreen />,
      ssr: false
    }
  ),

  SettingsView: dynamic(
    () => import('@/components/views/settings-view'),
    {
      loading: () => <LoadingScreen />,
      ssr: false
    }
  )
};