import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    Alert,
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

interface Expense {
    id: string;
    description: string;
    amount: number;
    category: string;
    date: string;
}

const ExpensesScreen: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
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

    const fetchExpenses = async () => {
        try {
            const response = await apiService.getExpenses({ limit: 20 });
            if (response.success && response.data) {
                setExpenses(response.data as Expense[]);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to load expenses');
            console.error('Expenses fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    const getCategoryEmoji = (category: string): string => {
        const emojiMap: Record<string, string> = {
            FOOD: '🍔',
            TRANSPORT: '🚗',
            SHOPPING: '🛍️',
            ENTERTAINMENT: '🎬',
            UTILITIES: '💡',
            HEALTH: '🏥',
            OTHER: '📦',
        };
        return emojiMap[category] || '📦';
    };

    const renderExpenseItem = ({ item }: { item: Expense }) => (
        <Card style={styles.expenseCard}>
            <View style={styles.expenseHeader}>
                <View style={styles.expenseInfo}>
                    <Text style={styles.categoryEmoji}>{getCategoryEmoji(item.category)}</Text>
                    <View style={styles.expenseDetails}>
                        <Text style={styles.expenseDescription}>{item.description}</Text>
                        <Text style={styles.expenseDate}>{formatDate(item.date)}</Text>
                    </View>
                </View>
                <Text style={styles.expenseAmount}>-{formatCurrency(item.amount)}</Text>
            </View>
        </Card>
    );

    if (loading) {
        return <LoadingSpinner fullScreen message="Loading expenses..." />;
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Expenses</Text>
                <Button
                    title="+ Add"
                    onPress={() => setModalVisible(true)}
                    size="small"
                />
            </View>

            {expenses.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyEmoji}>💸</Text>
                    <Text style={styles.emptyTitle}>No Expenses Yet</Text>
                    <Text style={styles.emptyText}>
                        Start tracking your expenses to manage your budget better!
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={expenses}
                    renderItem={renderExpenseItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                />
            )}

            {/* Create Expense Modal */}
            <Modal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
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
                            setModalVisible(false);
                            setDescription('');
                            setAmount('');
                            setCategory('FOOD');
                            fetchExpenses();
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
    listContent: {
        padding: 20,
    },
    expenseCard: {
        marginBottom: 12,
    },
    expenseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    expenseInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    categoryEmoji: {
        fontSize: 32,
        marginRight: 12,
    },
    expenseDetails: {
        flex: 1,
    },
    expenseDescription: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 4,
    },
    expenseDate: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    expenseAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.error,
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
});

export default ExpensesScreen;
