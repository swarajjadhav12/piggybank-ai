import { Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { GoalCreateSchema, GoalUpdateSchema } from '../types/index.js';
import { z } from 'zod';

const GoalIdSchema = z.object({
  id: z.string().cuid(),
});

export const createGoal = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const goalData = req.body;

    const goal = await prisma.goal.create({
      data: {
        ...goalData,
        userId,
        targetDate: new Date(goalData.targetDate),
      },
    });

    res.status(201).json({
      success: true,
      data: goal,
      message: 'Goal created successfully',
    });
  } catch (error) {
    console.error('Create goal error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create goal',
    });
  }
};

export const getGoals = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { active } = req.query;

    const where: any = { userId };
    
    if (active !== undefined) {
      where.isActive = active === 'true';
    }

    const goals = await prisma.goal.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { targetDate: 'asc' },
      ],
    });

    res.json({
      success: true,
      data: goals,
    });
  } catch (error) {
    console.error('Get goals error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get goals',
    });
  }
};

export const getGoal = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const goal = await prisma.goal.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found',
      });
    }

    res.json({
      success: true,
      data: goal,
    });
  } catch (error) {
    console.error('Get goal error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get goal',
    });
  }
};

export const updateGoal = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const updateData = req.body;

    // Check if goal exists and belongs to user
    const existingGoal = await prisma.goal.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingGoal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found',
      });
    }

    // Prepare update data
    const dataToUpdate: any = { ...updateData };
    if (updateData.targetDate) {
      dataToUpdate.targetDate = new Date(updateData.targetDate);
    }

    const updatedGoal = await prisma.goal.update({
      where: { id },
      data: dataToUpdate,
    });

    res.json({
      success: true,
      data: updatedGoal,
      message: 'Goal updated successfully',
    });
  } catch (error) {
    console.error('Update goal error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update goal',
    });
  }
};

export const deleteGoal = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    // Check if goal exists and belongs to user
    const existingGoal = await prisma.goal.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingGoal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found',
      });
    }

    await prisma.goal.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Goal deleted successfully',
    });
  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete goal',
    });
  }
};

export const addToGoal = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be greater than 0',
      });
    }

    // Check if goal exists and belongs to user
    const goal = await prisma.goal.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found',
      });
    }

    // Update goal saved amount
    const updatedGoal = await prisma.goal.update({
      where: { id },
      data: {
        saved: goal.saved + amount,
      },
    });

    // Create a saving record
    await prisma.saving.create({
      data: {
        amount,
        type: 'GOAL_CONTRIBUTION',
        date: new Date(),
        userId,
      },
    });

    res.json({
      success: true,
      data: updatedGoal,
      message: `Added $${amount} to ${goal.name}`,
    });
  } catch (error) {
    console.error('Add to goal error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add to goal',
    });
  }
};

export const getGoalProgress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

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
        targetDate: true,
        priority: true,
        emoji: true,
      },
      orderBy: [
        { priority: 'desc' },
        { targetDate: 'asc' },
      ],
    });

    const goalsWithProgress = goals.map(goal => ({
      ...goal,
      progress: (goal.saved / goal.target) * 100,
      remaining: goal.target - goal.saved,
      daysRemaining: Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
    }));

    res.json({
      success: true,
      data: goalsWithProgress,
    });
  } catch (error) {
    console.error('Get goal progress error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get goal progress',
    });
  }
};
