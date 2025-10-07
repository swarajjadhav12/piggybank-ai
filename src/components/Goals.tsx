import { useState, useEffect } from 'react';
import { Target, Plus, Calendar, DollarSign, TrendingUp, X, Trash2 } from 'lucide-react';
import { apiService } from '../services/api';

interface Goal {
  id: string;
  name: string;
  description: string;
  target: number;
  saved: number;
  targetDate: string;
  priority: 'low' | 'medium' | 'high';
  emoji: string;
}

const Goals = () => {
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [addAmount, setAddAmount] = useState('');
  const [addingFunds, setAddingFunds] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    target: '',
    targetDate: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const response = await apiService.getGoals();
      if (response.success) {
        setGoals(response.data as Goal[]);
      } else {
        setError('Failed to fetch goals');
      }
    } catch (err) {
      setError('Failed to fetch goals');
      console.error('Error fetching goals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async () => {
    try {
      const goalData = {
        name: formData.name,
        description: formData.description,
        target: parseFloat(formData.target),
        targetDate: formData.targetDate,
        priority: formData.priority.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH'
      };

      const response = await apiService.createGoal(goalData);
      if (response.success) {
        setShowAddGoal(false);
        setFormData({
          name: '',
          description: '',
          target: '',
          targetDate: '',
          priority: 'medium'
        });
        fetchGoals(); // Refresh the goals list
      } else {
        setError('Failed to create goal');
      }
    } catch (err) {
      setError('Failed to create goal');
      console.error('Error creating goal:', err);
    }
  };

  const handleAddToGoal = (goal: Goal) => {
    setSelectedGoal(goal);
    setAddAmount('');
    setShowAddFundsModal(true);
  };

  const handleAddFunds = async () => {
    if (!selectedGoal || !addAmount || parseFloat(addAmount) <= 0) {
      return;
    }

    try {
      setAddingFunds(true);
      const amount = parseFloat(addAmount);
      
      const response = await apiService.addToGoal(selectedGoal.id, amount);
      if (response.success) {
        // Update the goal's saved amount locally
        setGoals(prev => prev.map(goal => 
          goal.id === selectedGoal.id 
            ? { ...goal, saved: goal.saved + amount }
            : goal
        ));
        
        setShowAddFundsModal(false);
        setAddAmount('');
        setSelectedGoal(null);
      } else {
        setError('Failed to add funds to goal');
      }
    } catch (err) {
      setError('Failed to add funds to goal');
      console.error('Error adding funds to goal:', err);
    } finally {
      setAddingFunds(false);
    }
  };

  const handleDeleteGoal = (goal: Goal) => {
    setGoalToDelete(goal);
    setShowDeleteModal(true);
  };

  const confirmDeleteGoal = async () => {
    if (!goalToDelete) return;

    try {
      setDeleting(true);
      const response = await apiService.deleteGoal(goalToDelete.id);
      if (response.success) {
        // Remove the goal from the local state
        setGoals(prev => prev.filter(goal => goal.id !== goalToDelete.id));
        setShowDeleteModal(false);
        setGoalToDelete(null);
      } else {
        setError('Failed to delete goal');
      }
    } catch (err) {
      setError('Failed to delete goal');
      console.error('Error deleting goal:', err);
    } finally {
      setDeleting(false);
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'from-green-500 to-green-600';
    if (progress >= 50) return 'from-blue-500 to-blue-600';
    return 'from-orange-500 to-orange-600';
  };

  const calculateDaysLeft = (targetDate: string) => {
    const target = new Date(targetDate);
    const today = new Date();
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getQuickAmounts = (goal: Goal) => {
    const remaining = goal.target - goal.saved;
    const dailyNeed = remaining / Math.max(calculateDaysLeft(goal.targetDate), 1);
    
    return [
      { label: 'Daily Need', amount: Math.ceil(dailyNeed) },
      { label: 'Weekly', amount: Math.ceil(dailyNeed * 7) },
      { label: 'Monthly', amount: Math.ceil(dailyNeed * 30) },
      { label: 'Remaining', amount: Math.ceil(remaining) }
    ];
  };

  if (loading) {
    return (
      <div className="p-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Savings Goals</h2>
            <p className="text-gray-600">Track your financial dreams</p>
          </div>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading goals...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Savings Goals</h2>
            <p className="text-gray-600">Track your financial dreams</p>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchGoals}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Savings Goals</h2>
          <p className="text-gray-600">Track your financial dreams</p>
        </div>
        <button 
          onClick={() => setShowAddGoal(true)}
          className="p-3 bg-blue-600 rounded-xl text-white hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Goals Grid */}
      <div className="space-y-4">
        {goals.length === 0 ? (
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No goals yet</h3>
            <p className="text-gray-600 mb-4">Create your first savings goal to get started</p>
            <button 
              onClick={() => setShowAddGoal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Goal
            </button>
          </div>
        ) : (
          goals.map((goal) => {
            const progress = (goal.saved / goal.target) * 100;
            const daysLeft = calculateDaysLeft(goal.targetDate);
            const dailySavings = (goal.target - goal.saved) / Math.max(daysLeft, 1);

            return (
              <div key={goal.id} className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{goal.emoji || '🎯'}</div>
                    <div>
                      <h3 className="font-bold text-gray-900">{goal.name}</h3>
                      <p className="text-sm text-gray-600">{goal.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      goal.priority === 'high' ? 'bg-red-100 text-red-600' :
                      goal.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      {goal.priority}
                    </span>
                    <button
                      onClick={() => handleDeleteGoal(goal)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete goal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      ${goal.saved.toLocaleString()} of ${goal.target.toLocaleString()}
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {progress.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`bg-gradient-to-r ${getProgressColor(progress)} h-3 rounded-full transition-all duration-1000`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 text-gray-600 mb-1">
                      <Calendar className="w-3 h-3" />
                      <span className="text-xs">Days Left</span>
                    </div>
                    <span className="font-bold text-gray-900">{daysLeft > 0 ? daysLeft : '0'}</span>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 text-gray-600 mb-1">
                      <DollarSign className="w-3 h-3" />
                      <span className="text-xs">Daily Need</span>
                    </div>
                    <span className="font-bold text-gray-900">${dailySavings.toFixed(0)}</span>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 text-gray-600 mb-1">
                      <TrendingUp className="w-3 h-3" />
                      <span className="text-xs">Left</span>
                    </div>
                    <span className="font-bold text-gray-900">${(goal.target - goal.saved).toLocaleString()}</span>
                  </div>
                </div>

                {/* Action Button */}
                <button 
                  onClick={() => handleAddToGoal(goal)}
                  className="w-full mt-4 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-3 rounded-xl transition-colors"
                >
                  Add to Goal
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Add Goal Modal */}
      {showAddGoal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md mx-auto overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">New Goal</h3>
              <button 
                onClick={() => setShowAddGoal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Goal Name</label>
                <input 
                  type="text" 
                  placeholder="e.g., New Laptop"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <input 
                  type="text" 
                  placeholder="Brief description of your goal"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Amount</label>
                <input 
                  type="number" 
                  placeholder="1500"
                  value={formData.target}
                  onChange={(e) => setFormData({...formData, target: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Date</label>
                <input 
                  type="date" 
                  value={formData.targetDate}
                  onChange={(e) => setFormData({...formData, targetDate: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select 
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value as 'low' | 'medium' | 'high'})}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              
              <button 
                onClick={handleCreateGoal}
                disabled={!formData.name || !formData.target || !formData.targetDate}
                className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Create Goal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Funds Modal */}
      {showAddFundsModal && selectedGoal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Add to {selectedGoal.name}</h3>
              <button 
                onClick={() => setShowAddFundsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Goal Progress */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Current Progress</span>
                  <span className="text-sm font-bold text-gray-900">
                    ${selectedGoal.saved.toLocaleString()} / ${selectedGoal.target.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min((selectedGoal.saved / selectedGoal.target) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Quick Amount Buttons */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Quick Amounts</label>
                <div className="grid grid-cols-2 gap-2">
                  {getQuickAmounts(selectedGoal).map((quickAmount, index) => (
                    <button
                      key={index}
                      onClick={() => setAddAmount(quickAmount.amount.toString())}
                      className="p-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-bold">${quickAmount.amount}</div>
                      <div className="text-xs text-gray-500">{quickAmount.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Custom Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input 
                    type="number" 
                    placeholder="0.00"
                    value={addAmount}
                    onChange={(e) => setAddAmount(e.target.value)}
                    className="w-full p-3 pl-8 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button 
                  onClick={() => setShowAddFundsModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddFunds}
                  disabled={!addAmount || parseFloat(addAmount) <= 0 || addingFunds}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {addingFunds ? 'Adding...' : 'Add Funds'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && goalToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Delete Goal</h3>
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Are you sure you want to delete "{goalToDelete.name}"?
                </h4>
                <p className="text-gray-600">
                  This action cannot be undone. All progress and funds associated with this goal will be lost.
                </p>
              </div>

              <div className="bg-red-50 rounded-xl p-4">
                <div className="flex items-center space-x-2 text-red-800">
                  <div className="text-sm font-medium">Current Progress:</div>
                  <div className="text-sm">
                    ${goalToDelete.saved.toLocaleString()} of ${goalToDelete.target.toLocaleString()}
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDeleteGoal}
                  disabled={deleting}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {deleting ? 'Deleting...' : 'Delete Goal'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;