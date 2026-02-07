import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();
import { prisma } from '../config/database.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const PREFERRED_MODELS = [
  process.env.GEMINI_MODEL || '',
  'gemini-1.5-flash-001',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
].filter(Boolean);

export interface FinancialData {
  totalSavings: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  goals: Array<{
    name: string;
    target: number;
    saved: number;
    targetDate: string;
    priority: string;
  }>;
  recentExpenses: Array<{
    description: string;
    amount: number;
    category: string;
    date: string;
  }>;
  recentSavings: Array<{
    amount: number;
    type: string;
    date: string;
  }>;
}

export class AIService {
  private modelName: string = PREFERRED_MODELS[0];
  private getModel(modelName?: string) {
    return genAI.getGenerativeModel({ model: modelName || this.modelName });
  }

  private resolvedOnce = false;
  private async resolveAvailableModel(): Promise<string | null> {
    if (this.resolvedOnce && this.modelName) return this.modelName;
    try {
      const key = process.env.GEMINI_API_KEY;
      if (!key) return null;
      const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`;
      const resp = await fetch(url);
      if (!resp.ok) return null;
      const json: any = await resp.json();
      const models: Array<{ name: string; supportedGenerationMethods?: string[] }> = json.models || [];
      const candidate = models.find(m => (m.supportedGenerationMethods || []).includes('generateContent'))
        || models.find(m => (m.name || '').includes('gemini'))
        || null;
      if (candidate?.name) {
        // API returns names like 'models/gemini-1.5-flash-001' → extract suffix
        const parts = candidate.name.split('/');
        const picked = parts[parts.length - 1];
        console.log(`[AI] Discovered available model: ${picked}`);
        this.modelName = picked;
        this.resolvedOnce = true;
        return picked;
      }
    } catch (e) {
      console.warn('[AI] Failed to list models for discovery:', e);
    }
    return null;
  }

  async generateFinancialInsights(userId: string): Promise<{
    title: string;
    description: string;
    potentialSavings?: number;
    impact: 'LOW' | 'MEDIUM' | 'HIGH';
    type: 'SAVING' | 'SPENDING' | 'WARNING' | 'GOAL' | 'ACHIEVEMENT';
  }[]> {
    try {
      // Fetch user's financial data
      const financialData = await this.getUserFinancialData(userId);
      
      // Generate AI insights using Gemini
      const insights = await this.generateInsightsWithGemini(financialData);
      
      return insights;
    } catch (error) {
      console.error('Error generating AI insights:', error);
      // Return fallback insights if AI fails
      return this.getFallbackInsights();
    }
  }

  async chat(params: {
    userId: string;
    message: string;
    context?: string;
  }): Promise<{ reply: string }>{
    if (!process.env.GEMINI_API_KEY) {
      return {
        reply:
          'AI is not configured. Please set GEMINI_API_KEY on the server and restart. '
          + 'Contact support if the issue persists.',
      };
    }
    // Fetch a lightweight financial snapshot to ground answers
    let snapshot: FinancialData | null = null;
    try {
      snapshot = await this.getUserFinancialData(params.userId);
    } catch (e) {
      // If snapshot fails, continue with generic help
      snapshot = null;
    }

    const systemPrompt = `You are PiggyBank, a precise and helpful assistant for a payments app.
Respond with practical, step-by-step guidance tailored to the user's data. Prefer specific numbers and examples from the user's recent activity. If information is unavailable, state that clearly and ask one targeted follow-up question. Avoid speculation.`;

    const snapshotText = snapshot ? `
User Snapshot:
- Wallet Balance: $${snapshot.totalSavings.toFixed(2)}
- Estimated Monthly Income: $${snapshot.monthlyIncome.toFixed(2)}
- Monthly Expenses: $${snapshot.monthlyExpenses.toFixed(2)}
- Active Goals: ${snapshot.goals.length}
- Top Recent Categories: ${Object.entries(snapshot.recentExpenses.reduce((acc: any, e) => { acc[e.category] = (acc[e.category]||0)+e.amount; return acc; }, {} as Record<string, number>))
  .sort((a,b)=>b[1]-a[1]).slice(0,3).map(([c,a])=>`${c} $${a.toFixed(2)}`).join(', ') || 'N/A'}
` : 'User Snapshot: unavailable\n';

    const instructions = `
Answer policy:
1) Be concise (<= 6 sentences) and use bullet points for steps.
2) If budgeting or optimization is requested, include concrete amounts or percentages.
3) If the user asks about balances/transactions/goals, reference the snapshot numbers when relevant.
4) Never invent data. If unknown, ask exactly one clarifying question.
`;

    const userTurn = `
User Message:
${params.message}
`;

    const convoContext = params.context ? `
Conversation Context (last turns):
${params.context}
` : '';

    const fullPrompt = [systemPrompt, snapshotText, instructions, convoContext, userTurn]
      .filter(Boolean)
      .join('\n');

    try {
      // Use simple string prompt to avoid SDK signature mismatches
      let lastError: any = null;

      // Try env/default list first
      for (const name of PREFERRED_MODELS) {
        try {
          this.modelName = name;
          console.log(`[AI] Trying model: ${name}`);
          const result = await this.getModel(name).generateContent(fullPrompt);
          const response = await result.response;
          const text = response.text().trim();
          return { reply: text };
        } catch (err: any) {
          lastError = err;
          const status = err?.status || err?.response?.status;
          // Try next model only on 404/400 model errors
          if (status === 404 || status === 400) {
            console.warn(`[AI] Model not available (${name}) -> ${status}. Trying next...`);
            continue;
          }
          throw err;
        }
      }

      // If all defaults failed with 404/400, discover models dynamically
      const discovered = await this.resolveAvailableModel();
      if (discovered) {
        try {
          console.log(`[AI] Retrying with discovered model: ${discovered}`);
          const result = await this.getModel(discovered).generateContent(fullPrompt);
          const response = await result.response;
          const text = response.text().trim();
          return { reply: text };
        } catch (err) {
          lastError = err;
        }
      }
      // If we exhausted all models
      throw lastError || new Error('Provider error');
    } catch (error) {
      console.error('AI chat error:', error);
      const message = (error as any)?.message || '';
      if (message.includes('API key')) {
        return { reply: 'AI key error. Please verify GEMINI_API_KEY on the server.' };
      }
      if (message.includes('quota') || message.includes('429')) {
        return { reply: 'AI is rate-limited right now. Please try again in a moment.' };
      }
      return { reply: 'Sorry, I could not process that right now. Please try again.' };
    }
  }

  private async getUserFinancialData(userId: string): Promise<FinancialData> {
    const [goals, expenses, savings, wallet] = await Promise.all([
      prisma.goal.findMany({
        where: { userId, isActive: true },
        select: {
          name: true,
          target: true,
          saved: true,
          targetDate: true,
          priority: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.expense.findMany({
        where: { userId },
        select: {
          description: true,
          amount: true,
          category: true,
          date: true,
        },
        orderBy: { date: 'desc' },
        take: 10,
      }),
      prisma.saving.findMany({
        where: { userId },
        select: {
          amount: true,
          type: true,
          date: true,
        },
        orderBy: { date: 'desc' },
        take: 10,
      }),
      prisma.wallet.findUnique({
        where: { userId },
        select: { balance: true },
      }),
    ]);

    // Calculate monthly data (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const monthlyExpenses = expenses
      .filter(expense => new Date(expense.date) >= thirtyDaysAgo)
      .reduce((sum, expense) => sum + expense.amount, 0);

    const monthlySavings = savings
      .filter(saving => new Date(saving.date) >= thirtyDaysAgo)
      .reduce((sum, saving) => sum + saving.amount, 0);

    return {
      totalSavings: wallet?.balance || 0,
      monthlyIncome: monthlySavings + monthlyExpenses, // Rough estimate
      monthlyExpenses,
      goals: goals.map(goal => ({
        name: goal.name,
        target: goal.target,
        saved: goal.saved,
        targetDate: goal.targetDate.toISOString(),
        priority: goal.priority,
      })),
      recentExpenses: expenses.map(expense => ({
        description: expense.description,
        amount: expense.amount,
        category: expense.category,
        date: expense.date.toISOString(),
      })),
      recentSavings: savings.map(saving => ({
        amount: saving.amount,
        type: saving.type,
        date: saving.date.toISOString(),
      })),
    };
  }

  private async generateInsightsWithGemini(data: FinancialData): Promise<{
    title: string;
    description: string;
    potentialSavings?: number;
    impact: 'LOW' | 'MEDIUM' | 'HIGH';
    type: 'SAVING' | 'SPENDING' | 'WARNING' | 'GOAL' | 'ACHIEVEMENT';
  }[]> {
    const prompt = `
You are a professional financial advisor AI assistant. Analyze the following user's financial data and provide 3-5 personalized, actionable financial insights and tips.

User's Financial Data:
- Total Savings: $${data.totalSavings.toLocaleString()}
- Monthly Income (estimated): $${data.monthlyIncome.toLocaleString()}
- Monthly Expenses: $${data.monthlyExpenses.toLocaleString()}
- Active Goals: ${data.goals.length}
- Recent Expenses: ${data.recentExpenses.length} transactions
- Recent Savings: ${data.recentSavings.length} transactions

Goals:
${data.goals.map(goal => `- ${goal.name}: $${goal.saved}/${goal.target} (${goal.priority} priority, due ${new Date(goal.targetDate).toLocaleDateString()})`).join('\n')}

Recent Expense Categories:
${data.recentExpenses.map(expense => `- ${expense.category}: $${expense.amount} (${expense.description})`).join('\n')}

Please provide insights in the following JSON format:
[
  {
    "title": "Brief, actionable title",
    "description": "Detailed explanation and specific advice",
    "potentialSavings": 150.00,
    "impact": "HIGH",
    "type": "SAVING"
  }
]

Types: SAVING, SPENDING, WARNING, GOAL, ACHIEVEMENT
Impact: LOW, MEDIUM, HIGH

Focus on:
1. Specific, actionable advice based on their actual spending patterns
2. Goal achievement strategies
3. Expense optimization opportunities
4. Savings potential calculations
5. Financial health warnings if needed

Make the advice personal and relevant to their current financial situation.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from the response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const insights = JSON.parse(jsonMatch[0]);
        return insights.map((insight: any) => ({
          title: insight.title || 'Financial Tip',
          description: insight.description || 'Consider this financial advice',
          potentialSavings: insight.potentialSavings || undefined,
          impact: insight.impact || 'MEDIUM',
          type: insight.type || 'SAVING',
        }));
      }
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
    }

    return this.getFallbackInsights();
  }

  private getFallbackInsights() {
    return [
      {
        title: 'Track Your Daily Expenses',
        description: 'Start recording every expense, no matter how small. This awareness often leads to 10-15% reduction in spending.',
        potentialSavings: 200,
        impact: 'HIGH' as const,
        type: 'SAVING' as const,
      },
      {
        title: 'Set Up Automatic Savings',
        description: 'Automate your savings by setting up recurring transfers to your savings account on payday.',
        potentialSavings: 300,
        impact: 'HIGH' as const,
        type: 'SAVING' as const,
      },
      {
        title: 'Review Your Subscriptions',
        description: 'Audit your monthly subscriptions and cancel any you don\'t actively use. Many people save $50-100/month this way.',
        potentialSavings: 75,
        impact: 'MEDIUM' as const,
        type: 'SPENDING' as const,
      },
    ];
  }
}

export const aiService = new AIService();
