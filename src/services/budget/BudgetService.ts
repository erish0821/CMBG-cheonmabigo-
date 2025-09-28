import { Budget, BudgetSummary, CreateBudgetRequest, UpdateBudgetRequest, BudgetAnalytics } from '../../types/budget';
import { apiClient, ApiResponse } from '../api/apiClient';

export class BudgetService {
  /**
   * 모든 예산 조회
   */
  static async getAllBudgets(userId: number): Promise<Budget[]> {
    try {
      const response = await apiClient.get<Budget[]>('/budgets');

      if (response.success && response.data) {
        return response.data.map((budget: any) => ({
          id: budget.id,
          userId: budget.user_id,
          name: budget.name,
          amount: budget.amount,
          category: budget.category,
          period: budget.period,
          startDate: new Date(budget.start_date),
          endDate: budget.end_date ? new Date(budget.end_date) : undefined,
          alertThreshold: budget.alert_threshold,
          isActive: budget.is_active,
          autoRenew: budget.auto_renew,
          description: budget.description,
          createdAt: new Date(budget.created_at),
          updatedAt: new Date(budget.updated_at),
          // 추가 필드들 (예산 분석 데이터)
          spentAmount: budget.spent_amount || 0,
          remainingAmount: budget.remaining_amount || budget.amount,
          usagePercent: budget.usage_percent || 0,
          status: budget.status || 'normal',
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
    try {
      const response = await apiClient.get<Budget>(`/budgets/${budgetId}`);

      if (response.success && response.data) {
        const budget = response.data;
        return {
          ...budget,
          startDate: new Date(budget.startDate),
          endDate: budget.endDate ? new Date(budget.endDate) : undefined,
          createdAt: new Date(budget.createdAt),
          updatedAt: new Date(budget.updatedAt),
        };
      }

      return null;
    } catch (error) {
      console.error('예산 조회 실패:', error);
      return null;
    }
  }

  /**
   * 새 예산 생성
   */
  static async createBudget(userId: number, budgetData: CreateBudgetRequest): Promise<Budget> {
    try {
      const payload = {
        name: budgetData.name,
        category: budgetData.category,
        amount: budgetData.amount,
        period: budgetData.period,
        startDate: budgetData.startDate.toISOString().split('T')[0],
        endDate: budgetData.endDate?.toISOString().split('T')[0],
        alertThreshold: 80,
        isActive: true,
        autoRenew: budgetData.isRecurring || false,
        description: budgetData.description,
      };

      const response = await apiClient.post<Budget>('/budgets', payload);

      if (response.success && response.data) {
        const budget = response.data;
        console.log('새 예산 생성 완료:', budget.name);
        return {
          ...budget,
          startDate: new Date(budget.startDate),
          endDate: budget.endDate ? new Date(budget.endDate) : undefined,
          createdAt: new Date(budget.createdAt),
          updatedAt: new Date(budget.updatedAt),
        };
      }

      throw new Error('예산 생성 응답이 올바르지 않습니다.');
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
      const payload: any = { ...updates };

      // 날짜 필드 변환
      if (updates.startDate) {
        payload.startDate = updates.startDate.toISOString().split('T')[0];
      }
      if (updates.endDate) {
        payload.endDate = updates.endDate.toISOString().split('T')[0];
      }

      const response = await apiClient.put<Budget>(`/budgets/${budgetId}`, payload);

      if (response.success && response.data) {
        const budget = response.data;
        console.log('예산 업데이트 완료:', budgetId);
        return {
          ...budget,
          startDate: new Date(budget.startDate),
          endDate: budget.endDate ? new Date(budget.endDate) : undefined,
          createdAt: new Date(budget.createdAt),
          updatedAt: new Date(budget.updatedAt),
        };
      }

      throw new Error('예산 업데이트 응답이 올바르지 않습니다.');
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
      const response = await apiClient.delete(`/budgets/${budgetId}`);

      if (response.success) {
        console.log('예산 삭제 완료:', budgetId);
      } else {
        throw new Error('예산 삭제 응답이 올바르지 않습니다.');
      }
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
      // 백엔드에서 지출 계산이 자동으로 이루어지므로,
      // 여기서는 단순히 최신 예산 데이터를 가져오기만 하면 됨
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
      // 백엔드 API에서 예산 요약 정보를 직접 가져오기
      console.log('예산 요약 정보 로드 시작, 사용자 ID:', userId);
      const response = await apiClient.get<any>('/budgets/summary');

      if (response.success && response.data) {
        const data = response.data;
        console.log('백엔드에서 받은 예산 요약 데이터:', data);

        return {
          totalBudget: data.totalBudget || 0,
          totalSpent: data.totalSpent || 0,
          totalRemaining: data.totalRemaining || 0,
          budgetProgress: data.budgetProgress || 0,
          dailyRecommended: data.dailyRecommended || 0,
          status: data.status || 'good',
        };
      }

      // 백엔드 API 실패 시 fallback: 로컬 계산
      console.log('백엔드 API 실패, 로컬 계산으로 fallback');
      const activeBudgets = await this.getActiveBudgets(userId);

      const totalBudget = activeBudgets.reduce((sum, budget) => sum + budget.amount, 0);
      const totalSpent = activeBudgets.reduce((sum, budget) => sum + (budget.spent || 0), 0);
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
        const spent = budget.spent || 0;
        const progress = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
        budgetsByCategory[budget.category] = {
          budget: budget.amount,
          spent,
          remaining: budget.amount - spent,
          progress: Math.round(progress),
        };
      }

      console.log('사용자 예산 정보 로드됨:', totalBudget);
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
          category: 'TOTAL',
          amount: 800000,
          period: 'monthly',
          startDate: new Date(),
          isRecurring: true,
          color: '#7C3AED',
          description: '월 전체 지출 예산',
        },
        {
          name: '식비',
          category: 'FOOD_DINING',
          amount: 300000,
          period: 'monthly',
          startDate: new Date(),
          isRecurring: true,
          color: '#F59E0B',
          description: '식사 및 음료 예산',
        },
        {
          name: '교통비',
          category: 'TRANSPORTATION',
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
      // 백엔드 API를 통해 예산 분석 데이터 조회
      // 향후 구현 시 백엔드에서 분석 데이터를 제공하도록 수정 필요
      const budget = await this.getBudgetById(userId, budgetId);
      if (!budget) {
        throw new Error('해당 예산을 찾을 수 없습니다.');
      }

      // 임시로 기본 분석 데이터 반환
      return {
        budgetId,
        period: budget.period,
        averageSpending: 0,
        spendingTrend: 'stable' as const,
        categoryBreakdown: {},
        dailySpending: [],
        weeklySpending: [],
        recommendations: ['예산을 잘 관리하고 있습니다.'],
      };
    } catch (error) {
      console.error('예산 분석 실패:', error);
      throw error;
    }
  }

}