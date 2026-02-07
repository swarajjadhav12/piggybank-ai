import { Request, Response } from 'express';
import { prisma } from '../config/database.js';

export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    // Get all data in parallel for better performance
    const [
      totalSavings,
      recentExpenses,
      goals,
      insights,
      monthlyExpenses,
      yearlyExpenses,
      monthlySavings,
      yearlySavings
    ] = await Promise.all([
      // Total savings
      prisma.saving.aggregate({
        where: { userId },
        _sum: { amount: true },
      }),
      
      // Recent expenses (last 8)
      prisma.expense.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        take: 8,
      }),
      
      // Active goals
      prisma.goal.findMany({
        where: { userId, isActive: true },
        orderBy: [
          { priority: 'desc' },
          { targetDate: 'asc' },
        ],
        take: 5,
      }),
      
      // Recent AI insights
      prisma.aIInsight.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      
      // Monthly expenses (current month)
      prisma.expense.aggregate({
        where: {
          userId,
          date: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
        _sum: { amount: true },
      }),
      
      // Yearly expenses (current year)
      prisma.expense.aggregate({
        where: {
          userId,
          date: {
            gte: new Date(new Date().getFullYear(), 0, 1),
          },
        },
        _sum: { amount: true },
      }),
      
      // Monthly savings (current month)
      prisma.saving.aggregate({
        where: {
          userId,
          date: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
        _sum: { amount: true },
      }),
      
      // Yearly savings (current year)
      prisma.saving.aggregate({
        where: {
          userId,
          date: {
            gte: new Date(new Date().getFullYear(), 0, 1),
          },
        },
        _sum: { amount: true },
      }),
    ]);

    // Calculate savings data
    const totalSaved = totalSavings._sum.amount || 0;
    const monthlyGrowth = monthlySavings._sum.amount || 0;
    const yearlyGrowth = yearlySavings._sum.amount || 0;

    // Calculate monthly budget (estimated based on expenses)
    const monthlyExpenseTotal = monthlyExpenses._sum.amount || 0;
    const monthlyBudget = Math.max(monthlyExpenseTotal * 1.2, 2500); // 20% buffer or minimum $2500

    // Format recent expenses
    const formattedExpenses = recentExpenses.map(expense => ({
      id: expense.id,
      description: expense.description,
      amount: expense.amount,
      category: expense.category,
      date: formatRelativeDate(expense.date),
    }));

    // Format goals with progress
    const formattedGoals = goals.map(goal => ({
      id: goal.id,
      name: goal.name,
      description: goal.description,
      target: goal.target,
      saved: goal.saved,
      targetDate: goal.targetDate.toISOString().split('T')[0],
      priority: goal.priority,
      emoji: goal.emoji,
      progress: (goal.saved / goal.target) * 100,
    }));

    // Generate quick insights
    const quickInsights = generateQuickInsights(
      totalSaved,
      monthlyGrowth,
      yearlyGrowth,
      monthlyExpenseTotal,
      goals
    );

    // Format AI suggestions
    const aiSuggestions = insights.map(insight => ({
      id: insight.id,
      type: insight.type,
      title: insight.title,
      description: insight.description,
      potentialSavings: insight.potentialSavings || 0,
      impact: insight.impact,
    }));

    const dashboardData = {
      savings: {
        total: totalSaved,
        monthlyGrowth,
        yearlyGrowth,
      },
      monthlyBudget,
      recentExpenses: formattedExpenses,
      goals: formattedGoals,
      quickInsights,
      aiSuggestions,
    };

    res.json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error('Get dashboard data error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get dashboard data',
    });
  }
};

export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { period = '30' } = req.query;
    const days = parseInt(period as string);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get spending analytics
    const [expenseAnalytics, savingsAnalytics] = await Promise.all([
      getSpendingAnalytics(userId, startDate),
      getSavingsAnalytics(userId, startDate),
    ]);

    res.json({
      success: true,
      data: {
        spending: expenseAnalytics,
        savings: savingsAnalytics,
      },
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get analytics',
    });
  }
};

// Helper functions
function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

function generateQuickInsights(
  totalSaved: number,
  monthlyGrowth: number,
  yearlyGrowth: number,
  monthlyExpenses: number,
  goals: any[]
): string[] {
  const insights = [];

  // Savings insights
  if (monthlyGrowth > 500) {
    insights.push("Great job! You've been saving consistently this month. Keep up the momentum!");
  } else if (monthlyGrowth < 200) {
    insights.push("Consider increasing your monthly savings to reach your goals faster.");
  }

  // Goal insights
  const activeGoals = goals.filter(goal => goal.isActive);
  const onTrackGoals = activeGoals.filter(goal => {
    const progress = (goal.saved / goal.target) * 100;
    const daysRemaining = Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    const requiredDaily = (goal.target - goal.saved) / daysRemaining;
    return requiredDaily <= 50; // If they need to save less than $50/day, they're on track
  });

  if (onTrackGoals.length === activeGoals.length && activeGoals.length > 0) {
    insights.push("Excellent! You're on track to reach all your savings goals.");
  } else if (activeGoals.length > 0) {
    insights.push(`You're making progress on ${onTrackGoals.length} out of ${activeGoals.length} goals.`);
  }

  // Spending insights
  if (monthlyExpenses < 2000) {
    insights.push("Your spending is well-controlled this month. Great budgeting!");
  } else if (monthlyExpenses > 4000) {
    insights.push("Your monthly spending is high. Consider reviewing your expenses.");
  }

  // Total savings milestone
  if (totalSaved > 10000) {
    insights.push("Congratulations! You've reached a major savings milestone of $10,000!");
  } else if (totalSaved > 5000) {
    insights.push("You're halfway to $10,000 in savings. Keep going!");
  }

  return insights.slice(0, 4); // Return max 4 insights
}

async function getSpendingAnalytics(userId: string, startDate: Date) {
  const [totalSpent, categoryBreakdown, monthlyTrend] = await Promise.all([
    prisma.expense.aggregate({
      where: {
        userId,
        date: { gte: startDate },
      },
      _sum: { amount: true },
    }),
    
    prisma.expense.groupBy({
      by: ['category'],
      where: {
        userId,
        date: { gte: startDate },
      },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
    }),
    
    prisma.expense.groupBy({
      by: ['date'],
      where: {
        userId,
        date: { gte: startDate },
      },
      _sum: { amount: true },
    }),
  ]);

  const totalAmount = totalSpent._sum.amount || 0;
  const monthlyAverage = totalAmount / 30;

  return {
    totalSpent: totalAmount,
    monthlyAverage,
    categoryBreakdown: categoryBreakdown.map(cat => ({
      category: cat.category,
      amount: cat._sum.amount || 0,
      percentage: totalAmount ? ((cat._sum.amount || 0) / totalAmount) * 100 : 0,
    })),
    monthlyTrend: monthlyTrend.map(item => ({
      month: item.date.toISOString().slice(0, 7),
      amount: item._sum.amount || 0,
    })),
  };
}

async function getSavingsAnalytics(userId: string, startDate: Date) {
  const [totalSaved, goalProgress, monthlyTrend] = await Promise.all([
    prisma.saving.aggregate({
      where: {
        userId,
        date: { gte: startDate },
      },
      _sum: { amount: true },
    }),
    
    prisma.goal.findMany({
      where: {
        userId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        target: true,
        saved: true,
      },
    }),
    
    prisma.saving.groupBy({
      by: ['date'],
      where: {
        userId,
        date: { gte: startDate },
      },
      _sum: { amount: true },
    }),
  ]);

  const totalAmount = totalSaved._sum.amount || 0;
  const monthlyAverage = totalAmount / 30;

  return {
    totalSaved: totalAmount,
    monthlyAverage,
    goalProgress: goalProgress.map(goal => ({
      goalId: goal.id,
      goalName: goal.name,
      progress: (goal.saved / goal.target) * 100,
      remaining: goal.target - goal.saved,
    })),
    monthlyTrend: monthlyTrend.map(item => ({
      month: item.date.toISOString().slice(0, 7),
      amount: item._sum.amount || 0,
    })),
  };
}
