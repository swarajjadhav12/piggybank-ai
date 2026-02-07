import React, { useState, useEffect } from 'react';
import { Brain, TrendingDown, Target, AlertCircle, Lightbulb, Star, X, CheckCircle } from 'lucide-react';
import { apiService } from '../services/api';

interface AIInsight {
  id: string;
  title: string;
  description: string;
  type: 'saving' | 'spending' | 'warning' | 'tip';
  impact: 'low' | 'medium' | 'high';
  potentialSavings?: number;
  isRead: boolean;
  createdAt: string;
}

const AIInsights = () => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [applyingTip, setApplyingTip] = useState<string | null>(null);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const response = await apiService.getInsights();
      if (response.success) {
        setInsights(response.data as AIInsight[]);
      } else {
        setError('Failed to fetch insights');
      }
    } catch (err) {
      setError('Failed to fetch insights');
      console.error('Error fetching insights:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateNewInsight = async () => {
    try {
      setGenerating(true);
      setError(null); // Clear any previous errors
      
      console.log('🔄 Generating new insights...');
      console.log('🔑 Token:', apiService.getToken() ? 'Present' : 'Missing');
      
      const response = await apiService.generateInsights();
      console.log('📡 API Response:', response);
      
      if (response.success) {
        console.log('✅ Success! Refreshing insights...');
        fetchInsights(); // Refresh the insights list
        alert('New AI insights generated successfully!');
      } else {
        const errorMsg = response.error || 'Failed to generate new insight';
        console.error('❌ API Error:', errorMsg);
        setError(errorMsg);
        alert(`Error: ${errorMsg}`);
      }
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to generate new insight';
      console.error('❌ Network Error:', err);
      setError(errorMsg);
      alert(`Error: ${errorMsg}`);
    } finally {
      setGenerating(false);
    }
  };

  const markAsRead = async (insightId: string) => {
    try {
      const response = await apiService.markInsightAsRead(insightId);
      if (response.success) {
        setInsights(prev => prev.map(insight => 
          insight.id === insightId ? { ...insight, isRead: true } : insight
        ));
      }
    } catch (err) {
      console.error('Error marking insight as read:', err);
    }
  };

  const handleMoreInfo = (insight: AIInsight) => {
    setSelectedInsight(insight);
    setShowDetailModal(true);
  };

  const handleApplyTip = async (insight: AIInsight) => {
    try {
      setApplyingTip(insight.id);
      
      // Simulate applying the tip based on insight type
      switch (insight.type) {
        case 'saving':
          // Create a saving record
          await apiService.createSaving({
            amount: insight.potentialSavings || 50,
            type: 'MANUAL',
            date: new Date().toISOString(),
          });
          break;
        case 'spending':
          // Could create a budget alert or spending limit
          console.log('Applying spending tip:', insight.title);
          break;
        case 'warning':
          // Could create a reminder or alert
          console.log('Applying warning tip:', insight.title);
          break;
        case 'tip':
          // Could create a goal or reminder
          console.log('Applying general tip:', insight.title);
          break;
      }

      // Mark insight as read after applying
      await markAsRead(insight.id);
      
      // Show success message
      setTimeout(() => {
        setApplyingTip(null);
      }, 2000);
      
    } catch (err) {
      console.error('Error applying tip:', err);
      setApplyingTip(null);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'saving': return Target;
      case 'spending': return TrendingDown;
      case 'warning': return AlertCircle;
      default: return Lightbulb;
    }
  };

  const getInsightColor = (type: string, impact: string) => {
    if (impact === 'high') {
      return type === 'warning' ? 'from-red-500 to-red-600' : 'from-green-500 to-green-600';
    }
    if (impact === 'medium') {
      return 'from-blue-500 to-blue-600';
    }
    return 'from-gray-500 to-gray-600';
  };

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'saving': return 'bg-green-50 border-green-200';
      case 'spending': return 'bg-blue-50 border-blue-200';
      case 'warning': return 'bg-red-50 border-red-200';
      default: return 'bg-purple-50 border-purple-200';
    }
  };

  const getDetailedAdvice = (insight: AIInsight) => {
    switch (insight.type) {
      case 'saving':
        return [
          'Set up automatic transfers to your savings account',
          'Use the 50/30/20 rule: 50% needs, 30% wants, 20% savings',
          'Start with small amounts and gradually increase',
          'Consider high-yield savings accounts for better returns'
        ];
      case 'spending':
        return [
          'Track all your expenses for 30 days',
          'Identify and eliminate unnecessary subscriptions',
          'Use cash or debit cards instead of credit cards',
          'Set spending limits for different categories'
        ];
      case 'warning':
        return [
          'Review your budget immediately',
          'Cut back on non-essential expenses',
          'Consider increasing your income',
          'Seek financial advice if needed'
        ];
      default:
        return [
          'Review your financial goals regularly',
          'Stay consistent with your savings plan',
          'Monitor your progress monthly',
          'Adjust your strategy as needed'
        ];
    }
  };

  if (loading) {
    return (
      <div className="p-4 space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Financial Coach</h2>
          <p className="text-gray-600">Personalized insights for smarter spending</p>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading insights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Financial Coach</h2>
          <p className="text-gray-600">Personalized insights for smarter spending</p>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchInsights}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const unreadInsights = insights.filter(insight => !insight.isRead);
  const latestInsight = insights[0]; // Most recent insight

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Brain className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Financial Coach</h2>
        <p className="text-gray-600">Personalized insights for smarter spending</p>
      </div>

      {/* Generate New Insight Button */}
      <div className="flex justify-center">
        <button 
          onClick={generateNewInsight}
          disabled={generating}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
              Generating...
            </>
          ) : (
            'Generate New Insight'
          )}
        </button>
      </div>

      {/* Quick Insights Carousel */}
      {latestInsight && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-4 border border-indigo-100">
          <div className="flex items-center space-x-2 mb-3">
            <Star className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-semibold text-indigo-800">Latest Insight</span>
            {!latestInsight.isRead && (
              <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">New</span>
            )}
          </div>
          <p className="text-sm text-indigo-700 leading-relaxed mb-3">
            {latestInsight.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-indigo-600">
              {new Date(latestInsight.createdAt).toLocaleDateString()}
            </span>
            {!latestInsight.isRead && (
              <button 
                onClick={() => markAsRead(latestInsight.id)}
                className="text-xs text-indigo-600 hover:text-indigo-800"
              >
                Mark as read
              </button>
            )}
          </div>
        </div>
      )}

      {/* AI Suggestions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Personalized Recommendations</h3>
          {unreadInsights.length > 0 && (
            <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">
              {unreadInsights.length} new
            </span>
          )}
        </div>
        
        {insights.length === 0 ? (
          <div className="text-center py-8">
            <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No insights yet</h3>
            <p className="text-gray-600 mb-4">Generate your first AI insight to get personalized recommendations</p>
            <button 
              onClick={generateNewInsight}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Generate Insight
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((suggestion) => {
              const IconComponent = getInsightIcon(suggestion.type);
              
              return (
                <div 
                  key={suggestion.id} 
                  className={`rounded-2xl p-4 border ${getBackgroundColor(suggestion.type)} hover:shadow-md transition-all duration-300 ${
                    !suggestion.isRead ? 'ring-2 ring-purple-200' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-10 h-10 bg-gradient-to-r ${getInsightColor(suggestion.type, suggestion.impact)} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{suggestion.title}</h4>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            suggestion.impact === 'high' ? 'bg-green-100 text-green-700' :
                            suggestion.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {suggestion.impact} impact
                          </span>
                          {!suggestion.isRead && (
                            <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">
                              New
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                        {suggestion.description}
                      </p>
                      
                      {suggestion.potentialSavings && (
                        <div className="bg-white/70 rounded-lg p-3 mb-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Potential Monthly Savings:</span>
                            <span className="font-bold text-green-600">${suggestion.potentialSavings}</span>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleMoreInfo(suggestion)}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            More Info
                          </button>
                          <button 
                            onClick={() => handleApplyTip(suggestion)}
                            disabled={applyingTip === suggestion.id}
                            className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                          >
                            {applyingTip === suggestion.id ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                <span>Applying...</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-3 h-3" />
                                <span>Apply Tip</span>
                              </>
                            )}
                          </button>
                        </div>
                        {!suggestion.isRead && (
                          <button 
                            onClick={() => markAsRead(suggestion.id)}
                            className="text-xs text-gray-500 hover:text-gray-700"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* AI Learning Section */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-3">How AI Learns Your Habits</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Analyzes your spending patterns across categories</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Tracks progress toward your savings goals</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span>Predicts future expenses based on your history</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span>Suggests optimal saving strategies for your lifestyle</span>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedInsight && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Detailed Advice</h3>
              <button 
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">{selectedInsight.title}</h4>
                <p className="text-gray-700 mb-3">{selectedInsight.description}</p>
              </div>
              
              {selectedInsight.potentialSavings && (
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Potential Monthly Savings:</span>
                    <span className="font-bold text-green-600">${selectedInsight.potentialSavings}</span>
                  </div>
                </div>
              )}
              
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Action Steps:</h5>
                <ul className="space-y-2">
                  {getDetailedAdvice(selectedInsight).map((advice, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-gray-700">{advice}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="flex space-x-2 pt-4">
                <button 
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
                <button 
                  onClick={() => {
                    handleApplyTip(selectedInsight);
                    setShowDetailModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Apply This Tip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIInsights;