import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

type ProfilePageHeaderProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  rightIcon?: IconProp;
  rightAccessibilityLabel?: string;
  onRightPress?: () => void;
};

export function ProfilePageHeader({
  title,
  subtitle,
  eyebrow = 'PROFIL PLAYER',
  rightIcon,
  rightAccessibilityLabel,
  onRightPress,
}: ProfilePageHeaderProps) {
  return (
    <View className="mb-6">
      <View className="h-12 flex-row items-center">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Kembali ke halaman sebelumnya"
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-xl border border-[#34353d] bg-[#1b1c22]"
        >
          <FontAwesomeIcon icon={faChevronLeft} size={14} color="#e7bd68" />
        </Pressable>
        <View className="flex-1 items-center px-3">
          <Text className="text-center text-[10px] font-black uppercase tracking-[1.8px] text-[#e7bd68]">{eyebrow}</Text>
          <Text numberOfLines={1} className="mt-1 text-center text-lg font-black text-[#f5f0e6]">{title}</Text>
        </View>
        {rightIcon && onRightPress ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={rightAccessibilityLabel || 'Aksi halaman'}
            onPress={onRightPress}
            className="h-10 w-10 items-center justify-center rounded-xl border border-[#34353d] bg-[#1b1c22]"
          >
            <FontAwesomeIcon icon={rightIcon} size={14} color="#e7bd68" />
          </Pressable>
        ) : (
          <View className="h-10 w-10" />
        )}
      </View>
      {subtitle ? <Text className="mt-3 text-center text-sm leading-5 text-[#929097]">{subtitle}</Text> : null}
    </View>
  );
}
