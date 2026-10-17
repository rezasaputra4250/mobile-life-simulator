import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import { Pressable, Text, View } from 'react-native';

type HomeMenuCardProps = {
  icon: IconProp;
  label: string;
  summary: string;
  onPress: () => void;
  accessibilityLabel: string;
};

export function HomeMenuCard({
  icon,
  label,
  summary,
  onPress,
  accessibilityLabel,
}: HomeMenuCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      className="w-[23%] rounded-2xl border border-[#2d2e35] bg-[#1b1c22] p-2.5 active:border-[#8a6d38] active:bg-[#242118]"
    >
      {({ pressed }) => (
        <View className={`items-center ${pressed ? 'opacity-80' : 'opacity-100'}`}>
          <View className="h-9 w-9 items-center justify-center rounded-xl bg-[#342b1b]">
            <FontAwesomeIcon icon={icon} size={15} color="#e7bd68" />
          </View>
          <Text className="mt-2 text-center text-[11px] font-black text-[#f5f0e6]">{label}</Text>
          <Text className="mt-1 text-center text-[9px] leading-3 text-[#85838a]">{summary}</Text>
        </View>
      )}
    </Pressable>
  );
}
