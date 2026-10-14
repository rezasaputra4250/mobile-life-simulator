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
  login,
  register,
  resetPassword,
  type AuthSession,
  type AuthUser,
} from './src/lib/authApi';
import './global.css';

type Mission = {
  id: number;
  title: string;
  detail: string;
  reward: number;
  completed: boolean;
};

const initialMissions: Mission[] = [
  {
    id: 1,
    title: 'Selesaikan tugas utama',
    detail: 'Fokus kerja · 30 menit',
    reward: 50,
    completed: false,
  },
  {
    id: 2,
    title: 'Latihan pagi',
    detail: 'Kebugaran · 20 menit',
    reward: 30,
    completed: false,
  },
  {
    id: 3,
    title: 'Baca satu bab buku',
    detail: 'Pengetahuan · 15 menit',
    reward: 25,
    completed: true,
  },
];

const navigationItems: { label: string; icon: IconProp }[] = [
  { label: 'Beranda', icon: faHouse },
  { label: 'Misi', icon: faFlag },
  { label: 'Jurnal', icon: faBookOpen },
  { label: 'Profil', icon: faUser },
];

function MissionCard({
  mission,
  onToggle,
}: {
  mission: Mission;
  onToggle: (id: number) => void;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: mission.completed }}
      onPress={() => onToggle(mission.id)}
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
        <Text className="text-xs font-extrabold text-[#e7bd68]">+{mission.reward} XP</Text>
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

type AuthScreenName = 'login' | 'register' | 'forgot' | 'reset';

function AuthScreen({
  onContinueAsGuest,
  onAuthenticated,
  initialError,
}: {
  onContinueAsGuest: () => void;
  onAuthenticated: (session: AuthSession, rememberMe: boolean) => Promise<void>;
  initialError?: string;
}) {
  const [screen, setScreen] = useState<AuthScreenName>('login');
  const [rememberMe, setRememberMe] = useState(false);
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
      await onAuthenticated(session, screen === 'login' && rememberMe);
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
                {Platform.OS !== 'web' && (
                  <Pressable
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: rememberMe }}
                    onPress={() => setRememberMe(!rememberMe)}
                    className="flex-row items-center py-1"
                  >
                    <View
                      className={`mr-2 h-[18px] w-[18px] items-center justify-center rounded border ${
                        rememberMe
                          ? 'border-[#e7bd68] bg-[#e7bd68]'
                          : 'border-[#64616a] bg-transparent'
                      }`}
                    >
                      {rememberMe && <FontAwesomeIcon icon={faCheck} size={11} color="#101116" />}
                    </View>
                    <Text className="text-xs font-semibold text-[#c5beb0]">Ingat saya</Text>
                  </Pressable>
                )}
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
              ? Platform.OS === 'web'
                ? 'Sesi login hanya berlaku selama aplikasi terbuka di browser.'
                : 'Token login disimpan dengan aman di perangkat hanya jika Ingat saya dipilih.'
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
  const completedMissions = missions.filter((mission) => mission.completed).length;

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      if (Platform.OS === 'web') {
        setAuthReady(true);
        return;
      }
      try {
        const token = await SecureStore.getItemAsync('auth_token');
        if (!token) return;

        try {
          const result = await getCurrentUser(token);
          if (isMounted) {
            setAuthSession({ token, user: result.user, message: result.message });
            setAuthUser(result.user);
          }
        } catch (error) {
          if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
            await SecureStore.deleteItemAsync('auth_token');
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

  async function handleAuthenticated(session: AuthSession, rememberMe: boolean) {
    if (Platform.OS !== 'web' && rememberMe) {
      await SecureStore.setItemAsync('auth_token', session.token);
    } else if (Platform.OS !== 'web') {
      await SecureStore.deleteItemAsync('auth_token');
    }
    setAuthSession(session);
    setAuthUser(session.user);
    setIsGuest(false);
    setAuthError('');
  }

  async function handleLogout() {
    if (Platform.OS !== 'web') {
      try {
        await SecureStore.deleteItemAsync('auth_token');
      } catch {
        setAuthError('Token sesi tidak dapat dihapus dari penyimpanan perangkat.');
        return;
      }
    }
    setAuthSession(null);
    setAuthUser(null);
    setIsGuest(false);
    setActiveTab('Beranda');
  }

  function toggleMission(id: number) {
    setMissions((currentMissions) =>
      currentMissions.map((mission) =>
        mission.id === id ? { ...mission, completed: !mission.completed } : mission,
      ),
    );
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
            <Text className="mt-1 text-xl font-extrabold text-[#f5f0e6]">12</Text>
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
            <Text className="mt-1 text-xl font-extrabold text-[#f5f0e6]">+25</Text>
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

        <View className="gap-3">
          {missions.slice(0, 3).map((mission) => (
            <MissionCard key={mission.id} mission={mission} onToggle={toggleMission} />
          ))}
        </View>
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
                    (total, mission) => total + (mission.completed ? mission.reward : 0),
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
              <Text className="text-xs font-semibold text-[#85838a]">{missions.length} misi</Text>
            </View>
            <View className="gap-3">
              {missions.map((mission) => (
                <MissionCard key={mission.id} mission={mission} onToggle={toggleMission} />
              ))}
            </View>

            <View className="mt-6 rounded-2xl border border-dashed border-[#49433a] bg-[#191a1f] p-4">
              <View className="flex-row items-center">
                <FontAwesomeIcon icon={faPlus} size={14} color="#e7bd68" />
                <Text className="ml-3 flex-1 text-sm font-semibold text-[#aaa49a]">
                  Misi baru segera hadir di guild.
                </Text>
              </View>
            </View>
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
                  (total, mission) => total + (mission.completed ? mission.reward : 0),
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
                        +{mission.reward} XP
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
                {authUser?.email ?? 'Penjaga Guild'} · Level {authUser?.level ?? 12}
              </Text>
              <View className="mt-5 w-full">
                <View className="mb-2 flex-row items-center justify-between">
                  <Text className="text-xs font-semibold text-[#c5beb0]">Pengalaman menuju Lv. 13</Text>
                  <Text className="text-xs font-extrabold text-[#e7bd68]">680 / 1.000 XP</Text>
                </View>
                <View className="h-[7px] overflow-hidden rounded-full bg-[#484132]">
                  <View className="h-full w-[68%] rounded-full bg-[#e7bd68]" />
                </View>
              </View>
            </View>

            <View className="mb-6 flex-row gap-3">
              <View className="flex-1 items-center rounded-2xl border border-[#2d2e35] bg-[#1b1c22] p-4">
                <FontAwesomeIcon icon={faFlag} size={17} color="#e7bd68" />
                <Text className="mt-3 text-lg font-extrabold text-[#f5f0e6]">
                  {completedMissions}
                </Text>
                <Text className="mt-1 text-[10px] font-bold uppercase tracking-[1px] text-[#85838a]">
                  Misi selesai
                </Text>
              </View>
              <View className="flex-1 items-center rounded-2xl border border-[#2d2e35] bg-[#1b1c22] p-4">
                <FontAwesomeIcon icon={faFire} size={17} color="#e87959" />
                <Text className="mt-3 text-lg font-extrabold text-[#f5f0e6]">5 hari</Text>
                <Text className="mt-1 text-[10px] font-bold uppercase tracking-[1px] text-[#85838a]">
                  Streak terbaik
                </Text>
              </View>
              <View className="flex-1 items-center rounded-2xl border border-[#2d2e35] bg-[#1b1c22] p-4">
                <FontAwesomeIcon icon={faBolt} size={17} color="#8cbf9a" />
                <Text className="mt-3 text-lg font-extrabold text-[#f5f0e6]">680</Text>
                <Text className="mt-1 text-[10px] font-bold uppercase tracking-[1px] text-[#85838a]">
                  Total XP
                </Text>
              </View>
            </View>

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
