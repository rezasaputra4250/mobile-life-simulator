import { Stack } from 'expo-router';
import { ErrorModalHost } from '../lib/errorModal';
import '../../global.css';

export default function RootLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#17181d' } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="classes" />
        <Stack.Screen name="progression" />
        <Stack.Screen name="profile/[section]" />
        <Stack.Screen name="profile-edit" options={{ presentation: 'modal' }} />
        <Stack.Screen name="change-password" options={{ presentation: 'modal' }} />
        <Stack.Screen name="missions" options={{ presentation: 'modal' }} />
      </Stack>
      <ErrorModalHost />
    </>
  );
}
