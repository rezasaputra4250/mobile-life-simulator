import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { ProfilePageHeader } from '../components/ProfilePageHeader';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCurrentUser, updateProfile } from '../lib/authApi';
import { getSessionToken } from '../lib/session';
import { religions, type Religion } from '../constants/religions';
import { showFeedbackModal } from '../lib/errorModal';

export default function ProfileEditScreen() {
  const [token, setToken] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('');
  const [department, setDepartment] = useState('');
  const [bio, setBio] = useState('');
  const [religion, setReligion] = useState<Religion | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      const savedToken = await getSessionToken();
      if (!savedToken) return;
      setToken(savedToken);
      try {
        const result = await getCurrentUser(savedToken);
        setName(result.user.name);
        setEmail(result.user.email);
        setPhone(result.user.profile?.phone || '');
        setPosition(result.user.profile?.position || '');
        setDepartment(result.user.profile?.department || '');
        setBio(result.user.profile?.bio || '');
        setReligion(result.user.profile?.religion || null);
      } catch (error) {
        showFeedbackModal(error instanceof Error ? error.message : 'Profil belum dapat dimuat.', 'error');
      }
    })();
  }, []);

  async function save() {
    if (!token || !name.trim() || !email.trim()) {
      showFeedbackModal('Nama dan email wajib diisi.', 'error');
      return;
    }
    setIsSaving(true);
    try {
      const result = await updateProfile(token, {
        name: name.trim(), email: email.trim().toLowerCase(), phone: phone.trim() || null,
        position: position.trim() || null, department: department.trim() || null, bio: bio.trim() || null,
        religion,
      });
      showFeedbackModal(result.message, 'success');
      router.back();
    } catch (error) {
      showFeedbackModal(error instanceof Error ? error.message : 'Profil belum dapat diperbarui.', 'error');
    } finally {
      setIsSaving(false);
    }
  }

  const fields: { label: string; value: string; onChange: (value: string) => void }[] = [
    { label: 'Nama', value: name, onChange: setName },
    { label: 'Email', value: email, onChange: setEmail },
    { label: 'Nomor telepon', value: phone, onChange: setPhone },
    { label: 'Pekerjaan', value: position, onChange: setPosition },
    { label: 'Departemen', value: department, onChange: setDepartment },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#17181d]" edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView className="flex-1 px-5 pt-8" contentContainerStyle={{ paddingBottom: 32 }}>
      <ProfilePageHeader
        title="Edit profil"
        subtitle="Perbarui informasi dasar akun dan profilmu."
        rightIcon={faCheck}
        rightAccessibilityLabel="Simpan perubahan profil"
        onRightPress={() => void save()}
      />
      {fields.map(({ label, value, onChange }) => (
        <View key={String(label)} className="mt-4">
          <Text className="mb-2 text-xs font-bold uppercase tracking-[1px] text-[#aaa49a]">{label}</Text>
          <TextInput value={value} onChangeText={onChange} placeholder={label} placeholderTextColor="#77757d" className="rounded-xl border border-[#5a482a] bg-[#242118] px-4 py-3 text-[#f5f0e6]" />
        </View>
      ))}
      <Text className="mb-2 mt-4 text-xs font-bold uppercase tracking-[1px] text-[#aaa49a]">Bio</Text>
      <TextInput value={bio} onChangeText={setBio} placeholder="Ceritakan sedikit tentang dirimu" placeholderTextColor="#77757d" multiline className="min-h-[100px] rounded-xl border border-[#5a482a] bg-[#242118] px-4 py-3 text-[#f5f0e6]" />
      <Text className="mb-2 mt-4 text-xs font-bold uppercase tracking-[1px] text-[#aaa49a]">Preferensi agama</Text>
      <View className="gap-2">
        {religions.map((item) => (
          <Pressable
            key={item.value}
            accessibilityRole="radio"
            accessibilityState={{ selected: religion === item.value }}
            onPress={() => setReligion(item.value)}
            className={`rounded-xl border px-4 py-3 ${religion === item.value ? 'border-[#e7bd68] bg-[#342b1b]' : 'border-[#5a482a] bg-[#242118]'}`}
          >
            <Text className="text-sm font-bold text-[#f5f0e6]">{item.label}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable onPress={() => void save()} disabled={isSaving} className="mt-5 items-center rounded-xl bg-[#e7bd68] px-4 py-3">
        <Text className="font-black text-[#211c12]">{isSaving ? 'Menyimpan...' : 'Simpan perubahan'}</Text>
      </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
