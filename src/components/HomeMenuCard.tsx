import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import { Pressable, Text, View } from 'react-native';

type HomeMenuCardProps = {
  icon: IconProp;
  label: string;
  onPress: () => void;
  accessibilityLabel: string;
};

export function HomeMenuCard({
  icon,
  label,
  onPress,
  accessibilityLabel,
}: HomeMenuCardProps) {
  return (
    <View className="w-[23%] items-center">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        className="h-12 w-12 items-center justify-center rounded-2xl bg-[#342b1b] active:bg-[#4b3a22]"
      >
        {({ pressed }) => (
          <View className={pressed ? 'opacity-70' : 'opacity-100'}>
            <FontAwesomeIcon icon={icon} size={15} color="#e7bd68" />
          </View>
        )}
      </Pressable>
      <Text className="mt-2 text-center text-[11px] font-black text-[#f5f0e6]">{label}</Text>
    </View>
  );
}
