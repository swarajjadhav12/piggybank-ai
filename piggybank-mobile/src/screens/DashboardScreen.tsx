import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { Picker, PickerOption } from '../components/Picker';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { colors } from '../constants/colors';
import { formatCurrency } from '../utils/formatters';

interface DashboardData {
    savings: {
        total: number;
        monthlyGrowth: number;
        yearlyGrowth: number;
    };
    monthlyBudget: number;
    recentExpenses: Array<{
        id: string;
        description: string;
        amount: number;
        category: string;
        date: string;
    }>;
    goals: Array<{
        id: string;
        name: string;
        description?: string;
        target: number;
        saved: number;
        targetDate: string;
        priority: string;
        emoji?: string;
        progress: number;
    }>;
    quickInsights: string[];
    aiSuggestions: Array<{
        id: string;
        type: string;
        title: string;
        description: string;
        potentialSavings: number;
        impact: string;
    }>;
}

const DashboardScreen: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [data, setData] = useState<DashboardData | null>(null);
    const [depositModalVisible, setDepositModalVisible] = useState(false);
    const [expenseModalVisible, setExpenseModalVisible] = useState(false);
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('FOOD');
    const [processing, setProcessing] = useState(false);

    const categoryOptions: PickerOption[] = [
        { label: 'Food', value: 'FOOD', emoji: '🍔' },
        { label: 'Transport', value: 'TRANSPORT', emoji: '🚗' },
        { label: 'Shopping', value: 'SHOPPING', emoji: '🛍️' },
        { label: 'Entertainment', value: 'ENTERTAINMENT', emoji: '🎬' },
        { label: 'Utilities', value: 'UTILITIES', emoji: '💡' },
        { label: 'Health', value: 'HEALTH', emoji: '🏥' },
        { label: 'Other', value: 'OTHER', emoji: '📦' },
    ];

    const fetchDashboardData = async () => {
        try {
            const response = await apiService.getDashboardData();
            if (response.success && response.data) {
                setData(response.data as DashboardData);
            }
        } catch (error: any) {
            Alert.alert('Error', 'Failed to load dashboard data');
            console.error('Dashboard fetch error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchDashboardData();
    }, []);

    if (loading) {
        return <LoadingSpinner fullScreen message="Loading dashboard..." />;
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Hello,</Text>
                        <Text style={styles.userName}>
                            {user?.firstName || user?.email?.split('@')[0] || 'User'}!
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.notificationBadge}>
                        <Text style={styles.emoji}>🔔</Text>
                        {(data?.aiSuggestions?.length ?? 0) > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{data?.aiSuggestions?.length}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Wallet Balance */}
                <Card style={styles.walletCard}>
                    <Text style={styles.walletLabel}>Total Balance</Text>
                    <Text style={styles.walletAmount}>
                        {formatCurrency(data?.savings.total || 0)}
                    </Text>
                </Card>

                {/* Quick Stats */}
                <View style={styles.statsRow}>
                    <Card style={styles.statCard}>
                        <Text style={styles.statEmoji}>🎯</Text>
                        <Text style={styles.statValue}>{data?.goals?.length || 0}</Text>
                        <Text style={styles.statLabel}>Active Goals</Text>
                    </Card>

                    <Card style={styles.statCard}>
                        <Text style={styles.statEmoji}>💰</Text>
                        <Text style={styles.statValue}>
                            {formatCurrency(data?.goals?.reduce((sum, g) => sum + g.saved, 0) || 0)}
                        </Text>
                        <Text style={styles.statLabel}>Total Saved</Text>
                    </Card>
                </View>

                {/* Expenses This Month */}
                <Card style={styles.expenseCard}>
                    <View style={styles.expenseHeader}>
                        <Text style={styles.expenseTitle}>Expenses This Month</Text>
                        <Text style={styles.expenseEmoji}>💸</Text>
                    </View>
                    <Text style={styles.expenseAmount}>
                        {formatCurrency(data?.recentExpenses?.reduce((sum, e) => sum + e.amount, 0) || 0)}
                    </Text>
                </Card>

                {/* Quick Actions */}
                <View style={styles.actionsContainer}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.actionsRow}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => setDepositModalVisible(true)}
                        >
                            <Text style={styles.actionEmoji}>➕</Text>
                            <Text style={styles.actionText}>Add Money</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => setExpenseModalVisible(true)}
                        >
                            <Text style={styles.actionEmoji}>📝</Text>
                            <Text style={styles.actionText}>Add Expense</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* Deposit Modal */}
            <Modal
                visible={depositModalVisible}
                onClose={() => setDepositModalVisible(false)}
                title="Add Money"
            >
                <Input
                    label="Amount"
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="Enter amount"
                    keyboardType="numeric"
                />
                <Input
                    label="Description (Optional)"
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Enter description"
                />
                <Button
                    title="Add Money"
                    onPress={async () => {
                        const amountNum = parseFloat(amount);
                        if (!amountNum || amountNum <= 0) {
                            Alert.alert('Invalid Amount', 'Please enter a valid amount');
                            return;
                        }

                        setProcessing(true);
                        try {
                            await apiService.deposit(amountNum, description);
                            Alert.alert('Success', 'Money added successfully!');
                            setDepositModalVisible(false);
                            setAmount('');
                            setDescription('');
                            fetchDashboardData();
                        } catch (error: any) {
                            Alert.alert('Error', error.message || 'Failed to add money');
                        } finally {
                            setProcessing(false);
                        }
                    }}
                    loading={processing}
                    style={{ marginTop: 8 }}
                />
            </Modal>

            {/* Expense Modal */}
            <Modal
                visible={expenseModalVisible}
                onClose={() => setExpenseModalVisible(false)}
                title="Add Expense"
            >
                <Input
                    label="Description"
                    value={description}
                    onChangeText={setDescription}
                    placeholder="What did you spend on?"
                />
                <Input
                    label="Amount"
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="Enter amount"
                    keyboardType="numeric"
                />
                <Picker
                    label="Category"
                    value={category}
                    options={categoryOptions}
                    onValueChange={setCategory}
                />
                <Button
                    title="Add Expense"
                    onPress={async () => {
                        const amountNum = parseFloat(amount);
                        if (!description || !amountNum || amountNum <= 0) {
                            Alert.alert('Invalid Input', 'Please fill in all fields');
                            return;
                        }

                        setProcessing(true);
                        try {
                            await apiService.createExpense({
                                description,
                                amount: amountNum,
                                category,
                                date: new Date().toISOString(),
                            });
                            Alert.alert('Success', 'Expense added successfully!');
                            setExpenseModalVisible(false);
                            setDescription('');
                            setAmount('');
                            setCategory('FOOD');
                            fetchDashboardData();
                        } catch (error: any) {
                            Alert.alert('Error', error.message || 'Failed to add expense');
                        } finally {
                            setProcessing(false);
                        }
                    }}
                    loading={processing}
                    style={{ marginTop: 8 }}
                />
            </Modal>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    greeting: {
        fontSize: 16,
        color: colors.textSecondary,
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
    },
    notificationBadge: {
        position: 'relative',
    },
    emoji: {
        fontSize: 28,
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: colors.error,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: colors.white,
        fontSize: 12,
        fontWeight: 'bold',
    },
    walletCard: {
        backgroundColor: colors.primary,
        marginBottom: 20,
        padding: 24,
    },
    walletLabel: {
        fontSize: 14,
        color: colors.white,
        opacity: 0.9,
        marginBottom: 8,
    },
    walletAmount: {
        fontSize: 36,
        fontWeight: 'bold',
        color: colors.white,
    },
    statsRow: {
        flexDirection: 'row',
        marginBottom: 20,
        justifyContent: 'space-between',
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
        padding: 20,
        marginHorizontal: 6,
    },
    statEmoji: {
        fontSize: 32,
        marginBottom: 8,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    expenseCard: {
        marginBottom: 20,
    },
    expenseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    expenseTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    expenseEmoji: {
        fontSize: 24,
    },
    expenseAmount: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.error,
    },
    actionsContainer: {
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 16,
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionButton: {
        flex: 1,
        backgroundColor: colors.white,
        borderRadius: 12,
        marginHorizontal: 6,
        padding: 20,
        alignItems: 'center',
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    actionEmoji: {
        fontSize: 32,
        marginBottom: 8,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
    },
});

export default DashboardScreen;
