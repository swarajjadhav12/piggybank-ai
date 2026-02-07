import { Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { GoalCreateSchema, GoalUpdateSchema } from '../types/index.js';
import { z } from 'zod';
import { tipGenerationService } from '../services/tipGenerationService.js';

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

    // Validation
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

    // Check wallet balance
    let wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    // Create wallet if it doesn't exist
    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: { userId, balance: 0, currency: 'USD' },
      });
    }

    if (wallet.balance < amount) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient wallet balance',
        data: {
          required: amount,
          available: wallet.balance,
        },
      });
    }

    // Perform transaction atomically
    const result = await prisma.$transaction(async (tx) => {
      // Deduct from wallet
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet!.id },
        data: { balance: { decrement: amount } },
      });

      // Add to goal
      const updatedGoal = await tx.goal.update({
        where: { id },
        data: { saved: { increment: amount } },
      });

      // Create saving record
      await tx.saving.create({
        data: {
          amount,
          type: 'GOAL_CONTRIBUTION',
          date: new Date(),
          userId,
        },
      });

      // Create transaction record
      await tx.transaction.create({
        data: {
          amount,
          currency: wallet!.currency,
          type: 'WITHDRAWAL',
          status: 'COMPLETED',
          description: `Added to ${goal.name}`,
          senderWalletId: wallet!.id,
          senderUserId: userId,
        },
      });

      return { updatedWallet, updatedGoal };
    });

    // Generate AI tips for the goal contribution
    try {
      const tips = await tipGenerationService.generateGoalTips(userId, id, amount);
      await tipGenerationService.storeTipsAsInsights(userId, tips);
    } catch (tipError) {
      console.error('Error generating goal tips:', tipError);
      // Don't fail the operation if tip generation fails
    }

    res.json({
      success: true,
      data: result.updatedGoal,
      wallet: result.updatedWallet,
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

export const withdrawFromGoal = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { amount } = req.body;

    // Validation
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be greater than 0',
      });
    }

    // Check if goal exists and has sufficient funds
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

    if (goal.saved < amount) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient funds in goal',
        data: {
          required: amount,
          available: goal.saved,
        },
      });
    }

    // Get or create wallet
    let wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: { userId, balance: 0, currency: 'USD' },
      });
    }

    // Perform transaction atomically
    const result = await prisma.$transaction(async (tx) => {
      // Deduct from goal
      const updatedGoal = await tx.goal.update({
        where: { id },
        data: { saved: { decrement: amount } },
      });

      // Add to wallet
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet!.id },
        data: { balance: { increment: amount } },
      });

      // Create transaction record
      await tx.transaction.create({
        data: {
          amount,
          currency: wallet!.currency,
          type: 'DEPOSIT',
          status: 'COMPLETED',
          description: `Withdrawn from ${goal.name}`,
          receiverWalletId: wallet!.id,
          receiverUserId: userId,
        },
      });

      return { updatedWallet, updatedGoal };
    });

    res.json({
      success: true,
      data: result.updatedGoal,
      wallet: result.updatedWallet,
      message: `Withdrawn $${amount} from ${goal.name}`,
    });
  } catch (error) {
    console.error('Withdraw from goal error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to withdraw from goal',
    });
  }
};

export const makePaymentFromGoal = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { amount, description } = req.body;

    // Validation
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be greater than 0',
      });
    }

    // Check if goal exists and has sufficient funds
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

    if (goal.saved < amount) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient funds in goal',
        data: {
          required: amount,
          available: goal.saved,
        },
      });
    }

    // Perform transaction atomically
    const result = await prisma.$transaction(async (tx) => {
      // Deduct from goal
      const updatedGoal = await tx.goal.update({
        where: { id },
        data: { saved: { decrement: amount } },
      });

      // Create expense record to track the payment
      await tx.expense.create({
        data: {
          description: description || `Payment for ${goal.name}`,
          amount,
          category: 'Goal Payment',
          date: new Date(),
          userId,
        },
      });

      return { updatedGoal };
    });

    res.json({
      success: true,
      data: result.updatedGoal,
      message: `Payment of $${amount} made from ${goal.name}`,
    });
  } catch (error) {
    console.error('Make payment from goal error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to make payment from goal',
    });
  }
};

