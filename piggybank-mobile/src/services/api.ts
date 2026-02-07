import { API_BASE_URL } from '../constants/config';
import storageService from './storage';

interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

class ApiService {
    private token: string | null = null;

    async setToken(token: string) {
        this.token = token;
        await storageService.setItem('authToken', token);
    }

    async getToken(): Promise<string | null> {
        if (!this.token) {
            this.token = await storageService.getItem('authToken');
        }
        return this.token;
    }

    async clearToken() {
        this.token = null;
        await storageService.removeItem('authToken');
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        const url = `${API_BASE_URL}${endpoint}`;
        const token = await this.getToken();

        console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
        console.log('🔑 Token present:', !!token);

        const config: RequestInit = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
                ...options.headers,
            },
            ...options,
        };

        try {
            const response = await fetch(url, config);
            console.log(`📡 Response status: ${response.status} ${response.statusText}`);

            let payload: any = null;
            const contentType = response.headers.get('content-type') || '';
            try {
                if (contentType.includes('application/json')) {
                    payload = await response.json();
                } else {
                    const text = await response.text();
                    payload = text ? { success: false, error: text } : { success: response.ok };
                }
            } catch {
                const text = await response.text().catch(() => '');
                payload = text ? { success: response.ok, error: text } : { success: response.ok };
            }

            console.log('📄 Response data:', payload);

            if (!response.ok) {
                if (response.status === 401) {
                    await this.clearToken();
                    // In React Native, we'll handle navigation in the context
                }
                const message = payload?.error || payload?.message || `${response.status} ${response.statusText}`;
                throw new Error(message);
            }

            return payload as ApiResponse<T>;
        } catch (error) {
            console.error('❌ API request failed:', error);
            throw error;
        }
    }

    // Authentication
    async register(userData: {
        email: string;
        password: string;
        firstName?: string;
        lastName?: string;
    }) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    }

    async login(credentials: { email: string; password: string }) {
        type LoginData = { token: string };
        const response = await this.request<LoginData>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });

        if (response.success && (response.data as any)?.token) {
            await this.setToken((response.data as any).token);
        }

        return response;
    }

    async getProfile() {
        return this.request('/auth/profile');
    }

    async updateProfile(profileData: { firstName?: string; lastName?: string }) {
        return this.request('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData),
        });
    }

    async changePassword(passwordData: { currentPassword: string; newPassword: string }) {
        return this.request('/auth/change-password', {
            method: 'PUT',
            body: JSON.stringify(passwordData),
        });
    }

    // Goals
    async getGoals(params?: { active?: boolean }) {
        const queryString = params ? `?${new URLSearchParams(params as any)}` : '';
        return this.request(`/goals${queryString}`);
    }

    async createGoal(goalData: {
        name: string;
        description?: string;
        target: number;
        targetDate: string;
        priority?: 'LOW' | 'MEDIUM' | 'HIGH';
        emoji?: string;
    }) {
        return this.request('/goals', {
            method: 'POST',
            body: JSON.stringify(goalData),
        });
    }

    async updateGoal(id: string, goalData: any) {
        return this.request(`/goals/${id}`, {
            method: 'PUT',
            body: JSON.stringify(goalData),
        });
    }

    async deleteGoal(id: string) {
        return this.request(`/goals/${id}`, {
            method: 'DELETE',
        });
    }

    async addToGoal(id: string, amount: number) {
        return this.request(`/goals/${id}/add`, {
            method: 'POST',
            body: JSON.stringify({ amount }),
        });
    }

    async withdrawFromGoal(id: string, amount: number) {
        return this.request(`/goals/${id}/withdraw`, {
            method: 'POST',
            body: JSON.stringify({ amount }),
        });
    }

    async makePaymentFromGoal(id: string, amount: number, description?: string) {
        return this.request(`/goals/${id}/payment`, {
            method: 'POST',
            body: JSON.stringify({ amount, description }),
        });
    }

    async getGoalProgress() {
        return this.request('/goals/progress');
    }

    // Expenses
    async getExpenses(params?: {
        page?: number;
        limit?: number;
        category?: string;
        startDate?: string;
        endDate?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }) {
        const queryString = params ? `?${new URLSearchParams(params as any)}` : '';
        return this.request(`/expenses${queryString}`);
    }

    async createExpense(expenseData: {
        description: string;
        amount: number;
        category: string;
        date: string;
    }) {
        return this.request('/expenses', {
            method: 'POST',
            body: JSON.stringify(expenseData),
        });
    }

    async updateExpense(id: string, expenseData: any) {
        return this.request(`/expenses/${id}`, {
            method: 'PUT',
            body: JSON.stringify(expenseData),
        });
    }

    async deleteExpense(id: string) {
        return this.request(`/expenses/${id}`, {
            method: 'DELETE',
        });
    }

    async getExpenseCategories() {
        return this.request('/expenses/categories');
    }

    async getRecentExpenses(limit?: number) {
        const queryString = limit ? `?limit=${limit}` : '';
        return this.request(`/expenses/recent${queryString}`);
    }

    async getExpenseAnalytics(period?: number) {
        const queryString = period ? `?period=${period}` : '';
        return this.request(`/expenses/analytics${queryString}`);
    }

    // Savings
    async getSavings(params?: {
        page?: number;
        limit?: number;
        type?: string;
        startDate?: string;
        endDate?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }) {
        const queryString = params ? `?${new URLSearchParams(params as any)}` : '';
        return this.request(`/savings${queryString}`);
    }

    async createSaving(savingData: {
        amount: number;
        type: 'MANUAL' | 'AUTOMATIC' | 'ROUND_UP' | 'GOAL_CONTRIBUTION';
        date: string;
    }) {
        return this.request('/savings', {
            method: 'POST',
            body: JSON.stringify(savingData),
        });
    }

    async deleteSaving(id: string) {
        return this.request(`/savings/${id}`, {
            method: 'DELETE',
        });
    }

    async getSavingsSummary(period?: number) {
        const queryString = period ? `?period=${period}` : '';
        return this.request(`/savings/summary${queryString}`);
    }

    async getSavingsAnalytics() {
        return this.request('/savings/analytics');
    }

    // AI Insights
    async getInsights(params?: {
        page?: number;
        limit?: number;
        type?: string;
        isRead?: boolean;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }) {
        const queryString = params ? `?${new URLSearchParams(params as any)}` : '';
        return this.request(`/insights${queryString}`);
    }

    async createInsight(insightData: {
        type: 'SAVING' | 'SPENDING' | 'WARNING' | 'GOAL' | 'ACHIEVEMENT';
        title: string;
        description: string;
        potentialSavings?: number;
        impact?: 'LOW' | 'MEDIUM' | 'HIGH';
    }) {
        return this.request('/insights', {
            method: 'POST',
            body: JSON.stringify(insightData),
        });
    }

    async updateInsight(id: string, insightData: any) {
        return this.request(`/insights/${id}`, {
            method: 'PUT',
            body: JSON.stringify(insightData),
        });
    }

    async deleteInsight(id: string) {
        return this.request(`/insights/${id}`, {
            method: 'DELETE',
        });
    }

    async markInsightAsRead(id: string) {
        return this.request(`/insights/${id}/read`, {
            method: 'PUT',
        });
    }

    async markAllInsightsAsRead() {
        return this.request('/insights/mark-all-read', {
            method: 'PUT',
        });
    }

    async generateInsights() {
        return this.request('/insights/generate', {
            method: 'GET',
        });
    }

    async getUnreadCount() {
        return this.request('/insights/unread-count');
    }

    // Dashboard
    async getDashboardData() {
        return this.request('/dashboard');
    }

    async getAnalytics(period?: number) {
        const queryString = period ? `?period=${period}` : '';
        return this.request(`/dashboard/analytics${queryString}`);
    }

    // Payments
    async getWallet() {
        return this.request('/payments/wallet');
    }

    async getTransactions(params?: { page?: number; limit?: number }) {
        const queryString = params ? `?${new URLSearchParams(params as any)}` : '';
        return this.request(`/payments/transactions${queryString}`);
    }

    async deposit(amount: number, description?: string) {
        return this.request('/payments/deposit', {
            method: 'POST',
            body: JSON.stringify({ amount, description }),
        });
    }

    async withdraw(amount: number, description?: string) {
        return this.request('/payments/withdraw', {
            method: 'POST',
            body: JSON.stringify({ amount, description }),
        });
    }

    async transfer(receiverPhone: string, amount: number, description?: string) {
        return this.request('/payments/transfer', {
            method: 'POST',
            body: JSON.stringify({ receiverPhone, amount, description }),
        });
    }

    // Chatbot
    async sendChatMessage(message: string, context?: string) {
        return this.request('/chat', {
            method: 'POST',
            body: JSON.stringify({ message, context }),
        });
    }
}

export const apiService = new ApiService();
export default apiService;
