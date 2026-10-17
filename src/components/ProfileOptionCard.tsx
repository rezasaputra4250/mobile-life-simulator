import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { Pressable, Text, View, type PressableProps } from 'react-native';

type ProfileOptionCardProps = {
  icon: IconProp;
  label: string;
  description: string;
} & PressableProps;

export function ProfileOptionCard({ icon, label, description, ...pressableProps }: ProfileOptionCardProps) {
  return (
    <Pressable
      {...pressableProps}
      accessibilityRole="button"
      className="mb-3 flex-row items-center rounded-2xl border border-[#2d2e35] bg-[#1b1c22] p-4 active:border-[#8a6d38] active:bg-[#242118]"
    >
      <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-[#342b1b]">
        <FontAwesomeIcon icon={icon} size={16} color="#e7bd68" />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-black text-[#f5f0e6]">{label}</Text>
        <Text className="mt-1 text-xs leading-4 text-[#85838a]">{description}</Text>
      </View>
      <FontAwesomeIcon icon={faChevronRight} size={13} color="#e7bd68" />
    </Pressable>
  );
}
