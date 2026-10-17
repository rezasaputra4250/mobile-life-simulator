import { useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Link } from 'expo-router';
import { Pressable, Text, TextInput, View } from 'react-native';
import { createCustomMission } from '../lib/authApi';

export default function MissionCreateScreen() {
  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');
  const [missionDate, setMissionDate] = useState(getLocalDate());
  const [message, setMessage] = useState('');

  async function submit() {
    const token = await SecureStore.getItemAsync('auth_token');
    if (!token || !title.trim()) { setMessage('Judul misi wajib diisi.'); return; }
    try {
      await createCustomMission(token, {
        title: title.trim(),
        detail: detail.trim() || undefined,
        mission_date: missionDate,
      });
      setTitle('');
      setDetail('');
      setMissionDate(getLocalDate());
      setMessage('Misi berhasil dibuat dan masuk kategori Pribadi.');
    }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Misi gagal dibuat.'); }
  }

  return (
    <View className="flex-1 bg-[#17181d] px-5 pt-16">
      <Link href="/" asChild><Pressable><Text className="mb-6 text-sm font-bold text-[#e7bd68]">← Kembali</Text></Pressable></Link>
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
      {message ? <Text className="mt-4 text-sm font-bold text-[#8cbf9a]">{message}</Text> : null}
    </View>
  );
}

function getLocalDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
