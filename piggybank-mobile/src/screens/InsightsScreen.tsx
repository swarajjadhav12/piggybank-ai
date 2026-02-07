import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    TouchableOpacity,
    Alert,
    RefreshControl,
} from 'react-native';
import apiService from '../services/api';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { colors } from '../constants/colors';
import { formatCurrency } from '../utils/formatters';

interface Insight {
    id: string;
    type: 'SAVING' | 'SPENDING' | 'WARNING' | 'GOAL' | 'ACHIEVEMENT';
    title: string;
    description: string;
    potentialSavings?: number;
    impact: 'LOW' | 'MEDIUM' | 'HIGH';
    isRead: boolean;
    createdAt: string;
}

const InsightsScreen: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [insights, setInsights] = useState<Insight[]>([]);
    const [filter, setFilter] = useState<string>('ALL');

    const fetchInsights = async () => {
        try {
            const params = filter !== 'ALL' ? { type: filter } : {};
            const response = await apiService.getInsights(params);
            if (response.success && response.data) {
                setInsights(response.data as Insight[]);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to load insights');
            console.error('Insights fetch error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchInsights();
    }, [filter]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchInsights();
    };

    const handleGenerateInsights = async () => {
        try {
            setLoading(true);
            await apiService.generateInsights();
            Alert.alert('Success', 'New insights generated!');
            fetchInsights();
        } catch (error) {
            Alert.alert('Error', 'Failed to generate insights');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id: string) => {
        try {
            await apiService.markInsightAsRead(id);
            setInsights(insights.map(i => i.id === id ? { ...i, isRead: true } : i));
        } catch (error) {
            console.error('Mark as read error:', error);
        }
    };

    const getInsightEmoji = (type: string): string => {
        const emojiMap: Record<string, string> = {
            SAVING: '💰',
            SPENDING: '💸',
            WARNING: '⚠️',
            GOAL: '🎯',
            ACHIEVEMENT: '🏆',
        };
        return emojiMap[type] || '💡';
    };

    const getImpactColor = (impact: string): string => {
        const colorMap: Record<string, string> = {
            LOW: colors.success,
            MEDIUM: colors.warning,
            HIGH: colors.error,
        };
        return colorMap[impact] || colors.textSecondary;
    };

    const renderInsight = ({ item }: { item: Insight }) => (
        <TouchableOpacity onPress={() => !item.isRead && handleMarkAsRead(item.id)}>
            <Card style={[styles.insightCard, !item.isRead && styles.unreadCard]}>
                <View style={styles.insightHeader}>
                    <Text style={styles.insightEmoji}>{getInsightEmoji(item.type)}</Text>
                    <View style={styles.insightInfo}>
                        <Text style={styles.insightTitle}>{item.title}</Text>
                        <Text style={styles.insightDescription}>{item.description}</Text>
                    </View>
                    {!item.isRead && <View style={styles.unreadDot} />}
                </View>
                {item.potentialSavings && item.potentialSavings > 0 && (
                    <View style={styles.savingsContainer}>
                        <Text style={styles.savingsLabel}>Potential Savings:</Text>
                        <Text style={styles.savingsAmount}>
                            {formatCurrency(item.potentialSavings)}
                        </Text>
                    </View>
                )}
                <View style={styles.insightFooter}>
                    <View style={[styles.impactBadge, { backgroundColor: getImpactColor(item.impact) + '20' }]}>
                        <Text style={[styles.impactText, { color: getImpactColor(item.impact) }]}>
                            {item.impact}
                        </Text>
                    </View>
                    <Text style={styles.typeText}>{item.type}</Text>
                </View>
            </Card>
        </TouchableOpacity>
    );

    const filters = ['ALL', 'SAVING', 'SPENDING', 'WARNING', 'GOAL', 'ACHIEVEMENT'];

    if (loading && !refreshing) {
        return <LoadingSpinner fullScreen message="Loading insights..." />;
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>AI Insights</Text>
                <Button
                    title="Generate"
                    onPress={handleGenerateInsights}
                    size="small"
                />
            </View>

            <View style={styles.filterContainer}>
                <FlatList
                    horizontal
                    data={filters}
                    keyExtractor={(item) => item}
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.filterButton,
                                filter === item && styles.filterButtonActive,
                            ]}
                            onPress={() => setFilter(item)}
                        >
                            <Text
                                style={[
                                    styles.filterText,
                                    filter === item && styles.filterTextActive,
                                ]}
                            >
                                {item}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {insights.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyEmoji}>💡</Text>
                    <Text style={styles.emptyTitle}>No Insights Yet</Text>
                    <Text style={styles.emptyText}>
                        Generate AI insights to get personalized financial recommendations!
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={insights}
                    renderItem={renderInsight}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                />
            )}
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
    filterContainer: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: colors.gray100,
        marginRight: 8,
    },
    filterButtonActive: {
        backgroundColor: colors.primary,
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    filterTextActive: {
        color: colors.white,
    },
    listContent: {
        padding: 20,
    },
    insightCard: {
        marginBottom: 16,
    },
    unreadCard: {
        borderLeftWidth: 4,
        borderLeftColor: colors.primary,
    },
    insightHeader: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    insightEmoji: {
        fontSize: 32,
        marginRight: 12,
    },
    insightInfo: {
        flex: 1,
    },
    insightTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 4,
    },
    insightDescription: {
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 20,
    },
    unreadDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.primary,
    },
    savingsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.successLight,
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    savingsLabel: {
        fontSize: 14,
        color: colors.success,
        fontWeight: '600',
    },
    savingsAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.success,
    },
    insightFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    impactBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    impactText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    typeText: {
        fontSize: 12,
        color: colors.textSecondary,
        fontWeight: '600',
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

export default InsightsScreen;
