import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import DashboardScreen from '../screens/DashboardScreen';
import GoalsScreen from '../screens/GoalsScreen';
import GoalDetailsScreen from '../screens/GoalDetailsScreen';
import ExpensesScreen from '../screens/ExpensesScreen';
import InsightsScreen from '../screens/InsightsScreen';
import PaymentsScreen from '../screens/PaymentsScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { colors } from '../constants/colors';

export type MainTabParamList = {
    Dashboard: undefined;
    Goals: undefined;
    Expenses: undefined;
    Insights: undefined;
    Payments: undefined;
    Chat: undefined;
    Profile: undefined;
};

export type GoalsStackParamList = {
    GoalsList: undefined;
    GoalDetails: { goalId: string };
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const GoalsStack = createStackNavigator<GoalsStackParamList>();

const GoalsNavigator: React.FC = () => {
    return (
        <GoalsStack.Navigator>
            <GoalsStack.Screen
                name="GoalsList"
                component={GoalsScreen}
                options={{ headerShown: false }}
            />
            <GoalsStack.Screen
                name="GoalDetails"
                component={GoalDetailsScreen}
                options={{ title: 'Goal Details' }}
            />
        </GoalsStack.Navigator>
    );
};

const MainNavigator: React.FC = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.gray400,
                tabBarStyle: {
                    paddingBottom: 8,
                    paddingTop: 8,
                    height: 60,
                },
                headerShown: false,
            }}
        >
            <Tab.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ color }) => (
                        <Text style={{ fontSize: 24 }}>🏠</Text>
                    ),
                }}
            />
            <Tab.Screen
                name="Goals"
                component={GoalsNavigator}
                options={{
                    tabBarLabel: 'Goals',
                    tabBarIcon: ({ color }) => (
                        <Text style={{ fontSize: 24 }}>🎯</Text>
                    ),
                }}
            />
            <Tab.Screen
                name="Expenses"
                component={ExpensesScreen}
                options={{
                    tabBarLabel: 'Expenses',
                    tabBarIcon: ({ color }) => (
                        <Text style={{ fontSize: 24 }}>💸</Text>
                    ),
                }}
            />
            <Tab.Screen
                name="Insights"
                component={InsightsScreen}
                options={{
                    tabBarLabel: 'Insights',
                    tabBarIcon: ({ color }) => (
                        <Text style={{ fontSize: 24 }}>💡</Text>
                    ),
                }}
            />
            <Tab.Screen
                name="Payments"
                component={PaymentsScreen}
                options={{
                    tabBarLabel: 'Wallet',
                    tabBarIcon: ({ color }) => (
                        <Text style={{ fontSize: 24 }}>💳</Text>
                    ),
                }}
            />

            <Tab.Screen
                name="Chat"
                component={ChatScreen}
                options={{
                    tabBarLabel: 'AI Chat',
                    tabBarIcon: ({ color }) => (
                        <Text style={{ fontSize: 24 }}>🤖</Text>
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarLabel: 'Profile',
                    tabBarIcon: ({ color }) => (
                        <Text style={{ fontSize: 24 }}>👤</Text>
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

export default MainNavigator;

