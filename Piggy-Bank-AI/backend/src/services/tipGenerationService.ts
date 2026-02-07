import { prisma } from '../config/database.js';

interface Tip {
    type: 'SAVING' | 'SPENDING' | 'WARNING' | 'GOAL' | 'ACHIEVEMENT';
    title: string;
    description: string;
    impact: 'LOW' | 'MEDIUM' | 'HIGH';
    potentialSavings?: number;
}

// Helper function to format currency in US format
function formatCurrency(amount: number): string {
    return amount.toLocaleString('en-US');
}

export class TipGenerationService {
    /**
     * Generate tips after wallet deposit
     */
    async generateDepositTips(userId: string, amount: number): Promise<Tip[]> {
        const tips: Tip[] = [];

        try {
            // Fetch user's goals and wallet info
            const [goals, wallet] = await Promise.all([
                prisma.goal.findMany({
                    where: { userId, isActive: true },
                    orderBy: { priority: 'desc' },
                }),
                prisma.wallet.findUnique({ where: { userId } }),
            ]);

            // Tip 1: Congratulatory message
            if (amount >= 10000) {
                tips.push({
                    type: 'ACHIEVEMENT',
                    title: `🎉 Wow! You added $${formatCurrency(amount)} to your wallet!`,
                    description: 'Great job building your savings! This is a significant deposit that brings you closer to your financial goals.',
                    impact: 'HIGH',
                });
            } else if (amount >= 1000) {
                tips.push({
                    type: 'SAVING',
                    title: `💰 Nice! $${formatCurrency(amount)} added to your wallet`,
                    description: 'Every deposit counts! You\'re making steady progress toward financial security.',
                    impact: 'MEDIUM',
                });
            } else {
                tips.push({
                    type: 'SAVING',
                    title: `✨ $${formatCurrency(amount)} deposited successfully`,
                    description: 'Small steps lead to big achievements. Keep up the consistent saving habit!',
                    impact: 'LOW',
                });
            }

            // Tip 2: Goal allocation suggestion (if user has goals)
            if (goals.length > 0) {
                const topGoals = goals.slice(0, 2);
                const totalNeeded = topGoals.reduce((sum, goal) => sum + (goal.target - goal.saved), 0);

                if (amount >= totalNeeded) {
                    // Can fully fund top goals
                    tips.push({
                        type: 'GOAL',
                        title: '🎯 Smart Allocation Opportunity',
                        description: `You could fully fund your "${topGoals[0].name}" goal ($${formatCurrency(topGoals[0].target - topGoals[0].saved)})${topGoals.length > 1 ? ` and "${topGoals[1].name}" goal ($${formatCurrency(topGoals[1].target - topGoals[1].saved)})` : ''}, and still have $${formatCurrency(amount - totalNeeded)} left in your wallet!`,
                        impact: 'HIGH',
                        potentialSavings: amount - totalNeeded,
                    });
                } else if (goals.length >= 2) {
                    // Suggest split allocation
                    const allocation1 = Math.floor(amount * 0.4);
                    const allocation2 = Math.floor(amount * 0.4);
                    const remaining = amount - allocation1 - allocation2;

                    tips.push({
                        type: 'GOAL',
                        title: '💡 Suggested Goal Allocation',
                        description: `Consider allocating $${formatCurrency(allocation1)} to "${topGoals[0].name}" and $${formatCurrency(allocation2)} to "${topGoals[1].name}". You'll still have $${formatCurrency(remaining)} in your wallet for emergencies!`,
                        impact: 'MEDIUM',
                        potentialSavings: remaining,
                    });
                } else {
                    // Single goal suggestion
                    const allocation = Math.min(amount * 0.6, goals[0].target - goals[0].saved);
                    const remaining = amount - allocation;

                    tips.push({
                        type: 'GOAL',
                        title: '🎯 Boost Your Goal Progress',
                        description: `Put $${formatCurrency(Math.floor(allocation))} toward your "${goals[0].name}" goal and keep $${formatCurrency(Math.floor(remaining))} for flexibility. You'd be ${Math.round(((goals[0].saved + allocation) / goals[0].target) * 100)}% toward your goal!`,
                        impact: 'MEDIUM',
                    });
                }
            }

            // Tip 3: Savings potential or milestone
            if (wallet) {
                const currentBalance = wallet.balance;  // Already includes the deposit
                const previousBalance = currentBalance - amount;
                const milestones = [1000, 5000, 10000, 25000, 50000, 100000, 250000, 500000, 1000000];
                const nextMilestone = milestones.find(m => m > previousBalance && m <= currentBalance);

                if (nextMilestone) {
                    tips.push({
                        type: 'ACHIEVEMENT',
                        title: `🏆 Milestone Reached: $${formatCurrency(nextMilestone)}!`,
                        description: `Congratulations! Your wallet balance just crossed $${formatCurrency(nextMilestone)}. You're building serious financial momentum!`,
                        impact: 'HIGH',
                    });
                } else if (goals.length > 0) {
                    const goalsProgress = goals.map(g => (g.saved / g.target) * 100);
                    const avgProgress = goalsProgress.reduce((a, b) => a + b, 0) / goals.length;
                    const totalSaved = goals.reduce((sum, g) => sum + g.saved, 0);
                    const totalTarget = goals.reduce((sum, g) => sum + g.target, 0);

                    tips.push({
                        type: 'SAVING',
                        title: '📊 Your Financial Overview',
                        description: `You have $${formatCurrency(currentBalance)} in your wallet. Across ${goals.length} goal${goals.length > 1 ? 's' : ''}, you've saved $${formatCurrency(totalSaved)} of $${formatCurrency(totalTarget)} (${Math.round(avgProgress)}% average progress). You're doing great!`,
                        impact: 'MEDIUM',
                    });
                }
            }

            return tips.slice(0, 3); // Return max 3 tips
        } catch (error) {
            console.error('Error generating deposit tips:', error);
            return [{
                type: 'SAVING',
                title: '💰 Deposit Successful',
                description: `You've added $${formatCurrency(amount)} to your wallet. Keep up the great saving habits!`,
                impact: 'MEDIUM',
            }];
        }
    }

    /**
     * Generate tips after adding to goal
     */
    async generateGoalTips(userId: string, goalId: string, amount: number): Promise<Tip[]> {
        const tips: Tip[] = [];

        try {
            const [goal, allGoals] = await Promise.all([
                prisma.goal.findUnique({ where: { id: goalId } }),
                prisma.goal.findMany({ where: { userId, isActive: true } }),
            ]);

            if (!goal) return tips;

            const newSaved = goal.saved + amount;
            const progress = (newSaved / goal.target) * 100;
            const remaining = goal.target - newSaved;

            // Tip 1: Progress update
            if (progress >= 100) {
                tips.push({
                    type: 'ACHIEVEMENT',
                    title: `🎉 Goal Achieved: ${goal.name}!`,
                    description: `Congratulations! You've reached your goal of $${formatCurrency(goal.target)}. Time to celebrate this amazing achievement!`,
                    impact: 'HIGH',
                });
            } else if (progress >= 75) {
                tips.push({
                    type: 'GOAL',
                    title: `🔥 Almost There: ${Math.round(progress)}% Complete!`,
                    description: `Amazing progress on "${goal.name}"! Just $${formatCurrency(remaining)} more to reach your $${formatCurrency(goal.target)} goal. You're so close!`,
                    impact: 'HIGH',
                });
            } else if (progress >= 50) {
                tips.push({
                    type: 'GOAL',
                    title: `📈 Halfway Point Reached: ${Math.round(progress)}%`,
                    description: `You're now ${Math.round(progress)}% toward your "${goal.name}" goal. Keep up this momentum and you'll hit your target in no time!`,
                    impact: 'MEDIUM',
                });
            } else {
                tips.push({
                    type: 'GOAL',
                    title: `✨ Progress Update: ${Math.round(progress)}% Complete`,
                    description: `Great contribution to "${goal.name}"! You've saved $${formatCurrency(newSaved)} of your $${formatCurrency(goal.target)} goal.`,
                    impact: 'MEDIUM',
                });
            }

            // Tip 2: Timeline estimate
            const targetDate = new Date(goal.targetDate);
            const today = new Date();
            const daysRemaining = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

            if (daysRemaining > 0 && remaining > 0) {
                const dailyNeed = remaining / daysRemaining;

                if (dailyNeed <= 10) {
                    tips.push({
                        type: 'SAVING',
                        title: '⚡ You\'re Ahead of Schedule!',
                        description: `At this rate, you only need to save $${dailyNeed.toFixed(2)}/day to reach your goal by ${targetDate.toLocaleDateString('en-US')}. You might even finish early!`,
                        impact: 'MEDIUM',
                    });
                } else if (dailyNeed <= 50) {
                    tips.push({
                        type: 'SAVING',
                        title: '🎯 On Track to Success',
                        description: `Save $${dailyNeed.toFixed(2)}/day and you'll reach your "${goal.name}" goal by ${targetDate.toLocaleDateString('en-US')}. You've got this!`,
                        impact: 'MEDIUM',
                    });
                } else {
                    tips.push({
                        type: 'WARNING',
                        title: '⏰ Increase Your Pace',
                        description: `To reach your goal by ${targetDate.toLocaleDateString('en-US')}, try saving $${dailyNeed.toFixed(2)}/day. Consider adjusting your target date or increasing contributions.`,
                        impact: 'MEDIUM',
                    });
                }
            }

            // Tip 3: Comparison with other goals
            if (allGoals.length > 1) {
                const otherGoalsProgress = allGoals
                    .filter(g => g.id !== goalId)
                    .map(g => ({ name: g.name, progress: (g.saved / g.target) * 100 }))
                    .sort((a, b) => b.progress - a.progress);

                if (otherGoalsProgress.length > 0) {
                    const topOtherGoal = otherGoalsProgress[0];

                    if (progress > topOtherGoal.progress) {
                        tips.push({
                            type: 'ACHIEVEMENT',
                            title: '🏆 Leading the Pack!',
                            description: `"${goal.name}" is now your top-performing goal at ${Math.round(progress)}%! You're making excellent progress across all your savings targets.`,
                            impact: 'MEDIUM',
                        });
                    } else {
                        tips.push({
                            type: 'SAVING',
                            title: '💪 Keep Building Momentum',
                            description: `You're making great progress on "${goal.name}"! Your "${topOtherGoal.name}" goal is at ${Math.round(topOtherGoal.progress)}% - you're doing well across multiple goals.`,
                            impact: 'LOW',
                        });
                    }
                }
            }

            return tips.slice(0, 3); // Return max 3 tips
        } catch (error) {
            console.error('Error generating goal tips:', error);
            return [{
                type: 'GOAL',
                title: '✅ Contribution Successful',
                description: `You've added $${formatCurrency(amount)} to your goal. Great work on building your savings!`,
                impact: 'MEDIUM',
            }];
        }
    }

    /**
     * Store tips as AI insights
     */
    async storeTipsAsInsights(userId: string, tips: Tip[]): Promise<void> {
        try {
            await Promise.all(
                tips.map(tip =>
                    prisma.aIInsight.create({
                        data: {
                            userId,
                            type: tip.type,
                            title: tip.title,
                            description: tip.description,
                            impact: tip.impact,
                            potentialSavings: tip.potentialSavings,
                            isRead: false,
                        },
                    })
                )
            );
        } catch (error) {
            console.error('Error storing tips as insights:', error);
        }
    }
}

export const tipGenerationService = new TipGenerationService();
