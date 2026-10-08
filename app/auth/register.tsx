import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function RegisterScreen() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleRegister = () => {
        // ❗ validasi sederhana
        if (!name || !email || !password) {
            Alert.alert('Error', 'Semua field harus diisi!');
            return;
        }

        // 🧠 nanti bisa ganti API / Firebase di sini

        // 🎯 sukses register → ke login
        router.replace('/auth/login');
    };

    return (
        <SafeAreaView style={styles.container}>

            {/* HEADER */}
            <View style={styles.header}>
                <Text style={styles.title}>🛡 Create Account</Text>
                <Text style={styles.subtitle}>
                    Start your RPG journey
                </Text>
            </View>

            {/* FORM */}
            <View style={styles.form}>
                <TextInput
                    placeholder="Name"
                    placeholderTextColor="#94A3B8"
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                />

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

                {/* BUTTON */}
                <TouchableOpacity
                    style={styles.button}
                    onPress={handleRegister}
                >
                    <Text style={styles.buttonText}>REGISTER</Text>
                </TouchableOpacity>

                {/* LINK */}
                <TouchableOpacity onPress={() => router.push('/auth/login')}>
                    <Text style={styles.link}>
                        Sudah punya akun? Login
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
        alignItems: 'center',
        marginBottom: 40,
    },

    title: {
        fontSize: 26,
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
        backgroundColor: '#22C55E',
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