import { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { getClasses, getProgression, selectClass, type PlayerClass } from '../lib/authApi';

export default function ClassesScreen() {
  const [classes, setClasses] = useState<PlayerClass[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [currentClassId, setCurrentClassId] = useState<number | null>(null);
  const [currentClassLabel, setCurrentClassLabel] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    void (async () => {
      const token = await SecureStore.getItemAsync('auth_token');
      if (!token) return;
      try {
        const [classesResult, progressionResult] = await Promise.all([getClasses(token), getProgression(token)]);
        setClasses(classesResult.data);
        setCurrentClassId(progressionResult.data.character?.class_id ?? null);
        setCurrentClassLabel(progressionResult.data.character?.class_label || '');
      }
      catch { setMessage('Class belum dapat dimuat.'); }
    })();
  }, []);

  async function choose(classId: number) {
    const token = await SecureStore.getItemAsync('auth_token');
    if (!token) return;
    try {
      await selectClass(token, classId);
      setSelected(classId);
      setCurrentClassId(classId);
      setCurrentClassLabel(classes.find((item) => item.id === classId)?.label || '');
      setMessage('Class berhasil dipilih.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Class gagal dipilih.'); }
  }

  return (
    <ScrollView className="flex-1 bg-[#17181d] px-5 pt-16">
      <Pressable onPress={() => router.back()}><Text className="mb-6 text-sm font-bold text-[#e7bd68]">← Kembali</Text></Pressable>
      <Text className="text-3xl font-black text-[#f5f0e6]">Class karakter</Text>
      <Text className="mt-2 text-sm leading-6 text-[#aaa49a]">Class menggambarkan pekerjaan atau peranmu saat ini dan dapat diubah kapan saja.</Text>
      {currentClassLabel ? <Text className="mt-4 text-sm font-bold text-[#8cbf9a]">Class saat ini: {currentClassLabel}</Text> : null}
      {message ? <Text className="mt-4 text-sm font-bold text-[#8cbf9a]">{message}</Text> : null}
      {classes.map((item) => (
        <Pressable key={item.id} onPress={() => void choose(item.id)} className={`mt-4 rounded-2xl border p-5 ${selected === item.id || currentClassId === item.id ? 'border-[#e7bd68] bg-[#342b1b]' : 'border-[#5a482a] bg-[#242118]'}`}>
          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-black text-[#f5f0e6]">{item.label}</Text>
            <Text className="text-xs font-bold uppercase text-[#e7bd68]">{item.primary_stat}</Text>
          </View>
          <Text className="mt-2 text-sm leading-6 text-[#aaa49a]">{item.description}</Text>
          <Text className="mt-3 text-xs font-bold text-[#8cbf9a]">STR +{item.strength_bonus} · INT +{item.intelligence_bonus} · AGI +{item.agility_bonus} · STA +{item.stamina_bonus} · LCK +{item.luck_bonus}</Text>
          {currentClassId === item.id ? <Text className="mt-3 text-[10px] font-black uppercase tracking-[1px] text-[#e7bd68]">Class aktif</Text> : null}
        </Pressable>
      ))}
    </ScrollView>
  );
}
