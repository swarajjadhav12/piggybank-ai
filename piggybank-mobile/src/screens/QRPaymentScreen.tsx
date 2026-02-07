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
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { GoalsStackParamList } from '../navigation/MainNavigator';
import apiService from '../services/api';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { colors } from '../constants/colors';
import { formatCurrency } from '../utils/formatters';

type QRPaymentScreenNavigationProp = StackNavigationProp<GoalsStackParamList, 'QRPayment'>;
type QRPaymentScreenRouteProp = RouteProp<GoalsStackParamList, 'QRPayment'>;

interface Props {
    navigation: QRPaymentScreenNavigationProp;
    route: QRPaymentScreenRouteProp;
}

interface Goal {
    id: string;
    name: string;
    saved: number;
    emoji?: string;
}

const QRPaymentScreen: React.FC<Props> = ({ navigation, route }) => {
    const { goalId, qrData } = route.params;
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [goal, setGoal] = useState<Goal | null>(null);
    const [amount, setAmount] = useState('');

    useEffect(() => {
        fetchGoalDetails();
    }, [goalId]);

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

    const handleMakePayment = async () => {
        const amountNum = parseFloat(amount);

        if (!amountNum || amountNum <= 0) {
            Alert.alert('Invalid Amount', 'Please enter a valid amount');
            return;
        }

        if (goal && amountNum > goal.saved) {
            Alert.alert(
                'Insufficient Funds',
                `You only have ${formatCurrency(goal.saved)} in this goal`
            );
            return;
        }

        Alert.alert(
            'Confirm Payment',
            `Pay ${formatCurrency(amountNum)} from ${goal?.name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: async () => {
                        setProcessing(true);
                        try {
                            await apiService.payFromGoalWithQR(goalId, amountNum, qrData);
                            Alert.alert(
                                'Payment Successful',
                                `${formatCurrency(amountNum)} has been paid from your goal`,
                                [
                                    {
                                        text: 'OK',
                                        onPress: () => {
                                            navigation.navigate('GoalDetails', { goalId });
                                        },
                                    },
                                ]
                            );
                        } catch (error: any) {
                            Alert.alert('Payment Failed', error.message || 'Failed to process payment');
                        } finally {
                            setProcessing(false);
                        }
                    },
                },
            ]
        );
    };

    if (loading) {
        return <LoadingSpinner fullScreen message="Loading..." />;
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

    const remainingAfterPayment = goal.saved - (parseFloat(amount) || 0);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Card style={styles.headerCard}>
                    <Text style={styles.emoji}>{goal.emoji || '🎯'}</Text>
                    <Text style={styles.goalName}>{goal.name}</Text>
                    <Text style={styles.subtitle}>QR Payment</Text>
                </Card>

                <Card style={styles.qrInfoCard}>
                    <Text style={styles.sectionTitle}>QR Code Information</Text>
                    <View style={styles.qrDataContainer}>
                        <Text style={styles.qrDataLabel}>Scanned Data:</Text>
                        <Text style={styles.qrDataText} numberOfLines={3}>
                            {qrData}
                        </Text>
                    </View>
                </Card>

                <Card style={styles.balanceCard}>
                    <View style={styles.balanceRow}>
                        <Text style={styles.balanceLabel}>Available Balance:</Text>
                        <Text style={styles.balanceAmount}>{formatCurrency(goal.saved)}</Text>
                    </View>
                    {amount && parseFloat(amount) > 0 && (
                        <View style={styles.balanceRow}>
                            <Text style={styles.balanceLabel}>After Payment:</Text>
                            <Text
                                style={[
                                    styles.balanceAmount,
                                    remainingAfterPayment < 0 && styles.negativeAmount,
                                ]}
                            >
                                {formatCurrency(remainingAfterPayment)}
                            </Text>
                        </View>
                    )}
                </Card>

                <Card style={styles.paymentCard}>
                    <Text style={styles.sectionTitle}>Payment Amount</Text>
                    <Input
                        label="Enter Amount"
                        value={amount}
                        onChangeText={setAmount}
                        placeholder="0.00"
                        keyboardType="numeric"
                    />

                    <Button
                        title="Make Payment"
                        onPress={handleMakePayment}
                        loading={processing}
                        disabled={!amount || parseFloat(amount) <= 0}
                        style={styles.payButton}
                    />

                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => navigation.goBack()}
                        disabled={processing}
                    >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                </Card>
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
    headerCard: {
        alignItems: 'center',
        padding: 24,
        marginBottom: 16,
    },
    emoji: {
        fontSize: 48,
        marginBottom: 12,
    },
    goalName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 4,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    qrInfoCard: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 12,
    },
    qrDataContainer: {
        backgroundColor: colors.gray100,
        padding: 12,
        borderRadius: 8,
    },
    qrDataLabel: {
        fontSize: 12,
        color: colors.textSecondary,
        marginBottom: 4,
    },
    qrDataText: {
        fontSize: 14,
        color: colors.text,
        fontFamily: 'monospace',
    },
    balanceCard: {
        marginBottom: 16,
    },
    balanceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    balanceLabel: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    balanceAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.primary,
    },
    negativeAmount: {
        color: colors.error,
    },
    paymentCard: {
        marginBottom: 16,
    },
    payButton: {
        marginTop: 16,
    },
    cancelButton: {
        marginTop: 12,
        padding: 16,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        color: colors.textSecondary,
        fontWeight: '600',
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
});

export default QRPaymentScreen;
