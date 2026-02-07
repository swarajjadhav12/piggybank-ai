import { Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { ExpenseCreateSchema, ExpenseUpdateSchema } from '../types/index.js';

export const createExpense = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const expenseData = req.body;

    const expense = await prisma.expense.create({
      data: {
        ...expenseData,
        userId,
        date: new Date(expenseData.date),
      },
    });

    res.status(201).json({
      success: true,
      data: expense,
      message: 'Expense created successfully',
    });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create expense',
    });
  }
};

export const getExpenses = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { 
      page = '1', 
      limit = '20', 
      category, 
      startDate, 
      endDate,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { userId };

    if (category) {
      where.category = category;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.date.lte = new Date(endDate as string);
      }
    }

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        orderBy: {
          [sortBy as string]: sortOrder as 'asc' | 'desc',
        },
        skip,
        take: limitNum,
      }),
      prisma.expense.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      data: expenses,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get expenses',
    });
  }
};

export const getExpense = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const expense = await prisma.expense.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        error: 'Expense not found',
      });
    }

    res.json({
      success: true,
      data: expense,
    });
  } catch (error) {
    console.error('Get expense error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get expense',
    });
  }
};

export const updateExpense = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const updateData = req.body;

    // Check if expense exists and belongs to user
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingExpense) {
      return res.status(404).json({
        success: false,
        error: 'Expense not found',
      });
    }

    // Prepare update data
    const dataToUpdate: any = { ...updateData };
    if (updateData.date) {
      dataToUpdate.date = new Date(updateData.date);
    }

    const updatedExpense = await prisma.expense.update({
      where: { id },
      data: dataToUpdate,
    });

    res.json({
      success: true,
      data: updatedExpense,
      message: 'Expense updated successfully',
    });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update expense',
    });
  }
};

export const deleteExpense = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    // Check if expense exists and belongs to user
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingExpense) {
      return res.status(404).json({
        success: false,
        error: 'Expense not found',
      });
    }

    await prisma.expense.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Expense deleted successfully',
    });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete expense',
    });
  }
};

export const getExpenseCategories = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const categories = await prisma.expense.groupBy({
      by: ['category'],
      where: { userId },
      _count: {
        category: true,
      },
      _sum: {
        amount: true,
      },
      orderBy: {
        _sum: {
          amount: 'desc',
        },
      },
    });

    const categoryStats = categories.map(cat => ({
      category: cat.category,
      count: cat._count.category,
      totalAmount: cat._sum.amount || 0,
    }));

    res.json({
      success: true,
      data: categoryStats,
    });
  } catch (error) {
    console.error('Get expense categories error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get expense categories',
    });
  }
};

export const getRecentExpenses = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { limit = '10' } = req.query;
    const limitNum = parseInt(limit as string);

    const expenses = await prisma.expense.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: limitNum,
    });

    res.json({
      success: true,
      data: expenses,
    });
  } catch (error) {
    console.error('Get recent expenses error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get recent expenses',
    });
  }
};

export const getExpenseAnalytics = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { period = '30' } = req.query;
    const days = parseInt(period as string);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get total spent in period
    const totalSpent = await prisma.expense.aggregate({
      where: {
        userId,
        date: {
          gte: startDate,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Get category breakdown
    const categoryBreakdown = await prisma.expense.groupBy({
      by: ['category'],
      where: {
        userId,
        date: {
          gte: startDate,
        },
      },
      _sum: {
        amount: true,
      },
      orderBy: {
        _sum: {
          amount: 'desc',
        },
      },
    });

    // Get monthly trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrend = await prisma.expense.groupBy({
      by: ['date'],
      where: {
        userId,
        date: {
          gte: sixMonthsAgo,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Calculate monthly average
    const monthlyAverage = (totalSpent._sum.amount || 0) / (days / 30);

    const analytics = {
      totalSpent: totalSpent._sum.amount || 0,
      monthlyAverage,
      categoryBreakdown: categoryBreakdown.map(cat => ({
        category: cat.category,
        amount: cat._sum.amount || 0,
        percentage: totalSpent._sum.amount ? ((cat._sum.amount || 0) / totalSpent._sum.amount) * 100 : 0,
      })),
      monthlyTrend: monthlyTrend.map(item => ({
        month: item.date.toISOString().slice(0, 7), // YYYY-MM format
        amount: item._sum.amount || 0,
      })),
    };

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error('Get expense analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get expense analytics',
    });
  }
};
