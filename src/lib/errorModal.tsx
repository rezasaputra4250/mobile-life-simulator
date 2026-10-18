import { useEffect, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

type FeedbackTone = 'error' | 'success' | 'info';

let showListener: ((message: string, tone: FeedbackTone) => void) | null = null;

export function showErrorModal(message: string) {
  showListener?.(message, 'error');
}

export function showFeedbackModal(message: string, tone: FeedbackTone = 'info') {
  showListener?.(message, tone);
}

export function ErrorModalHost() {
  const [message, setMessage] = useState<string | null>(null);
  const [tone, setTone] = useState<FeedbackTone>('error');

  useEffect(() => {
    showListener = (nextMessage, nextTone) => {
      setMessage(nextMessage);
      setTone(nextTone);
    };
    return () => {
      showListener = null;
    };
  }, []);

  return (
    <Modal visible={Boolean(message)} transparent animationType="fade" onRequestClose={() => setMessage(null)}>
      <View className="flex-1 items-center justify-center bg-black/70 px-6">
        <View className={`w-full rounded-3xl border p-5 ${tone === 'error' ? 'border-[#793e3e] bg-[#241b1d]' : 'border-[#5a482a] bg-[#242118]'}`}>
          <Text className="text-lg font-black text-[#fff8e9]">
            {tone === 'error' ? 'Terjadi kesalahan' : tone === 'success' ? 'Berhasil' : 'Informasi'}
          </Text>
          <Text className={`mt-3 text-sm leading-5 ${tone === 'error' ? 'text-[#f1a39a]' : tone === 'success' ? 'text-[#8cbf9a]' : 'text-[#e7bd68]'}`}>{message}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Tutup modal informasi"
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
