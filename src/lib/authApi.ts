import axios, { isAxiosError } from 'axios';

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  level?: number;
  experience?: number;
  experience_to_next_level?: number;
};

export type AuthSession = {
  message: string;
  user: AuthUser;
  token: string;
};

type ApiMessage = {
  message: string;
  errors?: { field: string; message: string }[];
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, '');
const isApiDebugEnabled = process.env.EXPO_PUBLIC_API_DEBUG === 'true';

function redactSensitiveData(value: unknown): unknown {
  if (typeof value === 'string') {
    return value.replace(/([?&](?:token|password|email)=)[^&]*/gi, '$1[REDACTED]');
  }

  if (Array.isArray(value)) {
    return value.map(redactSensitiveData);
  }

  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        /password|token|authorization|email/i.test(key)
          ? '[REDACTED]'
          : redactSensitiveData(nestedValue),
      ]),
    );
  }

  return value;
}

async function request<T>(
  path: string,
  options: { method?: 'GET' | 'POST'; body?: object; token?: string } = {},
): Promise<T> {
  if (!apiBaseUrl) {
    throw new Error('URL API belum diatur. Isi EXPO_PUBLIC_API_URL pada file .env.');
  }

  const method = options.method ?? 'GET';
  const url = `${apiBaseUrl}${path}`;

  if (isApiDebugEnabled) {
    console.info('[API] Request', {
      method,
      url,
      body: redactSensitiveData(options.body),
    });
  }

  try {
    const response = await axios.request<T>({
      url,
      method,
      data: options.body,
      headers: {
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
    });

    if (isApiDebugEnabled) {
      console.info('[API] Response', {
        method,
        url,
        status: response.status,
        data: redactSensitiveData(response.data),
      });
    }

    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      if (isApiDebugEnabled) {
        console.info('[API] Error response', {
          method,
          url,
          status: error.response?.status ?? null,
          data: redactSensitiveData(error.response?.data),
        });
      }

      if (!error.response) {
        throw new Error(
          'Tidak dapat terhubung ke backend. Periksa koneksi dan EXPO_PUBLIC_API_URL.',
        );
      }

      const payload = error.response.data;
      const apiMessage: Partial<ApiMessage> =
        payload !== null && typeof payload === 'object' ? (payload as Partial<ApiMessage>) : {};
      const validationMessages = apiMessage.errors?.map((item) => item.message).filter(Boolean);
      throw new ApiError(
        validationMessages?.join('\n') || apiMessage.message || 'Permintaan ke backend gagal.',
        error.response.status,
      );
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Terjadi kesalahan saat menghubungi backend.');
  }
}

export function login(email: string, password: string) {
  return request<AuthSession>('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export function register(name: string, email: string, password: string) {
  return request<AuthSession>('/auth/register', {
    method: 'POST',
    body: { name, email, password },
  });
}

export function forgotPassword(email: string) {
  return request<{ message: string; resetUrl?: string }>('/auth/forgot-password', {
    method: 'POST',
    body: { email },
  });
}

export function resetPassword(email: string, token: string, password: string) {
  return request<{ message: string }>('/auth/reset-password', {
    method: 'POST',
    body: { email, token, password },
  });
}

export function getCurrentUser(token: string) {
  return request<{ message: string; user: AuthUser }>('/auth/me', { token });
}
