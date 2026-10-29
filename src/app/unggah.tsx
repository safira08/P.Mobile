import React from 'react';
import { useRouter } from 'expo-router';
import UnggahScreen from '../components/UnggahScreen';

export { UnggahScreen };

export default function UnggahPage() {
  const router = useRouter();

  return (
    <UnggahScreen
      onClose={() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/dashboard');
        }
      }}
      onSuccess={() => router.replace('/dashboard')}
    />
  );
}
