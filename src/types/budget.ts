export interface Budget {
  id: string;
  userId: number;
  name: string;
  category: string;
  amount: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate?: Date;
  spent: number;
  remaining: number;
  isActive: boolean;
  isRecurring: boolean;
  color?: string;
  icon?: string;
  description?: string;
  alerts: {
    enabled: boolean;
    thresholds: number[]; // 70%, 90%, 100%
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  budgetProgress: number; // 백분율
  status: 'good' | 'warning' | 'over';
  dailyRecommended: number;
  budgetsByCategory: {
    [category: string]: {
      budget: number;
      spent: number;
      remaining: number;
      progress: number;
    };
  };
}

export interface CreateBudgetRequest {
  name: string;
  category: string;
  amount: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate?: Date;
  isRecurring: boolean;
  color?: string;
  description?: string;
  alerts?: {
    enabled: boolean;
    thresholds: number[];
  };
}

export interface UpdateBudgetRequest {
  name?: string;
  amount?: number;
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  endDate?: Date;
  isActive?: boolean;
  isRecurring?: boolean;
  color?: string;
  description?: string;
  alerts?: {
    enabled: boolean;
    thresholds: number[];
  };
}

export interface BudgetAlert {
  id: string;
  budgetId: string;
  threshold: number;
  triggeredAt: Date;
  message: string;
  isRead: boolean;
}

export interface BudgetAnalytics {
  budgetId: string;
  period: string;
  averageSpending: number;
  spendingTrend: 'increasing' | 'decreasing' | 'stable';
  categoryBreakdown: {
    [category: string]: number;
  };
  dailySpending: {
    date: string;
    amount: number;
  }[];
  weeklySpending: {
    week: string;
    amount: number;
  }[];
  recommendations: string[];
}