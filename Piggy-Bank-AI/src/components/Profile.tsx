import React, { useState, useEffect } from 'react';
import { User, CreditCard, Bell, Shield, HelpCircle, LogOut, ChevronRight, Edit2, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';

const Profile = () => {
  const { user, logout, updateProfile } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');

  // Dashboard data state
  const [activeGoalsCount, setActiveGoalsCount] = useState(0);
  const [yearlySavings, setYearlySavings] = useState(0);
  const [successRate, setSuccessRate] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await apiService.getDashboardData();
        if (response.success && response.data) {
          const { goals, savings } = response.data;

          // Set active goals count
          setActiveGoalsCount(goals?.length || 0);

          // Set yearly savings
          setYearlySavings(savings?.yearlyGrowth || 0);

          // Calculate success rate (percentage of goals with >80% progress)
          if (goals && goals.length > 0) {
            const successfulGoals = goals.filter((goal: any) => goal.progress >= 80).length;
            const rate = Math.round((successfulGoals / goals.length) * 100);
            setSuccessRate(rate);
          } else {
            setSuccessRate(0);
          }
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format currency helper
  const formatCurrency = (amount: number): string => {
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount.toFixed(0)}`;
  };

  // Handle menu item clicks
  const handleMenuItemClick = (title: string) => {
    alert(`${title} - Coming Soon!\n\nThis feature is currently under development and will be available in a future update.`);
  };

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

  const handleLogout = () => {
    logout();
  };

  const handleEditProfile = () => {
    setFirstName(user?.firstName || '');
    setLastName(user?.lastName || '');
    setUpdateError('');
    setIsEditModalOpen(true);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateError('');
    setIsUpdating(true);

    try {
      await updateProfile({ firstName, lastName });
      setIsEditModalOpen(false);
    } catch (error: any) {
      setUpdateError(error.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  // Get display name
  const getDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user?.firstName) {
      return user.firstName;
    } else if (user?.lastName) {
      return user.lastName;
    }
    return user?.email || 'User';
  };

  // Format member since date
  const getMemberSince = () => {
    if (!user?.createdAt) return 'Recently';
    const date = new Date(user.createdAt);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="p-4 space-y-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{getDisplayName()}</h2>
              <p className="text-blue-100">{user?.email}</p>
              <p className="text-blue-100 text-sm">Member since {getMemberSince()}</p>
            </div>
          </div>
          <button
            onClick={handleEditProfile}
            className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
            title="Edit Profile"
          >
            <Edit2 className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">
                {isLoading ? '...' : activeGoalsCount}
              </p>
              <p className="text-blue-100 text-xs">Active Goals</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {isLoading ? '...' : formatCurrency(yearlySavings)}
              </p>
              <p className="text-blue-100 text-xs">Saved This Year</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {isLoading ? '...' : `${successRate}%`}
              </p>
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
          <button
            onClick={() => handleMenuItemClick('Manage Plan')}
            className="flex-1 bg-gray-100 text-gray-700 font-medium py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Manage Plan
          </button>
          <button
            onClick={() => handleMenuItemClick('Upgrade')}
            className="flex-1 bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
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
              onClick={() => handleMenuItemClick(item.title)}
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
        <button
          onClick={() => handleMenuItemClick('Connect Another Account')}
          className="w-full mt-3 bg-green-100 hover:bg-green-200 text-green-800 font-medium py-2 rounded-lg transition-colors"
        >
          + Connect Another Account
        </button>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-medium py-3 rounded-xl transition-colors flex items-center justify-center space-x-2"
      >
        <LogOut className="w-4 h-4" />
        <span>Sign Out</span>
      </button>

      {/* App Version */}
      <div className="text-center text-xs text-gray-500 pb-4">
        PiggyBank AI v2.1.0 • Made with ❤️ for smarter saving
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Edit Profile</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              {updateError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {updateError}
                </div>
              )}

              <div>
                <label htmlFor="editFirstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  id="editFirstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your first name"
                />
              </div>

              <div>
                <label htmlFor="editLastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  id="editLastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your last name"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;