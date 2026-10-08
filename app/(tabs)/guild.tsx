import { Ionicons } from '@expo/vector-icons';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function GuildScreen() {
    return (
        <ScrollView
            style={{
                flex: 1,
                backgroundColor: '#020617',
            }}
            contentContainerStyle={{
                padding: 20,
                paddingBottom: 100,
            }}>
            <View
                style={{
                    backgroundColor: '#1E293B',
                    borderRadius: 18,
                    padding: 20,
                    borderWidth: 1,
                    borderColor: '#334155',
                }}>
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                    }}>
                    <View
                        style={{
                            width: 60,
                            height: 60,
                            borderRadius: 30,
                            backgroundColor: '#FFD700',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 14,
                        }}>
                        <Ionicons name="shield" size={32} color="#0F172A" />
                    </View>

                    <View style={{ flex: 1 }}>
                        <Text
                            style={{
                                color: '#FFD700',
                                fontSize: 22,
                                fontWeight: 'bold',
                            }}>
                            Dragon Slayer
                        </Text>

                        <Text
                            style={{
                                color: '#94A3B8',
                                fontSize: 13,
                                marginTop: 4,
                            }}>
                            Level 8 Guild • 24 Members
                        </Text>
                    </View>
                </View>

                <Text
                    style={{
                        color: '#CBD5E1',
                        fontSize: 14,
                        lineHeight: 22,
                        marginTop: 16,
                    }}>
                    Guild para warrior yang fokus menyelesaikan quest harian,
                    meningkatkan level, dan mengumpulkan reward bersama.
                </Text>
            </View>

            <View
                style={{
                    flexDirection: 'row',
                    gap: 12,
                    marginTop: 16,
                }}>
                <View
                    style={{
                        flex: 1,
                        backgroundColor: '#1E293B',
                        borderRadius: 14,
                        padding: 14,
                        borderWidth: 1,
                        borderColor: '#334155',
                    }}>
                    <Text style={{ color: '#94A3B8', fontSize: 12 }}>Guild EXP</Text>
                    <Text
                        style={{
                            color: '#FFD700',
                            fontSize: 20,
                            fontWeight: 'bold',
                            marginTop: 6,
                        }}>
                        12,450
                    </Text>
                </View>

                <View
                    style={{
                        flex: 1,
                        backgroundColor: '#1E293B',
                        borderRadius: 14,
                        padding: 14,
                        borderWidth: 1,
                        borderColor: '#334155',
                    }}>
                    <Text style={{ color: '#94A3B8', fontSize: 12 }}>Rank</Text>
                    <Text
                        style={{
                            color: '#FFD700',
                            fontSize: 20,
                            fontWeight: 'bold',
                            marginTop: 6,
                        }}>
                        #15
                    </Text>
                </View>
            </View>

            <Text
                style={{
                    color: '#E2E8F0',
                    fontSize: 18,
                    fontWeight: 'bold',
                    marginTop: 24,
                    marginBottom: 12,
                }}>
                Guild Actions
            </Text>

            <View style={{ gap: 12 }}>
                <TouchableOpacity
                    style={{
                        backgroundColor: '#1E293B',
                        borderRadius: 14,
                        padding: 16,
                        borderWidth: 1,
                        borderColor: '#334155',
                        flexDirection: 'row',
                        alignItems: 'center',
                    }}>
                    <Ionicons name="people" size={24} color="#FFD700" />

                    <View style={{ marginLeft: 12, flex: 1 }}>
                        <Text
                            style={{
                                color: '#F8FAFC',
                                fontSize: 15,
                                fontWeight: '700',
                            }}>
                            Guild Members
                        </Text>
                        <Text
                            style={{
                                color: '#94A3B8',
                                fontSize: 12,
                                marginTop: 3,
                            }}>
                            Lihat anggota dan role mereka
                        </Text>
                    </View>

                    <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={{
                        backgroundColor: '#1E293B',
                        borderRadius: 14,
                        padding: 16,
                        borderWidth: 1,
                        borderColor: '#334155',
                        flexDirection: 'row',
                        alignItems: 'center',
                    }}>
                    <Ionicons name="flag" size={24} color="#FFD700" />

                    <View style={{ marginLeft: 12, flex: 1 }}>
                        <Text
                            style={{
                                color: '#F8FAFC',
                                fontSize: 15,
                                fontWeight: '700',
                            }}>
                            Guild Quest
                        </Text>
                        <Text
                            style={{
                                color: '#94A3B8',
                                fontSize: 12,
                                marginTop: 3,
                            }}>
                            Selesaikan misi bersama guild
                        </Text>
                    </View>

                    <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={{
                        backgroundColor: '#1E293B',
                        borderRadius: 14,
                        padding: 16,
                        borderWidth: 1,
                        borderColor: '#334155',
                        flexDirection: 'row',
                        alignItems: 'center',
                    }}>
                    <Ionicons name="trophy" size={24} color="#FFD700" />

                    <View style={{ marginLeft: 12, flex: 1 }}>
                        <Text
                            style={{
                                color: '#F8FAFC',
                                fontSize: 15,
                                fontWeight: '700',
                            }}>
                            Leaderboard
                        </Text>
                        <Text
                            style={{
                                color: '#94A3B8',
                                fontSize: 12,
                                marginTop: 3,
                            }}>
                            Ranking guild terbaik minggu ini
                        </Text>
                    </View>

                    <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
                </TouchableOpacity>
            </View>

            <Text
                style={{
                    color: '#E2E8F0',
                    fontSize: 18,
                    fontWeight: 'bold',
                    marginTop: 24,
                    marginBottom: 12,
                }}>
                Top Members
            </Text>

            {[
                { name: 'Tomi', role: 'Guild Master', level: 12 },
                { name: 'Raka', role: 'Knight', level: 10 },
                { name: 'Dina', role: 'Mage', level: 9 },
            ].map((member, index) => (
                <View
                    key={index}
                    style={{
                        backgroundColor: '#1E293B',
                        borderRadius: 14,
                        padding: 14,
                        borderWidth: 1,
                        borderColor: '#334155',
                        marginBottom: 10,
                        flexDirection: 'row',
                        alignItems: 'center',
                    }}>
                    <View
                        style={{
                            width: 42,
                            height: 42,
                            borderRadius: 21,
                            backgroundColor: '#334155',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 12,
                        }}>
                        <Ionicons name="person" size={22} color="#FFD700" />
                    </View>

                    <View style={{ flex: 1 }}>
                        <Text
                            style={{
                                color: '#F8FAFC',
                                fontSize: 15,
                                fontWeight: '700',
                            }}>
                            {member.name}
                        </Text>

                        <Text
                            style={{
                                color: '#94A3B8',
                                fontSize: 12,
                                marginTop: 2,
                            }}>
                            {member.role}
                        </Text>
                    </View>

                    <Text
                        style={{
                            color: '#FFD700',
                            fontWeight: 'bold',
                        }}>
                        Lv. {member.level}
                    </Text>
                </View>
            ))}
        </ScrollView>
    );
}