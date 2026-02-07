import React from 'react';
import { TrendingUp, PieChart, Calendar, DollarSign } from 'lucide-react';
import { mockData } from '../data/mockData';

const Analytics = () => {
  const { recentExpenses, monthlyBudget, analytics } = mockData;
  
  // Calculate category totals
  const categoryTotals = recentExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const categories = Object.entries(categoryTotals).map(([name, amount]) => ({
    name,
    amount,
    percentage: (amount / Object.values(categoryTotals).reduce((a, b) => a + b, 0)) * 100
  })).sort((a, b) => b.amount - a.amount);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Food': 'bg-green-500',
      'Transport': 'bg-blue-500',
      'Entertainment': 'bg-purple-500',
      'Shopping': 'bg-pink-500',
      'Bills': 'bg-orange-500',
      'Other': 'bg-gray-500'
    };
    return colors[category] || 'bg-gray-500';
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'Food': '🍕',
      'Transport': '🚗',
      'Entertainment': '🎬',
      'Shopping': '🛍️',
      'Bills': '💡',
      'Other': '💳'
    };
    return icons[category] || '💳';
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Analytics</h2>
        <p className="text-gray-600">Understand your spending patterns</p>
      </div>

      {/* Monthly Overview */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex items-center space-x-2 mb-4">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-gray-900">This Month</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Spent</p>
            <p className="text-2xl font-bold text-gray-900">
              ${Object.values(categoryTotals).reduce((a, b) => a + b, 0).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Budget Remaining</p>
            <p className="text-2xl font-bold text-green-600">
              ${(monthlyBudget - Object.values(categoryTotals).reduce((a, b) => a + b, 0)).toLocaleString()}
            </p>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Budget Usage</span>
            <span className="text-sm font-medium text-gray-900">
              {((Object.values(categoryTotals).reduce((a, b) => a + b, 0) / monthlyBudget) * 100).toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${(Object.values(categoryTotals).reduce((a, b) => a + b, 0) / monthlyBudget) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex items-center space-x-2 mb-4">
          <PieChart className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold text-gray-900">Spending by Category</h3>
        </div>
        
        <div className="space-y-4">
          {categories.map((category, index) => (
            <div key={category.name} className="flex items-center space-x-3">
              <div className="flex items-center space-x-3 flex-1">
                <div className="text-lg">{getCategoryIcon(category.name)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900">{category.name}</span>
                    <span className="text-sm font-bold text-gray-900">${category.amount.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`${getCategoryColor(category.name)} h-2 rounded-full transition-all duration-1000`}
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <span className="text-xs text-gray-500 font-medium w-10 text-right">
                {category.percentage.toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Trends */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="w-5 h-5 text-green-600" />
          <h3 className="font-bold text-gray-900">Spending Trends</h3>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {analytics.trends.map((trend, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div>
                <p className="font-medium text-gray-900">{trend.category}</p>
                <p className="text-sm text-gray-600">{trend.description}</p>
              </div>
              <div className="text-right">
                <p className={`font-bold ${trend.change >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {trend.change >= 0 ? '+' : ''}{trend.change}%
                </p>
                <p className="text-xs text-gray-500">vs last month</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center space-x-2 mb-2">
            <DollarSign className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Avg Daily</span>
          </div>
          <p className="text-xl font-bold text-blue-900">
            ${(Object.values(categoryTotals).reduce((a, b) => a + b, 0) / 30).toFixed(0)}
          </p>
        </div>
        
        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">Top Category</span>
          </div>
          <p className="text-xl font-bold text-green-900">{categories[0]?.name || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;