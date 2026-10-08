import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';

let isLoggedIn = false;

export const Auth = {
  login() {
    isLoggedIn = true;
  },
  logout() {
    isLoggedIn = false;
  },
  getStatus() {
    return isLoggedIn;
  },
};

export default function RootLayout() {
  const segments = useSegments();
  const router = useRouter();

  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;

    const inAuth = segments[0] === 'auth';
    const inTabs = segments[0] === '(tabs)';

    const loggedIn = Auth.getStatus();

    // ❌ belum login tapi masuk tabs
    if (!loggedIn && inTabs) {
      router.replace('/auth/login');
    }

    // ❌ sudah login tapi masih di auth
    if (loggedIn && inAuth) {
      router.replace('/(tabs)');
    }
  }, [segments, ready]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="auth" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}