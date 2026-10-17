import { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import {
  getExperienceHistory,
  getProgression,
  type ExperienceTransaction,
  type Progression,
} from '../lib/authApi';

function getLevelProgress(totalExperience: number, level: number, nextLevelExperience: number) {
  let experienceSpent = 0;
  for (let currentLevel = 1; currentLevel < Math.max(1, level); currentLevel += 1) {
    let requirement = 100;
    for (let requirementLevel = 1; requirementLevel < currentLevel; requirementLevel += 1) {
      requirement = Math.round(requirement * 1.5);
    }
    experienceSpent += requirement;
  }

  const currentExperience = Math.max(0, totalExperience - experienceSpent);
  const requiredExperience = Math.max(1, nextLevelExperience);

  return {
    currentExperience,
    requiredExperience,
    percentage: Math.min(100, (currentExperience / requiredExperience) * 100),
  };
}

export default function ProgressionScreen() {
  const [progression, setProgression] = useState<Progression | null>(null);
  const [history, setHistory] = useState<ExperienceTransaction[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let isMounted = true;
    void (async () => {
      const token = await SecureStore.getItemAsync('auth_token');
      if (!token) {
        if (isMounted) setMessage('Silakan masuk untuk melihat progression.');
        return;
      }
      try {
        const [progressionResult, historyResult] = await Promise.all([
          getProgression(token),
          getExperienceHistory(token),
        ]);
        if (isMounted) {
          setProgression(progressionResult.data);
          setHistory(historyResult.data);
        }
      } catch (error) {
        if (isMounted) setMessage(error instanceof Error ? error.message : 'Progression belum dapat dimuat.');
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const character = progression?.character;
  const levelProgress = character
    ? getLevelProgress(character.experience, character.level, character.experience_to_next_level)
    : null;

  return (
    <ScrollView className="flex-1 bg-[#17181d] px-5 pt-16" contentContainerStyle={{ paddingBottom: 32 }}>
      <Pressable onPress={() => router.back()}>
        <Text className="mb-6 text-sm font-bold text-[#e7bd68]">← Kembali</Text>
      </Pressable>
      <Text className="text-3xl font-black text-[#f5f0e6]">Progression</Text>
      <Text className="mt-2 text-sm leading-6 text-[#aaa49a]">Pantau level, class, kemampuan, dan perjalanan EXP karaktermu.</Text>
      {message ? <Text className="mt-4 text-sm font-bold text-[#f1a39a]">{message}</Text> : null}

      {character ? (
        <>
          <View className="mt-6 rounded-2xl border border-[#5a482a] bg-[#242118] p-5">
            <Text className="text-xs font-bold uppercase tracking-[1px] text-[#e7bd68]">Level karakter</Text>
            <View className="mt-2 flex-row items-end justify-between">
              <Text className="text-5xl font-black text-[#fff8e9]">{character.level}</Text>
              <Text className="text-sm font-bold text-[#c5beb0]">{character.experience} total EXP</Text>
            </View>
            <View className="mt-4 h-2 overflow-hidden rounded-full bg-[#484132]">
              <View className="h-full rounded-full bg-[#e7bd68]" style={{ width: `${levelProgress?.percentage ?? 0}%` }} />
            </View>
            <Text className="mt-2 text-xs text-[#aaa49a]">
              {levelProgress?.currentExperience ?? 0} / {levelProgress?.requiredExperience ?? character.experience_to_next_level} EXP · Kebutuhan level berikutnya: {character.experience_to_next_level} EXP
            </Text>
            <Text className="mt-4 text-base font-black text-[#f5f0e6]">{character.class_label || 'Belum memilih class'}</Text>
            {character.primary_stat ? <Text className="mt-1 text-xs text-[#aaa49a]">Stat utama: {character.primary_stat}</Text> : null}
          </View>

          <Text className="mb-3 mt-6 text-base font-extrabold text-[#f5f0e6]">Kemampuan</Text>
          {progression?.skills.length ? progression.skills.map((skill) => (
            <View key={skill.id} className="mb-3 rounded-2xl border border-[#2d2e35] bg-[#1b1c22] p-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-bold text-[#f1ede4]">{skill.label}</Text>
                <Text className="text-xs font-black text-[#e7bd68]">Lv. {skill.level}</Text>
              </View>
              <Text className="mt-2 text-xs text-[#85838a]">{skill.experience} / {skill.experience_to_next_level} EXP</Text>
              <View className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#484132]">
                <View className="h-full rounded-full bg-[#8cbf9a]" style={{ width: `${Math.min(100, (skill.experience / Math.max(1, skill.experience_to_next_level)) * 100)}%` }} />
              </View>
            </View>
          )) : <Text className="text-sm text-[#85838a]">Belum ada kemampuan yang terbuka.</Text>}

          <Text className="mb-3 mt-6 text-base font-extrabold text-[#f5f0e6]">Aktivitas EXP terbaru</Text>
          {history.slice(0, 10).map((transaction) => (
            <View key={transaction.id} className="mb-2 flex-row items-center rounded-xl bg-[#24252c] px-3 py-3">
              <View className="flex-1">
                <Text className="text-xs font-bold text-[#f1ede4]">{transaction.reason || transaction.source_type}</Text>
                <Text className="mt-1 text-[10px] text-[#85838a]">{new Date(transaction.created_at).toLocaleDateString('id-ID')}</Text>
              </View>
              <Text className={`text-xs font-black ${transaction.amount >= 0 ? 'text-[#8cbf9a]' : 'text-[#f1a39a]'}`}>
                {transaction.amount >= 0 ? '+' : ''}{transaction.amount} XP
              </Text>
            </View>
          ))}
        </>
      ) : null}
    </ScrollView>
  );
}
