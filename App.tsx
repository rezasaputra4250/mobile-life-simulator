import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SecureStore from 'expo-secure-store';
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
  faScroll,
  faShieldHalved,
  faStar,
  faTrophy,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
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
  getInventory,
  getMissions,
  login,
  register,
  resetPassword,
  toggleMission as toggleMissionApi,
  type AuthSession,
  type AuthUser,
  type InventoryData,
  type Mission,
  type MissionReward,
} from './src/lib/authApi';
import './global.css';

const initialMissions: Mission[] = [
  {
    id: 1,
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
  { label: 'Jurnal', icon: faBookOpen },
  { label: 'Inventori', icon: faScroll },
  { label: 'Profil', icon: faUser },
];

function formatMissionReward(mission: Mission) {
  if (mission.reward.type === 'xp') return `+${mission.reward.amount} XP`;
  if (mission.reward.type === 'skill') return `Skill: ${mission.reward.name}`;
  if (mission.reward.type === 'item') return `Item: ${mission.reward.name}`;
  return `Badge: ${mission.reward.name}`;
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
        mission.completed ? 'border-[#34352f] bg-[#1a1d1b]' : 'border-[#2d2e35] bg-[#1b1c22]'
      }`}
    >
      <View
        className={`mr-3 h-6 w-6 items-center justify-center rounded-full border ${
          mission.completed
            ? 'border-[#8cbf9a] bg-[#8cbf9a]'
            : 'border-[#5e5b53] bg-transparent'
        }`}
      >
        {mission.completed && <FontAwesomeIcon icon={faCheck} size={12} color="#101116" />}
      </View>
      <View className="flex-1">
        <Text
          className={`text-sm font-bold ${
            mission.completed ? 'text-[#898e88] line-through' : 'text-[#f1ede4]'
          }`}
        >
          {mission.title}
        </Text>
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
}: {
  mission: Mission | null;
  visible: boolean;
  onClose: () => void;
  onComplete: (missionId: number) => void;
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

          {mission.completed ? (
            <View className="rounded-2xl border border-[#416247] bg-[#243027] p-4">
              <Text className="text-center text-sm font-bold text-[#8cbf9a]">Misi sudah selesai</Text>
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
              Skill baru aktif
            </Text>
            <Text className="mt-2 text-center text-2xl font-black text-[#fff8e9]">
              {reward.name}
            </Text>
          </View>

          <View className="mb-5 rounded-2xl border border-[#5d4a29] bg-[#342b1b] p-4">
            <Text className="text-center text-sm leading-5 text-[#c5beb0]">
              {reward.description || 'Kemampuan baru telah ditambahkan ke daftar skill aktifmu.'}
            </Text>
            <Text className="mt-3 text-center text-xs font-bold text-[#8cbf9a]">
              Skill ini sekarang bisa dilihat di Profil Petualang.
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={onClose}
            className="h-12 items-center justify-center rounded-2xl bg-[#e7bd68]"
          >
            <Text className="text-sm font-black text-[#211c12]">Lihat skill saya</Text>
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
  level,
  experience,
  experienceToNextLevel,
}: {
  label: string;
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
  onAuthenticated: (session: AuthSession) => Promise<void>;
  initialError?: string;
}) {
  const [screen, setScreen] = useState<AuthScreenName>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(initialError ?? '');
  const [notice, setNotice] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');

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
          ? await register(name.trim(), normalizedEmail, password)
          : await login(normalizedEmail, password);
      await onAuthenticated(session);
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
    keyboardType?: 'default' | 'email-address';
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
                <Text className="text-xs font-semibold text-[#8cbf9a]">Sesi tersimpan otomatis</Text>
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

export default function App() {
  const [missions, setMissions] = useState(initialMissions);
  const [activeTab, setActiveTab] = useState('Beranda');
  const [isGuest, setIsGuest] = useState(false);
  const [authSession, setAuthSession] = useState<AuthSession | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState('');
  const [missionError, setMissionError] = useState('');
  const [isMissionLoading, setIsMissionLoading] = useState(false);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [unlockedSkill, setUnlockedSkill] = useState<MissionReward | null>(null);
  const [missionFilter, setMissionFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [inventory, setInventory] = useState<InventoryData>({
    items: [],
    badges: [],
    totals: { items: 0, badges: 0 },
  });
  const [isInventoryLoading, setIsInventoryLoading] = useState(false);
  const [inventoryError, setInventoryError] = useState('');
  const completedMissions = missions.filter((mission) => mission.completed).length;
  const totalMissionXp = missions.reduce(
    (total, mission) =>
      total + (mission.completed && mission.reward.type === 'xp' ? mission.reward.amount : 0),
    0,
  );
  const userLevel = authUser?.stats?.level ?? authUser?.level ?? 12;
  const userExperience = authUser?.stats?.experience ?? authUser?.experience ?? 0;
  const nextLevelExperience =
    authUser?.stats?.experience_to_next_level ?? authUser?.experience_to_next_level ?? 100;
  const userProfile = authUser?.profile;
  const visibleMissions = missions.filter((mission) => {
    if (missionFilter === 'active') return !mission.completed;
    if (missionFilter === 'completed') return mission.completed;
    return true;
  });

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      try {
        const token =
          Platform.OS === 'web'
            ? window.localStorage.getItem('auth_token')
            : await SecureStore.getItemAsync('auth_token');
        if (!token) return;

        try {
          const result = await getCurrentUser(token);
          if (isMounted) {
            setAuthSession({ token, user: result.user, message: result.message });
            setAuthUser(result.user);
          }
        } catch (error) {
          if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
            if (Platform.OS === 'web') {
              window.localStorage.removeItem('auth_token');
            } else {
              await SecureStore.deleteItemAsync('auth_token');
            }
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
    let isMounted = true;

    async function loadMissions() {
      setIsMissionLoading(true);
      try {
        const result = await getMissions(authSession.token);
        if (isMounted) {
          setMissions(result.missions);
          setMissionError('');
        }
      } catch (error) {
        if (isMounted) {
          setMissionError(error instanceof Error ? error.message : 'Misi belum dapat dimuat.');
        }
      } finally {
        if (isMounted) setIsMissionLoading(false);
      }
    }

    void loadMissions();
    return () => {
      isMounted = false;
    };
  }, [authSession]);

  useEffect(() => {
    if (!authSession) return;
    let isMounted = true;

    async function loadInventory() {
      setIsInventoryLoading(true);
      try {
        const result = await getInventory(authSession.token);
        if (isMounted) {
          setInventory(result);
          setInventoryError('');
        }
      } catch (error) {
        if (isMounted) {
          setInventoryError(
            error instanceof Error ? error.message : 'Inventori belum dapat dimuat.',
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

  async function handleAuthenticated(session: AuthSession) {
    if (Platform.OS === 'web') {
      window.localStorage.setItem('auth_token', session.token);
    } else {
      await SecureStore.setItemAsync('auth_token', session.token);
    }
    setAuthSession(session);
    setAuthUser(session.user);
    setIsGuest(false);
    setAuthError('');
  }

  async function handleLogout() {
    try {
      if (Platform.OS === 'web') {
        window.localStorage.removeItem('auth_token');
      } else {
        await SecureStore.deleteItemAsync('auth_token');
      }
    } catch {
      setAuthError('Token sesi tidak dapat dihapus dari penyimpanan perangkat.');
      return;
    }
    setAuthSession(null);
    setAuthUser(null);
    setInventory({ items: [], badges: [], totals: { items: 0, badges: 0 } });
    setIsGuest(false);
    setActiveTab('Beranda');
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
    setSelectedMission(mission);
  }

  async function completeSelectedMission(id: number) {
    const result = await toggleMission(id);
    if (result.completed) {
      setSelectedMission(null);
      if (result.reward?.type === 'skill') setUnlockedSkill(result.reward);
      if (authSession) {
        try {
          const [profileResult, inventoryResult] = await Promise.all([
            getCurrentUser(authSession.token),
            getInventory(authSession.token),
          ]);
          setAuthUser(profileResult.user);
          setInventory(inventoryResult);
        } catch (error) {
          setMissionError(
            error instanceof Error ? error.message : 'Data karakter belum dapat diperbarui.',
          );
        }
      }
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

          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-xs font-semibold text-[#c5beb0]">Progres misi</Text>
            <Text className="text-xs font-extrabold text-[#e7bd68]">
              {completedMissions}/{missions.length} selesai
            </Text>
          </View>
          <View className="h-[7px] overflow-hidden rounded-full bg-[#484132]">
            <View
              className="h-full rounded-full bg-[#e7bd68]"
              style={{ width: `${missions.length ? (completedMissions / missions.length) * 100 : 0}%` }}
            />
          </View>
        </View>

        <View className="mb-7 flex-row gap-3">
          <View className="flex-1 rounded-2xl border border-[#2d2e35] bg-[#1b1c22] p-4">
            <View className="mb-3 h-9 w-9 items-center justify-center rounded-xl bg-[#33291d]">
              <FontAwesomeIcon icon={faStar} size={16} color="#e7bd68" />
            </View>
            <Text className="text-[10px] font-bold uppercase tracking-[1.2px] text-[#85838a]">
              Level
            </Text>
            <Text className="mt-1 text-xl font-extrabold text-[#f5f0e6]">{userLevel}</Text>
          </View>
          <View className="flex-1 rounded-2xl border border-[#2d2e35] bg-[#1b1c22] p-4">
            <View className="mb-3 h-9 w-9 items-center justify-center rounded-xl bg-[#33291d]">
              <FontAwesomeIcon icon={faFire} size={16} color="#e87959" />
            </View>
            <Text className="text-[10px] font-bold uppercase tracking-[1.2px] text-[#85838a]">
              Streak
            </Text>
            <Text className="mt-1 text-xl font-extrabold text-[#f5f0e6]">5 hari</Text>
          </View>
          <View className="flex-1 rounded-2xl border border-[#2d2e35] bg-[#1b1c22] p-4">
            <View className="mb-3 h-9 w-9 items-center justify-center rounded-xl bg-[#33291d]">
              <FontAwesomeIcon icon={faShieldHalved} size={16} color="#8cbf9a" />
            </View>
            <Text className="text-[10px] font-bold uppercase tracking-[1.2px] text-[#85838a]">
              XP hari ini
            </Text>
            <Text className="mt-1 text-xl font-extrabold text-[#f5f0e6]">+{totalMissionXp}</Text>
          </View>
        </View>

        <View className="mb-4 flex-row items-center justify-between">
          <View>
            <Text className="text-xl font-extrabold text-[#f5f0e6]">Papan misi</Text>
            <Text className="mt-1 text-xs text-[#85838a]">Tuntaskan misi, kumpulkan XP.</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Tambah misi"
            className="h-10 w-10 items-center justify-center rounded-xl border border-[#5a482a] bg-[#2b251a]"
          >
            <FontAwesomeIcon icon={faPlus} size={16} color="#e7bd68" />
          </Pressable>
        </View>

        {isMissionLoading ? (
          <Text className="py-4 text-center text-sm text-[#85838a]">Memuat data misi...</Text>
        ) : missions.length ? (
          <View className="gap-3">
            {missions.slice(0, 3).map((mission) => (
              <MissionCard key={mission.id} mission={mission} onPress={openMissionDetails} />
            ))}
          </View>
        ) : (
          <Text className="py-4 text-center text-sm text-[#85838a]">Belum ada misi.</Text>
        )}
          </>
        ) : activeTab === 'Misi' ? (
          <>
            <View className="mb-6">
              <Text className="text-2xl font-black text-[#f5f0e6]">Papan Misi</Text>
              <Text className="mt-2 text-sm leading-5 text-[#929097]">
                Selesaikan tantanganmu dan kumpulkan XP untuk naik level.
              </Text>
            </View>

            <View className="mb-6 rounded-2xl border border-[#5a482a] bg-[#242118] p-4">
              <View className="mb-3 flex-row items-center">
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-[#3a3020]">
                  <FontAwesomeIcon icon={faFlag} size={17} color="#e7bd68" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-extrabold text-[#f5f0e6]">Misi harian</Text>
                  <Text className="mt-1 text-xs text-[#aaa49a]">
                    {completedMissions} dari {missions.length} misi selesai
                  </Text>
                </View>
                <Text className="text-sm font-extrabold text-[#e7bd68]">
                  {missions.reduce(
                    (total, mission) =>
                      total + (mission.completed && mission.reward.type === 'xp' ? mission.reward.amount : 0),
                    0,
                  )}{' '}
                  XP
                </Text>
              </View>
              <View className="h-[7px] overflow-hidden rounded-full bg-[#484132]">
                <View
                  className="h-full rounded-full bg-[#e7bd68]"
                  style={{
                    width: `${missions.length ? (completedMissions / missions.length) * 100 : 0}%`,
                  }}
                />
              </View>
            </View>

            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-base font-extrabold text-[#f5f0e6]">Semua tantangan</Text>
              <Text className="text-xs font-semibold text-[#85838a]">{visibleMissions.length} misi</Text>
            </View>
            <View className="mb-4 flex-row gap-2">
              {(['all', 'active', 'completed'] as const).map((filter) => (
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
                    {filter === 'all' ? 'Semua' : filter === 'active' ? 'Aktif' : 'Selesai'}
                  </Text>
                </Pressable>
              ))}
            </View>
            {isMissionLoading ? (
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

            <View className="mt-6 rounded-2xl border border-dashed border-[#49433a] bg-[#191a1f] p-4">
              <View className="flex-row items-center">
                <FontAwesomeIcon icon={faPlus} size={14} color="#e7bd68" />
                <Text className="ml-3 flex-1 text-sm font-semibold text-[#aaa49a]">
                  Misi baru segera hadir di guild.
                </Text>
              </View>
            </View>
          </>
        ) : activeTab === 'Inventori' ? (
          <>
            <View className="mb-6">
              <Text className="text-2xl font-black text-[#f5f0e6]">Inventori Petualang</Text>
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
            {missions.some((mission) => mission.completed) ? (
              <View className="gap-3">
                {missions
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

            <View className="mt-6 flex-row items-center rounded-2xl border border-[#2d2e35] bg-[#1b1c22] p-4">
              <FontAwesomeIcon icon={faFire} size={17} color="#e87959" />
              <Text className="ml-3 flex-1 text-sm text-[#c5beb0]">Konsistensi petualangan</Text>
              <Text className="text-sm font-extrabold text-[#f5f0e6]">5 hari berturut-turut</Text>
            </View>
          </>
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
                    {userExperience} / {nextLevelExperience} XP
                  </Text>
                </View>
                <View className="h-[7px] overflow-hidden rounded-full bg-[#484132]">
                  <View
                    className="h-full rounded-full bg-[#e7bd68]"
                    style={{
                      width: `${Math.min((userExperience / Math.max(nextLevelExperience, 1)) * 100, 100)}%`,
                    }}
                  />
                </View>
              </View>
            </View>

            <View className="mb-6 flex-row gap-3">
              <SummaryCard
                label="Misi selesai"
                value={`${completedMissions}/${missions.length}`}
                icon={faFlag}
                accent="#e7bd68"
                progress={missions.length ? (completedMissions / missions.length) * 100 : 0}
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
                progress={(userExperience / Math.max(nextLevelExperience, 1)) * 100}
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

            <Text className="mb-3 text-base font-extrabold text-[#f5f0e6]">Skill petualang</Text>
            {authUser?.skills?.length ? (
              authUser.skills.map((skill) => (
                <SkillCard
                  key={skill.id}
                  label={skill.label}
                  level={skill.level}
                  experience={skill.experience}
                  experienceToNextLevel={skill.experience_to_next_level}
                />
              ))
            ) : (
              <View className="mb-6 rounded-2xl border border-dashed border-[#49433a] bg-[#191a1f] p-4">
                <Text className="text-sm text-[#85838a]">Belum ada skill yang terbuka.</Text>
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

      <MissionRewardModal
        mission={selectedMission}
        visible={Boolean(selectedMission)}
        onClose={() => setSelectedMission(null)}
        onComplete={(id) => void completeSelectedMission(id)}
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
