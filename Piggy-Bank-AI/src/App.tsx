import React, { useState } from 'react';
import { Home, Target, Brain, TrendingUp, Settings, Plus, LogOut, CreditCard, MessageCircle } from 'lucide-react';
import Chatbot from './components/Chatbot';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Dashboard from './components/Dashboard';
import Goals from './components/Goals';
import AIInsights from './components/AIInsights';
import Analytics from './components/Analytics';
import Profile from './components/Profile';
import Payments from './components/Payments';
import Login from './components/Login';

type Screen = 'dashboard' | 'goals' | 'insights' | 'analytics' | 'profile' | 'payments';

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { isAuthenticated, isLoading, logout } = useAuth();

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <Dashboard />;
      case 'goals':
        return <Goals />;
      case 'insights':
        return <AIInsights />;
      case 'analytics':
        return <Analytics />;
      case 'profile':
        return <Profile />;
      case 'payments':
        return <Payments />;
      default:
        return <Dashboard />;
    }
  };

  const navigation = [
    { id: 'dashboard', icon: Home, label: 'Home', active: currentScreen === 'dashboard' },
    { id: 'goals', icon: Target, label: 'Goals', active: currentScreen === 'goals' },
    { id: 'insights', icon: Brain, label: 'AI Tips', active: currentScreen === 'insights' },
    { id: 'payments', icon: CreditCard, label: 'Payments', active: currentScreen === 'payments' },
    { id: 'analytics', icon: TrendingUp, label: 'Analytics', active: currentScreen === 'analytics' },
    { id: 'profile', icon: Settings, label: 'Profile', active: currentScreen === 'profile' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white text-2xl font-bold">🐷</span>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">🐷</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">PiggyBank AI</h1>
              <p className="text-xs text-gray-500">Smart Savings Assistant</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors">
              <Plus className="w-5 h-5 text-blue-600" />
            </button>
            <button 
              onClick={logout}
              className="p-2 bg-red-50 rounded-full hover:bg-red-100 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5 text-red-600" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto pb-20">
        {renderScreen()}
      </main>

      {/* Floating Chat Button */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-28 right-4 z-50 bg-blue-600 text-white rounded-full shadow-lg p-4 hover:bg-blue-700 active:scale-95 transition"
        aria-label="Open chat"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Chat Panel */}
      {isChatOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setIsChatOpen(false)} />
          <div className="relative w-full max-w-md mx-auto h-[70vh] bg-white rounded-t-xl shadow-2xl flex flex-col mb-16">
            <div className="flex items-center justify-between p-3 border-b">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">🤖</span>
                </div>
                <div>
                  <div className="text-sm font-semibold">PiggyBank Chat</div>
                  <div className="text-xs text-gray-500">Ask about payments, balances, goals…</div>
                </div>
              </div>
              <button className="text-sm text-gray-600 hover:text-gray-900" onClick={() => setIsChatOpen(false)}>Close</button>
            </div>
            <div className="flex-1 p-2">
              <div className="h-full">
                <Chatbot />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="max-w-md mx-auto flex">
          {navigation.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentScreen(item.id as Screen)}
                className={`flex-1 py-2 px-1 flex flex-col items-center justify-center space-y-1 transition-colors ${
                  item.active
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <IconComponent className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
                {item.active && (
                  <div className="w-4 h-0.5 bg-blue-600 rounded-full absolute bottom-0"></div>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;