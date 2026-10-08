import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ProfileScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>

                {/* PROFILE CARD */}
                <View style={styles.profileCard}>
                    <View style={styles.avatar}>
                        <Ionicons name="person" size={52} color="#FFD700" />
                    </View>

                    <Text style={styles.name}>Arka The Warrior</Text>
                    <Text style={styles.title}>Legendary Adventurer</Text>

                    <View style={styles.levelBadge}>
                        <Text style={styles.levelText}>LEVEL 12</Text>
                    </View>

                    <View style={styles.expBarBg}>
                        <View style={styles.expBarFill} />
                    </View>

                    <Text style={styles.expText}>850 / 1000 EXP</Text>
                </View>

                {/* STATS */}
                <Text style={styles.sectionTitle}>📊 Character Stats</Text>

                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>124</Text>
                        <Text style={styles.statLabel}>Quests</Text>
                    </View>

                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>28</Text>
                        <Text style={styles.statLabel}>Achievements</Text>
                    </View>

                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>15</Text>
                        <Text style={styles.statLabel}>STR</Text>
                    </View>

                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>18</Text>
                        <Text style={styles.statLabel}>INT</Text>
                    </View>
                </View>

                {/* STREAK */}
                <Text style={styles.sectionTitle}>🔥 Daily Streak</Text>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>12 Days Streak</Text>
                    <Text style={styles.cardDesc}>
                        Selesaikan quest setiap hari untuk mendapatkan bonus EXP.
                    </Text>
                </View>

                {/* ACHIEVEMENTS */}
                <Text style={styles.sectionTitle}>🏆 Achievements</Text>

                <View style={styles.card}>
                    <Text style={styles.achievement}>🥇 First Level Up</Text>
                    <Text style={styles.achievement}>⚔️ Quest Master</Text>
                    <Text style={styles.achievement}>📚 Study Champion</Text>
                    <Text style={styles.achievement}>🔥 7 Days Streak</Text>
                </View>

                {/* RANK */}
                <Text style={styles.sectionTitle}>🎖 Rank</Text>

                <View style={styles.rankCard}>
                    <Ionicons name="trophy" size={30} color="#FFD700" />
                    <View style={{ marginLeft: 10 }}>
                        <Text style={styles.rankTitle}>Gold Adventurer</Text>
                        <Text style={styles.rankDesc}>
                            Selesaikan quest untuk naik ke Platinum rank
                        </Text>
                    </View>
                </View>

                {/* SETTINGS */}
                <Text style={styles.sectionTitle}>⚙️ Settings</Text>

                <TouchableOpacity style={styles.settingItem}>
                    <Ionicons name="person-outline" size={22} color="#FFF" />
                    <Text style={styles.settingText}>Edit Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.settingItem}>
                    <Ionicons name="notifications-outline" size={22} color="#FFF" />
                    <Text style={styles.settingText}>Notifications</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.settingItem}>
                    <Ionicons name="color-palette-outline" size={22} color="#FFF" />
                    <Text style={styles.settingText}>Theme</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.settingItem}>
                    <Ionicons name="log-out-outline" size={22} color="#EF4444" />
                    <Text style={[styles.settingText, { color: '#EF4444' }]}>
                        Logout
                    </Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#020617',
    },

    profileCard: {
        backgroundColor: '#1E293B',
        margin: 16,
        padding: 24,
        borderRadius: 22,
        alignItems: 'center',
    },

    avatar: {
        width: 95,
        height: 95,
        borderRadius: 48,
        backgroundColor: '#334155',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },

    name: {
        color: '#FFF',
        fontSize: 22,
        fontWeight: 'bold',
    },

    title: {
        color: '#94A3B8',
        marginTop: 4,
    },

    levelBadge: {
        marginTop: 10,
        backgroundColor: '#0F172A',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FFD700',
    },

    levelText: {
        color: '#FFD700',
        fontWeight: 'bold',
        fontSize: 12,
    },

    expBarBg: {
        width: '100%',
        height: 10,
        backgroundColor: '#334155',
        borderRadius: 10,
        marginTop: 12,
        overflow: 'hidden',
    },

    expBarFill: {
        width: '85%',
        height: '100%',
        backgroundColor: '#22C55E',
    },

    expText: {
        color: '#94A3B8',
        marginTop: 6,
        fontSize: 12,
    },

    sectionTitle: {
        color: '#FFD700',
        fontSize: 18,
        fontWeight: 'bold',
        marginHorizontal: 16,
        marginTop: 20,
        marginBottom: 10,
    },

    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },

    statCard: {
        width: '48%',
        backgroundColor: '#1E293B',
        padding: 18,
        borderRadius: 18,
        marginBottom: 10,
        alignItems: 'center',
    },

    statValue: {
        color: '#FFD700',
        fontSize: 22,
        fontWeight: 'bold',
    },

    statLabel: {
        color: '#94A3B8',
        marginTop: 5,
    },

    card: {
        backgroundColor: '#1E293B',
        marginHorizontal: 16,
        padding: 16,
        borderRadius: 16,
    },

    cardTitle: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 6,
    },

    cardDesc: {
        color: '#94A3B8',
        lineHeight: 20,
    },

    achievement: {
        color: '#FFF',
        marginBottom: 8,
        fontSize: 14,
    },

    rankCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        marginHorizontal: 16,
        padding: 16,
        borderRadius: 16,
    },

    rankTitle: {
        color: '#FFD700',
        fontSize: 16,
        fontWeight: 'bold',
    },

    rankDesc: {
        color: '#94A3B8',
        fontSize: 12,
        marginTop: 3,
    },

    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        marginHorizontal: 16,
        marginBottom: 10,
        padding: 14,
        borderRadius: 14,
    },

    settingText: {
        color: '#FFF',
        marginLeft: 10,
        fontSize: 14,
    },
});