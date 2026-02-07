import { z } from 'zod';

// User Types
export const UserRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export const UserLoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type UserRegisterInput = z.infer<typeof UserRegisterSchema>;
export type UserLoginInput = z.infer<typeof UserLoginSchema>;

// Goal Types
export const GoalCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  target: z.number().positive(),
  targetDate: z.string().refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, "Invalid date format"),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  emoji: z.string().optional(),
});

export const GoalUpdateSchema = GoalCreateSchema.partial().extend({
  saved: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
});

export type GoalCreateInput = z.infer<typeof GoalCreateSchema>;
export type GoalUpdateInput = z.infer<typeof GoalUpdateSchema>;

// Expense Types
export const ExpenseCreateSchema = z.object({
  description: z.string().min(1),
  amount: z.number().positive(),
  category: z.string().min(1),
  date: z.string().datetime(),
});

export const ExpenseUpdateSchema = ExpenseCreateSchema.partial();

export type ExpenseCreateInput = z.infer<typeof ExpenseCreateSchema>;
export type ExpenseUpdateInput = z.infer<typeof ExpenseUpdateSchema>;

// Saving Types
export const SavingCreateSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(['MANUAL', 'AUTOMATIC', 'ROUND_UP', 'GOAL_CONTRIBUTION']),
  date: z.string().datetime(),
});

export type SavingCreateInput = z.infer<typeof SavingCreateSchema>;

// AI Insight Types
export const InsightCreateSchema = z.object({
  type: z.enum(['SAVING', 'SPENDING', 'WARNING', 'GOAL', 'ACHIEVEMENT']),
  title: z.string().min(1),
  description: z.string().min(1),
  potentialSavings: z.number().optional(),
  impact: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
});

export const InsightUpdateSchema = InsightCreateSchema.partial().extend({
  isRead: z.boolean().optional(),
});

export type InsightCreateInput = z.infer<typeof InsightCreateSchema>;
export type InsightUpdateInput = z.infer<typeof InsightUpdateSchema>;

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Auth Types
export interface JwtPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

// Analytics Types
export interface SpendingAnalytics {
  totalSpent: number;
  monthlyAverage: number;
  categoryBreakdown: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  monthlyTrend: {
    month: string;
    amount: number;
  }[];
}

export interface SavingsAnalytics {
  totalSaved: number;
  monthlyAverage: number;
  goalProgress: {
    goalId: string;
    goalName: string;
    progress: number;
    remaining: number;
  }[];
  monthlyTrend: {
    month: string;
    amount: number;
  }[];
}

// Dashboard Types
export interface DashboardData {
  savings: {
    total: number;
    monthlyGrowth: number;
    yearlyGrowth: number;
  };
  monthlyBudget: number;
  recentExpenses: Array<{
    id: string;
    description: string;
    amount: number;
    category: string;
    date: string;
  }>;
  goals: Array<{
    id: string;
    name: string;
    description?: string;
    target: number;
    saved: number;
    targetDate: string;
    priority: string;
    emoji?: string;
  }>;
  quickInsights: string[];
  aiSuggestions: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    potentialSavings: number;
    impact: string;
  }>;
}
