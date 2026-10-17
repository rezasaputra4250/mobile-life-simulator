import { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  getCurrentUser,
  getDifficultyConfigs,
  getInventory,
  getProgression,
  updateDifficulty,
  type AuthUser,
  type Difficulty,
  type DifficultyConfig,
  type InventoryData,
  type Progression,
} from '../../lib/authApi';
import { ProfilePageHeader } from '../../components/ProfilePageHeader';
import { getSessionToken } from '../../lib/session';

const difficultyLabels: Record<Difficulty, string> = {
  easy: 'Mudah',
  normal: 'Normal',
  hard: 'Sulit',
  expert: 'Ahli',
};

export default function ProfileDetailScreen() {
  const { section } = useLocalSearchParams<{ section?: string }>();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [difficultyConfigs, setDifficultyConfigs] = useState<DifficultyConfig[]>([]);
  const [progression, setProgression] = useState<Progression | null>(null);
  const [inventory, setInventory] = useState<InventoryData | null>(null);
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;
    void (async () => {
      const token = await getSessionToken();
      if (!token) {
        if (isMounted) setMessage('Silakan masuk untuk melihat data player.');
        return;
      }
      try {
        if (section === 'difficulty') {
          const [userResult, configResult] = await Promise.all([
            getCurrentUser(token),
            getDifficultyConfigs(token),
          ]);
          if (isMounted) {
            setUser(userResult.user);
            setDifficultyConfigs(configResult.data);
          }
        } else if (section === 'badges') {
          if (isMounted) setInventory(await getInventory(token));
        } else {
          if (isMounted) setProgression((await getProgression(token)).data);
        }
      } catch (error) {
        if (isMounted) setMessage(error instanceof Error ? error.message : 'Data player belum dapat dimuat.');
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [section]);

  async function changeDifficulty(difficulty: Difficulty) {
    const token = await getSessionToken();
    if (!token || isSaving) return;
    setIsSaving(true);
    try {
      await updateDifficulty(token, difficulty);
      setUser((current) => current ? { ...current, difficulty } : current);
      setMessage('Difficulty berhasil diperbarui.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Difficulty belum dapat diperbarui.');
    } finally {
      setIsSaving(false);
    }
  }

  const title = section === 'difficulty'
    ? 'Ganti difficulty'
    : section === 'stats'
      ? 'Statistik player'
      : section === 'badges'
        ? 'Badge player'
        : 'Kemampuan player';

  return (
    <SafeAreaView className="flex-1 bg-[#17181d]" edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView className="flex-1 px-5 pt-8" contentContainerStyle={{ paddingBottom: 32 }}>
      <ProfilePageHeader
        title={title}
        subtitle={section === 'difficulty' ? 'Atur tingkat tantangan untuk misi baru.' : 'Lihat ringkasan perkembangan karaktermu.'}
      />
      {message ? <Text className="mt-3 text-sm font-bold text-[#f1a39a]">{message}</Text> : null}

      {section === 'difficulty' ? (
        <View className="mt-6 gap-3">
          <Text className="text-sm leading-5 text-[#aaa49a]">Difficulty menentukan reward untuk mission baru. Mission lama tidak berubah.</Text>
          {(['easy', 'normal', 'hard', 'expert'] as Difficulty[]).map((difficulty) => (
            <Pressable
              key={difficulty}
              accessibilityRole="button"
              accessibilityState={{ selected: user?.difficulty === difficulty }}
              disabled={isSaving}
              onPress={() => void changeDifficulty(difficulty)}
              className={`rounded-2xl border p-4 ${user?.difficulty === difficulty ? 'border-[#e7bd68] bg-[#342b1b]' : 'border-[#2d2e35] bg-[#1b1c22]'}`}
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-base font-black text-[#f5f0e6]">{difficultyLabels[difficulty]}</Text>
              </View>
              <Text className="mt-2 text-xs leading-5 text-[#aaa49a]">
                {difficultyConfigs.find((item) => item.difficulty === difficulty)?.description || 'Penjelasan difficulty belum tersedia.'}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : section === 'stats' ? (
        <View className="mt-6 rounded-2xl border border-[#2d2e35] bg-[#1b1c22] p-4">
          {[
            ['Kekuatan', progression?.character?.strength ?? 0],
            ['Intelligence', progression?.character?.intelligence ?? 0],
            ['Agility', progression?.character?.agility ?? 0],
            ['Stamina', progression?.character?.stamina ?? 0],
            ['Keberuntungan', progression?.character?.luck ?? 0],
          ].map(([label, value]) => (
            <View key={String(label)} className="mb-4 last:mb-0">
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-sm font-bold text-[#f1ede4]">{label}</Text>
                <Text className="text-sm font-black text-[#e7bd68]">{value}</Text>
              </View>
              <View className="h-2 overflow-hidden rounded-full bg-[#484132]">
                <View className="h-full rounded-full bg-[#e7bd68]" style={{ width: `${Math.min(100, Number(value))}%` }} />
              </View>
            </View>
          ))}
        </View>
      ) : section === 'badges' ? (
        <View className="mt-6 gap-3">
          {inventory?.badges.length ? inventory.badges.map((badge) => (
            <View key={badge.badge_key} className="flex-row items-center rounded-2xl border border-[#5a482a] bg-[#242118] p-4">
              <View className="mr-3 h-11 w-11 items-center justify-center rounded-xl bg-[#3a3020]">
                <Text className="text-xl">🏅</Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-black text-[#f1ede4]">{badge.name}</Text>
                <Text className="mt-1 text-xs text-[#aaa49a]">{badge.description}</Text>
              </View>
            </View>
          )) : <Text className="text-sm text-[#85838a]">Belum ada badge yang terbuka.</Text>}
        </View>
      ) : (
        <View className="mt-6 gap-3">
          {progression?.skills.length ? progression.skills.map((skill) => (
            <View key={skill.id} className="rounded-2xl border border-[#2d2e35] bg-[#1b1c22] p-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-black text-[#f1ede4]">{skill.label}</Text>
                <Text className="text-xs font-black text-[#e7bd68]">Lv. {skill.level}</Text>
              </View>
              <Text className="mt-2 text-xs text-[#85838a]">{skill.experience} / {skill.experience_to_next_level} EXP</Text>
              <View className="mt-2 h-2 overflow-hidden rounded-full bg-[#484132]">
                <View className="h-full rounded-full bg-[#8cbf9a]" style={{ width: `${Math.min(100, (skill.experience / Math.max(1, skill.experience_to_next_level)) * 100)}%` }} />
              </View>
            </View>
          )) : <Text className="text-sm text-[#85838a]">Belum ada kemampuan yang terbuka.</Text>}
        </View>
      )}
      </ScrollView>
    </SafeAreaView>
  );
}
