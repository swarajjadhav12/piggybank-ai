import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { colors } from '../constants/colors';

const ProfileScreen: React.FC = () => {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>
                            {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                        </Text>
                    </View>
                    <Text style={styles.userName}>
                        {user?.firstName} {user?.lastName}
                    </Text>
                    <Text style={styles.userEmail}>{user?.email}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>

                    <Card style={styles.menuCard}>
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => Alert.alert('Coming Soon', 'Edit profile feature coming soon!')}
                        >
                            <Text style={styles.menuEmoji}>👤</Text>
                            <Text style={styles.menuText}>Edit Profile</Text>
                            <Text style={styles.menuArrow}>›</Text>
                        </TouchableOpacity>
                    </Card>

                    <Card style={styles.menuCard}>
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => Alert.alert('Coming Soon', 'Change password feature coming soon!')}
                        >
                            <Text style={styles.menuEmoji}>🔒</Text>
                            <Text style={styles.menuText}>Change Password</Text>
                            <Text style={styles.menuArrow}>›</Text>
                        </TouchableOpacity>
                    </Card>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Preferences</Text>

                    <Card style={styles.menuCard}>
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => Alert.alert('Coming Soon', 'Notifications settings coming soon!')}
                        >
                            <Text style={styles.menuEmoji}>🔔</Text>
                            <Text style={styles.menuText}>Notifications</Text>
                            <Text style={styles.menuArrow}>›</Text>
                        </TouchableOpacity>
                    </Card>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About</Text>

                    <Card style={styles.menuCard}>
                        <TouchableOpacity style={styles.menuItem}>
                            <Text style={styles.menuEmoji}>ℹ️</Text>
                            <Text style={styles.menuText}>App Version</Text>
                            <Text style={styles.versionText}>1.0.0</Text>
                        </TouchableOpacity>
                    </Card>
                </View>

                <Button
                    title="Logout"
                    onPress={handleLogout}
                    variant="danger"
                    style={styles.logoutButton}
                />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundSecondary,
    },
    scrollContent: {
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.white,
        textTransform: 'uppercase',
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 16,
        color: colors.textSecondary,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textSecondary,
        marginBottom: 12,
        textTransform: 'uppercase',
    },
    menuCard: {
        marginBottom: 8,
        padding: 0,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    menuEmoji: {
        fontSize: 24,
        marginRight: 12,
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        color: colors.text,
    },
    menuArrow: {
        fontSize: 24,
        color: colors.gray400,
    },
    versionText: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    logoutButton: {
        marginTop: 16,
    },
});

export default ProfileScreen;
