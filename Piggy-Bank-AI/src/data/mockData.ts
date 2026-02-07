export const mockData = {
  savings: {
    total: 3247,
    monthlyGrowth: 245,
    yearlyGrowth: 2100
  },
  
  monthlyBudget: 2500,
  
  recentExpenses: [
    { id: 1, description: 'Grocery Store', amount: 87, category: 'Food', date: 'Today' },
    { id: 2, description: 'Gas Station', amount: 45, category: 'Transport', date: 'Yesterday' },
    { id: 3, description: 'Netflix Subscription', amount: 15, category: 'Entertainment', date: '2 days ago' },
    { id: 4, description: 'Coffee Shop', amount: 12, category: 'Food', date: '2 days ago' },
    { id: 5, description: 'Amazon Purchase', amount: 156, category: 'Shopping', date: '3 days ago' },
    { id: 6, description: 'Uber Ride', amount: 23, category: 'Transport', date: '4 days ago' },
    { id: 7, description: 'Restaurant', amount: 78, category: 'Food', date: '5 days ago' },
    { id: 8, description: 'Movie Tickets', amount: 32, category: 'Entertainment', date: '6 days ago' }
  ],

  goals: [
    {
      id: 1,
      name: 'Emergency Fund',
      description: 'Build a safety net for unexpected expenses',
      target: 5000,
      saved: 3247,
      targetDate: '2024-12-31',
      priority: 'high' as const,
      emoji: '🛡️'
    },
    {
      id: 2,
      name: 'New Laptop',
      description: 'MacBook Pro for work and creativity',
      target: 2500,
      saved: 1200,
      targetDate: '2024-08-15',
      priority: 'medium' as const,
      emoji: '💻'
    },
    {
      id: 3,
      name: 'Summer Vacation',
      description: 'Trip to Europe with friends',
      target: 3500,
      saved: 890,
      targetDate: '2024-07-01',
      priority: 'medium' as const,
      emoji: '✈️'
    },
    {
      id: 4,
      name: 'Car Down Payment',
      description: 'Save for a reliable used car',
      target: 8000,
      saved: 2100,
      targetDate: '2025-03-01',
      priority: 'high' as const,
      emoji: '🚗'
    },
    {
      id: 5,
      name: 'Home Office Setup',
      description: 'Desk, chair, and equipment for productivity',
      target: 1200,
      saved: 450,
      targetDate: '2024-09-30',
      priority: 'low' as const,
      emoji: '🏠'
    }
  ],

  quickInsights: [
    "You've been spending 23% less on dining out this month compared to last month. Keep it up!",
    "Based on your patterns, you could save an extra $127 monthly by meal prepping twice a week.",
    "Your entertainment spending is trending upward. Consider setting a weekly limit of $50 to stay on track.",
    "Great job! You're on pace to reach your Emergency Fund goal 2 months earlier than planned."
  ],

  aiSuggestions: [
    {
      id: 1,
      type: 'saving',
      title: 'Automate Your Savings',
      description: 'Set up automatic transfers of $50 every Friday to boost your Emergency Fund. This small weekly habit could add $2,600 annually to your savings.',
      potentialSavings: 50,
      impact: 'high' as const
    },
    {
      id: 2,
      type: 'spending',
      title: 'Optimize Subscription Services',
      description: 'You have 4 active subscriptions totaling $67/month. Consider canceling Netflix (since you also have Disney+) to save money for your laptop fund.',
      potentialSavings: 15,
      impact: 'medium' as const
    },
    {
      id: 3,
      type: 'warning',
      title: 'Food Spending Alert',
      description: 'Your food expenses are 31% higher than usual this month. Try meal prepping on Sundays to reduce restaurant visits during busy weekdays.',
      potentialSavings: 120,
      impact: 'high' as const
    },
    {
      id: 4,
      type: 'goal',
      title: 'Accelerate Laptop Fund',
      description: 'You\'re $1,300 away from your laptop goal. By reducing entertainment spending by $30/week, you could reach it 6 weeks earlier.',
      potentialSavings: 30,
      impact: 'medium' as const
    },
    {
      id: 5,
      type: 'saving',
      title: 'Round-Up Savings',
      description: 'Enable round-up savings on purchases. Based on your spending, this could add an extra $23 monthly to your goals automatically.',
      potentialSavings: 23,
      impact: 'low' as const
    }
  ],

  analytics: {
    trends: [
      {
        category: 'Food & Dining',
        change: -23,
        description: 'Spending decreased vs last month'
      },
      {
        category: 'Transportation',
        change: 12,
        description: 'Slightly higher gas costs'
      },
      {
        category: 'Entertainment',
        change: 35,
        description: 'More activities this month'
      },
      {
        category: 'Shopping',
        change: -8,
        description: 'Reduced impulse purchases'
      }
    ]
  }
};