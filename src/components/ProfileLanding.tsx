import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBookOpen, faChartSimple, faGaugeHigh, faKey, faMedal, faShareNodes, faShieldHalved, faStar, faUserPen } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import type { AffiliateProfile, AuthUser } from '../lib/authApi';
import { ProfileOptionCard } from './ProfileOptionCard';

type ProfileLandingProps = {
  user: AuthUser | null;
  level: number;
  currentExperience: number;
  requiredExperience: number;
  progressPercentage: number;
  affiliateProfile: AffiliateProfile | null;
  onShareReferral: () => void;
  onLogout: () => void;
};

export function ProfileLanding({
  user,
  level,
  currentExperience,
  requiredExperience,
  progressPercentage,
  affiliateProfile,
  onShareReferral,
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
      <Link href="/profile-edit" asChild>
        <ProfileOptionCard icon={faUserPen} label="Edit profil" description="Ubah nama, email, pekerjaan, dan informasi profil." />
      </Link>
      <Link href="/change-password" asChild>
        <ProfileOptionCard icon={faKey} label="Ganti password" description="Perbarui password akun dengan aman." />
      </Link>
      <Link href="/classes" asChild>
        <ProfileOptionCard icon={faShieldHalved} label="Ganti class" description="Sesuaikan pekerjaan dan bonus karakter dengan kondisimu." />
      </Link>
      <Link href="/profile/difficulty" asChild>
        <ProfileOptionCard icon={faGaugeHigh} label="Difficulty" description="Atur tingkat tantangan mission baru." />
      </Link>
      <Link href="/profile/skills" asChild>
        <ProfileOptionCard icon={faStar} label="Kemampuan" description="Lihat kemampuan dan progres EXP kemampuan." />
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

      <View className="mb-3 rounded-2xl border border-[#5a482a] bg-[#242118] p-4">
        <View className="flex-row items-center">
          <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-[#3a3020]">
            <FontAwesomeIcon icon={faShareNodes} size={17} color="#e7bd68" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-extrabold text-[#f5f0e6]">Bagikan referral</Text>
            <Text className="mt-1 text-xs leading-5 text-[#aaa49a]">Ajak pengguna baru bergabung menggunakan kode referralmu.</Text>
          </View>
        </View>
        <View className="mt-4 flex-row items-center rounded-xl border border-[#66522c] bg-[#342b1b] px-4 py-3">
          <View className="flex-1">
            <Text className="text-[10px] font-bold uppercase tracking-[1px] text-[#9c927e]">Kode referral</Text>
            <Text className="mt-1 text-lg font-black tracking-[2px] text-[#e7bd68]">{user?.affiliate_code || 'Belum tersedia'}</Text>
            {affiliateProfile ? <Text className="mt-1 text-[10px] text-[#8cbf9a]">{affiliateProfile.referrals_count} referral terhubung</Text> : null}
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Bagikan kode referral"
            disabled={!user?.affiliate_code}
            onPress={onShareReferral}
            className={`rounded-xl px-4 py-2 ${user?.affiliate_code ? 'bg-[#e7bd68]' : 'bg-[#5a5141]'}`}
          >
            <Text className="text-xs font-black text-[#211b10]">Bagikan</Text>
          </Pressable>
        </View>
      </View>

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
