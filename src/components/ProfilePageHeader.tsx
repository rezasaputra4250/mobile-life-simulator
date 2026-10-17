import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronLeft, faUserShield } from '@fortawesome/free-solid-svg-icons';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

type ProfilePageHeaderProps = {
  title: string;
  subtitle: string;
  eyebrow?: string;
};

export function ProfilePageHeader({ title, subtitle, eyebrow = 'PROFIL PLAYER' }: ProfilePageHeaderProps) {
  return (
    <View className="mb-6">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Kembali ke profil"
        onPress={() => router.back()}
        className="mb-6 h-10 flex-row items-center self-start rounded-xl border border-[#34353d] bg-[#1b1c22] px-3"
      >
        <FontAwesomeIcon icon={faChevronLeft} size={13} color="#e7bd68" />
        <Text className="ml-2 text-xs font-black text-[#e7bd68]">Kembali ke profil</Text>
      </Pressable>
      <View className="flex-row items-start">
        <View className="mr-3 h-11 w-11 items-center justify-center rounded-2xl border border-[#5a482a] bg-[#342b1b]">
          <FontAwesomeIcon icon={faUserShield} size={18} color="#e7bd68" />
        </View>
        <View className="flex-1">
          <Text className="text-[10px] font-black uppercase tracking-[1.8px] text-[#e7bd68]">{eyebrow}</Text>
          <Text className="mt-1 text-2xl font-black text-[#f5f0e6]">{title}</Text>
          <Text className="mt-1 text-sm leading-5 text-[#929097]">{subtitle}</Text>
        </View>
      </View>
    </View>
  );
}
