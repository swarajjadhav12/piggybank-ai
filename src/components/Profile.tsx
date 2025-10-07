import React from 'react';
import { User, CreditCard, Bell, Shield, HelpCircle, LogOut, ChevronRight } from 'lucide-react';

const Profile = () => {
  const menuItems = [
    {
      icon: CreditCard,
      title: 'Connected Accounts',
      subtitle: '2 accounts linked',
      color: 'text-blue-600 bg-blue-50'
    },
    {
      icon: Bell,
      title: 'Notifications',
      subtitle: 'Manage your alerts',
      color: 'text-green-600 bg-green-50'
    },
    {
      icon: Shield,
      title: 'Security & Privacy',
      subtitle: 'Manage your data',
      color: 'text-purple-600 bg-purple-50'
    },
    {
      icon: HelpCircle,
      title: 'Help & Support',
      subtitle: 'Get assistance',
      color: 'text-orange-600 bg-orange-50'
    }
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Sarah Johnson</h2>
            <p className="text-blue-100">sarah.j@email.com</p>
            <p className="text-blue-100 text-sm">Member since March 2024</p>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">5</p>
              <p className="text-blue-100 text-xs">Active Goals</p>
            </div>
            <div>
              <p className="text-2xl font-bold">$2.5K</p>
              <p className="text-blue-100 text-xs">Saved This Year</p>
            </div>
            <div>
              <p className="text-2xl font-bold">92%</p>
              <p className="text-blue-100 text-xs">Success Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Account Status */}
      <div className="bg-white rounded-xl p-4 border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Account Status</h3>
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
            Premium
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-3">
          You're on the Premium plan with unlimited AI insights and advanced analytics.
        </p>
        <div className="flex space-x-3">
          <button className="flex-1 bg-gray-100 text-gray-700 font-medium py-2 rounded-lg hover:bg-gray-200 transition-colors">
            Manage Plan
          </button>
          <button className="flex-1 bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Upgrade
          </button>
        </div>
      </div>

      {/* Menu Items */}
      <div className="space-y-2">
        {menuItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <button
              key={index}
              className="w-full bg-white p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-medium text-gray-900">{item.title}</h4>
                  <p className="text-sm text-gray-600">{item.subtitle}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Bank Connection Status */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-semibold text-green-800">Bank Connection Status</span>
        </div>
        <p className="text-sm text-green-700 mb-3">
          Your accounts are securely connected and syncing properly.
        </p>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-green-700">Chase Checking</span>
            <span className="text-green-600 font-medium">Connected</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-green-700">Wells Fargo Savings</span>
            <span className="text-green-600 font-medium">Connected</span>
          </div>
        </div>
        <button className="w-full mt-3 bg-green-100 hover:bg-green-200 text-green-800 font-medium py-2 rounded-lg transition-colors">
          + Connect Another Account
        </button>
      </div>

      {/* Logout */}
      <button className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-medium py-3 rounded-xl transition-colors flex items-center justify-center space-x-2">
        <LogOut className="w-4 h-4" />
        <span>Sign Out</span>
      </button>

      {/* App Version */}
      <div className="text-center text-xs text-gray-500 pb-4">
        PiggyBank AI v2.1.0 • Made with ❤️ for smarter saving
      </div>
    </div>
  );
};

export default Profile;