import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// 🔐 ambil auth dari root layout
import { Auth } from '../_layout';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        // ❗ dummy validation (boleh kamu ganti nanti pakai API/Firebase)
        if (email.length === 0 || password.length === 0) return;

        // 🔥 set user login
        Auth.login();

        // 🎮 masuk ke game (tabs)
        router.replace('/(tabs)');
    };

    return (
        <SafeAreaView style={styles.container}>

            {/* HEADER */}
            <View style={styles.header}>
                <Text style={styles.title}>⚔️ RPG LIFE</Text>
                <Text style={styles.subtitle}>
                    Login to continue your adventure
                </Text>
            </View>

            {/* FORM */}
            <View style={styles.form}>
                <TextInput
                    placeholder="Email"
                    placeholderTextColor="#94A3B8"
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                />

                <TextInput
                    placeholder="Password"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                />

                {/* LOGIN BUTTON */}
                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                    <Text style={styles.buttonText}>LOGIN</Text>
                </TouchableOpacity>

                {/* REGISTER LINK */}
                <TouchableOpacity
                    onPress={() => router.push('/auth/register')}
                >
                    <Text style={styles.link}>
                        Belum punya akun? Register
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#020617',
        justifyContent: 'center',
        padding: 20,
    },

    header: {
        marginBottom: 40,
        alignItems: 'center',
    },

    title: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#FFD700',
    },

    subtitle: {
        color: '#94A3B8',
        marginTop: 6,
        textAlign: 'center',
    },

    form: {
        gap: 12,
    },

    input: {
        backgroundColor: '#1E293B',
        padding: 14,
        borderRadius: 12,
        color: '#fff',
    },

    button: {
        backgroundColor: '#FFD700',
        padding: 14,
        borderRadius: 12,
        marginTop: 10,
    },

    buttonText: {
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#000',
    },

    link: {
        color: '#94A3B8',
        textAlign: 'center',
        marginTop: 15,
    },
});