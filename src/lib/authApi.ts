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

async function request<T>(
  path: string,
  options: { method?: 'GET' | 'POST'; body?: object; token?: string } = {},
): Promise<T> {
  if (!apiBaseUrl) {
    throw new Error('URL API belum diatur. Isi EXPO_PUBLIC_API_URL pada file .env.');
  }

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      method: options.method ?? 'GET',
      headers: {
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      ...(options.body ? { body: JSON.stringify(options.body) } : {}),
    });
  } catch {
    throw new Error(
      'Tidak dapat terhubung ke backend. Periksa server dan EXPO_PUBLIC_API_URL di file .env.',
    );
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error('Backend mengirim respons yang tidak dapat dibaca.');
  }

  if (!response.ok) {
    const apiMessage: Partial<ApiMessage> =
      payload !== null && typeof payload === 'object' ? (payload as Partial<ApiMessage>) : {};
    const validationMessages = apiMessage.errors?.map((error) => error.message).filter(Boolean);
    throw new ApiError(
      validationMessages?.join('\n') || apiMessage.message || 'Permintaan ke backend gagal.',
      response.status,
    );
  }

  return payload as T;
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
