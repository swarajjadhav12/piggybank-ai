import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    Alert,
    RefreshControl,
    ScrollView,
} from 'react-native';
import apiService from '../services/api';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { colors } from '../constants/colors';
import { formatCurrency, formatDate } from '../utils/formatters';

interface Transaction {
    id: string;
    type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' | 'PAYMENT';
    amount: number;
    description?: string;
    createdAt: string;
}

const PaymentsScreen: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [depositModalVisible, setDepositModalVisible] = useState(false);
    const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [processing, setProcessing] = useState(false);

    const fetchWalletData = async () => {
        try {
            // Fetch wallet
            const walletRes = await apiService.getWallet();
            if (walletRes?.success && walletRes?.data) {
                const bal = walletRes.data?.balance || 0;
                setBalance(bal);
            }

            // Fetch transactions
            const txRes = await apiService.getTransactions({ limit: 20 });
            if (txRes?.success && txRes?.data && Array.isArray(txRes.data)) {
                setTransactions(txRes.data);
            }
        } catch (error: any) {
            console.error('Fetch error:', error);
            Alert.alert('Error', 'Failed to load wallet data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchWalletData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchWalletData();
    };

    const handleDeposit = async () => {
        const amountNum = parseFloat(amount);
        if (!amountNum || amountNum <= 0) {
            Alert.alert('Invalid Amount', 'Please enter a valid amount');
            return;
        }

        setProcessing(true);
        try {
            await apiService.deposit(amountNum, description);
            Alert.alert('Success', 'Money deposited successfully!');
            setDepositModalVisible(false);
            setAmount('');
            setDescription('');
            fetchWalletData();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to deposit money');
        } finally {
            setProcessing(false);
        }
    };

    const handleWithdraw = async () => {
        const amountNum = parseFloat(amount);
        if (!amountNum || amountNum <= 0) {
            Alert.alert('Invalid Amount', 'Please enter a valid amount');
            return;
        }

        if (amountNum > balance) {
            Alert.alert('Insufficient Balance', 'You don\'t have enough balance');
            return;
        }

        setProcessing(true);
        try {
            await apiService.withdraw(amountNum, description);
            Alert.alert('Success', 'Money withdrawn successfully!');
            setWithdrawModalVisible(false);
            setAmount('');
            setDescription('');
            fetchWalletData();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to withdraw money');
        } finally {
            setProcessing(false);
        }
    };

    const getTransactionIcon = (type: string): string => {
        const iconMap: Record<string, string> = {
            DEPOSIT: '⬇️',
            WITHDRAWAL: '⬆️',
            TRANSFER: '↔️',
            PAYMENT: '💳',
        };
        return iconMap[type] || '💰';
    };

    const getTransactionColor = (type: string): string => {
        return type === 'DEPOSIT' ? colors.success : colors.error;
    };

    if (loading) {
        return <LoadingSpinner fullScreen message="Loading wallet..." />;
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Wallet</Text>
            </View>

            <View style={styles.balanceCard}>
                <Text style={styles.balanceLabel}>Available Balance</Text>
                <Text style={styles.balanceAmount}>{formatCurrency(balance)}</Text>
                <View style={styles.actionButtons}>
                    <Button
                        title="Deposit"
                        onPress={() => setDepositModalVisible(true)}
                        style={styles.actionButton}
                    />
                    <Button
                        title="Withdraw"
                        onPress={() => setWithdrawModalVisible(true)}
                        variant="secondary"
                        style={styles.actionButton}
                    />
                </View>
            </View>

            <View style={styles.transactionsHeader}>
                <Text style={styles.sectionTitle}>Recent Transactions</Text>
            </View>

            {transactions.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyEmoji}>💳</Text>
                    <Text style={styles.emptyTitle}>No Transactions Yet</Text>
                    <Text style={styles.emptyText}>
                        Start by depositing money to your wallet!
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={transactions}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    renderItem={({ item }) => (
                        <Card style={styles.transactionCard}>
                            <View style={styles.transactionHeader}>
                                <View style={styles.transactionInfo}>
                                    <Text style={styles.transactionIcon}>{getTransactionIcon(item.type)}</Text>
                                    <View style={styles.transactionDetails}>
                                        <Text style={styles.transactionType}>{item.type}</Text>
                                        {item.description && (
                                            <Text style={styles.transactionDescription}>{item.description}</Text>
                                        )}
                                        <Text style={styles.transactionDate}>{formatDate(item.createdAt)}</Text>
                                    </View>
                                </View>
                                <Text style={[
                                    styles.transactionAmount,
                                    { color: getTransactionColor(item.type) }
                                ]}>
                                    {item.type === 'DEPOSIT' ? '+' : '-'}{formatCurrency(item.amount)}
                                </Text>
                            </View>
                        </Card>
                    )}
                />
            )}

            {/* Deposit Modal */}
            <Modal
                visible={depositModalVisible}
                onClose={() => setDepositModalVisible(false)}
                title="Deposit Money"
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
                    title="Deposit"
                    onPress={handleDeposit}
                    loading={processing}
                    style={styles.modalButton}
                />
            </Modal>

            {/* Withdraw Modal */}
            <Modal
                visible={withdrawModalVisible}
                onClose={() => setWithdrawModalVisible(false)}
                title="Withdraw Money"
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
                    title="Withdraw"
                    onPress={handleWithdraw}
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
    balanceCard: {
        backgroundColor: colors.primary,
        margin: 20,
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
    },
    balanceLabel: {
        fontSize: 14,
        color: colors.white,
        opacity: 0.9,
        marginBottom: 8,
    },
    balanceAmount: {
        fontSize: 40,
        fontWeight: 'bold',
        color: colors.white,
        marginBottom: 20,
    },
    actionButtons: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
    },
    actionButton: {
        flex: 1,
        marginHorizontal: 6,
    },
    transactionsHeader: {
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
    transactionCard: {
        marginBottom: 12,
    },
    transactionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    transactionInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    transactionIcon: {
        fontSize: 28,
        marginRight: 12,
    },
    transactionDetails: {
        flex: 1,
    },
    transactionType: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 2,
    },
    transactionDescription: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 2,
    },
    transactionDate: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    transactionAmount: {
        fontSize: 18,
        fontWeight: 'bold',
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

export default PaymentsScreen;
