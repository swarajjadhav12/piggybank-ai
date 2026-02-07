import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    Alert,
    TouchableOpacity,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { GoalsStackParamList } from '../navigation/MainNavigator';
import apiService from '../services/api';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { colors } from '../constants/colors';
import { formatCurrency, calculatePercentage } from '../utils/formatters';

type GoalDetailsScreenRouteProp = RouteProp<GoalsStackParamList, 'GoalDetails'>;
type GoalDetailsScreenNavigationProp = StackNavigationProp<GoalsStackParamList, 'GoalDetails'>;

interface Props {
    route: GoalDetailsScreenRouteProp;
    navigation: GoalDetailsScreenNavigationProp;
}

interface Goal {
    id: string;
    name: string;
    description?: string;
    target: number;
    saved: number;
    emoji?: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    targetDate?: string;
}

const GoalDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
    const { goalId } = route.params;
    const [loading, setLoading] = useState(true);
    const [goal, setGoal] = useState<Goal | null>(null);
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
    const [amount, setAmount] = useState('');
    const [processing, setProcessing] = useState(false);

    const fetchGoalDetails = async () => {
        try {
            const response = await apiService.getGoals();
            if (response.success && response.data) {
                const goals = response.data as Goal[];
                const foundGoal = goals.find(g => g.id === goalId);
                if (foundGoal) {
                    setGoal(foundGoal);
                } else {
                    Alert.alert('Error', 'Goal not found');
                    navigation.goBack();
                }
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to load goal details');
            console.error('Goal details fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGoalDetails();
    }, [goalId]);

    const handleAddMoney = async () => {
        const amountNum = parseFloat(amount);
        if (!amountNum || amountNum <= 0) {
            Alert.alert('Invalid Amount', 'Please enter a valid amount');
            return;
        }

        setProcessing(true);
        try {
            await apiService.addToGoal(goalId, amountNum);
            Alert.alert('Success', 'Money added to goal!');
            setAddModalVisible(false);
            setAmount('');
            fetchGoalDetails();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to add money');
        } finally {
            setProcessing(false);
        }
    };

    const handleWithdrawMoney = async () => {
        const amountNum = parseFloat(amount);
        if (!amountNum || amountNum <= 0) {
            Alert.alert('Invalid Amount', 'Please enter a valid amount');
            return;
        }

        if (goal && amountNum > goal.saved) {
            Alert.alert('Insufficient Funds', 'You don\'t have enough in this goal');
            return;
        }

        setProcessing(true);
        try {
            await apiService.withdrawFromGoal(goalId, amountNum);
            Alert.alert('Success', 'Money withdrawn from goal!');
            setWithdrawModalVisible(false);
            setAmount('');
            fetchGoalDetails();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to withdraw money');
        } finally {
            setProcessing(false);
        }
    };

    const handleDeleteGoal = () => {
        Alert.alert(
            'Delete Goal',
            'Are you sure you want to delete this goal?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await apiService.deleteGoal(goalId);
                            Alert.alert('Success', 'Goal deleted successfully');
                            navigation.goBack();
                        } catch (error: any) {
                            Alert.alert('Error', error.message || 'Failed to delete goal');
                        }
                    },
                },
            ]
        );
    };

    if (loading) {
        return <LoadingSpinner fullScreen message="Loading goal details..." />;
    }

    if (!goal) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Goal not found</Text>
                </View>
            </SafeAreaView>
        );
    }

    const percentage = calculatePercentage(goal.saved, goal.target);
    const remaining = goal.target - goal.saved;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Card style={styles.headerCard}>
                    <Text style={styles.emoji}>{goal.emoji || '🎯'}</Text>
                    <Text style={styles.goalName}>{goal.name}</Text>
                    {goal.description && (
                        <Text style={styles.goalDescription}>{goal.description}</Text>
                    )}
                </Card>

                <Card style={styles.progressCard}>
                    <View style={styles.progressHeader}>
                        <Text style={styles.progressLabel}>Progress</Text>
                        <Text style={styles.progressPercentage}>{percentage}%</Text>
                    </View>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${percentage}%` }]} />
                    </View>
                    <View style={styles.amountsRow}>
                        <View style={styles.amountItem}>
                            <Text style={styles.amountLabel}>Current</Text>
                            <Text style={styles.amountValue}>{formatCurrency(goal.saved)}</Text>
                        </View>
                        <View style={styles.amountItem}>
                            <Text style={styles.amountLabel}>Target</Text>
                            <Text style={styles.amountValue}>{formatCurrency(goal.target)}</Text>
                        </View>
                        <View style={styles.amountItem}>
                            <Text style={styles.amountLabel}>Remaining</Text>
                            <Text style={[styles.amountValue, styles.remainingAmount]}>
                                {formatCurrency(remaining)}
                            </Text>
                        </View>
                    </View>
                </Card>

                <View style={styles.actionsContainer}>
                    <Button
                        title="Add Money"
                        onPress={() => setAddModalVisible(true)}
                        style={styles.actionButton}
                    />
                    <Button
                        title="Withdraw"
                        onPress={() => setWithdrawModalVisible(true)}
                        variant="secondary"
                        style={styles.actionButton}
                    />
                </View>

                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={handleDeleteGoal}
                >
                    <Text style={styles.deleteButtonText}>Delete Goal</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Add Money Modal */}
            <Modal
                visible={addModalVisible}
                onClose={() => setAddModalVisible(false)}
                title="Add Money to Goal"
            >
                <Input
                    label="Amount"
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="Enter amount"
                    keyboardType="numeric"
                />
                <Button
                    title="Add Money"
                    onPress={handleAddMoney}
                    loading={processing}
                    style={styles.modalButton}
                />
            </Modal>

            {/* Withdraw Money Modal */}
            <Modal
                visible={withdrawModalVisible}
                onClose={() => setWithdrawModalVisible(false)}
                title="Withdraw from Goal"
            >
                <Input
                    label="Amount"
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="Enter amount"
                    keyboardType="numeric"
                />
                <Button
                    title="Withdraw"
                    onPress={handleWithdrawMoney}
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
    scrollContent: {
        padding: 20,
    },
    headerCard: {
        alignItems: 'center',
        padding: 32,
        marginBottom: 20,
    },
    emoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    goalName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 8,
        textAlign: 'center',
    },
    goalDescription: {
        fontSize: 16,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    progressCard: {
        marginBottom: 20,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    progressLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    progressPercentage: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.primary,
    },
    progressBar: {
        height: 12,
        backgroundColor: colors.gray200,
        borderRadius: 6,
        overflow: 'hidden',
        marginBottom: 20,
    },
    progressFill: {
        height: '100%',
        backgroundColor: colors.primary,
    },
    amountsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    amountItem: {
        alignItems: 'center',
    },
    amountLabel: {
        fontSize: 12,
        color: colors.textSecondary,
        marginBottom: 4,
    },
    amountValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
    },
    remainingAmount: {
        color: colors.primary,
    },
    actionsContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        justifyContent: 'space-between',
    },
    actionButton: {
        flex: 1,
        marginHorizontal: 6,
    },
    deleteButton: {
        backgroundColor: colors.errorLight,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    deleteButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.error,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 18,
        color: colors.textSecondary,
    },
    modalButton: {
        marginTop: 8,
    },
});

export default GoalDetailsScreen;

