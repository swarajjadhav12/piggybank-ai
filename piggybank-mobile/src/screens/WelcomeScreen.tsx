import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../navigation/AuthNavigator';
import { Button } from '../components/Button';
import { colors } from '../constants/colors';
import { LinearGradient } from 'expo-linear-gradient';

type WelcomeScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Welcome'>;

interface Props {
    navigation: WelcomeScreenNavigationProp;
}

const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
    return (
        <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            style={styles.container}
        >
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.emoji}>🐷</Text>
                        <Text style={styles.title}>PiggyBank AI</Text>
                        <Text style={styles.subtitle}>
                            Your Smart Savings Assistant
                        </Text>
                        <Text style={styles.description}>
                            Track expenses, set goals, and get AI-powered insights to save smarter
                        </Text>
                    </View>

                    <View style={styles.buttonContainer}>
                        <Button
                            title="Get Started"
                            onPress={() => navigation.navigate('Register')}
                            variant="primary"
                            size="large"
                            style={styles.primaryButton}
                        />
                        <Button
                            title="I Already Have an Account"
                            onPress={() => navigation.navigate('Login')}
                            variant="outline"
                            size="large"
                            style={styles.outlineButton}
                            textStyle={styles.outlineButtonText}
                        />
                    </View>
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingVertical: 40,
    },
    header: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emoji: {
        fontSize: 80,
        marginBottom: 20,
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: colors.white,
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 20,
        color: colors.white,
        marginBottom: 16,
        textAlign: 'center',
        opacity: 0.9,
    },
    description: {
        fontSize: 16,
        color: colors.white,
        textAlign: 'center',
        opacity: 0.8,
        paddingHorizontal: 20,
        lineHeight: 24,
    },
    buttonContainer: {
        // gap removed - not supported in React Native
    },
    primaryButton: {
        backgroundColor: colors.white,
        marginBottom: 16,
    },
    outlineButton: {
        borderColor: colors.white,
    },
    outlineButtonText: {
        color: colors.white,
    },
});

export default WelcomeScreen;
