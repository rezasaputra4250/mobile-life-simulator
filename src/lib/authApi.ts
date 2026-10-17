import axios, { isAxiosError } from 'axios';
import { showErrorModal } from './errorModal';
import Constants from 'expo-constants';

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  affiliate_code?: string | null;
  referred_by?: number | null;
  class_id?: number | null;
  difficulty?: Difficulty;
  level?: number;
  experience?: number;
  experience_to_next_level?: number;
  role?: { id: number; name: string; label: string } | null;
  company?: { id: number; name: string; legal_name?: string | null; code?: string | null } | null;
  profile?: {
    employee_number?: string | null;
    position?: string | null;
    department?: string | null;
    phone?: string | null;
    avatar_url?: string | null;
    city?: string | null;
    province?: string | null;
    bio?: string | null;
  };
  stats?: {
    level: number;
    experience: number;
    experience_to_next_level: number;
    health_points: number;
    mana_points: number;
    strength: number;
    intelligence: number;
    agility: number;
    stamina: number;
    luck: number;
  };
  skills?: AuthSkill[];
};

export type AuthSkill = {
  id: number;
  name: string;
  label: string;
  description?: string | null;
  level: number;
  experience: number;
  experience_to_next_level: number;
  unlocked_at?: string;
};

export type AuthSession = {
  message: string;
  user: AuthUser;
  token: string;
};

export type Mission = {
  id: number;
  todo_id?: number;
  guild_mission_id?: number;
  guild_id?: number;
  category?: 'system' | 'personal' | 'guild';
  source?: 'system' | 'personal' | 'guild';
  difficulty?: Difficulty;
  mission_date?: string;
  frequency?: 'daily' | 'weekly' | 'monthly';
  scheduled_time?: string | null;
  title: string;
  detail: string | null;
  reward: MissionReward;
  completed: boolean;
  failed?: boolean;
  failed_at?: string | null;
  completed_at?: string | null;
  target_progress?: number;
  current_progress?: number;
  status?: 'active' | 'completed' | 'cancelled';
  guild_progress?: { current: number; target: number };
};

export type MissionReward = {
  type: 'xp' | 'skill' | 'item' | 'badge';
  key: string | null;
  name: string;
  description: string | null;
  icon_key: string;
  amount: number;
};

export type Difficulty = 'easy' | 'normal' | 'hard' | 'expert';

export type DifficultyConfig = {
  difficulty: Difficulty;
  base_reward_xp: number;
  description: string;
};

export type ExperienceTransaction = {
  id: number;
  source_type: string;
  source_id: number | null;
  amount: number;
  reason: string | null;
  created_at: string;
};

export type InventoryItem = {
  item_key: string;
  name: string;
  description: string | null;
  icon_key: string | null;
  quantity: number;
};

export type InventoryBadge = {
  badge_key: string;
  name: string;
  description: string | null;
  unlocked_at: string;
};

export type InventoryData = {
  items: InventoryItem[];
  badges: InventoryBadge[];
  totals: { items: number; badges: number };
};

export type Todo = {
  id: number;
  title: string;
  description?: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string | null;
  completed_at?: string | null;
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

const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, '');
const apiPort = process.env.EXPO_PUBLIC_API_PORT || '5000';
const expoHost = Constants.expoConfig?.hostUri?.split(':')[0];
const discoveredApiUrl = expoHost ? `http://${expoHost}:${apiPort}/api/mobile` : undefined;
const shouldDiscoverHost = !configuredApiUrl || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(?:\/|$)/i.test(configuredApiUrl);
// Support both the current channel URL (/api/mobile) and older local configs (/api).
const apiBaseUrl = (shouldDiscoverHost ? discoveredApiUrl : configuredApiUrl)?.endsWith('/api')
  ? `${shouldDiscoverHost ? discoveredApiUrl : configuredApiUrl}/mobile`
  : (shouldDiscoverHost ? discoveredApiUrl : configuredApiUrl);
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
  options: { method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'; body?: object; token?: string } = {},
): Promise<T> {
  if (!apiBaseUrl) {
    const message = 'URL API belum diatur. Isi EXPO_PUBLIC_API_URL pada file .env.';
    showErrorModal(message);
    throw new Error(message);
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
        const message = 'Tidak dapat terhubung ke backend. Periksa koneksi dan EXPO_PUBLIC_API_URL.';
        showErrorModal(message);
        throw new Error(message);
      }

      const payload = error.response.data;
      const apiMessage: Partial<ApiMessage> =
        payload !== null && typeof payload === 'object' ? (payload as Partial<ApiMessage>) : {};
      const validationMessages = apiMessage.errors?.map((item) => item.message).filter(Boolean);
      const message = validationMessages?.join('\n') || apiMessage.message || 'Permintaan ke backend gagal.';
      showErrorModal(message);
      throw new ApiError(message, error.response.status);
    }

    if (error instanceof Error) {
      showErrorModal(error.message);
      throw error;
    }

    const message = 'Terjadi kesalahan saat menghubungi backend.';
    showErrorModal(message);
    throw new Error(message);
  }
}

export function login(email: string, password: string) {
  return request<AuthSession>('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export type ProfileUpdate = {
  name?: string;
  email?: string;
  employee_number?: string | null;
  position?: string | null;
  department?: string | null;
  phone?: string | null;
  bio?: string | null;
};

export function updateProfile(token: string, data: ProfileUpdate) {
  return request<{ message: string }>('/v1/me/profile', {
    method: 'PATCH', token, body: data,
  });
}

export function changePassword(token: string, currentPassword: string, newPassword: string, confirmPassword: string) {
  return request<{ message: string }>('/v1/me/password', {
    method: 'PATCH',
    token,
    body: { current_password: currentPassword, new_password: newPassword, confirm_password: confirmPassword },
  });
}

export type RegistrationProfile = {
  birth_date?: string;
  gender?: 'male' | 'female' | 'other';
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
};

export function register(name: string, email: string, password: string, referralCode?: string, profile?: RegistrationProfile) {
  return request<AuthSession>('/auth/register', {
    method: 'POST',
    body: { name, email, password, referral_code: referralCode || undefined, ...profile },
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

export function getMissions(token: string) {
  return request<{ message: string; missions: Mission[]; stats?: { streak_days: number } }>('/missions', { token });
}

export type PlayerClass = {
  id: number;
  name: string;
  label: string;
  description: string | null;
  primary_stat: string;
  strength_bonus: number;
  intelligence_bonus: number;
  agility_bonus: number;
  stamina_bonus: number;
  luck_bonus: number;
};

export type Progression = {
  character: (PlayerClass & {
    class_id: number | null;
    class_name: string | null;
    class_label: string | null;
    level: number;
    experience: number;
    experience_to_next_level: number;
    health_points: number;
    mana_points: number;
    strength: number;
    intelligence: number;
    agility: number;
    stamina: number;
    luck: number;
  }) | null;
  skills: AuthSkill[];
};

export function getClasses(token: string) {
  return request<{ message: string; data: PlayerClass[] }>('/v1/classes', { token });
}

export function selectClass(token: string, classId: number) {
  return request<{ message: string; data: PlayerClass }>('/v1/me/class', {
    method: 'POST', token, body: { class_id: classId },
  });
}

export function getProgression(token: string) {
  return request<{ message: string; data: Progression }>('/v1/me/progression', { token });
}

export function getDifficultyConfigs(token: string) {
  return request<{ message: string; data: DifficultyConfig[] }>('/v1/difficulty-configs', { token });
}

export function updateDifficulty(token: string, difficulty: Difficulty) {
  return request<{ message: string; data: { difficulty: Difficulty } }>('/v1/me/difficulty', {
    method: 'PATCH',
    token,
    body: { difficulty },
  });
}

export function getExperienceHistory(token: string) {
  return request<{ message: string; data: ExperienceTransaction[] }>('/v1/me/experience-history', { token });
}

export function getMissionTemplates(token: string) {
  return request<{ message: string; data: { id: number; title: string; detail: string | null; difficulty: string; duration_minutes: number; reward_xp: number }[] }>('/v1/mission-templates', { token });
}

export function createCustomMission(token: string, data: { title: string; detail?: string; difficulty?: string; duration_minutes?: number; frequency?: string; mission_date?: string; scheduled_time?: string; reward_xp?: number }) {
  return request<{ message: string; data: Record<string, unknown> }>('/v1/missions/custom', { method: 'POST', token, body: data });
}

export function completeMissionV1(token: string, missionId: number) {
  return request<{ message: string; data: { mission_id: number; reward_granted: boolean; xp: number; level_up: boolean } }>(`/v1/missions/${missionId}/complete`, { method: 'POST', token });
}

export type AppNotification = { id: number; type: string; title: string; body: string; read_at: string | null; created_at: string };

export function getNotifications(token: string) {
  return request<{ message: string; data: AppNotification[] }>('/v1/notifications', { token });
}

export function toggleMission(token: string, missionId: number) {
  return request<{
    message: string;
    mission: Mission;
    reward_granted: boolean;
    granted_reward: MissionReward | null;
  }>(`/missions/${missionId}/toggle`, {
    method: 'PATCH',
    token,
  });
}

export function cancelMission(token: string, missionId: number) {
  return request<{ message: string }>(`/missions/${missionId}/cancel`, {
    method: 'PATCH',
    token,
  });
}

export function getInventory(token: string) {
  return request<{ message: string } & InventoryData>('/inventory', { token });
}

export function getTodos(token: string) {
  return request<{ message: string; todos: Todo[] }>('/todos', { token });
}

export function createTodo(token: string, title: string, dueDate?: string, description?: string) {
  return request<{ message: string; todo: Todo }>('/todos', {
    method: 'POST',
    token,
    body: { title, description: description || undefined, due_date: dueDate || undefined },
  });
}

export function updateTodo(token: string, todoId: number, data: Partial<Pick<Todo, 'title' | 'status' | 'priority' | 'due_date'>>) {
  return request<{ message: string; todo: Todo }>(`/todos/${todoId}`, {
    method: 'PATCH',
    token,
    body: data,
  });
}

export function deleteTodo(token: string, todoId: number) {
  return request<{ message: string }>(`/todos/${todoId}`, { method: 'DELETE', token });
}

export type AffiliateProfile = {
  code: string;
  referrals_count: number;
  referrals: {
    id: number;
    name: string;
    email: string;
    created_at: string;
  }[];
};

export function getAffiliateProfile(token: string) {
  return request<{ message: string; affiliate: AffiliateProfile }>('/affiliate', { token });
}

export type Friend = {
  id: number;
  name: string;
  email: string;
  created_at: string;
};

export type FriendRequest = {
  id: number;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  requester_id: number;
  requester_name: string;
  requester_email: string;
};

export type FriendRelationshipStatus = 'none' | 'friends' | 'request_sent' | 'request_received';

export type Party = {
  id: number;
  name: string;
  owner_id?: number;
  max_members: number;
  member_count?: number;
  created_at?: string;
  members?: { id: number; name: string; email: string; role: 'owner' | 'member' }[];
};

export type GuildMember = {
  id: number;
  name: string;
  email: string;
  role: 'owner' | 'member';
};

export type Guild = {
  id: number;
  name: string;
  description?: string | null;
  owner_id: number;
  max_members: number;
  member_count?: number;
  members?: GuildMember[];
  missions?: GuildMission[];
};

export type GuildMission = {
  id: number;
  guild_id: number;
  creator_id: number;
  title: string;
  detail?: string | null;
  difficulty: Difficulty;
  target_progress: number;
  current_progress: number;
  reward_xp: number;
  mission_date: string;
  scheduled_time?: string | null;
  status: 'active' | 'completed' | 'cancelled';
  completed_at?: string | null;
};

export type GuildInvitation = {
  id: number;
  guild_id: number;
  guild_name: string;
  inviter_name: string;
  inviter_email: string;
  created_at: string;
};

export function getFriends(token: string) {
  return request<{ message: string; friends: Friend[]; requests: FriendRequest[] }>('/friends', { token });
}

export function searchUsers(token: string, query: string) {
  return request<{ message: string; users: { id: number; name: string; email: string; relationship_status?: FriendRelationshipStatus; incoming_request_id?: number | null }[] }>(
    `/friends/search?q=${encodeURIComponent(query)}`,
    { token },
  );
}

export function sendFriendRequest(token: string, userId: number) {
  return request<{ message: string; data?: { user_id: number; status: FriendRelationshipStatus } }>('/friends/requests', {
    method: 'POST',
    token,
    body: { user_id: userId },
  });
}

export function respondFriendRequest(token: string, requestId: number, action: 'accept' | 'reject') {
  return request<{ message: string }>(`/friends/requests/${requestId}`, {
    method: 'PATCH',
    token,
    body: { action },
  });
}

export function removeFriend(token: string, userId: number) {
  return request<{ message: string }>(`/friends/${userId}`, { method: 'DELETE', token });
}

export function getParties(token: string) {
  return request<{ message: string; parties: Party[] }>('/parties', { token });
}

export function createParty(token: string, name: string, maxMembers = 5) {
  return request<{ message: string; party: Party }>('/parties', {
    method: 'POST',
    token,
    body: { name, max_members: maxMembers },
  });
}

export function addPartyMember(token: string, partyId: number, userId: number) {
  return request<{ message: string }>(`/parties/${partyId}/members`, {
    method: 'POST',
    token,
    body: { user_id: userId },
  });
}

export function removePartyMember(token: string, partyId: number, userId: number) {
  return request<{ message: string }>(`/parties/${partyId}/members/${userId}`, {
    method: 'DELETE',
    token,
  });
}

export function getGuilds(token: string) {
  return request<{ message: string; guilds: Guild[]; invitations: GuildInvitation[] }>('/guilds', { token });
}

export function createGuild(token: string, name: string, description?: string, maxMembers = 20) {
  return request<{ message: string; guild: Guild }>('/guilds', {
    method: 'POST',
    token,
    body: { name, description: description || undefined, max_members: maxMembers },
  });
}

export function inviteToGuild(token: string, guildId: number, userId: number) {
  return request<{ message: string }>(`/guilds/${guildId}/invitations`, {
    method: 'POST',
    token,
    body: { user_id: userId },
  });
}

export function respondGuildInvitation(token: string, invitationId: number, action: 'accept' | 'reject') {
  return request<{ message: string }>(`/guilds/invitations/${invitationId}`, {
    method: 'PATCH',
    token,
    body: { action },
  });
}

export function createGuildMission(token: string, guildId: number, data: { title: string; detail?: string; difficulty?: GuildMission['difficulty']; target_progress?: number; mission_date: string; scheduled_time?: string; reward_xp?: number }) {
  return request<{ message: string; data: GuildMission }>(`/guilds/${guildId}/missions`, {
    method: 'POST', token, body: data,
  });
}

export function contributeGuildMission(token: string, guildId: number, missionId: number, amount = 1) {
  return request<{ message: string; data: { mission_id: number; applied: number; current_progress: number; target_progress: number; completed: boolean; reward_xp: number } }>(`/guilds/${guildId}/missions/${missionId}/contribute`, {
    method: 'POST', token, body: { amount },
  });
}
