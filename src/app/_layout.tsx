import { Stack } from 'expo-router';
import Toast from 'react-native-toast-message';
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
      <Toast />
    </>
  );
}
