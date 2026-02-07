import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { GoalsStackParamList } from '../navigation/MainNavigator';
import apiService from '../services/api';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { Picker, PickerOption } from '../components/Picker';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { colors } from '../constants/colors';
import { formatCurrency, calculatePercentage } from '../utils/formatters';

type GoalsScreenNavigationProp = StackNavigationProp<GoalsStackParamList, 'GoalsList'>;

interface Props {
    navigation: GoalsScreenNavigationProp;
}

interface Goal {
    id: string;
    name: string;
    description?: string;
    target: number;
    saved: number;
    emoji?: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

const GoalsScreen: React.FC<Props> = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [target, setTarget] = useState('');
    const [emoji, setEmoji] = useState('🎯');
    const [priority, setPriority] = useState('MEDIUM');
    const [processing, setProcessing] = useState(false);

    const emojiOptions: PickerOption[] = [
        { label: 'Target', value: '🎯', emoji: '🎯' },
        { label: 'House', value: '🏠', emoji: '🏠' },
        { label: 'Car', value: '🚗', emoji: '🚗' },
        { label: 'Vacation', value: '✈️', emoji: '✈️' },
        { label: 'Education', value: '🎓', emoji: '🎓' },
        { label: 'Wedding', value: '💍', emoji: '💍' },
        { label: 'Baby', value: '👶', emoji: '👶' },
        { label: 'Laptop', value: '💻', emoji: '💻' },
        { label: 'Phone', value: '📱', emoji: '📱' },
        { label: 'Money', value: '💰', emoji: '💰' },
    ];

    const priorityOptions: PickerOption[] = [
        { label: 'Low Priority', value: 'LOW' },
        { label: 'Medium Priority', value: 'MEDIUM' },
        { label: 'High Priority', value: 'HIGH' },
    ];

    const fetchGoals = async () => {
        try {
            const response = await apiService.getGoals({ active: true });
            if (response.success && response.data) {
                setGoals(response.data as Goal[]);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to load goals');
            console.error('Goals fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGoals();
    }, []);

    const renderGoalCard = ({ item }: { item: Goal }) => {
        const percentage = calculatePercentage(item.saved, item.target);

        return (
            <TouchableOpacity
                onPress={() => navigation.navigate('GoalDetails', { goalId: item.id })}
            >
                <Card style={styles.goalCard}>
                    <View style={styles.goalHeader}>
                        <Text style={styles.goalEmoji}>{item.emoji || '🎯'}</Text>
                        <View style={styles.goalInfo}>
                            <Text style={styles.goalName}>{item.name}</Text>
                            {item.description && (
                                <Text style={styles.goalDescription}>{item.description}</Text>
                            )}
                        </View>
                    </View>

                    <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: `${percentage}%` }]} />
                        </View>
                        <Text style={styles.progressText}>{percentage}%</Text>
                    </View>

                    <View style={styles.goalFooter}>
                        <Text style={styles.currentAmount}>
                            {formatCurrency(item.saved)}
                        </Text>
                        <Text style={styles.targetAmount}>
                            of {formatCurrency(item.target)}
                        </Text>
                    </View>
                </Card>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return <LoadingSpinner fullScreen message="Loading goals..." />;
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>My Goals</Text>
                <Button
                    title="+ New Goal"
                    onPress={() => setModalVisible(true)}
                    size="small"
                />
            </View>

            {goals.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyEmoji}>🎯</Text>
                    <Text style={styles.emptyTitle}>No Goals Yet</Text>
                    <Text style={styles.emptyText}>
                        Create your first savings goal to get started!
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={goals}
                    renderItem={renderGoalCard}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                />
            )}

            {/* Create Goal Modal */}
            <Modal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                title="Create New Goal"
            >
                <Picker
                    label="Emoji"
                    value={emoji}
                    options={emojiOptions}
                    onValueChange={setEmoji}
                />
                <Input
                    label="Goal Name"
                    value={name}
                    onChangeText={setName}
                    placeholder="e.g., Emergency Fund"
                />
                <Input
                    label="Description (Optional)"
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Describe your goal"
                />
                <Input
                    label="Target Amount"
                    value={target}
                    onChangeText={setTarget}
                    placeholder="Enter target amount"
                    keyboardType="numeric"
                />
                <Picker
                    label="Priority"
                    value={priority}
                    options={priorityOptions}
                    onValueChange={setPriority}
                />
                <Button
                    title="Create Goal"
                    onPress={async () => {
                        const targetNum = parseFloat(target);
                        if (!name || !targetNum || targetNum <= 0) {
                            Alert.alert('Invalid Input', 'Please fill in all required fields');
                            return;
                        }

                        setProcessing(true);
                        try {
                            await apiService.createGoal({
                                name,
                                description,
                                target: targetNum,
                                targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                                priority: priority as any,
                                emoji,
                            });
                            Alert.alert('Success', 'Goal created successfully!');
                            setModalVisible(false);
                            setName('');
                            setDescription('');
                            setTarget('');
                            setEmoji('🎯');
                            setPriority('MEDIUM');
                            fetchGoals();
                        } catch (error: any) {
                            Alert.alert('Error', error.message || 'Failed to create goal');
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
    goalCard: {
        marginBottom: 16,
    },
    goalHeader: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    goalEmoji: {
        fontSize: 40,
        marginRight: 12,
    },
    goalInfo: {
        flex: 1,
    },
    goalName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 4,
    },
    goalDescription: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    progressBar: {
        flex: 1,
        height: 8,
        backgroundColor: colors.gray200,
        borderRadius: 4,
        overflow: 'hidden',
        marginRight: 12,
    },
    progressFill: {
        height: '100%',
        backgroundColor: colors.primary,
    },
    progressText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.primary,
        minWidth: 40,
        textAlign: 'right',
    },
    goalFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    currentAmount: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
    },
    targetAmount: {
        fontSize: 14,
        color: colors.textSecondary,
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

export default GoalsScreen;
