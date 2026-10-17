import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

let volatileToken: string | null = null;
let sessionRuntimeStarted = false;

export function setSessionToken(token: string | null) {
  volatileToken = token;
}

export function clearSessionToken() {
  volatileToken = null;
}

export function hasStartedSessionRuntime() {
  return sessionRuntimeStarted;
}

export function markSessionRuntimeStarted() {
  sessionRuntimeStarted = true;
}

export async function getSessionToken() {
  if (volatileToken) return volatileToken;
  if (Platform.OS === 'web') return window.localStorage.getItem('auth_token');
  return SecureStore.getItemAsync('auth_token');
}
