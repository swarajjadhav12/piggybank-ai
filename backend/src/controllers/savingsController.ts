import { Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { SavingCreateSchema } from '../types/index.js';

export const createSaving = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const savingData = req.body;

    const saving = await prisma.saving.create({
      data: {
        ...savingData,
        userId,
        date: new Date(savingData.date),
      },
    });

    res.status(201).json({
      success: true,
      data: saving,
      message: 'Saving recorded successfully',
    });
  } catch (error) {
    console.error('Create saving error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record saving',
    });
  }
};

export const getSavings = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { 
      page = '1', 
      limit = '20', 
      type, 
      startDate, 
      endDate,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { userId };

    if (type) {
      where.type = type;
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

    const [savings, total] = await Promise.all([
      prisma.saving.findMany({
        where,
        orderBy: {
          [sortBy as string]: sortOrder as 'asc' | 'desc',
        },
        skip,
        take: limitNum,
      }),
      prisma.saving.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      data: savings,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Get savings error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get savings',
    });
  }
};

export const getSaving = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const saving = await prisma.saving.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!saving) {
      return res.status(404).json({
        success: false,
        error: 'Saving record not found',
      });
    }

    res.json({
      success: true,
      data: saving,
    });
  } catch (error) {
    console.error('Get saving error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get saving record',
    });
  }
};

export const deleteSaving = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    // Check if saving exists and belongs to user
    const existingSaving = await prisma.saving.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingSaving) {
      return res.status(404).json({
        success: false,
        error: 'Saving record not found',
      });
    }

    await prisma.saving.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Saving record deleted successfully',
    });
  } catch (error) {
    console.error('Delete saving error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete saving record',
    });
  }
};

export const getSavingsSummary = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { period = '30' } = req.query;
    const days = parseInt(period as string);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get total saved in period
    const totalSaved = await prisma.saving.aggregate({
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

    // Get savings by type
    const savingsByType = await prisma.saving.groupBy({
      by: ['type'],
      where: {
        userId,
        date: {
          gte: startDate,
        },
      },
      _sum: {
        amount: true,
      },
      _count: {
        type: true,
      },
    });

    // Get monthly trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrend = await prisma.saving.groupBy({
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
    const monthlyAverage = (totalSaved._sum.amount || 0) / (days / 30);

    const summary = {
      totalSaved: totalSaved._sum.amount || 0,
      monthlyAverage,
      savingsByType: savingsByType.map(type => ({
        type: type.type,
        amount: type._sum.amount || 0,
        count: type._count.type,
        percentage: totalSaved._sum.amount ? ((type._sum.amount || 0) / totalSaved._sum.amount) * 100 : 0,
      })),
      monthlyTrend: monthlyTrend.map(item => ({
        month: item.date.toISOString().slice(0, 7), // YYYY-MM format
        amount: item._sum.amount || 0,
      })),
    };

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error('Get savings summary error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get savings summary',
    });
  }
};

export const getSavingsAnalytics = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    // Get total savings
    const totalSavings = await prisma.saving.aggregate({
      where: { userId },
      _sum: { amount: true },
    });

    // Get goal progress
    const goals = await prisma.goal.findMany({
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
    });

    const goalProgress = goals.map(goal => ({
      goalId: goal.id,
      goalName: goal.name,
      progress: (goal.saved / goal.target) * 100,
      remaining: goal.target - goal.saved,
    }));

    // Get savings trend (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const savingsTrend = await prisma.saving.groupBy({
      by: ['date'],
      where: {
        userId,
        date: {
          gte: twelveMonthsAgo,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const analytics = {
      totalSaved: totalSavings._sum.amount || 0,
      goalProgress,
      savingsTrend: savingsTrend.map(item => ({
        month: item.date.toISOString().slice(0, 7), // YYYY-MM format
        amount: item._sum.amount || 0,
      })),
    };

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error('Get savings analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get savings analytics',
    });
  }
};
