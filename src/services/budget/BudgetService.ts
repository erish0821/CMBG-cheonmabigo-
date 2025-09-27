import AsyncStorage from '@react-native-async-storage/async-storage';
import { Budget, BudgetSummary, CreateBudgetRequest, UpdateBudgetRequest, BudgetAnalytics } from '../../types/budget';
import { Transaction } from '../../types/transaction';
import { transactionStorage } from '../storage/TransactionStorage';

export class BudgetService {
  private static readonly STORAGE_KEY = 'budgets';

  /**
   * 모든 예산 조회
   */
  static async getAllBudgets(userId: number): Promise<Budget[]> {
    try {
      const budgetsData = await AsyncStorage.getItem(`${this.STORAGE_KEY}_${userId}`);

      if (budgetsData) {
        const budgets: Budget[] = JSON.parse(budgetsData);
        return budgets.map(budget => ({
          ...budget,
          startDate: new Date(budget.startDate),
          endDate: budget.endDate ? new Date(budget.endDate) : undefined,
          createdAt: new Date(budget.createdAt),
          updatedAt: new Date(budget.updatedAt),
        }));
      }

      return [];
    } catch (error) {
      console.error('예산 조회 실패:', error);
      return [];
    }
  }

  /**
   * 활성 예산만 조회
   */
  static async getActiveBudgets(userId: number): Promise<Budget[]> {
    const allBudgets = await this.getAllBudgets(userId);
    return allBudgets.filter(budget => budget.isActive);
  }

  /**
   * 특정 예산 조회
   */
  static async getBudgetById(userId: number, budgetId: string): Promise<Budget | null> {
    const budgets = await this.getAllBudgets(userId);
    return budgets.find(budget => budget.id === budgetId) || null;
  }

  /**
   * 새 예산 생성
   */
  static async createBudget(userId: number, budgetData: CreateBudgetRequest): Promise<Budget> {
    try {
      const existingBudgets = await this.getAllBudgets(userId);

      const newBudget: Budget = {
        id: `budget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        name: budgetData.name,
        category: budgetData.category,
        amount: budgetData.amount,
        period: budgetData.period,
        startDate: budgetData.startDate,
        endDate: budgetData.endDate,
        spent: 0,
        remaining: budgetData.amount,
        isActive: true,
        isRecurring: budgetData.isRecurring,
        color: budgetData.color || '#7C3AED',
        icon: '💰',
        description: budgetData.description,
        alerts: budgetData.alerts || {
          enabled: true,
          thresholds: [70, 90, 100],
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedBudgets = [...existingBudgets, newBudget];

      await AsyncStorage.setItem(
        `${this.STORAGE_KEY}_${userId}`,
        JSON.stringify(updatedBudgets)
      );

      console.log('새 예산 생성 완료:', newBudget.name);
      return newBudget;
    } catch (error) {
      console.error('예산 생성 실패:', error);
      throw new Error('예산 생성에 실패했습니다.');
    }
  }

  /**
   * 예산 업데이트
   */
  static async updateBudget(
    userId: number,
    budgetId: string,
    updates: UpdateBudgetRequest
  ): Promise<Budget> {
    try {
      const budgets = await this.getAllBudgets(userId);
      const budgetIndex = budgets.findIndex(budget => budget.id === budgetId);

      if (budgetIndex === -1) {
        throw new Error('해당 예산을 찾을 수 없습니다.');
      }

      const updatedBudget: Budget = {
        ...budgets[budgetIndex],
        ...updates,
        updatedAt: new Date(),
      };

      // 예산 금액이 변경된 경우 remaining 계산
      if (updates.amount !== undefined) {
        updatedBudget.remaining = updates.amount - updatedBudget.spent;
      }

      budgets[budgetIndex] = updatedBudget;

      await AsyncStorage.setItem(
        `${this.STORAGE_KEY}_${userId}`,
        JSON.stringify(budgets)
      );

      console.log('예산 업데이트 완료:', budgetId);
      return updatedBudget;
    } catch (error) {
      console.error('예산 업데이트 실패:', error);
      throw error;
    }
  }

  /**
   * 예산 삭제
   */
  static async deleteBudget(userId: number, budgetId: string): Promise<void> {
    try {
      const budgets = await this.getAllBudgets(userId);
      const filteredBudgets = budgets.filter(budget => budget.id !== budgetId);

      await AsyncStorage.setItem(
        `${this.STORAGE_KEY}_${userId}`,
        JSON.stringify(filteredBudgets)
      );

      console.log('예산 삭제 완료:', budgetId);
    } catch (error) {
      console.error('예산 삭제 실패:', error);
      throw new Error('예산 삭제에 실패했습니다.');
    }
  }

  /**
   * 예산별 지출 업데이트
   */
  static async updateBudgetSpending(userId: number): Promise<void> {
    try {
      const budgets = await this.getAllBudgets(userId);
      const transactions = await transactionStorage.getAllTransactions();

      for (const budget of budgets) {
        if (!budget.isActive) continue;

        // 예산 기간에 해당하는 거래 필터링
        const relevantTransactions = this.getTransactionsInBudgetPeriod(
          transactions,
          budget
        );

        // 카테고리별 지출 계산
        const categorySpent = relevantTransactions
          .filter(transaction =>
            transaction.category === budget.category && !transaction.isIncome
          )
          .reduce((total, transaction) => total + transaction.amount, 0);

        // 예산 업데이트
        budget.spent = categorySpent;
        budget.remaining = Math.max(0, budget.amount - categorySpent);
        budget.updatedAt = new Date();
      }

      await AsyncStorage.setItem(
        `${this.STORAGE_KEY}_${userId}`,
        JSON.stringify(budgets)
      );

      console.log('예산별 지출 업데이트 완료');
    } catch (error) {
      console.error('예산 지출 업데이트 실패:', error);
    }
  }

  /**
   * 예산 요약 정보 조회
   */
  static async getBudgetSummary(userId: number): Promise<BudgetSummary> {
    try {
      await this.updateBudgetSpending(userId);
      const activeBudgets = await this.getActiveBudgets(userId);

      const totalBudget = activeBudgets.reduce((sum, budget) => sum + budget.amount, 0);
      const totalSpent = activeBudgets.reduce((sum, budget) => sum + budget.spent, 0);
      const totalRemaining = Math.max(0, totalBudget - totalSpent);
      const budgetProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

      let status: 'good' | 'warning' | 'over';
      if (budgetProgress <= 70) {
        status = 'good';
      } else if (budgetProgress <= 100) {
        status = 'warning';
      } else {
        status = 'over';
      }

      const dailyRecommended = this.calculateDailyRecommendedSpending(totalRemaining);

      const budgetsByCategory: { [category: string]: any } = {};
      for (const budget of activeBudgets) {
        const progress = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
        budgetsByCategory[budget.category] = {
          budget: budget.amount,
          spent: budget.spent,
          remaining: budget.remaining,
          progress: Math.round(progress),
        };
      }

      return {
        totalBudget,
        totalSpent,
        totalRemaining,
        budgetProgress: Math.round(budgetProgress),
        status,
        dailyRecommended,
        budgetsByCategory,
      };
    } catch (error) {
      console.error('예산 요약 조회 실패:', error);
      throw new Error('예산 요약 정보를 불러올 수 없습니다.');
    }
  }

  /**
   * 예산 기간에 해당하는 거래 필터링
   */
  private static getTransactionsInBudgetPeriod(
    transactions: Transaction[],
    budget: Budget
  ): Transaction[] {
    const now = new Date();
    let periodStart: Date;
    let periodEnd: Date;

    switch (budget.period) {
      case 'daily':
        periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        periodEnd = new Date(periodStart.getTime() + 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        const dayOfWeek = now.getDay();
        periodStart = new Date(now.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
        periodStart.setHours(0, 0, 0, 0);
        periodEnd = new Date(periodStart.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      case 'yearly':
        periodStart = new Date(now.getFullYear(), 0, 1);
        periodEnd = new Date(now.getFullYear() + 1, 0, 1);
        break;
      default:
        periodStart = budget.startDate;
        periodEnd = budget.endDate || now;
    }

    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= periodStart && transactionDate < periodEnd;
    });
  }

  /**
   * 일일 권장 지출 계산
   */
  private static calculateDailyRecommendedSpending(remainingBudget: number): number {
    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const remainingDays = Math.max(1, endOfMonth.getDate() - now.getDate() + 1);

    return Math.floor(remainingBudget / remainingDays);
  }

  /**
   * 기본 예산 생성 (첫 사용자용)
   */
  static async createDefaultBudgets(userId: number): Promise<Budget[]> {
    try {
      const defaultBudgets: CreateBudgetRequest[] = [
        {
          name: '월 총 예산',
          category: 'total',
          amount: 1000000,
          period: 'monthly',
          startDate: new Date(),
          isRecurring: true,
          color: '#7C3AED',
          description: '월 전체 지출 예산',
        },
        {
          name: '식비',
          category: 'food',
          amount: 300000,
          period: 'monthly',
          startDate: new Date(),
          isRecurring: true,
          color: '#F59E0B',
          description: '식사 및 음료 예산',
        },
        {
          name: '교통비',
          category: 'transport',
          amount: 100000,
          period: 'monthly',
          startDate: new Date(),
          isRecurring: true,
          color: '#10B981',
          description: '대중교통 및 교통비 예산',
        },
      ];

      const createdBudgets = [];
      for (const budgetData of defaultBudgets) {
        const budget = await this.createBudget(userId, budgetData);
        createdBudgets.push(budget);
      }

      console.log('기본 예산 생성 완료:', createdBudgets.length);
      return createdBudgets;
    } catch (error) {
      console.error('기본 예산 생성 실패:', error);
      throw error;
    }
  }

  /**
   * 예산 분석 데이터 조회
   */
  static async getBudgetAnalytics(userId: number, budgetId: string): Promise<BudgetAnalytics> {
    try {
      const budget = await this.getBudgetById(userId, budgetId);
      if (!budget) {
        throw new Error('해당 예산을 찾을 수 없습니다.');
      }

      const transactions = await transactionStorage.getAllTransactions();
      const relevantTransactions = this.getTransactionsInBudgetPeriod(transactions, budget);

      // 일별 지출 데이터
      const dailySpending = this.calculateDailySpending(relevantTransactions);

      // 주별 지출 데이터
      const weeklySpending = this.calculateWeeklySpending(relevantTransactions);

      // 카테고리별 지출 분석
      const categoryBreakdown = this.calculateCategoryBreakdown(relevantTransactions);

      // 평균 지출 및 트렌드
      const averageSpending = dailySpending.reduce((sum, day) => sum + day.amount, 0) / dailySpending.length || 0;
      const spendingTrend = this.calculateSpendingTrend(dailySpending);

      const recommendations = this.generateRecommendations(budget, dailySpending, averageSpending);

      return {
        budgetId,
        period: budget.period,
        averageSpending,
        spendingTrend,
        categoryBreakdown,
        dailySpending,
        weeklySpending,
        recommendations,
      };
    } catch (error) {
      console.error('예산 분석 실패:', error);
      throw error;
    }
  }

  private static calculateDailySpending(transactions: Transaction[]): { date: string; amount: number }[] {
    const dailyMap = new Map<string, number>();

    transactions.forEach(transaction => {
      const date = transaction.date.toISOString().split('T')[0];
      const current = dailyMap.get(date) || 0;
      dailyMap.set(date, current + (transaction.isIncome ? 0 : transaction.amount));
    });

    return Array.from(dailyMap.entries()).map(([date, amount]) => ({ date, amount }));
  }

  private static calculateWeeklySpending(transactions: Transaction[]): { week: string; amount: number }[] {
    const weeklyMap = new Map<string, number>();

    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const weekStart = new Date(date.getTime() - date.getDay() * 24 * 60 * 60 * 1000);
      const week = weekStart.toISOString().split('T')[0];
      const current = weeklyMap.get(week) || 0;
      weeklyMap.set(week, current + (transaction.isIncome ? 0 : transaction.amount));
    });

    return Array.from(weeklyMap.entries()).map(([week, amount]) => ({ week, amount }));
  }

  private static calculateCategoryBreakdown(transactions: Transaction[]): { [category: string]: number } {
    const categoryMap: { [category: string]: number } = {};

    transactions.forEach(transaction => {
      if (!transaction.isIncome) {
        const current = categoryMap[transaction.category] || 0;
        categoryMap[transaction.category] = current + transaction.amount;
      }
    });

    return categoryMap;
  }

  private static calculateSpendingTrend(dailySpending: { date: string; amount: number }[]): 'increasing' | 'decreasing' | 'stable' {
    if (dailySpending.length < 3) return 'stable';

    const recentDays = dailySpending.slice(-7);
    const firstHalf = recentDays.slice(0, Math.floor(recentDays.length / 2));
    const secondHalf = recentDays.slice(Math.floor(recentDays.length / 2));

    const firstAvg = firstHalf.reduce((sum, day) => sum + day.amount, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, day) => sum + day.amount, 0) / secondHalf.length;

    const change = (secondAvg - firstAvg) / firstAvg;

    if (change > 0.1) return 'increasing';
    if (change < -0.1) return 'decreasing';
    return 'stable';
  }

  private static generateRecommendations(
    budget: Budget,
    dailySpending: { date: string; amount: number }[],
    averageSpending: number
  ): string[] {
    const recommendations: string[] = [];

    const progress = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;

    if (progress > 90) {
      recommendations.push('예산의 90%를 초과했습니다. 지출을 줄이는 것을 고려해보세요.');
    } else if (progress > 70) {
      recommendations.push('예산의 70%를 사용했습니다. 남은 기간 동안 지출을 조절해보세요.');
    }

    const dailyRecommended = this.calculateDailyRecommendedSpending(budget.remaining);
    if (averageSpending > dailyRecommended * 1.2) {
      recommendations.push(`일일 평균 지출이 권장량보다 높습니다. 하루 ${dailyRecommended.toLocaleString()}원 이하로 지출해보세요.`);
    }

    if (recommendations.length === 0) {
      recommendations.push('예산을 잘 관리하고 있습니다. 계속 유지해보세요!');
    }

    return recommendations;
  }
}