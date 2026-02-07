import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const processQRPayment = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const { goalId, amount, qrData } = req.body;

        // Validate input
        if (!goalId || !amount || !qrData) {
            return res.status(400).json({
                success: false,
                error: 'Goal ID, amount, and QR data are required',
            });
        }

        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Amount must be greater than 0',
            });
        }

        // Get the goal
        const goal = await prisma.goal.findFirst({
            where: {
                id: goalId,
                userId: userId,
            },
        });

        if (!goal) {
            return res.status(404).json({
                success: false,
                error: 'Goal not found',
            });
        }

        // Check if goal has sufficient balance
        if (goal.saved < amount) {
            return res.status(400).json({
                success: false,
                error: 'Insufficient funds in goal',
            });
        }

        // Deduct amount from goal
        const updatedGoal = await prisma.goal.update({
            where: { id: goalId },
            data: {
                saved: goal.saved - amount,
            },
        });

        // Create a payment record (you can expand this to store QR data)
        // For now, we'll just create an expense record to track the payment
        await prisma.expense.create({
            data: {
                description: `QR Payment from ${goal.name}`,
                amount: amount,
                category: 'Payment',
                date: new Date(),
                userId: userId,
            },
        });

        res.json({
            success: true,
            message: 'Payment successful',
            data: {
                goal: updatedGoal,
                amountPaid: amount,
                qrData: qrData,
            },
        });
    } catch (error) {
        console.error('QR Payment error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process QR payment',
        });
    }
};
