import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBookOpen, faChartSimple, faGaugeHigh, faMedal, faShieldHalved, faStar } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import type { AuthUser } from '../lib/authApi';
import { ProfileOptionCard } from './ProfileOptionCard';

type ProfileLandingProps = {
  user: AuthUser | null;
  level: number;
  currentExperience: number;
  requiredExperience: number;
  progressPercentage: number;
  onLogout: () => void;
};

export function ProfileLanding({
  user,
  level,
  currentExperience,
  requiredExperience,
  progressPercentage,
  onLogout,
}: ProfileLandingProps) {
  return (
    <View>
      <View className="mb-6">
        <Text className="text-2xl font-black text-[#f5f0e6]">Profil Petualang</Text>
        <Text className="mt-2 text-sm leading-5 text-[#929097]">Kelola karakter dan perkembangan player.</Text>
      </View>

      <View className="mb-6 items-center rounded-[26px] border border-[#5a482a] bg-[#242118] px-5 py-6">
        <View className="mb-4 h-[76px] w-[76px] items-center justify-center rounded-full border-2 border-[#8a6d38] bg-[#3a3020]">
          <FontAwesomeIcon icon={faShieldHalved} size={31} color="#e7bd68" />
        </View>
        <Text className="text-xl font-black text-[#fff8e9]">{user?.name ?? 'Penjelajah'}</Text>
        <Text className="mt-1 text-xs font-bold uppercase tracking-[1.7px] text-[#aaa49a]">
          {user?.email ?? 'Penjaga Guild'} · Level {level}
        </Text>
        <View className="mt-5 w-full">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-xs font-semibold text-[#c5beb0]">Pengalaman menuju Lv. {level + 1}</Text>
            <Text className="text-xs font-extrabold text-[#e7bd68]">{currentExperience} / {requiredExperience} XP</Text>
          </View>
          <View className="h-[7px] overflow-hidden rounded-full bg-[#484132]">
            <View className="h-full rounded-full bg-[#e7bd68]" style={{ width: `${progressPercentage}%` }} />
          </View>
        </View>
      </View>

      <Text className="mb-3 text-base font-extrabold text-[#f5f0e6]">Pengaturan player</Text>
      <Link href="/classes" asChild>
        <ProfileOptionCard icon={faShieldHalved} label="Class" description="Pilih jalur perkembangan karakter." />
      </Link>
      <Link href="/profile/difficulty" asChild>
        <ProfileOptionCard icon={faGaugeHigh} label="Difficulty" description="Atur tingkat tantangan mission baru." />
      </Link>
      <Link href="/profile/skills" asChild>
        <ProfileOptionCard icon={faStar} label="Skill" description="Lihat skill dan progres EXP skill." />
      </Link>
      <Link href="/profile/stats" asChild>
        <ProfileOptionCard icon={faChartSimple} label="Statistik" description="Lihat atribut utama karakter." />
      </Link>
      <Link href="/profile/badges" asChild>
        <ProfileOptionCard icon={faMedal} label="Badge" description="Lihat pencapaian yang sudah terbuka." />
      </Link>
      <Link href="/progression" asChild>
        <ProfileOptionCard icon={faBookOpen} label="Progression & EXP" description="Lihat level dan riwayat EXP lengkap." />
      </Link>

      {user ? (
        <Pressable
          accessibilityRole="button"
          onPress={onLogout}
          className="mt-3 h-12 items-center justify-center rounded-2xl border border-[#793e3e] bg-[#321f21]"
        >
          <Text className="text-sm font-bold text-[#f1a39a]">Keluar dari akun</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
