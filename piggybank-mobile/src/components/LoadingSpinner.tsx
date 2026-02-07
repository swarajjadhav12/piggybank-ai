import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { colors } from '../constants/colors';

interface LoadingSpinnerProps {
    fullScreen?: boolean;
    message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    fullScreen = false,
    message,
}) => {
    if (fullScreen) {
        return (
            <View style={styles.fullScreenContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                {message && <Text style={styles.message}>{message}</Text>}
            </View>
        );
    }

    return (
        <View style={styles.inlineContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            {message && <Text style={styles.inlineMessage}>{message}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    fullScreenContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    inlineContainer: {
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    message: {
        marginTop: 12,
        fontSize: 16,
        color: colors.textSecondary,
    },
    inlineMessage: {
        marginTop: 8,
        fontSize: 14,
        color: colors.textSecondary,
    },
});
