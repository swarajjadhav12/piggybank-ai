import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
} from 'react-native';
import { colors } from '../constants/colors';

interface DatePickerProps {
    label: string;
    value: Date;
    onChange: (date: Date) => void;
    minimumDate?: Date;
    maximumDate?: Date;
    error?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
    label,
    value,
    onChange,
    minimumDate,
    maximumDate,
    error,
}) => {
    const [showPicker, setShowPicker] = useState(false);

    const formatDate = (date: Date): string => {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    // For simplicity, we'll use a basic implementation
    // In production, you might want to use @react-native-community/datetimepicker
    const handlePress = () => {
        // For now, just show an alert with instructions
        // In a full implementation, you'd show a native date picker
        alert('Date picker functionality - In production, use @react-native-community/datetimepicker');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <TouchableOpacity
                style={[styles.input, error && styles.inputError]}
                onPress={handlePress}
            >
                <Text style={styles.dateText}>{formatDate(value)}</Text>
                <Text style={styles.icon}>📅</Text>
            </TouchableOpacity>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 8,
    },
    input: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        padding: 16,
    },
    inputError: {
        borderColor: colors.error,
    },
    dateText: {
        fontSize: 16,
        color: colors.text,
    },
    icon: {
        fontSize: 20,
    },
    errorText: {
        fontSize: 12,
        color: colors.error,
        marginTop: 4,
    },
});
