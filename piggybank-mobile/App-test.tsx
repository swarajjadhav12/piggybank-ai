import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>🐷 PiggyBank Test</Text>
            <Text style={styles.subtitle}>App is working!</Text>
            <Text style={styles.info}>If you see this, Expo is connected successfully.</Text>
            <StatusBar style="auto" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 24,
        color: '#4CAF50',
        marginBottom: 20,
    },
    info: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
});
