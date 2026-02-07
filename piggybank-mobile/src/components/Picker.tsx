import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal as RNModal,
    FlatList,
} from 'react-native';
import { colors } from '../constants/colors';

export interface PickerOption {
    label: string;
    value: string;
    emoji?: string;
}

interface PickerProps {
    label: string;
    value: string;
    options: PickerOption[];
    onValueChange: (value: string) => void;
    placeholder?: string;
    error?: string;
}

export const Picker: React.FC<PickerProps> = ({
    label,
    value,
    options,
    onValueChange,
    placeholder = 'Select an option',
    error,
}) => {
    const [modalVisible, setModalVisible] = useState(false);

    const selectedOption = options.find(opt => opt.value === value);
    const displayText = selectedOption
        ? `${selectedOption.emoji ? selectedOption.emoji + ' ' : ''}${selectedOption.label}`
        : placeholder;

    const handleSelect = (selectedValue: string) => {
        onValueChange(selectedValue);
        setModalVisible(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <TouchableOpacity
                style={[styles.input, error && styles.inputError]}
                onPress={() => setModalVisible(true)}
            >
                <Text style={[styles.inputText, !selectedOption && styles.placeholder]}>
                    {displayText}
                </Text>
                <Text style={styles.arrow}>▼</Text>
            </TouchableOpacity>
            {error && <Text style={styles.errorText}>{error}</Text>}

            <RNModal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setModalVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{label}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Text style={styles.closeButton}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={options}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.option,
                                        item.value === value && styles.selectedOption,
                                    ]}
                                    onPress={() => handleSelect(item.value)}
                                >
                                    <Text style={styles.optionText}>
                                        {item.emoji && `${item.emoji} `}
                                        {item.label}
                                    </Text>
                                    {item.value === value && (
                                        <Text style={styles.checkmark}>✓</Text>
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </RNModal>
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
    inputText: {
        fontSize: 16,
        color: colors.text,
        flex: 1,
    },
    placeholder: {
        color: colors.textSecondary,
    },
    arrow: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    errorText: {
        fontSize: 12,
        color: colors.error,
        marginTop: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
    },
    closeButton: {
        fontSize: 24,
        color: colors.textSecondary,
    },
    option: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    selectedOption: {
        backgroundColor: colors.primaryLight,
    },
    optionText: {
        fontSize: 16,
        color: colors.text,
    },
    checkmark: {
        fontSize: 20,
        color: colors.primary,
        fontWeight: 'bold',
    },
});
