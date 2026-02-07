import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    Alert,
    RefreshControl,
} from 'react-native';
import apiService from '../services/api';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { Picker, PickerOption } from '../components/Picker';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { colors } from '../constants/colors';
import { formatCurrency, formatDate } from '../utils/formatters';

interface Saving {
    id: string;
    amount: number;
    type: 'MANUAL' | 'AUTOMATIC' | 'ROUND_UP' | 'GOAL_CONTRIBUTION';
    date: string;
    createdAt: string;
}

const SavingsScreen: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [savings, setSavings] = useState<Saving[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('MANUAL');
    const [processing, setProcessing] = useState(false);

    const savingTypes: PickerOption[] = [
        { label: 'Manual Saving', value: 'MANUAL', emoji: '💰' },
        { label: 'Automatic Saving', value: 'AUTOMATIC', emoji: '🤖' },
        { label: 'Round Up', value: 'ROUND_UP', emoji: '🔄' },
        { label: 'Goal Contribution', value: 'GOAL_CONTRIBUTION', emoji: '🎯' },
    ];

    const fetchSavings = async () => {
        try {
            const response = await apiService.getSavings({ limit: 50 });
            console.log('Savings response:', response);

            if (response.success && response.data) {
                const savingsData = Array.isArray(response.data) ? response.data : [];
                console.log('Setting savings data:', savingsData.length, 'items');
                setSavings(savingsData as Saving[]);
            }
        } catch (error) {
            console.error('Savings fetch error:', error);
            Alert.alert('Error', 'Failed to load savings');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchSavings();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchSavings();
    };

    const handleAddSaving = async () => {
        const amountNum = parseFloat(amount);
        if (!amountNum || amountNum <= 0) {
            Alert.alert('Invalid Amount', 'Please enter a valid amount');
            return;
        }

        setProcessing(true);
        try {
            await apiService.createSaving({
                amount: amountNum,
                type: type as any,
                date: new Date().toISOString(),
            });
            Alert.alert('Success', 'Saving added successfully!');
            setModalVisible(false);
            setAmount('');
            setType('MANUAL');
            fetchSavings();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to add saving');
        } finally {
            setProcessing(false);
        }
    };

    const getSavingTypeEmoji = (type: string): string => {
        const emojiMap: Record<string, string> = {
            MANUAL: '💰',
            AUTOMATIC: '🤖',
            ROUND_UP: '🔄',
            GOAL_CONTRIBUTION: '🎯',
        };
        return emojiMap[type] || '💵';
    };

    const getSavingTypeLabel = (type: string): string => {
        const labelMap: Record<string, string> = {
            MANUAL: 'Manual',
            AUTOMATIC: 'Automatic',
            ROUND_UP: 'Round Up',
            GOAL_CONTRIBUTION: 'Goal',
        };
        return labelMap[type] || type;
    };

    const totalSavings = savings.reduce((sum, s) => sum + s.amount, 0);

    const renderSaving = ({ item }: { item: Saving }) => (
        <Card style={styles.savingCard}>
            <View style={styles.savingHeader}>
                <View style={styles.savingInfo}>
                    <Text style={styles.savingEmoji}>{getSavingTypeEmoji(item.type)}</Text>
                    <View style={styles.savingDetails}>
                        <Text style={styles.savingType}>{getSavingTypeLabel(item.type)}</Text>
                        <Text style={styles.savingDate}>{formatDate(item.date || item.createdAt)}</Text>
                    </View>
                </View>
                <Text style={styles.savingAmount}>+{formatCurrency(item.amount)}</Text>
            </View>
        </Card>
    );

    if (loading) {
        return <LoadingSpinner fullScreen message="Loading savings..." />;
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Savings</Text>
                <Button
                    title="+ Add"
                    onPress={() => setModalVisible(true)}
                    size="small"
                />
            </View>

            <Card style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Total Savings</Text>
                <Text style={styles.summaryAmount}>{formatCurrency(totalSavings)}</Text>
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{savings.length}</Text>
                        <Text style={styles.statLabel}>Entries</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>
                            {savings.length > 0 ? formatCurrency(totalSavings / savings.length) : '$0'}
                        </Text>
                        <Text style={styles.statLabel}>Average</Text>
                    </View>
                </View>
            </Card>

            <View style={styles.listHeader}>
                <Text style={styles.sectionTitle}>Savings History</Text>
            </View>

            {savings.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyEmoji}>💰</Text>
                    <Text style={styles.emptyTitle}>No Savings Yet</Text>
                    <Text style={styles.emptyText}>
                        Start tracking your savings to see your progress!
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={savings}
                    renderItem={renderSaving}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                />
            )}

            {/* Add Saving Modal */}
            <Modal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                title="Add Saving"
            >
                <Input
                    label="Amount"
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="Enter amount"
                    keyboardType="numeric"
                />
                <Picker
                    label="Type"
                    value={type}
                    options={savingTypes}
                    onValueChange={setType}
                />
                <Button
                    title="Add Saving"
                    onPress={handleAddSaving}
                    loading={processing}
                    style={styles.modalButton}
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
    },
    summaryCard: {
        margin: 20,
        padding: 24,
        backgroundColor: colors.success,
    },
    summaryLabel: {
        fontSize: 14,
        color: colors.white,
        opacity: 0.9,
        marginBottom: 8,
    },
    summaryAmount: {
        fontSize: 36,
        fontWeight: 'bold',
        color: colors.white,
        marginBottom: 20,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statDivider: {
        width: 1,
        backgroundColor: colors.white,
        opacity: 0.3,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.white,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: colors.white,
        opacity: 0.9,
    },
    listHeader: {
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    savingCard: {
        marginBottom: 12,
    },
    savingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    savingInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    savingEmoji: {
        fontSize: 28,
        marginRight: 12,
    },
    savingDetails: {
        flex: 1,
    },
    savingType: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 4,
    },
    savingDate: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    savingAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.success,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyEmoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 16,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    modalButton: {
        marginTop: 8,
    },
});

export default SavingsScreen;
