import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function InventoryScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>🎒 Inventory</Text>
                    <Text style={styles.subtitle}>
                        Equipment & Items
                    </Text>
                </View>

                {/* Gold Card */}
                <View style={styles.goldCard}>
                    <Ionicons name="cash" size={28} color="#FFD700" />
                    <View style={{ marginLeft: 10 }}>
                        <Text style={styles.goldText}>1,250 Gold</Text>
                        <Text style={styles.goldSub}>
                            Currency
                        </Text>
                    </View>
                </View>

                {/* Equipment */}
                <Text style={styles.sectionTitle}>
                    ⚔️ Equipment
                </Text>

                <View style={styles.grid}>
                    <View style={styles.itemCard}>
                        <MaterialCommunityIcons name="sword" size={30} color="#FFD700" />
                        <Text style={styles.itemName}>Iron Sword</Text>
                        <Text style={styles.itemDesc}>+10 ATK</Text>
                    </View>

                    <View style={styles.itemCard}>
                        <MaterialCommunityIcons name="shield" size={30} color="#4CAF50" />
                        <Text style={styles.itemName}>Wood Shield</Text>
                        <Text style={styles.itemDesc}>+8 DEF</Text>
                    </View>

                    <View style={styles.itemCard}>
                        <MaterialCommunityIcons name="hat-fedora" size={30} color="#60A5FA" />
                        <Text style={styles.itemName}>Mage Hat</Text>
                        <Text style={styles.itemDesc}>+5 INT</Text>
                    </View>

                    <View style={styles.itemCard}>
                        <MaterialCommunityIcons name="boots" size={30} color="#F97316" />
                        <Text style={styles.itemName}>Leather Boots</Text>
                        <Text style={styles.itemDesc}>+3 SPD</Text>
                    </View>
                </View>

                {/* Consumables */}
                <Text style={styles.sectionTitle}>
                    🧪 Consumables
                </Text>

                <View style={styles.card}>
                    <Text style={styles.itemText}>
                        🧃 Health Potion x3
                    </Text>

                    <Text style={styles.itemText}>
                        💧 Energy Drink x5
                    </Text>

                    <Text style={styles.itemText}>
                        🍎 Apple x8
                    </Text>
                </View>

                {/* Materials */}
                <Text style={styles.sectionTitle}>
                    📦 Materials
                </Text>

                <View style={styles.card}>
                    <Text style={styles.itemText}>
                        🪵 Wood x20
                    </Text>

                    <Text style={styles.itemText}>
                        🪨 Stone x15
                    </Text>

                    <Text style={styles.itemText}>
                        ⚙️ Iron Ore x7
                    </Text>
                </View>

                {/* Stats Bonus */}
                <Text style={styles.sectionTitle}>
                    📊 Bonus Stats
                </Text>

                <View style={styles.statsCard}>
                    <Text style={styles.stat}>⚔️ ATK +15</Text>
                    <Text style={styles.stat}>🛡 DEF +8</Text>
                    <Text style={styles.stat}>⚡ SPD +3</Text>
                    <Text style={styles.stat}>🧠 INT +5</Text>
                </View>

                <View style={{ height: 30 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#020617',
    },

    header: {
        padding: 16,
        marginTop: 10,
    },

    title: {
        color: '#FFD700',
        fontSize: 24,
        fontWeight: 'bold',
    },

    subtitle: {
        color: '#94A3B8',
        marginTop: 4,
    },

    goldCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        marginHorizontal: 16,
        padding: 16,
        borderRadius: 16,
    },

    goldText: {
        color: '#FFD700',
        fontSize: 18,
        fontWeight: 'bold',
    },

    goldSub: {
        color: '#94A3B8',
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

    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },

    itemCard: {
        width: '48%',
        backgroundColor: '#1E293B',
        padding: 16,
        borderRadius: 16,
        marginBottom: 10,
        alignItems: 'center',
    },

    itemName: {
        color: '#FFF',
        marginTop: 8,
        fontWeight: '600',
    },

    itemDesc: {
        color: '#94A3B8',
        marginTop: 4,
    },

    card: {
        backgroundColor: '#1E293B',
        marginHorizontal: 16,
        padding: 16,
        borderRadius: 16,
    },

    itemText: {
        color: '#FFF',
        marginBottom: 10,
        fontSize: 15,
    },

    statsCard: {
        backgroundColor: '#1E293B',
        marginHorizontal: 16,
        padding: 16,
        borderRadius: 16,
    },

    stat: {
        color: '#FFD700',
        marginBottom: 8,
        fontSize: 15,
        fontWeight: '600',
    },
});