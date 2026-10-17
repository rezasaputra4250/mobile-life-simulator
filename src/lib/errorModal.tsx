import { useEffect, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

let showListener: ((message: string) => void) | null = null;

export function showErrorModal(message: string) {
  showListener?.(message);
}

export function ErrorModalHost() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    showListener = setMessage;
    return () => {
      showListener = null;
    };
  }, []);

  return (
    <Modal visible={Boolean(message)} transparent animationType="fade" onRequestClose={() => setMessage(null)}>
      <View className="flex-1 items-center justify-center bg-black/70 px-6">
        <View className="w-full rounded-3xl border border-[#793e3e] bg-[#241b1d] p-5">
          <Text className="text-lg font-black text-[#fff8e9]">Terjadi kesalahan</Text>
          <Text className="mt-3 text-sm leading-5 text-[#f1a39a]">{message}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Tutup notifikasi error"
            onPress={() => setMessage(null)}
            className="mt-5 items-center rounded-2xl bg-[#e7bd68] py-3"
          >
            <Text className="text-sm font-black text-[#211c12]">Tutup</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
