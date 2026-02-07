import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import apiService from '../services/api';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { colors } from '../constants/colors';

interface Message {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
}

const ChatScreen: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const [initializing, setInitializing] = useState(true);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        // Add welcome message
        const welcomeMessage: Message = {
            id: '0',
            text: 'Hello! I\'m your AI financial assistant. How can I help you today?',
            isUser: false,
            timestamp: new Date(),
        };
        setMessages([welcomeMessage]);
        setInitializing(false);
    }, []);

    useEffect(() => {
        // Auto-scroll to bottom when new messages arrive
        if (messages.length > 0 && flatListRef.current) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages]);

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputText.trim(),
            isUser: true,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setLoading(true);

        try {
            const response = await apiService.sendChatMessage(inputText.trim());

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: response.data?.response || 'I apologize, but I couldn\'t process that request.',
                isUser: false,
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to send message');

            // Add error message
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: 'Sorry, I encountered an error. Please try again.',
                isUser: false,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const renderMessage = ({ item }: { item: Message }) => (
        <View style={[
            styles.messageContainer,
            item.isUser ? styles.userMessageContainer : styles.aiMessageContainer
        ]}>
            <View style={[
                styles.messageBubble,
                item.isUser ? styles.userBubble : styles.aiBubble
            ]}>
                <Text style={[
                    styles.messageText,
                    item.isUser ? styles.userText : styles.aiText
                ]}>
                    {item.text}
                </Text>
                <Text style={[
                    styles.timestamp,
                    item.isUser ? styles.userTimestamp : styles.aiTimestamp
                ]}>
                    {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>
        </View>
    );

    if (initializing) {
        return <LoadingSpinner fullScreen message="Loading chat..." />;
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>AI Assistant</Text>
                <Text style={styles.subtitle}>Ask me anything about your finances</Text>
            </View>

            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.messagesContainer}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />

            {loading && (
                <View style={styles.typingIndicator}>
                    <Text style={styles.typingText}>AI is typing...</Text>
                </View>
            )}

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View style={styles.inputContainer}>
                    <Input
                        value={inputText}
                        onChangeText={setInputText}
                        placeholder="Type your message..."
                        multiline
                        style={styles.input}
                        onSubmitEditing={handleSend}
                    />
                    <Button
                        title="Send"
                        onPress={handleSend}
                        disabled={!inputText.trim() || loading}
                        style={styles.sendButton}
                        size="small"
                    />
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundSecondary,
    },
    header: {
        padding: 20,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    messagesContainer: {
        padding: 16,
        flexGrow: 1,
    },
    messageContainer: {
        marginBottom: 16,
        maxWidth: '80%',
    },
    userMessageContainer: {
        alignSelf: 'flex-end',
    },
    aiMessageContainer: {
        alignSelf: 'flex-start',
    },
    messageBubble: {
        padding: 12,
        borderRadius: 16,
    },
    userBubble: {
        backgroundColor: colors.primary,
        borderBottomRightRadius: 4,
    },
    aiBubble: {
        backgroundColor: colors.white,
        borderBottomLeftRadius: 4,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 22,
        marginBottom: 4,
    },
    userText: {
        color: colors.white,
    },
    aiText: {
        color: colors.text,
    },
    timestamp: {
        fontSize: 11,
    },
    userTimestamp: {
        color: colors.white,
        opacity: 0.8,
        textAlign: 'right',
    },
    aiTimestamp: {
        color: colors.textSecondary,
    },
    typingIndicator: {
        paddingHorizontal: 20,
        paddingVertical: 8,
    },
    typingText: {
        fontSize: 14,
        color: colors.textSecondary,
        fontStyle: 'italic',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        alignItems: 'flex-end',
    },
    input: {
        flex: 1,
        maxHeight: 100,
        marginRight: 8,
    },
    sendButton: {
        minWidth: 80,
    },
});

export default ChatScreen;
