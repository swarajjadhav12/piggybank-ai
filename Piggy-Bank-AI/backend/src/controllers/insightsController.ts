import { Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { aiService } from '../services/aiService.js';
import { InsightCreateSchema, InsightUpdateSchema } from '../types/index.js';

export const createInsight = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const insightData = req.body;

    const insight = await prisma.aIInsight.create({
      data: {
        ...insightData,
        userId,
      },
    });

    res.status(201).json({
      success: true,
      data: insight,
      message: 'Insight created successfully',
    });
  } catch (error) {
    console.error('Create insight error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create insight',
    });
  }
};

export const getInsights = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const {
      page = '1',
      limit = '20',
      type,
      isRead,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { userId };

    if (type) {
      where.type = type;
    }

    if (isRead !== undefined) {
      where.isRead = isRead === 'true';
    }

    const [insights, total] = await Promise.all([
      prisma.aIInsight.findMany({
        where,
        orderBy: {
          [sortBy as string]: sortOrder as 'asc' | 'desc',
        },
        skip,
        take: limitNum,
      }),
      prisma.aIInsight.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      data: insights,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Get insights error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get insights',
    });
  }
};

export const getInsight = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const insight = await prisma.aIInsight.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!insight) {
      return res.status(404).json({
        success: false,
        error: 'Insight not found',
      });
    }

    res.json({
      success: true,
      data: insight,
    });
  } catch (error) {
    console.error('Get insight error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get insight',
    });
  }
};

export const updateInsight = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const updateData = req.body;

    // Check if insight exists and belongs to user
    const existingInsight = await prisma.aIInsight.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingInsight) {
      return res.status(404).json({
        success: false,
        error: 'Insight not found',
      });
    }

    const updatedInsight = await prisma.aIInsight.update({
      where: { id },
      data: updateData,
    });

    res.json({
      success: true,
      data: updatedInsight,
      message: 'Insight updated successfully',
    });
  } catch (error) {
    console.error('Update insight error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update insight',
    });
  }
};

export const deleteInsight = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    // Check if insight exists and belongs to user
    const existingInsight = await prisma.aIInsight.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingInsight) {
      return res.status(404).json({
        success: false,
        error: 'Insight not found',
      });
    }

    await prisma.aIInsight.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Insight deleted successfully',
    });
  } catch (error) {
    console.error('Delete insight error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete insight',
    });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    // Check if insight exists and belongs to user
    const existingInsight = await prisma.aIInsight.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingInsight) {
      return res.status(404).json({
        success: false,
        error: 'Insight not found',
      });
    }

    const updatedInsight = await prisma.aIInsight.update({
      where: { id },
      data: { isRead: true },
    });

    res.json({
      success: true,
      data: updatedInsight,
      message: 'Insight marked as read',
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark insight as read',
    });
  }
};

export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    await prisma.aIInsight.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    res.json({
      success: true,
      message: 'All insights marked as read',
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark all insights as read',
    });
  }
};

export const deleteAllInsights = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const result = await prisma.aIInsight.deleteMany({
      where: {
        userId,
      },
    });

    res.json({
      success: true,
      message: `Deleted ${result.count} insights`,
      data: { deletedCount: result.count },
    });
  } catch (error) {
    console.error('Delete all insights error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete all insights',
    });
  }
};

export const generateInsights = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    // Generate AI-powered insights using Gemini
    const aiInsights = await aiService.generateFinancialInsights(userId);

    // Create insights in database
    const createdInsights = await Promise.all(
      aiInsights.map(insight =>
        prisma.aIInsight.create({
          data: {
            ...insight,
            userId,
          },
        })
      )
    );

    res.json({
      success: true,
      data: createdInsights,
      message: `Generated ${createdInsights.length} AI-powered insights`,
    });
  } catch (error) {
    console.error('Generate insights error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate insights',
    });
  }
};

export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const count = await prisma.aIInsight.count({
      where: {
        userId,
        isRead: false,
      },
    });

    res.json({
      success: true,
      data: { unreadCount: count },
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get unread count',
    });
  }
};
