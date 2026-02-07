import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, Zap } from 'lucide-react';
import apiService from '../services/api';

interface DashboardData {
  savings: {
    total: number;
    monthlyGrowth: number;
    yearlyGrowth: number;
  };
  monthlyBudget: number;
  recentExpenses: Array<{
    id: string;
    description: string;
    amount: number;
    category: string;
    date: string;
  }>;
  quickInsights: string[];
}

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await apiService.getDashboardData();
        if (response.success && response.data) {
          setDashboardData(response.data);
        } else {
          setError(response.error || 'Failed to load dashboard data');
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-4 space-y-6">
        <div className="animate-pulse">
          <div className="bg-gray-200 rounded-2xl h-32 mb-6"></div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-200 rounded-xl h-24"></div>
            <div className="bg-gray-200 rounded-xl h-24"></div>
          </div>
          <div className="bg-gray-200 rounded-xl h-20 mb-6"></div>
          <div className="bg-gray-200 rounded-xl h-48"></div>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error || 'Failed to load dashboard data'}
        </div>
      </div>
    );
  }

  const { savings, recentExpenses, quickInsights, monthlyBudget } = dashboardData;
  
  const totalExpenses = recentExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remainingBudget = monthlyBudget - totalExpenses;
  const spendingRate = (totalExpenses / monthlyBudget) * 100;

  return (
    <div className="p-4 space-y-6">
      {/* Savings Overview */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-blue-100 text-sm font-medium">Total Savings</p>
            <h2 className="text-3xl font-bold">${savings.total.toLocaleString()}</h2>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-2xl">🐷</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">+${savings.monthlyGrowth} this month</span>
          </div>
        </div>
        
        <div className="mt-4 bg-white/20 rounded-full h-2">
          <div 
            className="bg-white rounded-full h-2 transition-all duration-1000"
            style={{ width: `${(savings.total / 10000) * 100}%` }}
          ></div>
        </div>
        <p className="text-xs text-blue-100 mt-2">Goal: $10,000 Emergency Fund</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center space-x-2 mb-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-gray-600">This Month</span>
          </div>
          <p className="text-xl font-bold text-gray-900">${totalExpenses.toLocaleString()}</p>
          <p className="text-xs text-gray-500">of ${monthlyBudget.toLocaleString()} budget</p>
        </div>
        
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingDown className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-medium text-gray-600">Remaining</span>
          </div>
          <p className="text-xl font-bold text-gray-900">${remainingBudget.toLocaleString()}</p>
          <p className={`text-xs ${spendingRate > 80 ? 'text-red-500' : 'text-green-500'}`}>
            {spendingRate.toFixed(0)}% used
          </p>
        </div>
      </div>

      {/* AI Quick Insight */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-100">
        <div className="flex items-center space-x-2 mb-2">
          <Zap className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-semibold text-purple-800">AI Quick Tip</span>
        </div>
        <p className="text-sm text-purple-700">
          {quickInsights[0]}
        </p>
      </div>

      {/* Spending Alert */}
      {spendingRate > 75 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-semibold text-orange-800">Spending Alert</span>
          </div>
          <p className="text-sm text-orange-700">
            You've used {spendingRate.toFixed(0)}% of your monthly budget. Consider reviewing your recent expenses.
          </p>
        </div>
      )}

      {/* Recent Expenses */}
      <div className="bg-white rounded-xl p-4 border border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-4">Recent Expenses</h3>
        <div className="space-y-3">
          {recentExpenses.slice(0, 5).map((expense) => (
            <div key={expense.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                  expense.category === 'Food' ? 'bg-green-100 text-green-600' :
                  expense.category === 'Transport' ? 'bg-blue-100 text-blue-600' :
                  expense.category === 'Entertainment' ? 'bg-purple-100 text-purple-600' :
                  expense.category === 'Shopping' ? 'bg-pink-100 text-pink-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {expense.category === 'Food' ? '🍕' :
                   expense.category === 'Transport' ? '🚗' :
                   expense.category === 'Entertainment' ? '🎬' :
                   expense.category === 'Shopping' ? '🛍️' : '💳'}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{expense.description}</p>
                  <p className="text-xs text-gray-500">{expense.date}</p>
                </div>
              </div>
              <span className="font-semibold text-gray-900">-${expense.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;