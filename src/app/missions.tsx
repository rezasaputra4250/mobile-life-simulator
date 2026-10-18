import { useState } from 'react';
import { router } from 'expo-router';
import { Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createCustomMission } from '../lib/authApi';
import { getSessionToken } from '../lib/session';
import { showFeedbackModal } from '../lib/errorModal';

export default function MissionCreateScreen() {
  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');
  const [missionDate, setMissionDate] = useState(getLocalDate());

  async function submit() {
    const token = await getSessionToken();
    if (!token || !title.trim()) { showFeedbackModal('Judul misi wajib diisi.', 'error'); return; }
    try {
      await createCustomMission(token, {
        title: title.trim(),
        detail: detail.trim() || undefined,
        mission_date: missionDate,
      });
      setTitle('');
      setDetail('');
      setMissionDate(getLocalDate());
      showFeedbackModal('Misi berhasil dibuat dan masuk kategori Pribadi.', 'success');
      router.back();
    }
    catch (error) { showFeedbackModal(error instanceof Error ? error.message : 'Misi gagal dibuat.', 'error'); }
  }

  return (
    <SafeAreaView className="flex-1 bg-[#17181d] px-5 pt-8" edges={['top', 'left', 'right', 'bottom']}>
      <Pressable accessibilityRole="button" accessibilityLabel="Tutup form misi" onPress={() => router.back()}>
        <Text className="mb-6 text-sm font-bold text-[#e7bd68]">Tutup</Text>
      </Pressable>
      <Text className="text-3xl font-black text-[#f5f0e6]">Misi baru</Text>
      <Text className="mt-2 text-sm leading-6 text-[#aaa49a]">Ubah pekerjaan nyata menjadi progress karakter.</Text>
      <TextInput value={title} onChangeText={setTitle} placeholder="Contoh: Selesaikan laporan" placeholderTextColor="#77757d" className="mt-6 rounded-xl border border-[#5a482a] bg-[#242118] px-4 py-3 text-[#f5f0e6]" />
      <TextInput value={detail} onChangeText={setDetail} placeholder="Detail atau durasi" placeholderTextColor="#77757d" multiline className="mt-3 rounded-xl border border-[#5a482a] bg-[#242118] px-4 py-3 text-[#f5f0e6]" />
      <Text className="mt-4 text-xs font-bold uppercase tracking-[1px] text-[#aaa49a]">Waktu pelaksanaan</Text>
      <TextInput value={missionDate} onChangeText={setMissionDate} placeholder="YYYY-MM-DD" placeholderTextColor="#77757d" keyboardType="numbers-and-punctuation" maxLength={10} className="mt-2 rounded-xl border border-[#5a482a] bg-[#242118] px-4 py-3 text-[#f5f0e6]" />
      <Text className="mt-1 text-xs text-[#77757d]">Gunakan format tanggal seperti 2026-10-16.</Text>
      <View className="mt-3 rounded-xl border border-[#5a482a] bg-[#342b1b] px-4 py-3">
        <Text className="text-xs font-bold text-[#e7bd68]">Reward mengikuti difficulty aktif akun.</Text>
        <Text className="mt-1 text-xs text-[#aaa49a]">Ubah difficulty dari Profil untuk mission baru berikutnya.</Text>
      </View>
      <Pressable onPress={() => void submit()} className="mt-4 items-center rounded-xl bg-[#e7bd68] px-4 py-3"><Text className="font-black text-[#211c12]">Buat misi</Text></Pressable>
    </SafeAreaView>
  );
}

function getLocalDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
