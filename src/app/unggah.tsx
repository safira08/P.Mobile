import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import UnggahScreen from '../components/UnggahScreen';

export { UnggahScreen };

export default function UnggahPage() {
  const router = useRouter();
  const { mataKuliah, returnToTodo } = useLocalSearchParams<{
    mataKuliah?: string;
    returnToTodo?: string;
  }>();

  return (
    <UnggahScreen
      initialCourse={mataKuliah}
      onClose={() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/dashboard');
        }
      }}
      onSuccess={() => {
        if (returnToTodo === 'true') {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/todo');
          }
        } else {
          router.replace('/dashboard');
        }
      }}
    />
  );
}
