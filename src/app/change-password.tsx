import { useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { Pressable, ScrollView, Text, TextInput } from 'react-native';
import { changePassword } from '../lib/authApi';

export default function ChangePasswordScreen() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  async function save() {
    if (newPassword.length < 8) return setMessage('Password baru minimal 8 karakter.');
    if (newPassword !== confirmPassword) return setMessage('Konfirmasi password tidak sama.');
    const token = await SecureStore.getItemAsync('auth_token');
    if (!token) return setMessage('Sesi login tidak ditemukan.');
    setIsSaving(true);
    setMessage('');
    try {
      const result = await changePassword(token, currentPassword, newPassword, confirmPassword);
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      setMessage(result.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Password belum dapat diubah.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <ScrollView className="flex-1 bg-[#17181d] px-5 pt-16" contentContainerStyle={{ paddingBottom: 32 }}>
      <Pressable onPress={() => router.back()}><Text className="mb-6 text-sm font-bold text-[#e7bd68]">← Kembali ke profil</Text></Pressable>
      <Text className="text-3xl font-black text-[#f5f0e6]">Ganti password</Text>
      <Text className="mt-2 text-sm leading-6 text-[#aaa49a]">Gunakan password minimal 8 karakter dan jangan gunakan password yang sama di tempat lain.</Text>
      <TextInput value={currentPassword} onChangeText={setCurrentPassword} placeholder="Password saat ini" placeholderTextColor="#77757d" secureTextEntry className="mt-6 rounded-xl border border-[#5a482a] bg-[#242118] px-4 py-3 text-[#f5f0e6]" />
      <TextInput value={newPassword} onChangeText={setNewPassword} placeholder="Password baru" placeholderTextColor="#77757d" secureTextEntry className="mt-3 rounded-xl border border-[#5a482a] bg-[#242118] px-4 py-3 text-[#f5f0e6]" />
      <TextInput value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Ulangi password baru" placeholderTextColor="#77757d" secureTextEntry className="mt-3 rounded-xl border border-[#5a482a] bg-[#242118] px-4 py-3 text-[#f5f0e6]" />
      <Pressable onPress={() => void save()} disabled={isSaving} className="mt-5 items-center rounded-xl bg-[#e7bd68] px-4 py-3">
        <Text className="font-black text-[#211c12]">{isSaving ? 'Menyimpan...' : 'Simpan password'}</Text>
      </Pressable>
      {message ? <Text className="mt-4 text-sm font-bold text-[#f1a39a]">{message}</Text> : null}
    </ScrollView>
  );
}
