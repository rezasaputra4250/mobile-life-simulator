export const APP_ENVIRONMENTS = ['local', 'development', 'staging', 'production'] as const;

export type AppEnvironment = (typeof APP_ENVIRONMENTS)[number];

function resolveAppEnvironment(value: string | undefined): AppEnvironment {
  if (value && APP_ENVIRONMENTS.includes(value as AppEnvironment)) {
    return value as AppEnvironment;
  }

  return 'local';
}

const appEnvironment = resolveAppEnvironment(process.env.EXPO_PUBLIC_APP_ENV);
const environmentApiUrls: Record<AppEnvironment, string | undefined> = {
  local: process.env.EXPO_PUBLIC_API_URL_LOCAL,
  development: process.env.EXPO_PUBLIC_API_URL_DEVELOPMENT,
  staging: process.env.EXPO_PUBLIC_API_URL_STAGING,
  production: process.env.EXPO_PUBLIC_API_URL_PRODUCTION,
};

const environmentApiUrl = environmentApiUrls[appEnvironment]?.replace(/\/+$/, '');
const legacyApiUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, '');

export const mobileEnvironment = {
  name: appEnvironment,
  apiUrl: environmentApiUrl || legacyApiUrl,
  apiPort: process.env.EXPO_PUBLIC_API_PORT || '5000',
  apiDebug: process.env.EXPO_PUBLIC_API_DEBUG === 'true',
};
