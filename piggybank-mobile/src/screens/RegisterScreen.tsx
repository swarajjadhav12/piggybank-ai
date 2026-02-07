import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    TouchableOpacity,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../navigation/AuthNavigator';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { colors } from '../constants/colors';

type RegisterScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Register'>;

interface Props {
    navigation: RegisterScreenNavigationProp;
}

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const updateField = (field: string, value: string) => {
        setFormData({ ...formData, [field]: value });
        if (errors[field]) {
            const newErrors = { ...errors };
            delete newErrors[field];
            setErrors(newErrors);
        }
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        }

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async () => {
        if (!validate()) return;

        setLoading(true);
        try {
            await register({
                email: formData.email,
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName,
            });
            // Navigation will happen automatically via AuthContext
        } catch (error: any) {
            Alert.alert('Registration Failed', error.message || 'Please try again');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.header}>
                        <Text style={styles.emoji}>🐷</Text>
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>Start your savings journey</Text>
                    </View>

                    <View style={styles.form}>
                        <Input
                            label="First Name"
                            value={formData.firstName}
                            onChangeText={(text) => updateField('firstName', text)}
                            placeholder="Enter your first name"
                            error={errors.firstName}
                        />

                        <Input
                            label="Last Name (Optional)"
                            value={formData.lastName}
                            onChangeText={(text) => updateField('lastName', text)}
                            placeholder="Enter your last name"
                        />

                        <Input
                            label="Email"
                            value={formData.email}
                            onChangeText={(text) => updateField('email', text)}
                            placeholder="Enter your email"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            error={errors.email}
                        />

                        <Input
                            label="Password"
                            value={formData.password}
                            onChangeText={(text) => updateField('password', text)}
                            placeholder="Create a password"
                            secureTextEntry
                            error={errors.password}
                        />

                        <Input
                            label="Confirm Password"
                            value={formData.confirmPassword}
                            onChangeText={(text) => updateField('confirmPassword', text)}
                            placeholder="Confirm your password"
                            secureTextEntry
                            error={errors.confirmPassword}
                        />

                        <Button
                            title="Create Account"
                            onPress={handleRegister}
                            loading={loading}
                            style={styles.registerButton}
                        />

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Already have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.linkText}>Login</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingVertical: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    emoji: {
        fontSize: 60,
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: colors.textSecondary,
    },
    form: {
        flex: 1,
    },
    registerButton: {
        marginTop: 8,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    footerText: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    linkText: {
        fontSize: 14,
        color: colors.primary,
        fontWeight: '600',
    },
});

export default RegisterScreen;
