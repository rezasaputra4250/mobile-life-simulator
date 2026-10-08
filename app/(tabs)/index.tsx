import { Ionicons } from '@expo/vector-icons';
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';

type InfoCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
};

function InfoCard({ icon, title, subtitle }: InfoCardProps) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={22} color="#FFD700" />

      <View style={{ marginLeft: 12, flex: 1 }}>
        <Text style={styles.infoTitle}>{title}</Text>

        {subtitle ? (
          <Text style={styles.infoSubtitle}>{subtitle}</Text>
        ) : null}
      </View>
    </View>
  );
}

const screenWidth = Dimensions.get('window').width;

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}>

        <View style={styles.characterCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="#FFD700" />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.characterName}>Arka The Warrior</Text>
            <Text style={styles.level}>Level 12 • Warrior • Silver II</Text>

            <View style={styles.expContainer}>
              <View style={styles.expBar} />
            </View>

            <Text style={styles.expText}>850 / 1000 EXP menuju Level 13</Text>
          </View>
        </View>

        <View style={styles.currencyContainer}>
          <View style={styles.currencyCard}>
            <Ionicons name="cash" size={24} color="#FFD700" />
            <Text style={styles.currencyValue}>1,250</Text>
            <Text style={styles.currencyLabel}>Gold</Text>
          </View>

          <View style={styles.currencyCard}>
            <Ionicons name="diamond" size={24} color="#FFD700" />
            <Text style={styles.currencyValue}>45</Text>
            <Text style={styles.currencyLabel}>Gem</Text>
          </View>

          <View style={styles.currencyCard}>
            <Ionicons name="flash" size={24} color="#FFD700" />
            <Text style={styles.currencyValue}>80/100</Text>
            <Text style={styles.currencyLabel}>Energy</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Status</Text>

        <View style={styles.card}>
          <InfoCard icon="heart" title="HP" subtitle="140 / 160" />

          <View style={styles.hpContainer}>
            <View style={styles.hpBar} />
          </View>

          <InfoCard icon="water" title="Mana" subtitle="70 / 100" />

          <View style={styles.manaContainer}>
            <View style={styles.manaBar} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Character Stats</Text>

        <View style={styles.chartCard}>
          <BarChart
            data={{
              labels: ['STR', 'INT', 'DISC', 'VIT', 'AGI', 'LUCK'],
              datasets: [
                {
                  data: [15, 18, 20, 14, 17, 11],
                },
              ],
            }}
            width={screenWidth - 32}
            height={260}
            yAxisLabel=""
            yAxisSuffix=""
            fromZero
            showValuesOnTopOfBars
            chartConfig={{
              backgroundColor: '#1E293B',
              backgroundGradientFrom: '#1E293B',
              backgroundGradientTo: '#1E293B',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 215, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(226, 232, 240, ${opacity})`,
              barPercentage: 0.6,
              propsForBackgroundLines: {
                stroke: '#334155',
              },
            }}
            style={styles.chart}
          />
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="barbell" size={24} color="#FFD700" />
            <Text style={styles.statValue}>15</Text>
            <Text style={styles.statLabel}>STR</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="bulb" size={24} color="#FFD700" />
            <Text style={styles.statValue}>18</Text>
            <Text style={styles.statLabel}>INT</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="flash" size={24} color="#FFD700" />
            <Text style={styles.statValue}>20</Text>
            <Text style={styles.statLabel}>DISC</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="heart" size={24} color="#FFD700" />
            <Text style={styles.statValue}>14</Text>
            <Text style={styles.statLabel}>VIT</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Today's Progress</Text>

        <View style={styles.card}>
          <InfoCard icon="checkmark-circle" title="Quest Selesai" subtitle="3 / 5" />

          <View style={styles.progressContainer}>
            <View style={styles.progressBar} />
          </View>

          <Text style={styles.progressText}>60% Complete</Text>
        </View>

        <Text style={styles.sectionTitle}>Daily Quests</Text>

        <View style={styles.questCard}>
          <InfoCard
            icon="walk"
            title="Olahraga 30 Menit"
            subtitle="Reward: +50 EXP • +10 Gold"
          />
        </View>

        <View style={styles.questCard}>
          <InfoCard
            icon="book"
            title="Belajar 1 Jam"
            subtitle="Reward: +75 EXP • +15 Gold"
          />
        </View>

        <View style={styles.questCard}>
          <InfoCard
            icon="water"
            title="Minum 2 Liter Air"
            subtitle="Reward: +20 EXP • +5 Gold"
          />
        </View>

        <Text style={styles.sectionTitle}>Guild</Text>

        <View style={styles.card}>
          <InfoCard icon="shield" title="Dragon Slayer" subtitle="Guild utama kamu" />
          <InfoCard icon="people" title="24 Members" subtitle="Anggota aktif guild" />
          <InfoCard icon="trophy" title="Rank #15 Global" subtitle="Leaderboard guild" />
          <InfoCard icon="star" title="Guild Level 8" subtitle="12,450 Guild EXP" />
        </View>

        <Text style={styles.sectionTitle}>Achievements</Text>

        <View style={styles.card}>
          <InfoCard icon="flame" title="7 Day Streak" />
          <InfoCard icon="trophy" title="First Level Up" />
          <InfoCard icon="book" title="Study Master" />
          <InfoCard icon="ribbon" title="Quest Hunter" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },

  characterCard: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    margin: 16,
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
  },

  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },

  characterName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },

  level: {
    color: '#FFD700',
    marginTop: 4,
  },

  expContainer: {
    marginTop: 10,
    height: 10,
    backgroundColor: '#334155',
    borderRadius: 10,
    overflow: 'hidden',
  },

  expBar: {
    width: '85%',
    height: '100%',
    backgroundColor: '#22C55E',
  },

  expText: {
    color: '#94A3B8',
    marginTop: 5,
    fontSize: 12,
  },

  sectionTitle: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginBottom: 10,
    marginTop: 16,
  },

  currencyContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
  },

  currencyCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
  },

  currencyValue: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 6,
  },

  currencyLabel: {
    color: '#94A3B8',
    marginTop: 2,
    fontSize: 12,
  },

  card: {
    backgroundColor: '#1E293B',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  infoTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },

  infoSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 3,
  },

  hpContainer: {
    height: 10,
    backgroundColor: '#334155',
    borderRadius: 10,
    marginBottom: 12,
    overflow: 'hidden',
  },

  hpBar: {
    width: '87%',
    height: '100%',
    backgroundColor: '#EF4444',
  },

  manaContainer: {
    height: 10,
    backgroundColor: '#334155',
    borderRadius: 10,
    overflow: 'hidden',
  },

  manaBar: {
    width: '70%',
    height: '100%',
    backgroundColor: '#3B82F6',
  },

  chartCard: {
    backgroundColor: '#1E293B',
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    paddingVertical: 10,
  },

  chart: {
    borderRadius: 16,
  },

  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 10,
  },

  statCard: {
    width: '48%',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    marginBottom: 10,
    alignItems: 'center',
  },

  statValue: {
    color: '#FFD700',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 6,
  },

  statLabel: {
    color: '#CBD5E1',
    marginTop: 5,
  },

  progressContainer: {
    height: 10,
    backgroundColor: '#334155',
    borderRadius: 10,
    marginVertical: 10,
    overflow: 'hidden',
  },

  progressBar: {
    width: '60%',
    height: '100%',
    backgroundColor: '#FFD700',
  },

  progressText: {
    color: '#94A3B8',
  },

  questCard: {
    backgroundColor: '#1E293B',
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 16,
    borderRadius: 16,
  },
});