import { useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SecureStore from 'expo-secure-store';
import { Link, useFocusEffect } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import {
  faArrowLeft,
  faArrowRight,
  faBookOpen,
  faBolt,
  faCalendarCheck,
  faCheck,
  faChevronRight,
  faCompass,
  faEnvelope,
  faEye,
  faEyeSlash,
  faFire,
  faFlag,
  faHouse,
  faKey,
  faLock,
  faMedal,
  faPlus,
  faPhone,
  faScroll,
  faShieldHalved,
  faStar,
  faTrophy,
  faUser,
  faUsers,
  faUserGroup,
  faWallet,
  faStore,
} from '@fortawesome/free-solid-svg-icons';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Share,
  Text,
  TextInput,
  Pressable,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ApiError,
  forgotPassword,
  getCurrentUser,
  updateProfile,
  getClasses,
  getGuilds,
  searchGuilds,
  requestGuildJoin,
  respondGuildJoinRequest,
  createGuildMission,
  contributeGuildMission,
  getFriends,
  getInventory,
  getFinanceSummary,
  getFinanceTransactions,
  createFinanceTransaction,
  updateFinanceTransaction,
  getDifficultyConfigs,
  getExperienceHistory,
  getProgression,
  getAffiliateProfile,
  createTodo,
  updateTodo,
  deleteTodo,
  cancelMission as cancelMissionApi,
  getMissions,
  createCustomMission,
  login,
  register,
  selectClass,
  respondFriendRequest,
  removeFriend,
  resetPassword,
  searchUsers,
  sendFriendRequest,
  createGuild,
  updateGuild,
  inviteToGuild,
  respondGuildInvitation,
  createParty,
  addPartyMember,
  removePartyMember,
  getParties,
  toggleMission as toggleMissionApi,
  updateDifficulty,
  type AuthSession,
  type AuthUser,
  type AuthSkill,
  type FriendRequest,
  type FriendRelationshipStatus,
  type InventoryData,
  type FinanceSummary,
  type FinanceTransaction,
  type Mission,
  type MissionReward,
  type Friend,
  type Party,
  type Guild,
  type GuildInvitation,
  type GuildJoinRequest,
  type AffiliateProfile,
  type Todo,
  type Difficulty,
  type DifficultyConfig,
  type ExperienceTransaction,
  type Progression,
} from './src/lib/authApi';
import { HomeMenuCard } from './src/components/HomeMenuCard';
import { RadarCard, type RadarAxis } from './src/components/RadarChart';
import { ProfileLanding } from './src/components/ProfileLanding';
import { religions, type Religion } from './src/constants/religions';
import {
  clearSessionToken,
  getSessionToken,
  hasStartedSessionRuntime,
  markSessionRuntimeStarted,
  setSessionToken,
} from './src/lib/session';
import './global.css';

const initialMissions: Mission[] = [
  {
    id: 1,
    scheduled_time: '09:00:00',
    title: 'Selesaikan tugas utama',
    detail: 'Fokus kerja · 30 menit',
    reward: {
      type: 'xp',
      key: 'xp',
      name: '50 XP',
      description: null,
      icon_key: 'xp',
      amount: 50,
    },
    completed: false,
  },
  {
    id: 2,
    scheduled_time: '06:30:00',
    title: 'Latihan pagi',
    detail: 'Kebugaran · 20 menit',
    reward: {
      type: 'item',
      key: 'energy-potion',
      name: 'Potion Energi',
      description: 'Ramuan kecil dari apotek guild untuk menemani perjalanan.',
      icon_key: 'potion',
      amount: 1,
    },
    completed: false,
  },
  {
    id: 3,
    scheduled_time: '20:00:00',
    title: 'Baca satu bab buku',
    detail: 'Pengetahuan · 15 menit',
    reward: {
      type: 'skill',
      key: 'problem_solving',
      name: 'Pemecahan Masalah',
      description: null,
      icon_key: 'skill',
      amount: 1,
    },
    completed: true,
  },
];

const navigationItems: { label: string; icon: IconProp }[] = [
  { label: 'Beranda', icon: faHouse },
  { label: 'Misi', icon: faFlag },
  { label: 'Guild', icon: faUsers },
  { label: 'Profil', icon: faUser },
];

function getSkillRadarAxes(skills: AuthSkill[] | undefined): RadarAxis[] {
  return (skills || [])
    .slice()
    .sort((left, right) => left.label.localeCompare(right.label))
    .slice(0, 6)
    .map((skill) => {
      const nextLevelExperience = Math.max(1, skill.experience_to_next_level || 1);
      const progress = Math.min(1, Math.max(0, skill.experience / nextLevelExperience));
      const value = Math.max(0, skill.level + progress);
      return {
        label: skill.label,
        value,
        displayValue: `Lv. ${skill.level}`,
      };
    });
}

function getStatRadarAxes(stats: AuthUser['stats'] | undefined): RadarAxis[] {
  return [
    { label: 'Kekuatan', value: stats?.strength ?? 0 },
    { label: 'Intelligence', value: stats?.intelligence ?? 0 },
    { label: 'Agility', value: stats?.agility ?? 0 },
    { label: 'Stamina', value: stats?.stamina ?? 0 },
    { label: 'Keberuntungan', value: stats?.luck ?? 0 },
  ];
}

function getLocalDateValue() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function getLocalTimeValue() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

function parseDateValue(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date();
  if (year && month && day) date.setFullYear(year, month - 1, day);
  return date;
}

function parseTimeValue(value: string) {
  const [hours, minutes] = value.split(':').map(Number);
  const date = new Date();
  date.setHours(Number.isFinite(hours) ? hours : 9, Number.isFinite(minutes) ? minutes : 0, 0, 0);
  return date;
}

function formatDateValue(value: Date) {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
}

function formatTimeValue(value: Date) {
  return `${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`;
}

function getLevelProgress(totalExperience: number, level: number, nextLevelExperience: number) {
  let experienceSpent = 0;
  for (let currentLevel = 1; currentLevel < Math.max(1, level); currentLevel += 1) {
    let requirement = 100;
    for (let requirementLevel = 1; requirementLevel < currentLevel; requirementLevel += 1) {
      requirement = Math.round(requirement * 1.5);
    }
    experienceSpent += requirement;
  }
  const currentExperience = Math.max(0, totalExperience - experienceSpent);
  return {
    currentExperience,
    requiredExperience: Math.max(1, nextLevelExperience),
    percentage: Math.min(100, (currentExperience / Math.max(1, nextLevelExperience)) * 100),
  };
}

function formatDifficulty(value?: Difficulty) {
  if (value === 'normal') return 'Normal';
  if (value === 'hard') return 'Hard';
  if (value === 'expert') return 'Expert';
  return 'Easy';
}

function formatCurrency(value: number, currency = 'IDR') {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function PickerField({
  label,
  value,
  mode,
  icon,
  placeholder,
  onChange,
}: {
  label: string;
  value: Date;
  mode: 'date' | 'time';
  icon?: IconProp;
  placeholder?: string;
  onChange: (value: Date) => void;
}) {
  const [visible, setVisible] = useState(false);
  const displayValue = placeholder || (mode === 'date' ? formatDateValue(value) : formatTimeValue(value));

  function handlePickerChange(_event: unknown, selectedValue?: Date) {
    if (selectedValue) onChange(selectedValue);
    if (Platform.OS !== 'ios') setVisible(false);
  }

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={() => setVisible(true)}
        className={`border border-[#34343a] bg-[#1b1c22] ${icon ? 'h-14 flex-row items-center rounded-2xl px-4' : 'h-11 justify-center rounded-xl px-3'}`}
      >
        {icon ? <FontAwesomeIcon icon={icon} size={16} color="#918d84" /> : null}
        <Text className={icon ? 'ml-3 flex-1 text-sm text-[#f5f0e6]' : 'text-sm text-[#f5f0e6]'}>
          {displayValue}
        </Text>
      </Pressable>
      {visible && Platform.OS === 'ios' ? (
        <Modal transparent animationType="fade" visible onRequestClose={() => setVisible(false)}>
          <View className="flex-1 items-center justify-center bg-black/60 px-6">
            <View className="w-full rounded-2xl border border-[#5a482a] bg-[#242118] p-4">
              <DateTimePicker
                value={value}
                mode={mode}
                display="spinner"
                onChange={handlePickerChange}
                onDismiss={() => setVisible(false)}
                textColor="#f5f0e6"
              />
              <Pressable onPress={() => setVisible(false)} className="mt-3 items-center rounded-xl bg-[#e7bd68] py-3">
                <Text className="text-xs font-black text-[#211c12]">Selesai</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      ) : null}
      {visible && Platform.OS !== 'ios' ? (
        <DateTimePicker
          value={value}
          mode={mode}
          display="default"
          onChange={handlePickerChange}
          onDismiss={() => setVisible(false)}
        />
      ) : null}
    </>
  );
}

function formatMissionReward(mission: Mission) {
  if (mission.reward.type === 'xp') return `+${mission.reward.amount} XP`;
  if (mission.reward.type === 'skill') return `Kemampuan: ${mission.reward.name}`;
  if (mission.reward.type === 'item') return `Item: ${mission.reward.name}`;
  return `Badge: ${mission.reward.name}`;
}

function formatMissionProgress(mission: Mission) {
  if (!mission.guild_progress) return null;
  return `${mission.guild_progress.current}/${mission.guild_progress.target} kontribusi`;
}

function formatMissionSchedule(mission: Mission) {
  const time = mission.scheduled_time ? String(mission.scheduled_time).slice(0, 5).replace(':', '.') : null;

  if (time) return `Pukul ${time}`;
  return 'Waktu fleksibel';
}

function formatMissionFrequency(value?: Mission['frequency']) {
  if (value === 'weekly') return 'Mingguan';
  if (value === 'monthly') return 'Bulanan';
  return 'Harian';
}

function formatMissionCategory(value?: Mission['category']) {
  if (value === 'personal') return 'Pribadi';
  if (value === 'guild') return 'Guild';
  return 'Sistem';
}

function formatTodoDueDate(value?: string | null) {
  if (!value) return 'Waktu fleksibel';
  const normalized = String(value).replace('T', ' ');
  return normalized.length >= 16 ? normalized.slice(0, 16).replace(' ', ' · ') : normalized;
}

function MissionCard({
  mission,
  onPress,
}: {
  mission: Mission;
  onPress: (mission: Mission) => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Lihat detail misi ${mission.title}`}
      onPress={() => onPress(mission)}
      className={`flex-row items-center rounded-2xl border p-4 ${
        mission.failed
          ? 'border-[#633d3d] bg-[#241b1b]'
          : mission.completed
            ? 'border-[#34352f] bg-[#1a1d1b]'
            : 'border-[#2d2e35] bg-[#1b1c22]'
      }`}
    >
      <View
        className={`mr-3 h-6 w-6 items-center justify-center rounded-full border ${
          mission.failed
            ? 'border-[#e87959] bg-[#e87959]'
            : mission.completed
              ? 'border-[#8cbf9a] bg-[#8cbf9a]'
              : 'border-[#5e5b53] bg-transparent'
        }`}
      >
        {mission.failed ? (
          <Text className="text-xs font-black text-[#241b1b]">!</Text>
        ) : mission.completed ? (
          <FontAwesomeIcon icon={faCheck} size={12} color="#101116" />
        ) : null}
      </View>
      <View className="flex-1">
        <Text
          className={`text-sm font-bold ${
            mission.failed
              ? 'text-[#d58b78] line-through'
              : mission.completed
                ? 'text-[#898e88] line-through'
                : 'text-[#f1ede4]'
          }`}
        >
          {mission.title}
        </Text>
        <Text className="mt-1 text-xs font-bold text-[#e7bd68]">
          {formatMissionCategory(mission.category)} · {formatMissionFrequency(mission.frequency)} · {formatMissionSchedule(mission)}
        </Text>
        {mission.failed && <Text className="mt-1 text-xs font-bold text-[#e87959]">Gagal</Text>}
        {formatMissionProgress(mission) ? <Text className="mt-1 text-xs font-bold text-[#8cbf9a]">{formatMissionProgress(mission)}</Text> : null}
        <Text className="mt-1 text-xs text-[#85838a]">{mission.detail}</Text>
      </View>
      <View className="ml-2 items-end">
        <Text className="max-w-[100px] text-right text-xs font-extrabold text-[#e7bd68]">
          {formatMissionReward(mission)}
        </Text>
        <FontAwesomeIcon
          icon={faChevronRight}
          size={10}
          color="#66636b"
          style={{ marginTop: 8 }}
        />
      </View>
    </Pressable>
  );
}

function MissionRewardModal({
  mission,
  visible,
  onClose,
  onComplete,
  onCancel,
}: {
  mission: Mission | null;
  visible: boolean;
  onClose: () => void;
  onComplete: (missionId: number) => void;
  onCancel: (missionId: number) => void;
}) {
  if (!mission) return null;

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/70 px-6">
        <View className="w-full rounded-[28px] border border-[#5a482a] bg-[#242118] p-5">
          <View className="mb-5 flex-row items-start justify-between">
            <View className="mr-4 flex-1">
              <Text className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#e7bd68]">
                Detail misi
              </Text>
              <Text className="mt-2 text-xl font-black text-[#fff8e9]">{mission.title}</Text>
          <Text className="mt-2 text-sm font-bold text-[#e7bd68]">
            {formatMissionFrequency(mission.frequency)} · {formatMissionSchedule(mission)}
          </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Tutup detail misi"
              onPress={onClose}
              className="h-9 w-9 items-center justify-center rounded-full bg-[#3a3020]"
            >
              <Text className="text-lg font-bold text-[#e7bd68]">×</Text>
            </Pressable>
          </View>

          <Text className="mb-5 text-sm leading-5 text-[#c5beb0]">
            {mission.detail || 'Selesaikan tantangan ini untuk mendapatkan hadiah.'}
          </Text>

          <View className="mb-5 rounded-2xl border border-[#5d4a29] bg-[#342b1b] p-4">
            <Text className="text-[10px] font-bold uppercase tracking-[1.3px] text-[#aaa49a]">
              Hadiah yang didapat
            </Text>
            <Text className="mt-2 text-lg font-black text-[#e7bd68]">
              {formatMissionReward(mission)}
            </Text>
            <Text className="mt-1 text-xs text-[#c5beb0]">
              Hadiah akan diberikan satu kali saat misi diselesaikan.
            </Text>
          </View>

          {mission.failed ? (
            <View className="rounded-2xl border border-[#633d3d] bg-[#321f1f] p-4">
              <Text className="text-center text-sm font-bold text-[#e87959]">
                Misi gagal karena waktunya sudah terlewat
              </Text>
            </View>
          ) : mission.completed ? (
            <View>
              <View className="rounded-2xl border border-[#416247] bg-[#243027] p-4">
                <Text className="text-center text-sm font-bold text-[#8cbf9a]">Misi sudah selesai</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={() => onCancel(mission.id)}
                className="mt-3 h-12 items-center justify-center rounded-2xl border border-[#633d3d] bg-[#321f1f]"
              >
                <Text className="text-sm font-black text-[#e87959]">Batalkan penyelesaian</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              accessibilityRole="button"
              onPress={() => onComplete(mission.id)}
              className="h-12 items-center justify-center rounded-2xl bg-[#e7bd68]"
            >
              <Text className="text-sm font-black text-[#211c12]">Selesaikan misi</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}

function SkillUnlockModal({
  reward,
  visible,
  onClose,
}: {
  reward: MissionReward | null;
  visible: boolean;
  onClose: () => void;
}) {
  if (!reward) return null;

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/75 px-6">
        <View className="w-full rounded-[28px] border border-[#8a6d38] bg-[#242118] p-6">
          <View className="mb-5 items-center">
            <View className="h-16 w-16 items-center justify-center rounded-2xl border border-[#8a6d38] bg-[#3a3020]">
              <FontAwesomeIcon icon={faBolt} size={28} color="#e7bd68" />
            </View>
            <Text className="mt-4 text-[10px] font-bold uppercase tracking-[2px] text-[#e7bd68]">
              Kemampuan baru aktif
            </Text>
            <Text className="mt-2 text-center text-2xl font-black text-[#fff8e9]">
              {reward.name}
            </Text>
          </View>

          <View className="mb-5 rounded-2xl border border-[#5d4a29] bg-[#342b1b] p-4">
            <Text className="text-center text-sm leading-5 text-[#c5beb0]">
              {reward.description || 'Kemampuan baru telah ditambahkan ke daftar kemampuan aktifmu.'}
            </Text>
            <Text className="mt-3 text-center text-xs font-bold text-[#8cbf9a]">
              Kemampuan ini sekarang bisa dilihat di Profil Petualang.
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={onClose}
            className="h-12 items-center justify-center rounded-2xl bg-[#e7bd68]"
          >
              <Text className="text-sm font-black text-[#211c12]">Lihat kemampuan saya</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function GameStatRow({ label, value }: { label: string; value: number }) {
  const percentage = Math.min((value / 100) * 100, 100);

  return (
    <View className="mb-4">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-xs font-bold uppercase tracking-[1px] text-[#c5beb0]">{label}</Text>
        <Text className="text-sm font-black text-[#e7bd68]">{value}</Text>
      </View>
      <View className="h-2 overflow-hidden rounded-full bg-[#484132]">
        <View
          className="h-full rounded-full bg-[#e7bd68]"
          style={{ width: `${percentage}%` }}
        />
      </View>
    </View>
  );
}

function SkillCard({
  label,
  description,
  level,
  experience,
  experienceToNextLevel,
}: {
  label: string;
  description?: string | null;
  level: number;
  experience: number;
  experienceToNextLevel: number;
}) {
  const percentage = Math.min(
    (experience / Math.max(experienceToNextLevel, 1)) * 100,
    100,
  );

  return (
    <View className="mb-3 rounded-2xl border border-[#2d2e35] bg-[#1b1c22] p-4">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-sm font-extrabold text-[#f1ede4]">{label}</Text>
        <Text className="text-xs font-black text-[#e7bd68]">Lv. {level}</Text>
      </View>
      {description ? <Text className="mb-2 text-xs leading-5 text-[#aaa49a]">{description}</Text> : null}
      <View className="mb-2 h-2 overflow-hidden rounded-full bg-[#484132]">
        <View
          className="h-full rounded-full bg-[#8cbf9a]"
          style={{ width: `${percentage}%` }}
        />
      </View>
      <Text className="text-[10px] text-[#85838a]">
        {experience} / {experienceToNextLevel} XP menuju level berikutnya
      </Text>
    </View>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  accent,
  progress,
}: {
  label: string;
  value: string | number;
  icon: IconProp;
  accent: string;
  progress?: number;
}) {
  return (
    <View className="flex-1 overflow-hidden rounded-2xl border border-[#34353d] bg-[#1b1c22] p-4">
      <View className="mb-4 flex-row items-center justify-between">
        <View className="h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: `${accent}22` }}>
          <FontAwesomeIcon icon={icon} size={16} color={accent} />
        </View>
        <Text className="text-[10px] font-bold uppercase tracking-[1px] text-[#77757d]">DATA</Text>
      </View>
      <Text className="text-2xl font-black text-[#fff8e9]">{value}</Text>
      <Text className="mt-1 text-[10px] font-bold uppercase tracking-[1px] text-[#85838a]">
        {label}
      </Text>
      {progress !== undefined ? (
        <View className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#484132]">
          <View
            className="h-full rounded-full"
            style={{ backgroundColor: accent, width: `${Math.min(Math.max(progress, 0), 100)}%` }}
          />
        </View>
      ) : null}
    </View>
  );
}

function InventoryPanel({
  inventory,
  isLoading,
  error,
}: {
  inventory: InventoryData;
  isLoading: boolean;
  error: string;
}) {
  if (isLoading) {
    return <Text className="py-8 text-center text-sm text-[#85838a]">Membuka peti inventori...</Text>;
  }

  if (error) {
    return <Text className="py-8 text-center text-sm text-[#f1a39a]">{error}</Text>;
  }

  return (
    <>
      <View className="mb-6 flex-row gap-3">
        <View className="flex-1 rounded-2xl border border-[#2d2e35] bg-[#1b1c22] p-4">
          <FontAwesomeIcon icon={faScroll} size={17} color="#e7bd68" />
          <Text className="mt-3 text-2xl font-black text-[#fff8e9]">{inventory.totals.items}</Text>
          <Text className="mt-1 text-[10px] font-bold uppercase tracking-[1px] text-[#85838a]">
            Total item
          </Text>
        </View>
        <View className="flex-1 rounded-2xl border border-[#2d2e35] bg-[#1b1c22] p-4">
          <FontAwesomeIcon icon={faMedal} size={17} color="#e7bd68" />
          <Text className="mt-3 text-2xl font-black text-[#fff8e9]">{inventory.totals.badges}</Text>
          <Text className="mt-1 text-[10px] font-bold uppercase tracking-[1px] text-[#85838a]">
            Badge terbuka
          </Text>
        </View>
      </View>

      <Text className="mb-3 text-base font-extrabold text-[#f5f0e6]">Item koleksi</Text>
      {inventory.items.length ? (
        <View className="mb-6 gap-3">
          {inventory.items.map((item) => (
            <View key={item.item_key} className="flex-row items-center rounded-2xl border border-[#2d2e35] bg-[#1b1c22] p-4">
              <View className="mr-3 h-11 w-11 items-center justify-center rounded-xl bg-[#33291d]">
                <FontAwesomeIcon icon={faScroll} size={18} color="#e7bd68" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-extrabold text-[#f1ede4]">{item.name}</Text>
                <Text className="mt-1 text-xs leading-4 text-[#85838a]">{item.description}</Text>
              </View>
              <Text className="ml-3 text-sm font-black text-[#e7bd68]">×{item.quantity}</Text>
            </View>
          ))}
        </View>
      ) : (
        <View className="mb-6 rounded-2xl border border-dashed border-[#49433a] bg-[#191a1f] p-4">
          <Text className="text-sm text-[#85838a]">Peti inventori masih kosong.</Text>
        </View>
      )}

      <Text className="mb-3 text-base font-extrabold text-[#f5f0e6]">Badge pencapaian</Text>
      {inventory.badges.length ? (
        <View className="gap-3">
          {inventory.badges.map((badge) => (
            <View key={badge.badge_key} className="flex-row items-center rounded-2xl border border-[#5a482a] bg-[#242118] p-4">
              <View className="mr-3 h-11 w-11 items-center justify-center rounded-xl bg-[#3a3020]">
                <FontAwesomeIcon icon={faMedal} size={18} color="#e7bd68" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-extrabold text-[#f1ede4]">{badge.name}</Text>
                <Text className="mt-1 text-xs leading-4 text-[#aaa49a]">{badge.description}</Text>
              </View>
              <FontAwesomeIcon icon={faTrophy} size={18} color="#e7bd68" />
            </View>
          ))}
        </View>
      ) : (
        <View className="rounded-2xl border border-dashed border-[#49433a] bg-[#191a1f] p-4">
          <Text className="text-sm text-[#85838a]">Belum ada badge yang terbuka.</Text>
        </View>
      )}
    </>
  );
}

type AuthScreenName = 'login' | 'register' | 'forgot' | 'reset';

function AuthScreen({
  onContinueAsGuest,
  onAuthenticated,
  initialError,
}: {
  onContinueAsGuest: () => void;
  onAuthenticated: (session: AuthSession, rememberMe?: boolean) => Promise<void>;
  initialError?: string;
}) {
  const [screen, setScreen] = useState<AuthScreenName>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(initialError ?? '');
  const [notice, setNotice] = useState('');
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | ''>('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  async function submitForm() {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail.includes('@') || !normalizedEmail.includes('.')) {
      setFormError('Masukkan alamat email yang valid.');
      return;
    }

    if (screen === 'register' && !name.trim()) {
      setFormError('Masukkan nama petualangmu terlebih dahulu.');
      return;
    }
    if (screen === 'register' && !/^\d{4}-\d{2}-\d{2}$/.test(birthDate.trim())) {
      setFormError('Pilih tanggal lahir terlebih dahulu.');
      return;
    }
    if (screen === 'register' && !gender) {
      setFormError('Pilih jenis kelamin terlebih dahulu.');
      return;
    }
    if (screen === 'register' && !phone.trim()) {
      setFormError('Nomor telepon wajib diisi.');
      return;
    }
    if ((screen === 'register' || screen === 'reset') && password.length < 8) {
      setFormError('Gunakan password minimal 8 karakter.');
      return;
    }
    if ((screen === 'register' || screen === 'reset') && password !== confirmPassword) {
      setFormError('Pastikan kedua password yang kamu masukkan sama.');
      return;
    }
    if (screen === 'login' && !password) {
      setFormError('Masukkan password untuk melanjutkan.');
      return;
    }
    if (screen === 'reset' && !resetToken.trim()) {
      setFormError('Token reset wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');
    setNotice('');
    try {
      if (screen === 'forgot') {
        const result = await forgotPassword(normalizedEmail);
        const tokenMatch = result.resetUrl?.match(/[?&]token=([^&]+)/);
        if (tokenMatch) {
          setResetToken(tokenMatch[1]);
          setScreen('reset');
          setNotice('Tautan reset diterima dari backend pengembangan. Atur password baru di bawah.');
        } else {
          setNotice(
            `${result.message} Jika tidak menerima email, pastikan layanan email reset password sudah dikonfigurasi di backend.`,
          );
        }
        return;
      }

      if (screen === 'reset') {
        const result = await resetPassword(normalizedEmail, resetToken.trim(), password);
        setScreen('login');
        setPassword('');
        setConfirmPassword('');
        setResetToken('');
        setNotice(result.message);
        return;
      }

      const session =
        screen === 'register'
          ? await register(name.trim(), normalizedEmail, password, referralCode.trim() || undefined, {
              birth_date: birthDate.trim(),
              gender: gender || undefined,
              phone: phone.trim(),
            })
          : await login(normalizedEmail, password);
      if (screen === 'register') {
        setScreen('login');
        setPassword('');
        setConfirmPassword('');
        setBirthDate('');
        setGender('');
        setPhone('');
        setNotice('Akun berhasil dibuat. Silakan login untuk memilih difficulty dan class.');
        return;
      }
      await onAuthenticated(session, screen === 'login' ? rememberMe : true);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error instanceof ApiError && error.status >= 500
            ? 'Server sedang bermasalah. Coba lagi beberapa saat.'
            : error.message
          : 'Terjadi kesalahan saat menghubungi server. Coba lagi.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function renderInput({
    icon,
    placeholder,
    value,
    onChangeText,
    isPassword = false,
    keyboardType,
    autoCapitalize = 'none',
  }: {
    icon: IconProp;
    placeholder: string;
    value: string;
    onChangeText: (value: string) => void;
    isPassword?: boolean;
    keyboardType?: 'default' | 'email-address' | 'phone-pad';
    autoCapitalize?: 'none' | 'words';
  }) {
    return (
      <View className="mb-3 h-14 flex-row items-center rounded-2xl border border-[#34343a] bg-[#1b1c22] px-4">
        <FontAwesomeIcon icon={icon} size={16} color="#918d84" />
        <TextInput
          accessibilityLabel={placeholder}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          className="ml-3 flex-1 py-0 text-sm text-[#f5f0e6]"
          keyboardType={keyboardType}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#77757d"
          secureTextEntry={isPassword && !showPassword}
          value={value}
        />
        {isPassword && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
            onPress={() => setShowPassword(!showPassword)}
            hitSlop={10}
          >
            <FontAwesomeIcon
              icon={showPassword ? faEyeSlash : faEye}
              size={16}
              color="#918d84"
            />
          </Pressable>
        )}
      </View>
    );
  }

  const isPasswordScreen = screen === 'login' || screen === 'register' || screen === 'reset';

  return (
    <SafeAreaView className="flex-1 bg-[#101116]" edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingHorizontal: 26,
            paddingVertical: 28,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {screen !== 'login' && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Kembali ke login"
              onPress={() => {
                setScreen('login');
                setFormError('');
                setNotice('');
              }}
              className="mb-6 h-10 w-10 items-center justify-center self-start rounded-full border border-[#34343a] bg-[#1b1c22]"
            >
              <FontAwesomeIcon icon={faArrowLeft} size={15} color="#d9d2c5" />
            </Pressable>
          )}

          <View className="mb-8 items-center">
            <View className="mb-5 h-[72px] w-[72px] items-center justify-center rounded-[24px] border border-[#66522c] bg-[#282317]">
              <FontAwesomeIcon icon={faShieldHalved} size={31} color="#e7bd68" />
            </View>
            <Text className="mb-2 text-[11px] font-bold uppercase tracking-[2.5px] text-[#e7bd68]">
              GUILD PETUALANG
            </Text>
            <Text className="text-center text-[27px] font-black text-[#fff8e9]">
              {screen === 'login'
                ? 'Selamat datang kembali'
                : screen === 'register'
                  ? 'Mulai petualanganmu'
                  : screen === 'reset'
                    ? 'Buat password baru'
                    : 'Pulihkan akun'}
            </Text>
            <Text className="mt-2 max-w-[290px] text-center text-sm leading-5 text-[#99969c]">
              {screen === 'login'
                ? 'Masuk ke guild dan lanjutkan misi yang menantimu.'
                : screen === 'register'
                  ? 'Buat akun dan mulai bangun kebiasaan legendaris.'
                  : screen === 'reset'
                    ? 'Masukkan token reset dan password baru untuk akunmu.'
                    : 'Masukkan email akunmu untuk mendapatkan bantuan reset password.'}
            </Text>
          </View>

          <View className="rounded-[26px] border border-[#34343a] bg-[#17181d] p-5">
            {screen === 'register' &&
              renderInput({
                icon: faUser,
                placeholder: 'Nama petualang',
                value: name,
                onChangeText: setName,
                autoCapitalize: 'words',
              })}

            {screen === 'register' && (
              <>
                <View className="mb-3">
                  <PickerField
                    label="Tanggal lahir"
                    value={birthDate ? parseDateValue(birthDate) : new Date(2000, 0, 1)}
                    mode="date"
                    icon={faCalendarCheck}
                    placeholder={birthDate ? undefined : 'Pilih tanggal lahir'}
                    onChange={(value) => setBirthDate(formatDateValue(value))}
                  />
                </View>
                <View className="mb-3 flex-row gap-2">
                  {([
                    ['male', 'Laki-laki'],
                    ['female', 'Perempuan'],
                  ] as const).map(([value, label]) => (
                    <Pressable
                      key={value}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: gender === value }}
                      onPress={() => setGender(value)}
                      className={`flex-1 items-center rounded-xl border px-2 py-3 ${gender === value ? 'border-[#e7bd68] bg-[#342b1b]' : 'border-[#34343a] bg-[#121318]'}`}
                    >
                      <Text className="text-[10px] font-bold text-[#f5f0e6]">{label}</Text>
                    </Pressable>
                  ))}
                </View>
                {renderInput({
                  icon: faPhone,
                  placeholder: 'Nomor telepon',
                  value: phone,
                  onChangeText: setPhone,
                  keyboardType: 'phone-pad',
                })}
              </>
            )}

            {screen === 'register' &&
              renderInput({
                icon: faKey,
                placeholder: 'Kode affiliate (opsional)',
                value: referralCode,
                onChangeText: setReferralCode,
                autoCapitalize: 'words',
              })}

            {renderInput({
              icon: faEnvelope,
              placeholder: 'Alamat email',
              value: email,
              onChangeText: setEmail,
              keyboardType: 'email-address',
            })}

            {screen === 'reset' &&
              renderInput({
                icon: faKey,
                placeholder: 'Token reset',
                value: resetToken,
                onChangeText: setResetToken,
              })}

            {isPasswordScreen &&
              renderInput({
                icon: faLock,
                placeholder: 'Password',
                value: password,
                onChangeText: setPassword,
                isPassword: true,
              })}

            {screen === 'register' &&
              renderInput({
                icon: faLock,
                placeholder: 'Ulangi password',
                value: confirmPassword,
                onChangeText: setConfirmPassword,
                isPassword: true,
              })}

            {screen === 'reset' &&
              renderInput({
                icon: faLock,
                placeholder: 'Ulangi password baru',
                value: confirmPassword,
                onChangeText: setConfirmPassword,
                isPassword: true,
              })}

            {!!formError && (
              <View className="mb-4 rounded-xl border border-[#793e3e] bg-[#321f21] px-3 py-2.5">
                <Text className="text-xs leading-5 text-[#f1a39a]">
                  {formError}
                </Text>
              </View>
            )}

            {!!notice && (
              <View className="mb-4 rounded-xl border border-[#5a482a] bg-[#2b251a] px-3 py-2.5">
                <Text className="text-xs leading-5 text-[#e7bd68]">{notice}</Text>
              </View>
            )}

            {screen === 'login' && (
              <View className="mb-5 flex-row items-center justify-between">
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: rememberMe }}
                  accessibilityLabel="Ingat saya di perangkat ini"
                  onPress={() => setRememberMe((current) => !current)}
                  className="flex-row items-center"
                  hitSlop={8}
                >
                  <View
                    className={`mr-2 h-5 w-5 items-center justify-center rounded-md border ${
                      rememberMe ? 'border-[#e7bd68] bg-[#e7bd68]' : 'border-[#5a5b64] bg-transparent'
                    }`}
                  >
                    {rememberMe ? <FontAwesomeIcon icon={faCheck} size={12} color="#211b10" /> : null}
                  </View>
                  <Text className="text-xs font-semibold text-[#c5beb0]">Ingat saya</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setScreen('forgot');
                    setFormError('');
                    setNotice('');
                  }}
                  hitSlop={8}
                >
                  <Text className="text-xs font-bold text-[#e7bd68]">Lupa password?</Text>
                </Pressable>
              </View>
            )}

            <Pressable
              accessibilityRole="button"
              disabled={isSubmitting}
              onPress={() => void submitForm()}
              className={`h-14 flex-row items-center justify-center rounded-2xl ${
                isSubmitting ? 'bg-[#8e7545]' : 'bg-[#d8ad59] active:bg-[#c69a48]'
              }`}
            >
              <Text className="mr-2 text-sm font-black text-[#211b10]">
                {isSubmitting
                  ? 'Menghubungi server...'
                  : screen === 'login'
                    ? 'Masuk ke akun'
                    : screen === 'register'
                      ? 'Buat akun'
                      : screen === 'reset'
                        ? 'Simpan password baru'
                        : 'Kirim instruksi reset'}
              </Text>
              <FontAwesomeIcon icon={faArrowRight} size={14} color="#211b10" />
            </Pressable>

            {(screen === 'login' || screen === 'register') && (
              <View className="mt-5 flex-row items-center justify-center">
                <Text className="text-xs text-[#99969c]">
                  {screen === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'}{' '}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setScreen(screen === 'login' ? 'register' : 'login');
                    setFormError('');
                    setNotice('');
                  }}
                  hitSlop={8}
                >
                  <Text className="text-xs font-extrabold text-[#e7bd68]">
                    {screen === 'login' ? 'Daftar' : 'Masuk'}
                  </Text>
                </Pressable>
              </View>
            )}

            {(screen === 'forgot' || screen === 'reset') && (
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setScreen('login');
                  setFormError('');
                  setNotice('');
                }}
                className="mt-5 items-center"
              >
                <Text className="text-xs font-bold text-[#c5beb0]">Kembali ke login</Text>
              </Pressable>
            )}
          </View>

          {screen === 'login' && (
            <>
              <View className="my-5 flex-row items-center">
                <View className="h-px flex-1 bg-[#34343a]" />
                <Text className="mx-3 text-[10px] font-bold uppercase tracking-[1.5px] text-[#77757d]">
                  atau
                </Text>
                <View className="h-px flex-1 bg-[#34343a]" />
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={onContinueAsGuest}
                className="h-12 items-center justify-center rounded-2xl border border-[#49433a] bg-[#191a1f]"
              >
                <Text className="text-sm font-bold text-[#d9d2c5]">Jelajahi sebagai tamu</Text>
              </Pressable>
            </>
          )}

          <Text className="mt-6 text-center text-[10px] leading-4 text-[#706e75]">
            {screen === 'login'
              ? 'Sesi login disimpan dengan aman di perangkat sampai kamu keluar dari akun.'
              : 'Jaga kerahasiaan email, password, dan token reset akunmu.'}
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type OnboardingStep = 'religion' | 'difficulty' | 'class';

function onboardingStorageKey(userId: number) {
  return `rpg_onboarding_completed_${userId}`;
}

async function markOnboardingCompleted(userId: number) {
  const key = onboardingStorageKey(userId);
  if (Platform.OS === 'web') {
    window.localStorage.setItem(key, 'true');
  } else {
    await SecureStore.setItemAsync(key, 'true');
  }
}

function getRequiredOnboardingStep(
  user: AuthUser | null | undefined,
  progressionResult: Progression | null | undefined,
): OnboardingStep | null {
  if (!user?.profile?.religion) return 'religion';
  const hasClass = Number(user?.class_id || progressionResult?.character?.class_id || 0) > 0;
  if (hasClass) return null;

  return user?.difficulty ? 'class' : 'difficulty';
}

const onboardingDifficultyLabels: Record<Difficulty, string> = {
  easy: 'Easy',
  normal: 'Normal',
  hard: 'Hard',
  expert: 'Expert',
};

function OnboardingScreen({
  token,
  step,
  onReligionSelected,
  onDifficultySelected,
  onCompleted,
  onBackToLogin,
}: {
  token: string;
  step: OnboardingStep;
  onReligionSelected: (religion: Religion) => Promise<void>;
  onDifficultySelected: (difficulty: Difficulty) => Promise<void>;
  onCompleted: () => Promise<void>;
  onBackToLogin: () => Promise<void>;
}) {
  const [classes, setClasses] = useState<{
    id: number;
    label: string;
    description: string | null;
    primary_stat: string;
    strength_bonus: number;
    intelligence_bonus: number;
    agility_bonus: number;
    stamina_bonus: number;
    luck_bonus: number;
  }[]>([]);
  const [difficultyConfigs, setDifficultyConfigs] = useState<DifficultyConfig[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);
  const [selectedReligion, setSelectedReligion] = useState<Religion | null>(null);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        if (step === 'religion') {
          if (mounted) setIsLoading(false);
        } else if (step === 'difficulty') {
          const result = await getDifficultyConfigs(token);
          if (mounted) setDifficultyConfigs(result.data);
        } else {
          const result = await getClasses(token);
          if (mounted) setClasses(result.data);
        }
      } catch (loadError) {
        if (mounted) setError(loadError instanceof Error ? loadError.message : 'Data onboarding belum dapat dimuat.');
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [step, token]);

  async function continueOnboarding() {
    const value = step === 'religion' ? selectedReligion : step === 'difficulty' ? selectedDifficulty : selectedClass;
    if (!value) {
      setError(step === 'religion' ? 'Pilih agama terlebih dahulu.' : step === 'difficulty' ? 'Pilih difficulty terlebih dahulu.' : 'Pilih class terlebih dahulu.');
      return;
    }
    setIsSaving(true);
    setError('');
    try {
      if (step === 'religion') {
        await onReligionSelected(value as Religion);
      } else if (step === 'difficulty') {
        await onDifficultySelected(value as Difficulty);
      } else {
        await selectClass(token, value as number);
        await onCompleted();
      }
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Pilihan belum dapat disimpan.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-[#101116]" edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar style="light" />
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 26 }}>
        <View className="mb-8 items-center">
          <View className="mb-5 h-[72px] w-[72px] items-center justify-center rounded-[24px] border border-[#66522c] bg-[#282317]">
            <FontAwesomeIcon icon={step === 'religion' ? faStar : step === 'difficulty' ? faCompass : faShieldHalved} size={31} color="#e7bd68" />
          </View>
          <Text className="mb-2 text-[11px] font-bold uppercase tracking-[2.5px] text-[#e7bd68]">PERSIAPAN PETUALANG</Text>
          <Text className="text-center text-[27px] font-black text-[#fff8e9]">
            {step === 'religion' ? 'Pilih preferensi agama' : step === 'difficulty' ? 'Pilih tingkat tantangan' : 'Pilih class karakter'}
          </Text>
          <Text className="mt-2 text-center text-sm leading-5 text-[#99969c]">
            {step === 'religion'
              ? 'Pilihan ini digunakan untuk menampilkan misi ibadah yang sesuai. Kamu tetap dapat memilih opsi umum.'
              : step === 'difficulty'
              ? 'Difficulty menentukan reward untuk misi baru. Pilihan ini bisa diubah nanti dari Profil.'
              : 'Class menentukan bonus awal dan arah perkembangan karakter.'}
          </Text>
        </View>

        <View className="rounded-[26px] border border-[#34343a] bg-[#17181d] p-5">
          {isLoading ? <Text className="py-8 text-center text-sm text-[#85838a]">Menyiapkan pilihan...</Text> : null}
          {!isLoading && step === 'religion' ? (
            <View className="gap-3">
              {religions.map((religion) => (
                <Pressable
                  key={religion.value}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: selectedReligion === religion.value }}
                  onPress={() => setSelectedReligion(religion.value)}
                  className={`rounded-2xl border p-4 ${selectedReligion === religion.value ? 'border-[#e7bd68] bg-[#342b1b]' : 'border-[#2d2e35] bg-[#1b1c22]'}`}
                >
                  <Text className="text-base font-black text-[#f5f0e6]">{religion.label}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}
          {!isLoading && step === 'difficulty' ? (
            <View className="gap-3">
              {(['easy', 'normal', 'hard', 'expert'] as Difficulty[]).map((difficulty) => (
                <Pressable
                  key={difficulty}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: selectedDifficulty === difficulty }}
                  onPress={() => setSelectedDifficulty(difficulty)}
                  className={`rounded-2xl border p-4 ${selectedDifficulty === difficulty ? 'border-[#e7bd68] bg-[#342b1b]' : 'border-[#2d2e35] bg-[#1b1c22]'}`}
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="text-base font-black text-[#f5f0e6]">{onboardingDifficultyLabels[difficulty]}</Text>
                  </View>
                  <Text className="mt-2 text-xs leading-5 text-[#aaa49a]">
                    {difficultyConfigs.find((item) => item.difficulty === difficulty)?.description || 'Penjelasan difficulty belum tersedia.'}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : null}
          {!isLoading && step === 'class' ? (
            <View className="gap-3">
              {classes.map((item) => (
                <Pressable
                  key={item.id}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: selectedClass === item.id }}
                  onPress={() => setSelectedClass(item.id)}
                  className={`rounded-2xl border p-4 ${selectedClass === item.id ? 'border-[#e7bd68] bg-[#342b1b]' : 'border-[#2d2e35] bg-[#1b1c22]'}`}
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="text-base font-black text-[#f5f0e6]">{item.label}</Text>
                    <Text className="text-xs font-bold uppercase text-[#e7bd68]">{item.primary_stat}</Text>
                  </View>
                  <Text className="mt-2 text-sm leading-5 text-[#aaa49a]">{item.description}</Text>
                  <Text className="mt-3 text-[10px] font-bold text-[#8cbf9a]">STR +{item.strength_bonus} · INT +{item.intelligence_bonus} · AGI +{item.agility_bonus} · STA +{item.stamina_bonus} · LCK +{item.luck_bonus}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}
          {error ? <Text className="mt-4 text-xs leading-5 text-[#f1a39a]">{error}</Text> : null}
          <Pressable onPress={() => void continueOnboarding()} disabled={isSaving || isLoading} className="mt-5 h-14 items-center justify-center rounded-2xl bg-[#d8ad59]">
            <Text className="text-sm font-black text-[#211b10]">{isSaving ? 'Menyimpan...' : step === 'religion' ? 'Lanjut pilih difficulty' : step === 'difficulty' ? 'Lanjut pilih class' : 'Masuk ke beranda'}</Text>
          </Pressable>
        </View>
        <Pressable accessibilityRole="button" onPress={() => void onBackToLogin()} className="mt-6 items-center py-3">
          <Text className="text-xs font-bold text-[#c5beb0]">Kembali ke login</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function App() {
  const [missions, setMissions] = useState(initialMissions);
  const [streakDays, setStreakDays] = useState(0);
  const [lastCompletedDate, setLastCompletedDate] = useState<string | null>(null);
  const [streakStatus, setStreakStatus] = useState<'active' | 'pending' | 'broken' | 'none'>('none');
  const [activeTab, setActiveTab] = useState('Beranda');
  const [isGuest, setIsGuest] = useState(false);
  const [authSession, setAuthSession] = useState<AuthSession | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState('');
  const [difficultyConfigs, setDifficultyConfigs] = useState<DifficultyConfig[]>([]);
  const [progression, setProgression] = useState<Progression | null>(null);
  const [experienceHistory, setExperienceHistory] = useState<ExperienceTransaction[]>([]);
  const [difficultyError, setDifficultyError] = useState('');
  const [isDifficultySaving, setIsDifficultySaving] = useState(false);
  const [missionError, setMissionError] = useState('');
  const [isMissionLoading, setIsMissionLoading] = useState(false);
  const [hasLoadedMissions, setHasLoadedMissions] = useState(false);

  function applyMissionStats(stats?: { streak_days: number; last_completed_date: string | null; status: 'active' | 'pending' | 'broken' | 'none' }) {
    setStreakDays(stats?.streak_days ?? 0);
    setLastCompletedDate(stats?.last_completed_date ?? null);
    setStreakStatus(stats?.status ?? 'none');
  }
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [unlockedSkill, setUnlockedSkill] = useState<MissionReward | null>(null);
  const [missionFrequency, setMissionFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [missionCategory, setMissionCategory] = useState<'all' | 'system' | 'personal' | 'guild'>('all');
  const [missionFilter, setMissionFilter] = useState<'all' | 'active' | 'failed' | 'completed'>('all');
  const [isMissionComposerOpen, setIsMissionComposerOpen] = useState(false);
  const [missionComposerType, setMissionComposerType] = useState<'personal' | 'guild' | null>(null);
  const [personalMissionTitle, setPersonalMissionTitle] = useState('');
  const [personalMissionDetail, setPersonalMissionDetail] = useState('');
  const [personalMissionDate, setPersonalMissionDate] = useState(getLocalDateValue());
  const [personalMissionTime, setPersonalMissionTime] = useState(getLocalTimeValue());
  const [personalMissionError, setPersonalMissionError] = useState('');
  const [inventory, setInventory] = useState<InventoryData>({
    items: [],
    badges: [],
    totals: { items: 0, badges: 0 },
  });
  const [isInventoryLoading, setIsInventoryLoading] = useState(false);
  const [inventoryError, setInventoryError] = useState('');
  const [finance, setFinance] = useState<FinanceSummary | null>(null);
  const [financeTransactions, setFinanceTransactions] = useState<FinanceTransaction[]>([]);
  const [financeError, setFinanceError] = useState('');
  const [isFinanceModalOpen, setIsFinanceModalOpen] = useState(false);
  const [financeType, setFinanceType] = useState<'income' | 'expense' | 'transfer'>('income');
  const [financeAmount, setFinanceAmount] = useState('');
  const [financeCategory, setFinanceCategory] = useState('');
  const [financeDescription, setFinanceDescription] = useState('');
  const [financeAccountId, setFinanceAccountId] = useState<number | null>(null);
  const [financeFromAccountId, setFinanceFromAccountId] = useState<number | null>(null);
  const [financeToAccountId, setFinanceToAccountId] = useState<number | null>(null);
  const [editingFinanceTransaction, setEditingFinanceTransaction] = useState<FinanceTransaction | null>(null);
  const [isFinanceSaving, setIsFinanceSaving] = useState(false);
  const [financeFormError, setFinanceFormError] = useState('');
  const [affiliateProfile, setAffiliateProfile] = useState<AffiliateProfile | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [todoTitle, setTodoTitle] = useState('');
  const [todoDescription, setTodoDescription] = useState('');
  const [todoDueDate, setTodoDueDate] = useState('');
  const [todoError, setTodoError] = useState('');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [guildInvitations, setGuildInvitations] = useState<GuildInvitation[]>([]);
  const [guildJoinRequests, setGuildJoinRequests] = useState<GuildJoinRequest[]>([]);
  const [socialSearch, setSocialSearch] = useState('');
  const [socialSearchResults, setSocialSearchResults] = useState<
    Array<{ id: number; name: string; email: string; relationship_status?: FriendRelationshipStatus; incoming_request_id?: number | null }>
  >([]);
  const [socialError, setSocialError] = useState('');
  const [isSocialLoading, setIsSocialLoading] = useState(false);
  const [newPartyName, setNewPartyName] = useState('');
  const [isPartyFormOpen, setIsPartyFormOpen] = useState(false);
  const [newGuildName, setNewGuildName] = useState('');
  const [newGuildDescription, setNewGuildDescription] = useState('');
  const [isGuildFormOpen, setIsGuildFormOpen] = useState(false);
  const [guildSearchQuery, setGuildSearchQuery] = useState('');
  const [guildSearchResults, setGuildSearchResults] = useState<Guild[]>([]);
  const [editingGuildId, setEditingGuildId] = useState<number | null>(null);
  const [editGuildName, setEditGuildName] = useState('');
  const [editGuildDescription, setEditGuildDescription] = useState('');
  const [guildMissionTitle, setGuildMissionTitle] = useState('');
  const [guildMissionDetail, setGuildMissionDetail] = useState('');
  const [guildMissionDate, setGuildMissionDate] = useState(getLocalDateValue());
  const [guildMissionTime, setGuildMissionTime] = useState(getLocalTimeValue());
  const activeDifficulty = authUser?.difficulty ?? 'easy';
  const availableMissions = authSession
    ? missions.filter((mission) => !mission.difficulty || mission.difficulty === activeDifficulty)
    : missions;
  const completedMissions = availableMissions.filter((mission) => mission.completed).length;
  const userLevel = progression?.character?.level ?? authUser?.stats?.level ?? authUser?.level ?? 12;
  const userExperience = progression?.character?.experience ?? authUser?.stats?.experience ?? authUser?.experience ?? 0;
  const nextLevelExperience =
    progression?.character?.experience_to_next_level
      ?? authUser?.stats?.experience_to_next_level
      ?? authUser?.experience_to_next_level
      ?? 100;
  const levelProgress = getLevelProgress(userExperience, userLevel, nextLevelExperience);
  const activeDifficultyConfig = difficultyConfigs.find((item) => item.difficulty === activeDifficulty);
  const userProfile = authUser?.profile;
  const skillRadarAxes = getSkillRadarAxes(authUser?.skills);
  const statRadarAxes = getStatRadarAxes(authUser?.stats);
  const categoryMissions = availableMissions.filter((mission) => missionCategory === 'all' || (mission.category || 'system') === missionCategory);
  const frequencyMissions = categoryMissions.filter((mission) => (mission.frequency || 'daily') === missionFrequency);
  const visibleMissions = frequencyMissions.filter((mission) => {
    if (missionFilter === 'active') return !mission.completed && !mission.failed;
    if (missionFilter === 'failed') return Boolean(mission.failed);
    if (missionFilter === 'completed') return mission.completed;
    return true;
  });
  const selectedCompletedMissions = frequencyMissions.filter((mission) => mission.completed).length;
  const selectedFailedMissions = frequencyMissions.filter((mission) => mission.failed).length;
  const selectedMissionXp = frequencyMissions.reduce(
    (total, mission) => total + (mission.completed && mission.reward.type === 'xp' ? mission.reward.amount : 0),
    0,
  );

  function formatMissionFrequencyLabel(value: 'daily' | 'weekly' | 'monthly') {
    if (value === 'weekly') return 'Mingguan';
    if (value === 'monthly') return 'Bulanan';
    return 'Harian';
  }

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      try {
        const token = await getSessionToken();
        if (!token) return;
        const rememberValue = Platform.OS === 'web'
          ? window.localStorage.getItem('auth_remembered')
          : await SecureStore.getItemAsync('auth_remembered');
        if (rememberValue === 'false' && !hasStartedSessionRuntime()) {
          if (Platform.OS === 'web') {
            window.localStorage.removeItem('auth_token');
            window.localStorage.removeItem('auth_remembered');
          } else {
            await SecureStore.deleteItemAsync('auth_token');
            await SecureStore.deleteItemAsync('auth_remembered');
          }
          return;
        }
        markSessionRuntimeStarted();
        setSessionToken(token);

        try {
          const result = await getCurrentUser(token);
          if (isMounted) {
            setAuthSession({ token, user: result.user, message: result.message });
            setAuthUser(result.user);
          }
          try {
            const progressionResult = await getProgression(token);
            const requiredStep = getRequiredOnboardingStep(result.user, progressionResult.data);
            if (isMounted) setOnboardingStep(requiredStep);
            if (!requiredStep) await markOnboardingCompleted(result.user.id);
          } catch {
            // Keep the existing session flow if onboarding status cannot be checked.
          }
        } catch (error) {
          if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
            if (Platform.OS === 'web') {
              window.localStorage.removeItem('auth_token');
            } else {
              await SecureStore.deleteItemAsync('auth_token');
            }
          clearSessionToken();
          } else if (isMounted) {
            setAuthError(
              error instanceof Error
                ? `Sesi tersimpan belum dapat dipulihkan. ${error.message}`
                : 'Sesi tersimpan belum dapat dipulihkan. Periksa koneksi ke backend.',
            );
          }
        }
      } catch {
        if (isMounted) {
          setAuthError('Penyimpanan sesi aman tidak dapat dibuka. Silakan masuk kembali.');
        }
      } finally {
        if (isMounted) setAuthReady(true);
      }
    }

    void restoreSession();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!authSession) return;
    const token = authSession.token;
    let isMounted = true;

    async function loadMissions() {
      setHasLoadedMissions(false);
      setIsMissionLoading(true);
      try {
        const result = await getMissions(token);
        if (isMounted) {
          setMissions(result.missions);
          applyMissionStats(result.stats);
          setMissionError('');
        }
      } catch (error) {
        if (isMounted) {
          setMissionError(error instanceof Error ? error.message : 'Misi belum dapat dimuat.');
        }
      } finally {
        if (isMounted) {
          setIsMissionLoading(false);
          setHasLoadedMissions(true);
        }
      }
    }

    void loadMissions();
    return () => {
      isMounted = false;
    };
  }, [authSession]);

  useEffect(() => {
    if (!authSession) return;
    const token = authSession.token;
    let isMounted = true;

    async function loadFinance() {
      try {
        const [summaryResult, transactionsResult] = await Promise.all([
          getFinanceSummary(token),
          getFinanceTransactions(token),
        ]);
        if (isMounted) {
          setFinance(summaryResult);
          setFinanceTransactions(transactionsResult.transactions);
          setFinanceError('');
        }
      } catch (error) {
        if (isMounted) setFinanceError(error instanceof Error ? error.message : 'Data dompet belum dapat dimuat.');
      }
    }

    void loadFinance();
    return () => {
      isMounted = false;
    };
  }, [authSession]);

  useFocusEffect(useCallback(() => {
    if (!authSession) return undefined;
    let isMounted = true;
    void Promise.all([
      getCurrentUser(authSession.token),
      getProgression(authSession.token),
      getMissions(authSession.token),
    ]).then(([profileResult, progressionResult, missionsResult]) => {
      if (!isMounted) return;
      setAuthUser(profileResult.user);
      setProgression(progressionResult.data);
      setMissions(missionsResult.missions);
      applyMissionStats(missionsResult.stats);
      setMissionError('');
    }).catch(() => {
      // The existing dashboard data remains visible if a focus refresh fails.
    });
    return () => {
      isMounted = false;
    };
  }, [authSession]));

  useEffect(() => {
    if (!authSession) return;
    const token = authSession.token;
    let isMounted = true;

    async function loadRpgCore() {
      try {
        const [difficultyResult, historyResult, progressionResult] = await Promise.all([
          getDifficultyConfigs(token),
          getExperienceHistory(token),
          getProgression(token),
        ]);
        if (isMounted) {
          setDifficultyConfigs(difficultyResult.data);
          setExperienceHistory(historyResult.data);
          setProgression(progressionResult.data);
          setDifficultyError('');
        }
      } catch (error) {
        if (isMounted) {
          setDifficultyError(error instanceof Error ? error.message : 'Data progression belum dapat dimuat.');
        }
      }
    }

    void loadRpgCore();
    return () => {
      isMounted = false;
    };
  }, [authSession]);

  useEffect(() => {
    if (!authSession) return;
    const token = authSession.token;
    let isMounted = true;

    async function loadConnectedData() {
      try {
        const affiliateResult = await getAffiliateProfile(token);
        if (isMounted) {
          setAffiliateProfile(affiliateResult.affiliate);
        }
      } catch (error) {
        if (isMounted) {
          setTodoError(error instanceof Error ? error.message : 'Data to-do belum dapat dimuat.');
        }
      }
    }

    void loadConnectedData();
    return () => {
      isMounted = false;
    };
  }, [authSession]);

  useEffect(() => {
    if (!authSession) return;
    const token = authSession.token;
    let isMounted = true;

    async function loadSocial() {
      setIsSocialLoading(true);
      try {
        const [friendsResult, partiesResult, guildsResult] = await Promise.all([
          getFriends(token),
          getParties(token),
          getGuilds(token),
        ]);
        if (isMounted) {
          setFriends(friendsResult.friends);
          setFriendRequests(friendsResult.requests);
          setParties(partiesResult.parties);
          setGuilds(guildsResult.guilds);
          setGuildInvitations(guildsResult.invitations);
          setGuildJoinRequests(guildsResult.join_requests || []);
          setSocialError('');
        }
      } catch (error) {
        if (isMounted) {
          setSocialError(error instanceof Error ? error.message : 'Data sosial belum dapat dimuat.');
        }
      } finally {
        if (isMounted) setIsSocialLoading(false);
      }
    }

    void loadSocial();
    return () => {
      isMounted = false;
    };
  }, [authSession]);

  useEffect(() => {
    if (!authSession) return;
    const token = authSession.token;
    let isMounted = true;

    async function loadInventory() {
      setIsInventoryLoading(true);
      try {
        const result = await getInventory(token);
        if (isMounted) {
          setInventory(result);
          setInventoryError('');
        }
      } catch (error) {
        if (isMounted) {
          setInventoryError(
            error instanceof Error ? error.message : 'Inventaris belum dapat dimuat.',
          );
        }
      } finally {
        if (isMounted) setIsInventoryLoading(false);
      }
    }

    void loadInventory();
    return () => {
      isMounted = false;
    };
  }, [authSession]);

  async function handleAuthenticated(session: AuthSession, rememberMe = true) {
    markSessionRuntimeStarted();
    setSessionToken(session.token);
    if (Platform.OS === 'web') {
      window.localStorage.setItem('auth_token', session.token);
      window.localStorage.setItem('auth_remembered', String(rememberMe));
    } else {
      await SecureStore.setItemAsync('auth_token', session.token);
      await SecureStore.setItemAsync('auth_remembered', String(rememberMe));
    }
    setAuthSession(session);
    setAuthUser(session.user);
    setIsGuest(false);
    setAuthError('');
    try {
      const progressionResult = await getProgression(session.token);
      const requiredStep = getRequiredOnboardingStep(session.user, progressionResult.data);
      setOnboardingStep(requiredStep);
      if (!requiredStep) await markOnboardingCompleted(session.user.id);
    } catch {
      // Keep the existing session flow if onboarding status cannot be checked.
      setOnboardingStep(null);
    }
  }

  async function handleOnboardingReligion(religion: Religion) {
    if (!authSession) return;
    await updateProfile(authSession.token, { religion });
    const profileResult = await getCurrentUser(authSession.token);
    setAuthUser(profileResult.user);
    setAuthSession((current) => current ? { ...current, user: profileResult.user } : current);
    setOnboardingStep('difficulty');
  }

  async function handleOnboardingDifficulty(difficulty: Difficulty) {
    if (!authSession) return;
    await updateDifficulty(authSession.token, difficulty);
    const [profileResult, progressionResult] = await Promise.all([
      getCurrentUser(authSession.token),
      getProgression(authSession.token),
    ]);
    setAuthUser(profileResult.user);
    setAuthSession((current) => current ? { ...current, user: profileResult.user } : current);
    setProgression(progressionResult.data);
    setOnboardingStep('class');
  }

  async function finishOnboarding() {
    if (!authSession) return;
    const profileResult = await getCurrentUser(authSession.token);
    setAuthUser(profileResult.user);
    setAuthSession((current) => current ? { ...current, user: profileResult.user } : current);
    await markOnboardingCompleted(profileResult.user.id);
    setOnboardingStep(null);
  }

  async function handleDifficultyChange(difficulty: Difficulty) {
    if (!authSession || authUser?.difficulty === difficulty || isDifficultySaving) return;
    setIsDifficultySaving(true);
    try {
      await updateDifficulty(authSession.token, difficulty);
      const [profileResult, progressionResult] = await Promise.all([
        getCurrentUser(authSession.token),
        getProgression(authSession.token),
      ]);
      setAuthUser(profileResult.user);
      setAuthSession((current) => current ? { ...current, user: profileResult.user } : current);
      setProgression(progressionResult.data);
      setDifficultyError('');
    } catch (error) {
      setDifficultyError(error instanceof Error ? error.message : 'Difficulty belum dapat diperbarui.');
    } finally {
      setIsDifficultySaving(false);
    }
  }

  async function handleLogout() {
    clearSessionToken();
    try {
      if (Platform.OS === 'web') {
        window.localStorage.removeItem('auth_token');
      window.localStorage.removeItem('auth_remembered');
      } else {
        await SecureStore.deleteItemAsync('auth_token');
      await SecureStore.deleteItemAsync('auth_remembered');
      }
    } catch {
      setAuthError('Token sesi tidak dapat dihapus dari penyimpanan perangkat.');
      return;
    }
    setAuthSession(null);
    setAuthUser(null);
    setOnboardingStep(null);
    setInventory({ items: [], badges: [], totals: { items: 0, badges: 0 } });
    setProgression(null);
    setAffiliateProfile(null);
    setTodos([]);
    setTodoTitle('');
    setTodoDescription('');
    setTodoDueDate('');
    applyMissionStats();
    setFriends([]);
    setFriendRequests([]);
    setParties([]);
    setGuilds([]);
    setGuildInvitations([]);
    setIsGuest(false);
    setActiveTab('Beranda');
  }

  async function handleCreateTodo() {
    if (!authSession || !todoTitle.trim()) {
      setTodoError('Judul to-do wajib diisi.');
      return;
    }
    try {
      const result = await createTodo(
        authSession.token,
        todoTitle.trim(),
        todoDueDate.trim() || undefined,
        todoDescription.trim() || undefined,
      );
      setTodos((current) => [...current, result.todo]);
      const missionsResult = await getMissions(authSession.token);
      setMissions(missionsResult.missions);
      applyMissionStats(missionsResult.stats);
      setTodoTitle('');
      setTodoDescription('');
      setTodoDueDate('');
      setTodoError('');
    } catch (error) {
      setTodoError(error instanceof Error ? error.message : 'To-do belum dapat dibuat.');
    }
  }

  async function handleCreatePersonalMission() {
    if (!authSession || personalMissionTitle.trim().length < 2) {
      setPersonalMissionError('Judul misi pribadi minimal 2 karakter.');
      return;
    }
    try {
      await createCustomMission(authSession.token, {
        title: personalMissionTitle.trim(),
        detail: personalMissionDetail.trim() || undefined,
        mission_date: personalMissionDate,
        scheduled_time: personalMissionTime,
      });
      const missionsResult = await getMissions(authSession.token);
      setMissions(missionsResult.missions);
      applyMissionStats(missionsResult.stats);
      setPersonalMissionTitle('');
      setPersonalMissionDetail('');
      setPersonalMissionDate(getLocalDateValue());
      setPersonalMissionTime(getLocalTimeValue());
      setPersonalMissionError('');
      setMissionComposerType(null);
      setIsMissionComposerOpen(false);
    } catch (error) {
      setPersonalMissionError(error instanceof Error ? error.message : 'Misi pribadi belum dapat dibuat.');
    }
  }

  async function handleToggleTodo(todo: Todo) {
    if (!authSession) return;
    const status = todo.status === 'completed' ? 'pending' : 'completed';
    try {
      const result = await updateTodo(authSession.token, todo.id, { status });
      setTodos((current) => current.map((item) => (item.id === todo.id ? result.todo : item)));
      const missionsResult = await getMissions(authSession.token);
      setMissions(missionsResult.missions);
      applyMissionStats(missionsResult.stats);
      setTodoError('');
    } catch (error) {
      setTodoError(error instanceof Error ? error.message : 'Status to-do gagal diperbarui.');
    }
  }

  async function handleDeleteTodo(todoId: number) {
    if (!authSession) return;
    try {
      await deleteTodo(authSession.token, todoId);
      setTodos((current) => current.filter((todo) => todo.id !== todoId));
      const missionsResult = await getMissions(authSession.token);
      setMissions(missionsResult.missions);
      applyMissionStats(missionsResult.stats);
      setTodoError('');
    } catch (error) {
      setTodoError(error instanceof Error ? error.message : 'To-do gagal dihapus.');
    }
  }

  async function handleRemoveFriend(userId: number) {
    if (!authSession) return;
    try {
      await removeFriend(authSession.token, userId);
      await refreshSocial();
      setSocialError('');
    } catch (error) {
      setSocialError(error instanceof Error ? error.message : 'Teman gagal dihapus.');
    }
  }

  async function handleAddPartyMember(partyId: number, userId: number) {
    if (!authSession) return;
    try {
      await addPartyMember(authSession.token, partyId, userId);
      await refreshSocial();
      setSocialError('Teman berhasil ditambahkan ke party.');
    } catch (error) {
      setSocialError(error instanceof Error ? error.message : 'Teman gagal ditambahkan ke party.');
    }
  }

  async function handleRemovePartyMember(partyId: number, userId: number) {
    if (!authSession) return;
    try {
      await removePartyMember(authSession.token, partyId, userId);
      await refreshSocial();
      setSocialError('Anggota berhasil dikeluarkan dari party.');
    } catch (error) {
      setSocialError(error instanceof Error ? error.message : 'Anggota party gagal dikeluarkan.');
    }
  }

  async function refreshSocial() {
    if (!authSession) return;
    const [friendsResult, partiesResult, guildsResult] = await Promise.all([
      getFriends(authSession.token),
      getParties(authSession.token),
      getGuilds(authSession.token),
    ]);
    setFriends(friendsResult.friends);
    setFriendRequests(friendsResult.requests);
    setParties(partiesResult.parties);
    setGuilds(guildsResult.guilds);
    setGuildInvitations(guildsResult.invitations);
    setGuildJoinRequests(guildsResult.join_requests || []);
  }

  useEffect(() => {
    if (!authSession || (activeTab !== 'Guild' && activeTab !== 'Pertemanan')) return;
    void refreshSocial();
    // Refresh the social data when the user opens the Guild or Pertemanan page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, authSession?.token]);

  async function handleCreateFinanceTransaction() {
    if (!authSession) return;
    const amount = Number(financeAmount.replace(/[^0-9]/g, ''));
    if (!amount || amount < 1) {
      setFinanceFormError('Masukkan nominal transaksi yang valid.');
      return;
    }
    if (!financeCategory.trim()) {
      setFinanceFormError('Kategori transaksi wajib diisi.');
      return;
    }
    if (financeType === 'transfer' && (!financeFromAccountId || !financeToAccountId || financeFromAccountId === financeToAccountId)) {
      setFinanceFormError('Pilih akun asal dan tujuan yang berbeda.');
      return;
    }

    setIsFinanceSaving(true);
    setFinanceFormError('');
    try {
      if (editingFinanceTransaction) {
        await updateFinanceTransaction(authSession.token, editingFinanceTransaction.id, {
          type: financeType,
          amount,
          account_id: financeType === 'transfer' ? financeFromAccountId || undefined : financeAccountId || undefined,
          from_account_id: financeType === 'transfer' ? financeFromAccountId || undefined : undefined,
          to_account_id: financeType === 'transfer' ? financeToAccountId || undefined : undefined,
          category: financeCategory.trim(),
          description: financeDescription.trim() || null,
        });
      } else {
        if (!financeAccountId) {
          setFinanceFormError('Pilih akun transaksi terlebih dahulu.');
          return;
        }
        await createFinanceTransaction(authSession.token, {
          type: financeType,
          amount,
          account_id: financeType === 'transfer' ? undefined : financeAccountId || undefined,
          from_account_id: financeType === 'transfer' ? financeFromAccountId || undefined : undefined,
          to_account_id: financeType === 'transfer' ? financeToAccountId || undefined : undefined,
          category: financeCategory.trim(),
          description: financeDescription.trim() || null,
        });
      }
      const [summaryResult, transactionsResult] = await Promise.all([
        getFinanceSummary(authSession.token),
        getFinanceTransactions(authSession.token),
      ]);
      setFinance(summaryResult);
      setFinanceTransactions(transactionsResult.transactions);
      setFinanceAmount('');
      setFinanceCategory('');
      setFinanceDescription('');
      setFinanceAccountId(null);
      setFinanceFromAccountId(null);
      setFinanceToAccountId(null);
      setEditingFinanceTransaction(null);
      setIsFinanceModalOpen(false);
    } catch (error) {
      setFinanceFormError(error instanceof Error ? error.message : 'Transaksi belum dapat disimpan.');
    } finally {
      setIsFinanceSaving(false);
    }
  }

  async function handleSocialSearch() {
    if (!authSession || socialSearch.trim().length < 2) {
      setSocialError('Masukkan minimal 2 karakter untuk mencari pengguna.');
      setSocialSearchResults([]);
      return;
    }
    try {
      const result = await searchUsers(authSession.token, socialSearch.trim());
      setSocialSearchResults(result.users);
      setSocialError('');
    } catch (error) {
      setSocialError(error instanceof Error ? error.message : 'Pencarian pengguna gagal.');
    }
  }

  async function handleSendFriendRequest(userId: number, incomingRequestId?: number | null) {
    if (!authSession) return;
    try {
      const result = incomingRequestId
        ? await respondFriendRequest(authSession.token, incomingRequestId, 'accept').then(() => ({ data: { status: 'friends' as const } }))
        : await sendFriendRequest(authSession.token, userId);
      const status = result.data?.status || 'request_sent';
      setSocialError(incomingRequestId || status === 'friends' ? 'Kalian sekarang sudah berteman.' : 'Permintaan pertemanan berhasil dikirim.');
      setSocialSearchResults((results) => results.map((user) => (
        user.id === userId ? { ...user, relationship_status: status } : user
      )));
      await refreshSocial();
    } catch (error) {
      setSocialError(error instanceof Error ? error.message : 'Permintaan pertemanan gagal.');
    }
  }

  async function handleFriendRequest(requestId: number, action: 'accept' | 'reject') {
    if (!authSession) return;
    try {
      await respondFriendRequest(authSession.token, requestId, action);
      await refreshSocial();
      setSocialError('');
    } catch (error) {
      setSocialError(error instanceof Error ? error.message : 'Permintaan pertemanan gagal diproses.');
    }
  }

  async function handleCreateParty() {
    if (!authSession || !newPartyName.trim()) {
      setSocialError('Nama party wajib diisi.');
      return;
    }
    try {
      await createParty(authSession.token, newPartyName.trim());
      setNewPartyName('');
      setIsPartyFormOpen(false);
      await refreshSocial();
      setSocialError('Party berhasil dibuat.');
    } catch (error) {
      setSocialError(error instanceof Error ? error.message : 'Party belum dapat dibuat.');
    }
  }

  async function handleCreateGuild() {
    if (!authSession || newGuildName.trim().length < 2) {
      setSocialError('Nama guild minimal 2 karakter.');
      return;
    }
    try {
      await createGuild(authSession.token, newGuildName.trim(), newGuildDescription.trim());
      setNewGuildName('');
      setNewGuildDescription('');
      setIsGuildFormOpen(false);
      await refreshSocial();
      setSocialError('Guild berhasil dibuat.');
    } catch (error) {
      setSocialError(error instanceof Error ? error.message : 'Guild belum dapat dibuat.');
    }
  }

  async function handleSearchGuilds() {
    if (!authSession || guildSearchQuery.trim().length < 2) {
      setSocialError('Masukkan minimal 2 karakter untuk mencari guild.');
      setGuildSearchResults([]);
      return;
    }
    try {
      const result = await searchGuilds(authSession.token, guildSearchQuery.trim());
      setGuildSearchResults(result.guilds);
      setSocialError('');
    } catch (error) {
      setSocialError(error instanceof Error ? error.message : 'Pencarian guild gagal.');
    }
  }

  async function handleRequestGuildJoin(guildId: number) {
    if (!authSession) return;
    try {
      await requestGuildJoin(authSession.token, guildId);
      setGuildSearchResults((results) => results.map((guild) => (
        guild.id === guildId ? { ...guild, has_pending_request: 1 } : guild
      )));
      setSocialError('Permintaan bergabung berhasil dikirim.');
    } catch (error) {
      setSocialError(error instanceof Error ? error.message : 'Permintaan bergabung gagal dikirim.');
    }
  }

  async function handleGuildJoinRequest(requestId: number, action: 'accept' | 'reject') {
    if (!authSession) return;
    try {
      await respondGuildJoinRequest(authSession.token, requestId, action);
      await refreshSocial();
      setSocialError(action === 'accept' ? 'Permintaan bergabung disetujui.' : 'Permintaan bergabung ditolak.');
    } catch (error) {
      setSocialError(error instanceof Error ? error.message : 'Permintaan bergabung gagal diproses.');
    }
  }

  async function handleUpdateGuild() {
    if (!authSession || !editingGuildId) return;
    if (editGuildName.trim().length < 2) {
      setSocialError('Nama guild minimal 2 karakter.');
      return;
    }
    try {
      await updateGuild(authSession.token, editingGuildId, {
        name: editGuildName.trim(),
        description: editGuildDescription.trim() || undefined,
      });
      await refreshSocial();
      setEditingGuildId(null);
      setSocialError('Guild berhasil diperbarui.');
    } catch (error) {
      setSocialError(error instanceof Error ? error.message : 'Guild belum dapat diperbarui.');
    }
  }

  async function handleCreateGuildMission(guildId: number) {
    if (!authSession || guildMissionTitle.trim().length < 2) {
      setSocialError('Judul misi guild minimal 2 karakter.');
      return;
    }
    try {
      await createGuildMission(authSession.token, guildId, {
        title: guildMissionTitle.trim(),
        detail: guildMissionDetail.trim() || undefined,
        mission_date: guildMissionDate,
        scheduled_time: guildMissionTime,
        difficulty: 'normal',
        target_progress: 5,
      });
      setGuildMissionTitle('');
      setGuildMissionDetail('');
      setGuildMissionDate(getLocalDateValue());
      setGuildMissionTime(getLocalTimeValue());
      setMissionComposerType(null);
      setIsMissionComposerOpen(false);
      await refreshSocial();
      setSocialError('Misi guild berhasil dibuat.');
    } catch (error) {
      setSocialError(error instanceof Error ? error.message : 'Misi guild belum dapat dibuat.');
    }
  }

  async function handleContributeGuildMission(guildId: number, missionId: number) {
    if (!authSession) return;
    try {
      const result = await contributeGuildMission(authSession.token, guildId, missionId);
      await refreshSocial();
      setSocialError(result.data.completed ? 'Misi guild selesai.' : `Progress bertambah ${result.data.applied}.`);
    } catch (error) {
      setSocialError(error instanceof Error ? error.message : 'Progress misi guild gagal ditambahkan.');
    }
  }

  async function handleGuildInvitation(invitationId: number, action: 'accept' | 'reject') {
    if (!authSession) return;
    try {
      await respondGuildInvitation(authSession.token, invitationId, action);
      await refreshSocial();
      setSocialError('');
    } catch (error) {
      setSocialError(error instanceof Error ? error.message : 'Undangan guild gagal diproses.');
    }
  }

  async function handleInviteToGuild(guildId: number, userId: number) {
    if (!authSession) return;
    try {
      await inviteToGuild(authSession.token, guildId, userId);
      setSocialError('Undangan guild berhasil dikirim.');
    } catch (error) {
      setSocialError(error instanceof Error ? error.message : 'Undangan guild gagal dikirim.');
    }
  }

  async function toggleMission(id: number): Promise<{ completed: boolean; reward: MissionReward | null }> {
    if (!authSession) {
      setMissions((currentMissions) =>
        currentMissions.map((mission) =>
          mission.id === id ? { ...mission, completed: !mission.completed } : mission,
        ),
      );
      return { completed: true, reward: null };
    }

    const previousMissions = missions;
    setMissions((currentMissions) =>
      currentMissions.map((mission) =>
        mission.id === id ? { ...mission, completed: !mission.completed } : mission,
      ),
    );
    try {
      const result = await toggleMissionApi(authSession.token, id);
      setMissions((currentMissions) =>
        currentMissions.map((mission) => (mission.id === id ? result.mission : mission)),
      );
      setMissionError('');
      return { completed: true, reward: result.reward_granted ? result.granted_reward : null };
    } catch (error) {
      setMissions(previousMissions);
      setMissionError(error instanceof Error ? error.message : 'Status misi gagal diperbarui.');
      return { completed: false, reward: null };
    }
  }

  function openMissionDetails(mission: Mission) {
    if (mission.todo_id) {
      const todo = todos.find((item) => item.id === mission.todo_id);
      if (todo) void handleToggleTodo(todo);
      return;
    }
    if (mission.guild_mission_id && mission.guild_id) {
      void handleContributeGuildMission(mission.guild_id, mission.guild_mission_id);
      return;
    }
    setSelectedMission(mission);
  }

  async function completeSelectedMission(id: number) {
    const result = await toggleMission(id);
    if (result.completed) {
      setSelectedMission(null);
      if (result.reward?.type === 'skill') setUnlockedSkill(result.reward);
      if (authSession) {
        try {
          const [profileResult, inventoryResult, missionsResult, historyResult, progressionResult] = await Promise.all([
            getCurrentUser(authSession.token),
            getInventory(authSession.token),
            getMissions(authSession.token),
            getExperienceHistory(authSession.token),
            getProgression(authSession.token),
          ]);
          setAuthUser(profileResult.user);
          setInventory(inventoryResult);
          setMissions(missionsResult.missions);
          applyMissionStats(missionsResult.stats);
          setExperienceHistory(historyResult.data);
          setProgression(progressionResult.data);
        } catch (error) {
          setMissionError(
            error instanceof Error ? error.message : 'Data karakter belum dapat diperbarui.',
          );
        }
      }
    }
  }

  async function cancelSelectedMission(id: number) {
    if (!authSession) {
      setMissions((currentMissions) =>
        currentMissions.map((mission) =>
          mission.id === id ? { ...mission, completed: false } : mission,
        ),
      );
      setSelectedMission(null);
      return;
    }

    try {
      await cancelMissionApi(authSession.token, id);
      setMissions((currentMissions) =>
        currentMissions.map((mission) =>
          mission.id === id ? { ...mission, completed: false, completed_at: null } : mission,
        ),
      );
      setSelectedMission(null);
      const [profileResult, inventoryResult, missionsResult, historyResult, progressionResult] = await Promise.all([
        getCurrentUser(authSession.token),
        getInventory(authSession.token),
        getMissions(authSession.token),
        getExperienceHistory(authSession.token),
        getProgression(authSession.token),
      ]);
      setAuthUser(profileResult.user);
      setInventory(inventoryResult);
      setMissions(missionsResult.missions);
      applyMissionStats(missionsResult.stats);
      setExperienceHistory(historyResult.data);
      setProgression(progressionResult.data);
      setMissionError('');
    } catch (error) {
      setMissionError(error instanceof Error ? error.message : 'Pembatalan misi gagal.');
    }
  }

  if (!authReady) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#101116]">
        <StatusBar style="light" />
        <FontAwesomeIcon icon={faShieldHalved} size={30} color="#e7bd68" />
        <Text className="mt-4 text-sm font-semibold text-[#c5beb0]">Memeriksa sesi guild...</Text>
      </SafeAreaView>
    );
  }

  if (authSession && onboardingStep) {
    return (
      <OnboardingScreen
        token={authSession.token}
        step={onboardingStep}
        onReligionSelected={handleOnboardingReligion}
        onDifficultySelected={handleOnboardingDifficulty}
        onCompleted={finishOnboarding}
        onBackToLogin={handleLogout}
      />
    );
  }

  if (!authSession && !isGuest) {
    return (
      <AuthScreen
        initialError={authError}
        onAuthenticated={handleAuthenticated}
        onContinueAsGuest={() => setIsGuest(true)}
      />
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#101116]" edges={['top', 'left', 'right']}>
      <StatusBar style="light" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 12, paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'Beranda' ? (
          <>
        {missionError ? <Text className="mb-3 text-xs text-[#f1a39a]">{missionError}</Text> : null}
        <View className="mb-7 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="mr-3 h-12 w-12 items-center justify-center rounded-2xl border border-[#66522c] bg-[#282317]">
              <FontAwesomeIcon icon={faShieldHalved} size={21} color="#e7bd68" />
            </View>
            <View>
              <Text className="text-[11px] font-bold uppercase tracking-[2px] text-[#8d8b91]">
                GUILD PETUALANG
              </Text>
              <Text className="mt-1 text-lg font-extrabold text-[#f5f0e6]">
                {authUser ? `Halo, ${authUser.name.split(' ')[0]}!` : 'Selamat pagi!'}
              </Text>
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Lihat notifikasi"
            className="h-11 w-11 items-center justify-center rounded-full border border-[#2c2d34] bg-[#1b1c22]"
          >
            <FontAwesomeIcon icon={faFire} size={18} color="#e7bd68" />
            <View className="absolute right-[9px] top-[8px] h-2 w-2 rounded-full border border-[#1b1c22] bg-[#e87959]" />
          </Pressable>
        </View>

        <View className="mb-5 overflow-hidden rounded-[28px] border border-[#5a482a] bg-[#242118] p-5">
          <View className="mb-5 flex-row items-start justify-between">
            <View className="flex-1">
              <View className="mb-3 self-start rounded-full border border-[#5d4a29] bg-[#342b1b] px-3 py-1">
                <Text className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#e7bd68]">
                  Petualangan hari ini
                </Text>
              </View>
              <Text className="text-[25px] font-black leading-[31px] text-[#fff8e9]">
                Jadikan hari ini{'\n'}sebuah legenda.
              </Text>
              <Text className="mt-2 text-sm leading-5 text-[#aaa49a]">
                Satu misi kecil adalah langkah menuju kemenangan.
              </Text>
            </View>
            <View className="ml-2 mt-1 h-12 w-12 items-center justify-center rounded-2xl bg-[#3a3020]">
              <FontAwesomeIcon icon={faCompass} size={22} color="#e7bd68" />
            </View>
          </View>

        </View>

        <View className="mb-6">
          <Text className="mb-3 text-xl font-extrabold text-[#f5f0e6]">Menu petualangan</Text>
          <View className="flex-row flex-wrap gap-y-3">
            <HomeMenuCard
              icon={faFlag}
              label="Misi"
              accessibilityLabel="Buka menu Misi"
              onPress={() => setActiveTab('Misi')}
            />
            <HomeMenuCard
              icon={faBookOpen}
              label="Jurnal"
              accessibilityLabel="Buka menu Jurnal"
              onPress={() => setActiveTab('Jurnal')}
            />
            <HomeMenuCard
              icon={faUsers}
              label="Guild"
              accessibilityLabel="Buka menu Guild"
              onPress={() => setActiveTab('Guild')}
            />
            <HomeMenuCard
              icon={faUserGroup}
              label="Pertemanan"
              accessibilityLabel="Buka menu Pertemanan"
              onPress={() => setActiveTab('Pertemanan')}
            />
            <HomeMenuCard
              icon={faScroll}
              label="Inventaris"
              accessibilityLabel="Buka menu Inventaris"
              onPress={() => setActiveTab('Inventaris')}
            />
            <HomeMenuCard
              icon={faWallet}
              label="Dompet"
              accessibilityLabel="Buka menu Dompet"
              onPress={() => setActiveTab('Dompet')}
            />
            <HomeMenuCard
              icon={faStore}
              label="Belanja"
              accessibilityLabel="Buka menu Belanja"
              onPress={() => setActiveTab('Belanja')}
            />
          </View>
        </View>

        <View className="mb-7 gap-3">
          <RadarCard
            title="Kemampuan"
            description="Kemampuan yang telah terbuka."
            axes={skillRadarAxes}
            emptyMessage="Selesaikan misi ber-reward kemampuan untuk membuka data radar."
            accent="#8cbf9a"
          />
          <RadarCard
            title="Statistik"
            description="Atribut utama karakter petualangmu."
            axes={statRadarAxes}
            accent="#e7bd68"
          />
        </View>

          </>
        ) : activeTab === 'Misi' ? (
          <>
            <View className="mb-6">
              <Text className="text-2xl font-black text-[#f5f0e6]">Papan Misi</Text>
              <Text className="mt-2 text-sm leading-5 text-[#929097]">
                Selesaikan tantanganmu dan kumpulkan XP untuk naik level.
              </Text>
              {authSession ? (
                <Text className="mt-2 text-xs font-bold text-[#e7bd68]">
                  Difficulty aktif: {formatDifficulty(activeDifficulty)} · hanya misi {formatDifficulty(activeDifficulty)} yang ditampilkan.
                </Text>
              ) : null}
            </View>

            <View className="mb-4 flex-row rounded-2xl border border-[#34353d] bg-[#1b1c22] p-1">
              {(['daily', 'weekly', 'monthly'] as const).map((frequency) => (
                <Pressable
                  key={frequency}
                  accessibilityRole="button"
                  onPress={() => {
                    setMissionFrequency(frequency);
                    setMissionFilter('all');
                  }}
                  className={`flex-1 rounded-xl px-2 py-3 ${
                    missionFrequency === frequency ? 'bg-[#342b1b]' : 'bg-transparent'
                  }`}
                >
                  <Text
                    className={`text-center text-xs font-extrabold ${
                      missionFrequency === frequency ? 'text-[#e7bd68]' : 'text-[#85838a]'
                    }`}
                  >
                    {formatMissionFrequencyLabel(frequency)}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View className="mb-5 flex-row gap-2">
              {(['all', 'system', 'personal', 'guild'] as const).map((category) => (
                <Pressable
                  key={category}
                  accessibilityRole="button"
                  onPress={() => setMissionCategory(category)}
                  className={`rounded-full border px-3 py-2 ${
                    missionCategory === category
                      ? 'border-[#e7bd68] bg-[#342b1b]'
                      : 'border-[#34353d] bg-[#1b1c22]'
                  }`}
                >
                  <Text
                    className={`text-[10px] font-bold ${
                      missionCategory === category ? 'text-[#e7bd68]' : 'text-[#85838a]'
                    }`}
                  >
                    {category === 'all'
                      ? 'Semua'
                      : category === 'system'
                        ? 'Sistem'
                        : category === 'personal'
                          ? 'Pribadi'
                          : 'Guild'}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View className="mb-6 rounded-2xl border border-[#5a482a] bg-[#242118] p-4">
              <View className="mb-3 flex-row items-center">
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-[#3a3020]">
                  <FontAwesomeIcon icon={faFlag} size={17} color="#e7bd68" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-extrabold text-[#f5f0e6]">
                    Misi {formatMissionFrequencyLabel(missionFrequency).toLowerCase()}
                  </Text>
                  <Text className="mt-1 text-xs text-[#aaa49a]">
                    {selectedCompletedMissions} selesai · {selectedFailedMissions} gagal dari {frequencyMissions.length} misi
                  </Text>
                </View>
                <Text className="text-sm font-extrabold text-[#e7bd68]">
                  {selectedMissionXp}{' '}
                  XP
                </Text>
              </View>
              <View className="h-[7px] overflow-hidden rounded-full bg-[#484132]">
                <View
                  className="h-full rounded-full bg-[#e7bd68]"
                  style={{
                    width: `${frequencyMissions.length ? (selectedCompletedMissions / frequencyMissions.length) * 100 : 0}%`,
                  }}
                />
              </View>
            </View>

            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-base font-extrabold text-[#f5f0e6]">Semua tantangan</Text>
              <Text className="text-xs font-semibold text-[#85838a]">{visibleMissions.length} misi</Text>
            </View>
            <View className="mb-4 flex-row gap-2">
              {(['all', 'active', 'failed', 'completed'] as const).map((filter) => (
                <Pressable
                  key={filter}
                  accessibilityRole="button"
                  onPress={() => setMissionFilter(filter)}
                  className={`rounded-full border px-3 py-2 ${
                    missionFilter === filter
                      ? 'border-[#e7bd68] bg-[#342b1b]'
                      : 'border-[#34353d] bg-[#1b1c22]'
                  }`}
                >
                  <Text
                    className={`text-[10px] font-bold ${
                      missionFilter === filter ? 'text-[#e7bd68]' : 'text-[#85838a]'
                    }`}
                  >
                    {filter === 'all'
                      ? 'Semua'
                      : filter === 'active'
                        ? 'Aktif'
                        : filter === 'failed'
                          ? 'Gagal'
                          : 'Selesai'}
                  </Text>
                </Pressable>
              ))}
            </View>
            {authSession && isMissionLoading && !hasLoadedMissions ? (
              <Text className="py-4 text-center text-sm text-[#85838a]">Memuat data misi...</Text>
            ) : visibleMissions.length ? (
              <View className="gap-3">
                {visibleMissions.map((mission) => (
                  <MissionCard key={mission.id} mission={mission} onPress={openMissionDetails} />
                ))}
              </View>
            ) : (
              <Text className="py-4 text-center text-sm text-[#85838a]">Belum ada misi.</Text>
            )}

          </>
        ) : activeTab === 'Dompet' ? (
          <>
            <View className="mb-6">
              <Text className="text-2xl font-black text-[#f5f0e6]">Dompet Petualang</Text>
              <Text className="mt-2 text-sm leading-5 text-[#929097]">
                Pantau saldo dan perjalanan keuangan karaktermu.
              </Text>
            </View>
            {financeError ? <Text className="mb-4 rounded-xl bg-[#321f21] p-3 text-xs leading-5 text-[#f1a39a]">{financeError}</Text> : null}
            <View className="mb-4 rounded-3xl border border-[#66522c] bg-[#342b1b] p-5">
              <View className="flex-row items-center">
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-[#49391e]">
                  <FontAwesomeIcon icon={faWallet} size={18} color="#e7bd68" />
                </View>
                <Text className="text-xs font-bold uppercase tracking-[1.2px] text-[#c5a85f]">Saldo tersedia</Text>
              </View>
              <Text className="mt-5 text-3xl font-black text-[#fff8e9]">
                {formatCurrency(finance?.wallet.balance ?? 0, finance?.wallet.currency ?? 'IDR')}
              </Text>
            </View>
            <View className="mb-6 flex-row items-stretch gap-3">
              <View className="min-w-0 flex-1 rounded-2xl border border-[#314c3b] bg-[#1d2b22] p-4">
                <Text numberOfLines={1} className="text-[10px] font-bold uppercase tracking-[1px] text-[#8cbf9a]">Pemasukan</Text>
                <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75} className="mt-2 text-sm font-black text-[#d9f0df]">{formatCurrency(finance?.totals.total_income ?? 0)}</Text>
              </View>
              <View className="min-w-0 flex-1 rounded-2xl border border-[#553536] bg-[#2b2022] p-4">
                <Text numberOfLines={1} className="text-[10px] font-bold uppercase tracking-[1px] text-[#f1a39a]">Pengeluaran</Text>
                <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75} className="mt-2 text-sm font-black text-[#f5d5d0]">{formatCurrency(finance?.totals.total_expense ?? 0)}</Text>
              </View>
            </View>
            <View className="mb-6">
              <Text className="mb-3 text-base font-extrabold text-[#f5f0e6]">Akun keuangan</Text>
              <View className="gap-2">
                {(finance?.accounts ?? []).map((account) => (
                  <View key={account.id} className="flex-row items-center rounded-2xl border border-[#2d2e35] bg-[#1b1c22] p-4">
                    <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-[#342b1b]">
                      <FontAwesomeIcon icon={faWallet} size={16} color="#e7bd68" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-bold text-[#f1ede4]">{account.name}</Text>
                      <Text className="mt-1 text-xs text-[#85838a]">{account.type === 'e_wallet' ? 'E-Wallet' : account.type === 'bank' ? 'Bank' : account.type === 'cash' ? 'Kas' : 'Lainnya'}</Text>
                    </View>
                    <Text className="text-sm font-black text-[#e7bd68]">{formatCurrency(account.balance, account.currency)}</Text>
                  </View>
                ))}
              </View>
            </View>
            <Text className="mb-3 text-base font-extrabold text-[#f5f0e6]">Transaksi terbaru</Text>
            {financeTransactions.length ? financeTransactions.map((transaction) => (
              <View key={transaction.id} className="mb-2 flex-row items-center rounded-2xl border border-[#2d2e35] bg-[#1b1c22] p-4">
                <View className={`mr-3 h-9 w-9 items-center justify-center rounded-full ${transaction.type === 'income' ? 'bg-[#243027]' : transaction.type === 'transfer' ? 'bg-[#342b1b]' : 'bg-[#321f21]'}`}>
                  <FontAwesomeIcon icon={transaction.type === 'income' || transaction.type === 'transfer' ? faArrowRight : faArrowLeft} size={13} color={transaction.type === 'income' ? '#8cbf9a' : transaction.type === 'transfer' ? '#e7bd68' : '#f1a39a'} />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-[#f1ede4]">{transaction.category}</Text>
                  <Text className="mt-1 text-xs text-[#85838a]">
                    {transaction.type === 'transfer'
                      ? `${transaction.from_account_name || 'Akun asal'} → ${transaction.to_account_name || 'Akun tujuan'}`
                      : `${transaction.account_name || 'Akun keuangan'} · ${transaction.description || 'Transaksi keuangan'}`}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className={`text-xs font-black ${transaction.type === 'income' ? 'text-[#8cbf9a]' : transaction.type === 'transfer' ? 'text-[#e7bd68]' : 'text-[#f1a39a]'}`}>
                    {transaction.type === 'income' ? '+' : transaction.type === 'transfer' ? '↔ ' : '-'}{formatCurrency(transaction.amount)}
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      setEditingFinanceTransaction(transaction);
                      setFinanceType(transaction.type);
                      setFinanceAmount(String(transaction.amount));
                      setFinanceAccountId(transaction.account_id || null);
                      setFinanceFromAccountId(transaction.from_account_id || null);
                      setFinanceToAccountId(transaction.to_account_id || null);
                      setFinanceCategory(transaction.category);
                      setFinanceDescription(transaction.description || '');
                      setFinanceFormError('');
                      setIsFinanceModalOpen(true);
                    }}
                    className="mt-2 rounded-lg px-1 py-0.5"
                  >
                    <Text className="text-[10px] font-black text-[#e7bd68]">Edit</Text>
                  </Pressable>
                </View>
              </View>
            )) : (
              <Text className="rounded-2xl border border-dashed border-[#49433a] p-4 text-sm text-[#85838a]">Belum ada transaksi.</Text>
            )}
          </>
        ) : activeTab === 'Belanja' ? (
          <>
            <View className="mb-6">
              <Text className="text-2xl font-black text-[#f5f0e6]">Belanja</Text>
              <Text className="mt-2 text-sm leading-5 text-[#929097]">Perlengkapi petualanganmu dengan item yang tepat.</Text>
            </View>
            <View className="mb-4 rounded-2xl border border-[#5a482a] bg-[#242118] p-4">
              <View className="flex-row items-center">
                <FontAwesomeIcon icon={faWallet} size={17} color="#e7bd68" />
                <Text className="ml-3 flex-1 text-sm font-bold text-[#f5f0e6]">Saldo dompet</Text>
                <Text className="text-sm font-black text-[#e7bd68]">{formatCurrency(finance?.wallet.balance ?? 0, finance?.wallet.currency ?? 'IDR')}</Text>
              </View>
            </View>
            <View className="items-center rounded-3xl border border-dashed border-[#49433a] bg-[#191a1f] px-6 py-10">
              <FontAwesomeIcon icon={faStore} size={28} color="#e7bd68" />
              <Text className="mt-4 text-base font-extrabold text-[#f5f0e6]">Toko segera dibuka</Text>
              <Text className="mt-2 text-center text-xs leading-5 text-[#85838a]">Katalog item, harga, dan pembelian akan hadir di pembaruan berikutnya.</Text>
            </View>
          </>
        ) : activeTab === 'Inventaris' ? (
          <>
            <View className="mb-6">
              <Text className="text-2xl font-black text-[#f5f0e6]">Inventaris Petualang</Text>
              <Text className="mt-2 text-sm leading-5 text-[#929097]">
                Simpan item dan badge yang kamu dapatkan dari quest guild.
              </Text>
            </View>
            <InventoryPanel
              inventory={inventory}
              isLoading={isInventoryLoading}
              error={inventoryError}
            />
          </>
        ) : activeTab === 'Jurnal' ? (
          <>
            <View className="mb-6">
              <Text className="text-2xl font-black text-[#f5f0e6]">Jurnal Petualangan</Text>
              <Text className="mt-2 text-sm leading-5 text-[#929097]">
                Catatan perjalanan dan pencapaianmu.
              </Text>
            </View>

            {authSession ? (
              <View className="mb-6 rounded-2xl border border-[#5a482a] bg-[#242118] p-4">
                <View className="mb-3 flex-row items-center">
                  <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-[#3a3020]">
                    <FontAwesomeIcon icon={faFlag} size={16} color="#e7bd68" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-extrabold text-[#f5f0e6]">To-do pribadi</Text>
                    <Text className="mt-1 text-xs text-[#aaa49a]">Catatan tugas pribadi yang belum menjadi misi ber-reward.</Text>
                  </View>
                  <View className="rounded-full border border-[#66522c] bg-[#342b1b] px-2 py-1">
                    <Text className="text-[9px] font-black text-[#e7bd68]">PRIBADI</Text>
                  </View>
                </View>
                <View className="mt-4 gap-2">
                  {todos.map((todo) => (
                    <View key={todo.id} className={`rounded-2xl border p-4 ${todo.status === 'completed' ? 'border-[#34352f] bg-[#1a1d1b]' : 'border-[#2d2e35] bg-[#1b1c22]'}`}>
                      <View className="flex-row items-center">
                      <Pressable
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: todo.status === 'completed' }}
                        onPress={() => void handleToggleTodo(todo)}
                        className={`mr-3 h-6 w-6 items-center justify-center rounded-full border ${
                          todo.status === 'completed' ? 'border-[#8cbf9a] bg-[#8cbf9a]' : 'border-[#77757d]'
                        }`}
                      >
                        {todo.status === 'completed' ? <FontAwesomeIcon icon={faCheck} size={12} color="#101116" /> : null}
                      </Pressable>
                      <View className="flex-1">
                        <Text className={`text-sm font-bold ${todo.status === 'completed' ? 'text-[#898e88] line-through' : 'text-[#f1ede4]'}`}>
                          {todo.title}
                        </Text>
                        <Text className="mt-1 text-xs font-bold text-[#e7bd68]">Pribadi · {formatTodoDueDate(todo.due_date)}</Text>
                      </View>
                      <Pressable accessibilityRole="button" onPress={() => void handleDeleteTodo(todo.id)} className="px-2 py-1">
                        <Text className="text-[10px] font-bold text-[#f1a39a]">Hapus</Text>
                      </Pressable>
                      </View>
                      {todo.description ? <Text className="mt-2 ml-9 text-xs leading-5 text-[#85838a]">{todo.description}</Text> : null}
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            <View className="mb-6 flex-row items-center rounded-2xl border border-[#5a482a] bg-[#242118] p-4">
              <View className="mr-3 h-11 w-11 items-center justify-center rounded-xl bg-[#3a3020]">
                <FontAwesomeIcon icon={faCalendarCheck} size={19} color="#e7bd68" />
              </View>
              <View className="flex-1">
                <Text className="text-[10px] font-bold uppercase tracking-[1.3px] text-[#9c927e]">
                  Rekap hari ini
                </Text>
                <Text className="mt-1 text-sm font-extrabold text-[#f5f0e6]">
                  {completedMissions} misi dituntaskan
                </Text>
              </View>
              <Text className="text-sm font-extrabold text-[#e7bd68]">
                +{missions.reduce(
                  (total, mission) =>
                    total + (mission.completed && mission.reward.type === 'xp' ? mission.reward.amount : 0),
                  0,
                )}{' '}
                XP
              </Text>
            </View>

            <Text className="mb-4 text-base font-extrabold text-[#f5f0e6]">Aktivitas terbaru</Text>
            {availableMissions.some((mission) => mission.completed) ? (
              <View className="gap-3">
                {availableMissions
                  .filter((mission) => mission.completed)
                  .map((mission) => (
                    <View
                      key={mission.id}
                      className="flex-row items-center rounded-2xl border border-[#2d2e35] bg-[#1b1c22] p-4"
                    >
                      <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-[#243027]">
                        <FontAwesomeIcon icon={faCheck} size={15} color="#8cbf9a" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-bold text-[#f1ede4]">{mission.title}</Text>
                        <Text className="mt-1 text-xs text-[#85838a]">Misi harian · Selesai</Text>
                      </View>
                      <Text className="text-xs font-extrabold text-[#e7bd68]">
                        {formatMissionReward(mission)}
                      </Text>
                    </View>
                  ))}
              </View>
            ) : (
              <View className="items-center rounded-2xl border border-[#2d2e35] bg-[#1b1c22] px-6 py-10">
                <FontAwesomeIcon icon={faScroll} size={25} color="#77757d" />
                <Text className="mt-4 text-sm font-bold text-[#d4cfc4]">Jurnal masih kosong</Text>
                <Text className="mt-2 text-center text-xs leading-5 text-[#85838a]">
                  Selesaikan misi pertamamu untuk mengisi catatan petualangan.
                </Text>
              </View>
            )}

            <View className="mt-6 rounded-2xl border border-[#2d2e35] bg-[#1b1c22] p-4">
              <View className="flex-row items-center">
                <FontAwesomeIcon icon={faFire} size={17} color="#e87959" />
                <Text className="ml-3 flex-1 text-sm font-bold text-[#c5beb0]">Streak misi</Text>
                <Text className="text-sm font-extrabold text-[#f5f0e6]">
                  {streakDays ? `${streakDays} hari aktif` : 'Belum aktif'}
                </Text>
              </View>
              <Text className="mt-3 text-xs leading-5 text-[#929097]">
                {streakStatus === 'active'
                  ? 'Selesaikan semua misi harian untuk melanjutkan streak.'
                  : streakStatus === 'broken'
                    ? 'Streak terputus karena ada misi gagal atau hari terlewat.'
                    : streakStatus === 'pending'
                      ? 'Selesaikan misi hari ini untuk memulai atau melanjutkan streak.'
                      : 'Belum ada hari misi yang selesai penuh.'}
              </Text>
              {lastCompletedDate ? (
                <Text className="mt-2 text-xs font-semibold text-[#d8ad59]">Terakhir selesai: {lastCompletedDate}</Text>
              ) : null}
            </View>
          </>
        ) : activeTab === 'Guild' || activeTab === 'Pertemanan' ? (
          <>
            <View className="mb-6">
                <Text className="text-2xl font-black text-[#f5f0e6]">{activeTab === 'Guild' ? 'Guild' : 'Pertemanan'}</Text>
              <Text className="mt-2 text-sm leading-5 text-[#929097]">
                {activeTab === 'Guild' ? 'Bangun komunitas dan selesaikan misi bersama.' : 'Temukan teman dan bangun party petualangmu.'}
              </Text>
            </View>

            {socialError ? (
              <Text className="mb-4 rounded-xl bg-[#321f21] p-3 text-xs leading-5 text-[#f1a39a]">
                {socialError}
              </Text>
            ) : null}

            {activeTab === 'Guild' ? (
              <>
            <View className="mb-6 rounded-2xl border border-[#2d2e35] bg-[#1b1c22] p-4">
              <Text className="mb-3 text-base font-extrabold text-[#f5f0e6]">Cari guild</Text>
              <View className="flex-row gap-2">
                <TextInput
                  value={guildSearchQuery}
                  onChangeText={setGuildSearchQuery}
                  onSubmitEditing={() => void handleSearchGuilds()}
                  placeholder="Nama atau deskripsi guild"
                  placeholderTextColor="#77757d"
                  className="h-11 flex-1 rounded-xl border border-[#34353d] bg-[#121318] px-3 text-sm text-[#f5f0e6]"
                />
                <Pressable
                  accessibilityRole="button"
                  onPress={() => void handleSearchGuilds()}
                  className="h-11 items-center justify-center rounded-xl bg-[#e7bd68] px-4"
                >
                  <Text className="text-xs font-black text-[#211c12]">Cari</Text>
                </Pressable>
              </View>
              {guildSearchResults.length ? (
                <View className="mt-3 gap-2">
                  {guildSearchResults.map((result) => (
                    <View key={result.id} className="rounded-xl bg-[#24252c] p-3">
                      <View className="flex-row items-center">
                        <View className="mr-3 h-9 w-9 items-center justify-center rounded-xl bg-[#3a3020]">
                          <FontAwesomeIcon icon={faShieldHalved} size={14} color="#e7bd68" />
                        </View>
                        <View className="flex-1">
                          <Text className="text-sm font-bold text-[#f1ede4]">{result.name}</Text>
                          <Text className="mt-1 text-xs text-[#85838a]">Lv. {result.level || 1} · {result.member_count ?? 0}/{result.max_members} anggota</Text>
                        </View>
                        <Pressable
                          accessibilityRole="button"
                          disabled={Boolean(result.is_member) || Boolean(result.has_pending_request) || result.owner_id === authUser?.id}
                          onPress={() => void handleRequestGuildJoin(result.id)}
                          className={`rounded-lg border px-2.5 py-2 ${result.is_member || result.has_pending_request || result.owner_id === authUser?.id ? 'border-[#34353d] bg-[#1b1c22]' : 'border-[#66522c] bg-[#342b1b]'}`}
                        >
                          <Text className={`text-[10px] font-black ${result.is_member || result.has_pending_request || result.owner_id === authUser?.id ? 'text-[#85838a]' : 'text-[#e7bd68]'}`}>
                            {result.is_member ? 'Sudah gabung' : result.has_pending_request ? 'Terkirim' : result.owner_id === authUser?.id ? 'Pemilik' : 'Minta gabung'}
                          </Text>
                        </Pressable>
                      </View>
                      {result.description ? <Text className="mt-2 text-xs leading-5 text-[#aaa49a]">{result.description}</Text> : null}
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
            <View className="mb-6 flex-row items-center justify-between">
              <View>
                <Text className="text-base font-extrabold text-[#f5f0e6]">Guild saya</Text>
                <Text className="mt-1 text-xs text-[#85838a]">Bangun komunitas petualangmu.</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={() => setIsGuildFormOpen((open) => !open)}
                className="rounded-xl border border-[#66522c] bg-[#342b1b] px-3 py-2"
              >
                <Text className="text-[10px] font-black text-[#e7bd68]">
                  {isGuildFormOpen ? 'Tutup' : 'Buat guild'}
                </Text>
              </Pressable>
            </View>

            {isGuildFormOpen ? (
              <View className="mb-5 rounded-2xl border border-[#5a482a] bg-[#242118] p-4">
                <TextInput
                  value={newGuildName}
                  onChangeText={setNewGuildName}
                  placeholder="Nama guild"
                  placeholderTextColor="#77757d"
                  className="h-11 rounded-xl border border-[#34353d] bg-[#121318] px-3 text-sm text-[#f5f0e6]"
                />
                <TextInput
                  value={newGuildDescription}
                  onChangeText={setNewGuildDescription}
                  placeholder="Deskripsi singkat (opsional)"
                  placeholderTextColor="#77757d"
                  className="mt-3 h-11 rounded-xl border border-[#34353d] bg-[#121318] px-3 text-sm text-[#f5f0e6]"
                />
                <Pressable
                  accessibilityRole="button"
                  onPress={() => void handleCreateGuild()}
                  className="mt-3 items-center rounded-xl bg-[#e7bd68] py-3"
                >
                  <Text className="text-xs font-black text-[#211c12]">Simpan guild</Text>
                </Pressable>
              </View>
            ) : null}

            {guildJoinRequests.length ? (
              <View className="mb-6">
                <Text className="mb-3 text-base font-extrabold text-[#f5f0e6]">Permintaan bergabung</Text>
                <View className="gap-3">
                  {guildJoinRequests.map((request) => (
                    <View key={request.id} className="rounded-2xl border border-[#5a482a] bg-[#242118] p-4">
                      <Text className="text-sm font-bold text-[#f1ede4]">{request.requester_name}</Text>
                      <Text className="mt-1 text-xs text-[#aaa49a]">Ingin bergabung ke guild kamu · {request.requester_email}</Text>
                      <View className="mt-3 flex-row gap-2">
                        <Pressable
                          accessibilityRole="button"
                          onPress={() => void handleGuildJoinRequest(request.id, 'accept')}
                          className="flex-1 items-center rounded-xl bg-[#8cbf9a] py-2.5"
                        >
                          <Text className="text-xs font-black text-[#15251a]">Setujui</Text>
                        </Pressable>
                        <Pressable
                          accessibilityRole="button"
                          onPress={() => void handleGuildJoinRequest(request.id, 'reject')}
                          className="flex-1 items-center rounded-xl border border-[#793e3e] bg-[#321f21] py-2.5"
                        >
                          <Text className="text-xs font-black text-[#f1a39a]">Tolak</Text>
                        </Pressable>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {guildInvitations.length ? (
              <View className="mb-6">
                <Text className="mb-3 text-base font-extrabold text-[#f5f0e6]">Undangan guild</Text>
                <View className="gap-3">
                  {guildInvitations.map((invitation) => (
                    <View key={invitation.id} className="rounded-2xl border border-[#5a482a] bg-[#242118] p-4">
                      <Text className="text-sm font-bold text-[#f1ede4]">{invitation.guild_name}</Text>
                      <Text className="mt-1 text-xs text-[#aaa49a]">
                        Diundang oleh {invitation.inviter_name}
                      </Text>
                      <View className="mt-3 flex-row gap-2">
                        <Pressable
                          accessibilityRole="button"
                          onPress={() => void handleGuildInvitation(invitation.id, 'accept')}
                          className="flex-1 items-center rounded-xl bg-[#8cbf9a] py-2.5"
                        >
                          <Text className="text-xs font-black text-[#15251a]">Gabung</Text>
                        </Pressable>
                        <Pressable
                          accessibilityRole="button"
                          onPress={() => void handleGuildInvitation(invitation.id, 'reject')}
                          className="flex-1 items-center rounded-xl border border-[#793e3e] bg-[#321f21] py-2.5"
                        >
                          <Text className="text-xs font-black text-[#f1a39a]">Tolak</Text>
                        </Pressable>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {guilds.length ? (
              <View className="mb-6 gap-3">
                {guilds.map((guild) => (
                  <View key={guild.id} className="rounded-2xl border border-[#5a482a] bg-[#242118] p-4">
                    <View className="flex-row items-center">
                      <View className="mr-3 h-11 w-11 items-center justify-center rounded-xl bg-[#3a3020]">
                        <FontAwesomeIcon icon={faShieldHalved} size={18} color="#e7bd68" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-base font-extrabold text-[#f5f0e6]">{guild.name}</Text>
                        <Text className="mt-1 text-xs text-[#aaa49a]">
                          Lv. {guild.level || 1} · {guild.member_count ?? 0}/{guild.max_members} anggota
                        </Text>
                      </View>
                      {guild.owner_id === authUser?.id ? (
                        <Pressable
                          accessibilityRole="button"
                          onPress={() => {
                            setEditingGuildId(guild.id);
                            setEditGuildName(guild.name);
                            setEditGuildDescription(guild.description || '');
                            setSocialError('');
                          }}
                          className="rounded-lg border border-[#66522c] px-2.5 py-2"
                        >
                          <Text className="text-[10px] font-black text-[#e7bd68]">Edit</Text>
                        </Pressable>
                      ) : null}
                    </View>
                    {editingGuildId === guild.id ? (
                      <View className="mt-4 rounded-xl border border-[#66522c] bg-[#1b1c22] p-3">
                        <TextInput
                          value={editGuildName}
                          onChangeText={setEditGuildName}
                          placeholder="Nama guild"
                          placeholderTextColor="#77757d"
                          className="h-11 rounded-xl border border-[#34353d] bg-[#121318] px-3 text-sm text-[#f5f0e6]"
                        />
                        <TextInput
                          value={editGuildDescription}
                          onChangeText={setEditGuildDescription}
                          placeholder="Deskripsi singkat (opsional)"
                          placeholderTextColor="#77757d"
                          className="mt-3 h-11 rounded-xl border border-[#34353d] bg-[#121318] px-3 text-sm text-[#f5f0e6]"
                        />
                        <Text className="mt-3 text-xs leading-5 text-[#aaa49a]">
                          Level {guild.level || 1} · XP {guild.experience || 0}/{guild.experience_to_next_level || 100} · Kapasitas {guild.max_members} anggota. Naikkan level guild melalui kontribusi misi untuk menambah kapasitas.
                        </Text>
                        <View className="mt-3 flex-row gap-2">
                          <Pressable onPress={() => void handleUpdateGuild()} className="flex-1 items-center rounded-xl bg-[#e7bd68] py-2.5">
                            <Text className="text-xs font-black text-[#211c12]">Simpan</Text>
                          </Pressable>
                          <Pressable onPress={() => setEditingGuildId(null)} className="flex-1 items-center rounded-xl border border-[#34353d] py-2.5">
                            <Text className="text-xs font-black text-[#aaa49a]">Batal</Text>
                          </Pressable>
                        </View>
                      </View>
                    ) : null}
                    {guild.description ? (
                      <Text className="mt-3 text-xs leading-5 text-[#aaa49a]">{guild.description}</Text>
                    ) : null}
                    <View className="mt-4 border-t border-[#3b3428] pt-4">
                      <Text className="text-sm font-extrabold text-[#f5f0e6]">Misi guild</Text>
                      {guild.missions?.length ? (
                        <View className="mt-3 gap-2">
                          {guild.missions.map((mission) => (
                            <View key={mission.id} className="rounded-xl bg-[#1b1c22] p-3">
                              <View className="flex-row items-center">
                                <View className="flex-1">
                                  <Text className="text-xs font-bold text-[#f1ede4]">{mission.title}</Text>
                                  <Text className="mt-1 text-[10px] text-[#85838a]">
                                    {mission.mission_date} · {mission.current_progress}/{mission.target_progress} progress · +{mission.reward_xp} XP
                                  </Text>
                                </View>
                                <Pressable
                                  accessibilityRole="button"
                                  onPress={() => void handleContributeGuildMission(guild.id, mission.id)}
                                  className="rounded-lg bg-[#8cbf9a] px-3 py-2"
                                >
                                  <Text className="text-[10px] font-black text-[#15251a]">Kontribusi +1</Text>
                                </Pressable>
                              </View>
                              <View className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#484132]">
                                <View className="h-full rounded-full bg-[#e7bd68]" style={{ width: `${Math.min(100, (mission.current_progress / Math.max(1, mission.target_progress)) * 100)}%` }} />
                              </View>
                            </View>
                          ))}
                        </View>
                      ) : (
                        <Text className="mt-2 text-xs text-[#85838a]">Belum ada misi aktif.</Text>
                      )}
                    </View>
                    {guild.owner_id === authUser?.id && friends.length ? (
                      <View className="mt-4">
                        <Text className="mb-2 text-xs font-bold text-[#c5beb0]">Undang teman</Text>
                        <View className="gap-2">
                          {friends.map((friend) => (
                            <Pressable
                              key={friend.id}
                              accessibilityRole="button"
                              onPress={() => void handleInviteToGuild(guild.id, friend.id)}
                              className="flex-row items-center justify-between rounded-xl bg-[#1b1c22] px-3 py-2.5"
                            >
                              <Text className="text-xs text-[#f1ede4]">{friend.name}</Text>
                              <Text className="text-[10px] font-black text-[#e7bd68]">Undang</Text>
                            </Pressable>
                          ))}
                        </View>
                      </View>
                    ) : null}
                  </View>
                ))}
              </View>
            ) : (
              <View className="mb-6 rounded-2xl border border-dashed border-[#49433a] bg-[#191a1f] p-4">
                <Text className="text-sm text-[#85838a]">Kamu belum memiliki guild.</Text>
              </View>
            )}

              </>
            ) : (
              <>

            <View className="mb-6 rounded-2xl border border-[#2d2e35] bg-[#1b1c22] p-4">
              <Text className="mb-3 text-base font-extrabold text-[#f5f0e6]">Cari teman</Text>
              <View className="flex-row gap-2">
                <TextInput
                  value={socialSearch}
                  onChangeText={setSocialSearch}
                  onSubmitEditing={() => void handleSocialSearch()}
                  placeholder="Nama atau email"
                  placeholderTextColor="#77757d"
                  className="h-11 flex-1 rounded-xl border border-[#34353d] bg-[#121318] px-3 text-sm text-[#f5f0e6]"
                  autoCapitalize="none"
                />
                <Pressable
                  accessibilityRole="button"
                  onPress={() => void handleSocialSearch()}
                  className="h-11 items-center justify-center rounded-xl bg-[#e7bd68] px-4"
                >
                  <Text className="text-xs font-black text-[#211c12]">Cari</Text>
                </Pressable>
              </View>
              {socialSearchResults.length ? (
                <View className="mt-3 gap-2">
                  {socialSearchResults.map((user) => {
                    const relationshipStatus = user.relationship_status || 'none';
                    const isConnected = relationshipStatus === 'friends';
                    const isRequestSent = relationshipStatus === 'request_sent';
                    const isRequestReceived = relationshipStatus === 'request_received';
                    return (
                    <View key={user.id} className="flex-row items-center rounded-xl bg-[#24252c] p-3">
                      <View className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-[#3a3020]">
                        <FontAwesomeIcon icon={faUser} size={14} color={isConnected ? '#8cbf9a' : '#e7bd68'} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-bold text-[#f1ede4]">{user.name}</Text>
                        <Text className="mt-1 text-xs text-[#85838a]">{user.email}</Text>
                      </View>
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => void handleSendFriendRequest(user.id, user.incoming_request_id)}
                        disabled={isConnected || isRequestSent}
                        className={`rounded-lg border px-3 py-2 ${
                          isConnected
                            ? 'border-[#42684d] bg-[#243027]'
                            : isRequestSent
                              ? 'border-[#66522c] bg-[#2b251a]'
                              : 'border-[#66522c] bg-[#342b1b]'
                        }`}
                      >
                        <Text className={`text-[10px] font-black ${isConnected ? 'text-[#8cbf9a]' : 'text-[#e7bd68]'}`}>
                          {isConnected ? 'Sudah berteman' : isRequestSent ? 'Terkirim' : isRequestReceived ? 'Terima' : 'Tambah'}
                        </Text>
                      </Pressable>
                    </View>
                    );
                  })}
                </View>
              ) : null}
            </View>

            <Text className="mb-3 text-base font-extrabold text-[#f5f0e6]">
              Permintaan pertemanan {friendRequests.length ? `(${friendRequests.length})` : ''}
            </Text>
            {friendRequests.length ? (
              <View className="mb-6 gap-3">
                {friendRequests.map((request) => (
                  <View key={request.id} className="rounded-2xl border border-[#5a482a] bg-[#242118] p-4">
                    <Text className="text-sm font-bold text-[#f1ede4]">{request.requester_name}</Text>
                    <Text className="mt-1 text-xs text-[#aaa49a]">{request.requester_email}</Text>
                    <View className="mt-3 flex-row gap-2">
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => void handleFriendRequest(request.id, 'accept')}
                        className="flex-1 items-center rounded-xl bg-[#8cbf9a] py-2.5"
                      >
                        <Text className="text-xs font-black text-[#15251a]">Terima</Text>
                      </Pressable>
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => void handleFriendRequest(request.id, 'reject')}
                        className="flex-1 items-center rounded-xl border border-[#793e3e] bg-[#321f21] py-2.5"
                      >
                        <Text className="text-xs font-black text-[#f1a39a]">Tolak</Text>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <Text className="mb-6 text-sm text-[#85838a]">Belum ada permintaan baru.</Text>
            )}

            <View className="mb-6 flex-row items-center justify-between">
              <Text className="text-base font-extrabold text-[#f5f0e6]">Teman</Text>
              <Text className="text-xs font-semibold text-[#85838a]">{friends.length} teman</Text>
            </View>
            {friends.length ? (
              <View className="mb-6 gap-2">
                {friends.map((friend) => (
                  <View key={friend.id} className="flex-row items-center rounded-2xl border border-[#2d2e35] bg-[#1b1c22] p-4">
                    <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-[#243027]">
                      <FontAwesomeIcon icon={faUsers} size={15} color="#8cbf9a" />
                    </View>
                    <View>
                      <Text className="text-sm font-bold text-[#f1ede4]">{friend.name}</Text>
                      <Text className="mt-1 text-xs text-[#85838a]">{friend.email}</Text>
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => void handleRemoveFriend(friend.id)}
                      className="ml-auto rounded-lg px-2 py-1"
                    >
                      <Text className="text-[10px] font-bold text-[#f1a39a]">Hapus</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            ) : (
              <Text className="mb-6 text-sm text-[#85838a]">Belum ada teman. Mulai cari teman baru.</Text>
            )}

            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-base font-extrabold text-[#f5f0e6]">Party kamu</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => setIsPartyFormOpen((open) => !open)}
                className="rounded-xl border border-[#66522c] bg-[#342b1b] px-3 py-2"
              >
                <Text className="text-[10px] font-black text-[#e7bd68]">{isPartyFormOpen ? 'Tutup' : 'Buat party'}</Text>
              </Pressable>
            </View>
            {isPartyFormOpen ? (
              <View className="mb-4 rounded-2xl border border-[#5a482a] bg-[#242118] p-4">
                <TextInput
                  value={newPartyName}
                  onChangeText={setNewPartyName}
                  placeholder="Nama party"
                  placeholderTextColor="#77757d"
                  className="h-11 rounded-xl border border-[#34353d] bg-[#121318] px-3 text-sm text-[#f5f0e6]"
                />
                <Pressable
                  accessibilityRole="button"
                  onPress={() => void handleCreateParty()}
                  className="mt-3 items-center rounded-xl bg-[#e7bd68] py-3"
                >
                  <Text className="text-xs font-black text-[#211c12]">Simpan party</Text>
                </Pressable>
              </View>
            ) : null}
            {isSocialLoading ? (
              <Text className="py-4 text-center text-sm text-[#85838a]">Memuat data sosial...</Text>
            ) : parties.length ? (
              <View className="gap-3">
                {parties.map((party) => (
                  <View key={party.id} className="rounded-2xl border border-[#2d2e35] bg-[#1b1c22] p-4">
                    <View className="flex-row items-center">
                      <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-[#33291d]">
                        <FontAwesomeIcon icon={faUsers} size={17} color="#e7bd68" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-bold text-[#f1ede4]">{party.name}</Text>
                        <Text className="mt-1 text-xs text-[#85838a]">
                          {party.member_count ?? 0}/{party.max_members} anggota
                        </Text>
                      </View>
                    </View>
                    {party.members?.length ? (
                      <View className="mt-3 gap-1">
                        {party.members.map((member) => (
                          <View key={member.id} className="flex-row items-center justify-between rounded-lg bg-[#24252c] px-3 py-2">
                            <Text className="text-xs text-[#c5beb0]">{member.name}</Text>
                            {party.owner_id === authUser?.id && member.role !== 'owner' ? (
                              <Pressable onPress={() => void handleRemovePartyMember(party.id, member.id)}>
                                <Text className="text-[10px] font-bold text-[#f1a39a]">Keluarkan</Text>
                              </Pressable>
                            ) : null}
                          </View>
                        ))}
                      </View>
                    ) : null}
                    {party.owner_id === authUser?.id && friends.length ? (
                      <View className="mt-3 flex-row flex-wrap gap-1">
                        {friends.slice(0, 3).map((friend) => (
                          <Pressable
                            key={friend.id}
                            accessibilityRole="button"
                            onPress={() => void handleAddPartyMember(party.id, friend.id)}
                            className="rounded-lg bg-[#342b1b] px-2 py-1"
                          >
                            <Text className="text-[9px] font-bold text-[#e7bd68]">+ {friend.name}</Text>
                          </Pressable>
                        ))}
                      </View>
                    ) : null}
                  </View>
                ))}
              </View>
            ) : (
              <Text className="text-sm text-[#85838a]">Belum ada party. Buat party pertamamu.</Text>
            )}
              </>
            )}
          </>
        ) : activeTab === 'Profil' ? (
          <ProfileLanding
            user={authUser}
            level={userLevel}
            currentExperience={levelProgress.currentExperience}
            requiredExperience={levelProgress.requiredExperience}
            progressPercentage={levelProgress.percentage}
            affiliateProfile={affiliateProfile}
            onShareReferral={() => {
              if (authUser?.affiliate_code) {
                void Share.share({
                  message: `Gunakan kode referral saya: ${authUser.affiliate_code}`,
                });
              }
            }}
            onLogout={() => void handleLogout()}
          />
        ) : (
          <>
            <View className="mb-6">
              <Text className="text-2xl font-black text-[#f5f0e6]">Profil Petualang</Text>
              <Text className="mt-2 text-sm leading-5 text-[#929097]">
                Lihat perkembangan dan pencapaian karaktermu.
              </Text>
            </View>

            <View className="mb-5 items-center rounded-[26px] border border-[#5a482a] bg-[#242118] px-5 py-6">
              <View className="mb-4 h-[76px] w-[76px] items-center justify-center rounded-full border-2 border-[#8a6d38] bg-[#3a3020]">
                <FontAwesomeIcon icon={faShieldHalved} size={31} color="#e7bd68" />
              </View>
              <Text className="text-xl font-black text-[#fff8e9]">
                {authUser?.name ?? 'Penjelajah'}
              </Text>
              <Text className="mt-1 text-xs font-bold uppercase tracking-[1.7px] text-[#aaa49a]">
                {authUser?.email ?? 'Penjaga Guild'} · Level {userLevel}
              </Text>
              {userProfile?.position || userProfile?.department ? (
                <Text className="mt-2 text-xs text-[#c5beb0]">
                  {[userProfile.position, userProfile.department].filter(Boolean).join(' · ')}
                </Text>
              ) : null}
              <View className="mt-5 w-full">
                <View className="mb-2 flex-row items-center justify-between">
                  <Text className="text-xs font-semibold text-[#c5beb0]">
                    Pengalaman menuju Lv. {userLevel + 1}
                  </Text>
                  <Text className="text-xs font-extrabold text-[#e7bd68]">
                    {levelProgress.currentExperience} / {levelProgress.requiredExperience} XP
                  </Text>
                </View>
                <View className="h-[7px] overflow-hidden rounded-full bg-[#484132]">
                  <View
                    className="h-full rounded-full bg-[#e7bd68]"
                    style={{
                      width: `${levelProgress.percentage}%`,
                    }}
                  />
                </View>
              </View>
            </View>

            <Link href="/classes" asChild>
              <Pressable
                accessibilityRole="button"
                className="mb-5 rounded-2xl border border-[#5a482a] bg-[#242118] p-4"
              >
                <View className="flex-row items-center">
                  <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-[#3a3020]">
                    <FontAwesomeIcon icon={faShieldHalved} size={17} color="#e7bd68" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[10px] font-bold uppercase tracking-[1px] text-[#9c927e]">Class karakter</Text>
                    <Text className="mt-1 text-base font-black text-[#f5f0e6]">
                      {progression?.character?.class_label || 'Belum memilih class'}
                    </Text>
                    <Text className="mt-1 text-xs text-[#aaa49a]">
                      {progression?.character?.primary_stat
                        ? `Stat utama: ${progression.character.primary_stat}`
                        : 'Pilih class untuk menentukan arah perkembangan.'}
                    </Text>
                  </View>
                  <FontAwesomeIcon icon={faChevronRight} size={14} color="#e7bd68" />
                </View>
              </Pressable>
            </Link>

            <View className="mb-5 rounded-2xl border border-[#5a482a] bg-[#242118] p-4">
              <View className="flex-row items-center">
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-[#3a3020]">
                  <FontAwesomeIcon icon={faCompass} size={17} color="#e7bd68" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-extrabold text-[#f5f0e6]">Difficulty petualangan</Text>
                  <Text className="mt-1 text-xs text-[#aaa49a]">Berlaku untuk misi baru. Misi lama tetap menggunakan konfigurasi sebelumnya.</Text>
                </View>
              </View>
              <View className="mt-4 flex-row gap-2">
                {(['easy', 'normal', 'hard', 'expert'] as Difficulty[]).map((difficulty) => (
                  <Pressable
                    key={difficulty}
                    accessibilityRole="button"
                    accessibilityState={{ selected: activeDifficulty === difficulty }}
                    disabled={isDifficultySaving}
                    onPress={() => void handleDifficultyChange(difficulty)}
                    className={`flex-1 rounded-xl border px-2 py-2.5 ${activeDifficulty === difficulty ? 'border-[#e7bd68] bg-[#342b1b]' : 'border-[#34353d] bg-[#1b1c22]'}`}
                  >
                    <Text className={`text-center text-[10px] font-black ${activeDifficulty === difficulty ? 'text-[#e7bd68]' : 'text-[#85838a]'}`}>
                      {formatDifficulty(difficulty)}
                    </Text>
                    <Text className="mt-1 text-center text-[9px] leading-3 text-[#aaa49a]">
                      {difficultyConfigs.find((item) => item.difficulty === difficulty)?.description || 'Penjelasan belum tersedia.'}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {difficultyError ? <Text className="mt-3 text-xs text-[#f1a39a]">{difficultyError}</Text> : null}
            </View>

            <Link href="/progression" asChild>
              <Pressable className="mb-5 flex-row items-center rounded-2xl border border-[#5a482a] bg-[#242118] p-4">
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-[#3a3020]">
                  <FontAwesomeIcon icon={faStar} size={17} color="#e7bd68" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-extrabold text-[#f5f0e6]">Buka progression lengkap</Text>
              <Text className="mt-1 text-xs text-[#aaa49a]">Lihat kemampuan dan riwayat EXP di layar khusus.</Text>
                </View>
                <FontAwesomeIcon icon={faChevronRight} size={14} color="#e7bd68" />
              </Pressable>
            </Link>

            <View className="mb-5 rounded-2xl border border-[#2d2e35] bg-[#1b1c22] p-4">
              <View className="mb-3 flex-row items-center justify-between">
                <Text className="text-base font-extrabold text-[#f5f0e6]">Riwayat EXP</Text>
                <Text className="text-[10px] font-bold uppercase tracking-[1px] text-[#85838a]">100 terbaru</Text>
              </View>
              {experienceHistory.length ? experienceHistory.slice(0, 5).map((transaction) => (
                <View key={transaction.id} className="mb-2 flex-row items-center rounded-xl bg-[#24252c] px-3 py-2.5">
                  <View className="flex-1">
                    <Text className="text-xs font-bold text-[#f1ede4]">{transaction.reason || transaction.source_type}</Text>
                    <Text className="mt-1 text-[10px] text-[#85838a]">{new Date(transaction.created_at).toLocaleDateString('id-ID')}</Text>
                  </View>
                  <Text className={`text-xs font-black ${transaction.amount >= 0 ? 'text-[#8cbf9a]' : 'text-[#f1a39a]'}`}>
                    {transaction.amount >= 0 ? '+' : ''}{transaction.amount} XP
                  </Text>
                </View>
              )) : <Text className="text-xs text-[#85838a]">Belum ada transaksi EXP.</Text>}
            </View>

            <View className="mb-6 rounded-2xl border border-[#5a482a] bg-[#242118] p-4">
              <Text className="text-base font-extrabold text-[#f5f0e6]">Program referral</Text>
              <Text className="mt-1 text-xs leading-5 text-[#aaa49a]">
                Bagikan kode ini agar pengguna baru dapat terhubung sebagai referralmu.
              </Text>
              {affiliateProfile ? (
                <Text className="mt-2 text-xs font-bold text-[#8cbf9a]">
                  {affiliateProfile.referrals_count} referral berhasil terhubung
                </Text>
              ) : null}
              <View className="mt-4 flex-row items-center rounded-xl border border-[#66522c] bg-[#342b1b] px-4 py-3">
                <Text className="flex-1 text-lg font-black tracking-[2px] text-[#e7bd68]">
                  {authUser?.affiliate_code || 'Belum tersedia'}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    if (authUser?.affiliate_code) {
                      void Share.share({
                        message: `Gunakan kode affiliate saya: ${authUser.affiliate_code}`,
                      });
                    }
                  }}
                  className="rounded-xl bg-[#e7bd68] px-4 py-2"
                >
                  <Text className="text-xs font-black text-[#211c12]">Bagikan</Text>
                </Pressable>
              </View>
            </View>

            <View className="mb-6 flex-row gap-3">
              <SummaryCard
                label="Misi selesai"
                value={`${completedMissions}/${availableMissions.length}`}
                icon={faFlag}
                accent="#e7bd68"
                progress={availableMissions.length ? (completedMissions / availableMissions.length) * 100 : 0}
              />
              <SummaryCard
                label="Kesehatan"
                value={authUser?.stats?.health_points ?? 0}
                icon={faFire}
                accent="#e87959"
                progress={authUser?.stats?.health_points ?? 0}
              />
              <SummaryCard
                label="Total EXP"
                value={userExperience}
                icon={faBolt}
                accent="#8cbf9a"
                progress={levelProgress.percentage}
              />
            </View>

            <View className="mb-6 rounded-2xl border border-[#5a482a] bg-[#242118] p-4">
              <View className="mb-4 flex-row items-center">
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-[#3a3020]">
                  <FontAwesomeIcon icon={faBolt} size={17} color="#e7bd68" />
                </View>
                <View>
                  <Text className="text-base font-extrabold text-[#f5f0e6]">Statistik karakter</Text>
                  <Text className="mt-1 text-xs text-[#aaa49a]">Atribut utama petualangmu</Text>
                </View>
              </View>
              <GameStatRow label="Kekuatan" value={authUser?.stats?.strength ?? 0} />
              <GameStatRow label="Intelligence" value={authUser?.stats?.intelligence ?? 0} />
              <GameStatRow label="Agility" value={authUser?.stats?.agility ?? 0} />
              <GameStatRow label="Stamina" value={authUser?.stats?.stamina ?? 0} />
              <GameStatRow label="Keberuntungan" value={authUser?.stats?.luck ?? 0} />
            </View>

            <Text className="mb-3 text-base font-extrabold text-[#f5f0e6]">Kemampuan petualang</Text>
            {authUser?.skills?.length ? (
              authUser.skills.map((skill) => (
                <SkillCard
                  key={skill.id}
                  label={skill.label}
                  description={skill.description}
                  level={skill.level}
                  experience={skill.experience}
                  experienceToNextLevel={skill.experience_to_next_level}
                />
              ))
            ) : (
              <View className="mb-6 rounded-2xl border border-dashed border-[#49433a] bg-[#191a1f] p-4">
                <Text className="text-sm text-[#85838a]">Belum ada kemampuan yang terbuka.</Text>
              </View>
            )}

            <Text className="mb-3 text-base font-extrabold text-[#f5f0e6]">Lencana pencapaian</Text>
            <View className="flex-row items-center rounded-2xl border border-[#2d2e35] bg-[#1b1c22] p-4">
              <View className="mr-3 h-11 w-11 items-center justify-center rounded-xl bg-[#33291d]">
                <FontAwesomeIcon icon={faTrophy} size={18} color="#e7bd68" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-[#f1ede4]">Awal yang gemilang</Text>
                <Text className="mt-1 text-xs text-[#85838a]">Selesaikan misi pertamamu</Text>
              </View>
              <FontAwesomeIcon icon={faMedal} size={19} color="#e7bd68" />
            </View>
            {authSession && (
              <Pressable
                accessibilityRole="button"
                onPress={() => void handleLogout()}
                className="mt-5 h-12 items-center justify-center rounded-2xl border border-[#793e3e] bg-[#321f21]"
              >
                <Text className="text-sm font-bold text-[#f1a39a]">Keluar dari akun</Text>
              </Pressable>
            )}
          </>
        )}
      </ScrollView>

      {activeTab === 'Misi' && authSession ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Tambah misi"
          onPress={() => {
            setMissionComposerType(null);
            setIsMissionComposerOpen(true);
          }}
          className="absolute bottom-[78px] right-5 h-14 w-14 items-center justify-center rounded-full border-2 border-[#f5d98e] bg-[#e7bd68] shadow-lg"
        >
          <FontAwesomeIcon icon={faPlus} size={22} color="#211c12" />
        </Pressable>
      ) : null}

      {activeTab === 'Dompet' && authSession ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Tambah transaksi keuangan"
          onPress={() => {
            setEditingFinanceTransaction(null);
            setFinanceFormError('');
            setFinanceType('income');
            setFinanceAccountId(finance?.accounts[0]?.id ?? null);
            setFinanceFromAccountId(finance?.accounts[0]?.id ?? null);
            setFinanceToAccountId(finance?.accounts[1]?.id ?? null);
            setIsFinanceModalOpen(true);
          }}
          className="absolute bottom-[78px] right-5 h-14 w-14 items-center justify-center rounded-full border-2 border-[#f5d98e] bg-[#e7bd68] shadow-lg"
        >
          <FontAwesomeIcon icon={faPlus} size={22} color="#211c12" />
        </Pressable>
      ) : null}

      <Modal
        visible={isMissionComposerOpen}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setMissionComposerType(null);
          setIsMissionComposerOpen(false);
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1 justify-end bg-black/60"
        >
          <View className="max-h-[92%] rounded-t-[28px] border-t border-[#5a482a] bg-[#242118] px-5 pb-8 pt-5">
            <View className="mb-5 flex-row items-center">
              <View className="flex-1">
                <Text className="text-xl font-black text-[#f5f0e6]">
                  {missionComposerType ? 'Tambah misi' : 'Pilih jenis misi'}
                </Text>
                <Text className="mt-1 text-xs text-[#aaa49a]">
                  {missionComposerType ? 'Isi detail misi dan tentukan waktu pelaksanaannya.' : 'Buat misi pribadi atau tantangan bersama guild.'}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Tutup modal tambah misi"
                onPress={() => {
                  setMissionComposerType(null);
                  setIsMissionComposerOpen(false);
                }}
                className="h-9 w-9 items-center justify-center rounded-full bg-[#342b1b]"
              >
                <Text className="text-lg font-bold text-[#e7bd68]">×</Text>
              </Pressable>
            </View>

            {!missionComposerType ? (
              <View className="gap-3">
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setPersonalMissionError('');
                    setMissionComposerType('personal');
                  }}
                  className="flex-row items-center rounded-2xl border border-[#5a482a] bg-[#342b1b] p-4"
                >
                  <View className="mr-3 h-11 w-11 items-center justify-center rounded-xl bg-[#4b3a22]">
                    <FontAwesomeIcon icon={faFlag} size={18} color="#e7bd68" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-extrabold text-[#f5f0e6]">Misi pribadi</Text>
                    <Text className="mt-1 text-xs text-[#aaa49a]">Tugas nyata dengan reward XP untuk dirimu.</Text>
                  </View>
                  <FontAwesomeIcon icon={faChevronRight} size={14} color="#e7bd68" />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setMissionComposerType('guild')}
                  className="flex-row items-center rounded-2xl border border-[#5a482a] bg-[#342b1b] p-4"
                >
                  <View className="mr-3 h-11 w-11 items-center justify-center rounded-xl bg-[#4b3a22]">
                    <FontAwesomeIcon icon={faUsers} size={18} color="#e7bd68" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-extrabold text-[#f5f0e6]">Misi guild</Text>
                    <Text className="mt-1 text-xs text-[#aaa49a]">Tantangan kolaboratif untuk anggota guild.</Text>
                  </View>
                  <FontAwesomeIcon icon={faChevronRight} size={14} color="#e7bd68" />
                </Pressable>
              </View>
            ) : (
              <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setMissionComposerType(null)}
                  className="mb-4 self-start rounded-lg border border-[#66522c] px-3 py-2"
                >
                  <Text className="text-[10px] font-black text-[#e7bd68]">Ganti jenis misi</Text>
                </Pressable>

                {missionComposerType === 'personal' ? (
                  <View>
                    <TextInput
                      value={personalMissionTitle}
                      onChangeText={setPersonalMissionTitle}
                      placeholder="Contoh: Selesaikan laporan kerja"
                      placeholderTextColor="#77757d"
                      className="h-11 rounded-xl border border-[#34353d] bg-[#121318] px-3 text-sm text-[#f5f0e6]"
                    />
                    <TextInput
                      value={personalMissionDetail}
                      onChangeText={setPersonalMissionDetail}
                      placeholder="Detail misi (opsional)"
                      placeholderTextColor="#77757d"
                      multiline
                      className="mt-3 min-h-[62px] rounded-xl border border-[#34353d] bg-[#121318] px-3 py-3 text-sm text-[#f5f0e6]"
                      textAlignVertical="top"
                    />
                    <View className="mt-3 flex-row gap-2">
                      <View className="flex-1">
                        <PickerField
                          label="Tanggal"
                          mode="date"
                          value={parseDateValue(personalMissionDate)}
                          onChange={(value) => setPersonalMissionDate(formatDateValue(value))}
                        />
                      </View>
                      <View className="w-28">
                        <PickerField
                          label="Waktu"
                          mode="time"
                          value={parseTimeValue(personalMissionTime)}
                          onChange={(value) => setPersonalMissionTime(formatTimeValue(value))}
                        />
                      </View>
                    </View>
                    <View className="mt-3 rounded-xl border border-[#66522c] bg-[#342b1b] px-3 py-3">
                      <Text className="text-[10px] font-bold uppercase tracking-[1px] text-[#9c927e]">Reward berdasarkan difficulty aktif</Text>
                      <Text className="mt-1 text-sm font-black text-[#e7bd68]">{formatDifficulty(activeDifficulty)} · +{activeDifficultyConfig?.base_reward_xp ?? '—'} XP</Text>
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => void handleCreatePersonalMission()}
                      className="mt-4 items-center rounded-xl bg-[#e7bd68] py-3"
                    >
                      <Text className="text-xs font-black text-[#211c12]">Simpan misi pribadi</Text>
                    </Pressable>
                    {personalMissionError ? <Text className="mt-2 text-xs text-[#f1a39a]">{personalMissionError}</Text> : null}
                  </View>
                ) : (
                  <View>
                    {guilds.filter((guild) => guild.owner_id === authUser?.id).map((guild) => (
                      <View key={guild.id} className="mb-3 rounded-xl border border-[#34353d] bg-[#1b1c22] p-3">
                        <Text className="text-xs font-bold text-[#e7bd68]">{guild.name}</Text>
                        <TextInput
                          value={guildMissionTitle}
                          onChangeText={setGuildMissionTitle}
                          placeholder="Contoh: Selesaikan 5 tugas bersama"
                          placeholderTextColor="#77757d"
                          className="mt-2 h-10 rounded-lg border border-[#34353d] bg-[#121318] px-3 text-xs text-[#f5f0e6]"
                        />
                        <TextInput
                          value={guildMissionDetail}
                          onChangeText={setGuildMissionDetail}
                          placeholder="Detail misi (opsional)"
                          placeholderTextColor="#77757d"
                          multiline
                          className="mt-2 min-h-[58px] rounded-lg border border-[#34353d] bg-[#121318] px-3 py-2 text-xs text-[#f5f0e6]"
                          textAlignVertical="top"
                        />
                        <View className="mt-2 flex-row gap-2">
                          <View className="flex-1">
                            <PickerField
                              label="Tanggal"
                              mode="date"
                              value={parseDateValue(guildMissionDate)}
                              onChange={(value) => setGuildMissionDate(formatDateValue(value))}
                            />
                          </View>
                          <View className="w-28">
                            <PickerField
                              label="Waktu"
                              mode="time"
                              value={parseTimeValue(guildMissionTime)}
                              onChange={(value) => setGuildMissionTime(formatTimeValue(value))}
                            />
                          </View>
                        </View>
                        <View className="mt-2 rounded-lg border border-[#66522c] bg-[#342b1b] px-3 py-2.5">
                          <Text className="text-[10px] font-bold uppercase tracking-[1px] text-[#9c927e]">Reward kontribusi</Text>
                          <Text className="mt-1 text-xs font-black text-[#e7bd68]">Normal · +{difficultyConfigs.find((item) => item.difficulty === 'normal')?.base_reward_xp ?? '—'} XP</Text>
                        </View>
                        <Pressable
                          accessibilityRole="button"
                          onPress={() => void handleCreateGuildMission(guild.id)}
                          className="mt-2 items-center rounded-lg bg-[#e7bd68] py-2.5"
                        >
                          <Text className="text-[10px] font-black text-[#211c12]">Simpan misi guild</Text>
                        </Pressable>
                      </View>
                    ))}
                    {!guilds.some((guild) => guild.owner_id === authUser?.id) ? (
                      <Text className="text-xs text-[#85838a]">Kamu harus menjadi pemilik guild untuk membuat misi.</Text>
                    ) : null}
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={isFinanceModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsFinanceModalOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1 justify-end bg-black/60"
        >
          <View className="rounded-t-[28px] border-t border-[#5a482a] bg-[#242118] px-5 pb-8 pt-5">
            <View className="mb-5 flex-row items-center">
              <View className="flex-1">
                <Text className="text-xl font-black text-[#f5f0e6]">{editingFinanceTransaction ? 'Edit transaksi' : 'Tambah transaksi'}</Text>
                <Text className="mt-1 text-xs text-[#aaa49a]">{editingFinanceTransaction ? 'Perbarui catatan transaksi keuanganmu.' : 'Catat pemasukan atau pengeluaran dompetmu.'}</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Tutup modal transaksi"
                onPress={() => setIsFinanceModalOpen(false)}
                className="h-9 w-9 items-center justify-center rounded-full bg-[#342b1b]"
              >
                <Text className="text-lg font-bold text-[#e7bd68]">×</Text>
              </Pressable>
            </View>

            <View className="mb-4 flex-row gap-2">
              {(['income', 'expense', 'transfer'] as const).map((type) => (
                <Pressable
                  key={type}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: financeType === type }}
                  onPress={() => setFinanceType(type)}
                  className={`flex-1 items-center rounded-xl border px-3 py-3 ${financeType === type ? 'border-[#e7bd68] bg-[#342b1b]' : 'border-[#34353d] bg-[#121318]'}`}
                >
                  <Text className={`text-xs font-black ${financeType === type ? 'text-[#e7bd68]' : 'text-[#85838a]'}`}>
                    {type === 'income' ? 'Pemasukan' : type === 'expense' ? 'Pengeluaran' : 'Transfer'}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View className="mb-3">
              <Text className="mb-2 text-[10px] font-black uppercase tracking-[1px]">{financeType === 'transfer' ? 'Dari akun' : 'Akun transaksi'}</Text>
              <View className="flex-row flex-wrap gap-2">
                {(finance?.accounts ?? []).map((account) => (
                  <Pressable
                    key={account.id}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: financeType === 'transfer' ? financeFromAccountId === account.id : financeAccountId === account.id }}
                    onPress={() => financeType === 'transfer' ? setFinanceFromAccountId(account.id) : setFinanceAccountId(account.id)}
                    className={`rounded-xl border px-3 py-2.5 ${(financeType === 'transfer' ? financeFromAccountId === account.id : financeAccountId === account.id) ? 'border-[#e7bd68] bg-[#342b1b]' : 'border-[#34353d] bg-[#121318]'}`}
                  >
                    <Text className={`text-xs font-bold ${(financeType === 'transfer' ? financeFromAccountId === account.id : financeAccountId === account.id) ? 'text-[#e7bd68]' : 'text-[#85838a]'}`}>{account.name}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
            {financeType === 'transfer' ? (
              <View className="mb-3">
                <Text className="mb-2 text-[10px] font-black uppercase tracking-[1px]">Ke akun</Text>
                <View className="flex-row flex-wrap gap-2">
                  {(finance?.accounts ?? []).map((account) => (
                    <Pressable
                      key={account.id}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: financeToAccountId === account.id }}
                      onPress={() => setFinanceToAccountId(account.id)}
                      className={`rounded-xl border px-3 py-2.5 ${financeToAccountId === account.id ? 'border-[#e7bd68] bg-[#342b1b]' : 'border-[#34353d] bg-[#121318]'}`}
                    >
                      <Text className={`text-xs font-bold ${financeToAccountId === account.id ? 'text-[#e7bd68]' : 'text-[#85838a]'}`}>{account.name}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : null}
            <TextInput
              value={financeAmount}
              onChangeText={setFinanceAmount}
              placeholder="Nominal, contoh 50000"
              placeholderTextColor="#77757d"
              keyboardType="number-pad"
              className="h-12 rounded-xl border border-[#34353d] bg-[#121318] px-3 text-sm text-[#f5f0e6]"
            />
            <TextInput
              value={financeCategory}
              onChangeText={setFinanceCategory}
              placeholder="Kategori, contoh Gaji atau Makan"
              placeholderTextColor="#77757d"
              className="mt-3 h-12 rounded-xl border border-[#34353d] bg-[#121318] px-3 text-sm text-[#f5f0e6]"
            />
            <TextInput
              value={financeDescription}
              onChangeText={setFinanceDescription}
              placeholder="Catatan (opsional)"
              placeholderTextColor="#77757d"
              multiline
              textAlignVertical="top"
              className="mt-3 min-h-[70px] rounded-xl border border-[#34353d] bg-[#121318] px-3 py-3 text-sm text-[#f5f0e6]"
            />
            {financeFormError ? <Text className="mt-3 text-xs text-[#f1a39a]">{financeFormError}</Text> : null}
            <Pressable
              accessibilityRole="button"
              disabled={isFinanceSaving}
              onPress={() => void handleCreateFinanceTransaction()}
              className={`mt-4 items-center rounded-xl py-3 ${isFinanceSaving ? 'bg-[#8e7545]' : 'bg-[#e7bd68]'}`}
            >
              <Text className="text-xs font-black text-[#211c12]">{isFinanceSaving ? 'Menyimpan...' : editingFinanceTransaction ? 'Simpan perubahan' : 'Simpan transaksi'}</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <MissionRewardModal
        mission={selectedMission}
        visible={Boolean(selectedMission)}
        onClose={() => setSelectedMission(null)}
        onComplete={(id) => void completeSelectedMission(id)}
        onCancel={(id) => void cancelSelectedMission(id)}
      />
      <SkillUnlockModal
        reward={unlockedSkill}
        visible={Boolean(unlockedSkill)}
        onClose={() => {
          setUnlockedSkill(null);
          setActiveTab('Profil');
        }}
      />

      <View className="flex-row border-t border-[#292a30] bg-[#17181d] px-2 pb-1 pt-2">
        {navigationItems.map((item) => {
          const isActive = activeTab === item.label;

          return (
            <Pressable
              key={item.label}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              onPress={() => setActiveTab(item.label)}
              className="flex-1 items-center py-2"
            >
              <FontAwesomeIcon
                icon={item.icon}
                size={18}
                color={isActive ? '#e7bd68' : '#77757d'}
              />
              <Text
                className={`mt-1.5 text-[10px] font-bold ${
                  isActive ? 'text-[#e7bd68]' : 'text-[#77757d]'
                }`}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}
