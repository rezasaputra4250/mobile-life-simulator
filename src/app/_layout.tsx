import { Stack } from 'expo-router';
import { ErrorModalHost } from '../lib/errorModal';
import '../../global.css';

export default function RootLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#17181d' } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="classes" />
        <Stack.Screen name="missions" />
        <Stack.Screen name="progression" />
        <Stack.Screen name="profile/[section]" />
      </Stack>
      <ErrorModalHost />
    </>
  );
}
