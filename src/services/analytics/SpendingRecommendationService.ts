import { Budget, BudgetSummary } from '../../types/budget';
import { Transaction } from '../../types/transaction';
import { BudgetService } from '../budget/BudgetService';
import { transactionStorage } from '../storage/TransactionStorage';

export interface DailyRecommendation {
  date: string;
  recommendedAmount: number;
  actualSpent: number;
  variance: number;
  status: 'under' | 'on_track' | 'over';
  message: string;
  tips: string[];
}

export interface SpendingAnalysis {
  currentMonth: {
    totalBudget: number;
    totalSpent: number;
    remaining: number;
    daysLeft: number;
    dailyRecommended: number;
    projectedSpending: number;
    onTrackToGoal: boolean;
  };
  recommendations: {
    daily: DailyRecommendation;
    weekly: {
      targetAmount: number;
      currentWeekSpent: number;
      status: 'good' | 'warning' | 'over';
    };
    categories: {
      [category: string]: {
        budgetUsed: number;
        recommendedAdjustment: string;
        priority: 'high' | 'medium' | 'low';
      };
    };
  };
  insights: string[];
}

export class SpendingRecommendationService {
  /**
   * 일일 권장 지출 계산
   */
  static async calculateDailyRecommendation(userId: number): Promise<DailyRecommendation> {
    try {
      const budgetSummary = await BudgetService.getBudgetSummary(userId);
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];

      // 오늘 지출 계산
      const transactions = await transactionStorage.getAllTransactions();
      const todayTransactions = transactions.filter(tx => {
        const txDate = tx.date.toISOString().split('T')[0];
        return txDate === todayString && !tx.isIncome;
      });

      const actualSpent = todayTransactions.reduce((sum, tx) => sum + tx.amount, 0);
      const recommendedAmount = budgetSummary.dailyRecommended;
      const variance = actualSpent - recommendedAmount;

      let status: 'under' | 'on_track' | 'over';
      let message: string;
      let tips: string[] = [];

      if (variance <= -recommendedAmount * 0.3) {
        status = 'under';
        message = `오늘 예산보다 ${Math.abs(variance).toLocaleString()}원 적게 지출했습니다! 👍`;
        tips = [
          '절약을 잘하고 있어요!',
          '남은 예산은 저축이나 투자에 활용해보세요',
          '이 패턴을 유지하면 목표를 초과 달성할 수 있어요'
        ];
      } else if (variance <= recommendedAmount * 0.2) {
        status = 'on_track';
        message = `오늘 예산 범위 내에서 잘 지출하고 있습니다! 💚`;
        tips = [
          '균형잡힌 지출을 하고 있어요',
          '이 패턴을 계속 유지해보세요',
          '가끔은 작은 여유도 괜찮습니다'
        ];
      } else {
        status = 'over';
        message = `오늘 예산을 ${variance.toLocaleString()}원 초과했습니다. 😟`;
        tips = [
          '내일은 조금 더 절약해보세요',
          '불필요한 지출이 있었는지 점검해보세요',
          '큰 지출은 계획을 세워서 하는 것이 좋아요'
        ];
      }

      return {
        date: todayString,
        recommendedAmount,
        actualSpent,
        variance,
        status,
        message,
        tips,
      };
    } catch (error) {
      console.error('일일 권장 지출 계산 실패:', error);
      throw new Error('권장 지출을 계산할 수 없습니다.');
    }
  }

  /**
   * 종합 지출 분석
   */
  static async getSpendingAnalysis(userId: number): Promise<SpendingAnalysis> {
    try {
      const budgetSummary = await BudgetService.getBudgetSummary(userId);
      const transactions = await transactionStorage.getAllTransactions();
      const dailyRecommendation = await this.calculateDailyRecommendation(userId);

      const now = new Date();
      const currentMonth = {
        totalBudget: budgetSummary.totalBudget,
        totalSpent: budgetSummary.totalSpent,
        remaining: budgetSummary.totalRemaining,
        daysLeft: this.getDaysLeftInMonth(now),
        dailyRecommended: budgetSummary.dailyRecommended,
        projectedSpending: this.calculateProjectedSpending(transactions, now),
        onTrackToGoal: budgetSummary.status !== 'over',
      };

      const weeklyAnalysis = this.calculateWeeklyAnalysis(transactions, budgetSummary);
      const categoryAnalysis = this.analyzeCategorySpending(budgetSummary);
      const insights = this.generateInsights(currentMonth, dailyRecommendation, budgetSummary);

      return {
        currentMonth,
        recommendations: {
          daily: dailyRecommendation,
          weekly: weeklyAnalysis,
          categories: categoryAnalysis,
        },
        insights,
      };
    } catch (error) {
      console.error('지출 분석 실패:', error);
      throw new Error('지출 분석을 수행할 수 없습니다.');
    }
  }

  /**
   * 월말까지 남은 일수 계산
   */
  private static getDaysLeftInMonth(date: Date): number {
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const today = date.getDate();
    return lastDay.getDate() - today + 1;
  }

  /**
   * 예상 지출 계산
   */
  private static calculateProjectedSpending(transactions: Transaction[], currentDate: Date): number {
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const monthlyTransactions = transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate.getMonth() === currentMonth &&
             txDate.getFullYear() === currentYear &&
             !tx.isIncome;
    });

    const totalSpent = monthlyTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysPassed = currentDate.getDate();
    const averageDailySpending = totalSpent / daysPassed;

    return averageDailySpending * daysInMonth;
  }

  /**
   * 주간 분석
   */
  private static calculateWeeklyAnalysis(
    transactions: Transaction[],
    budgetSummary: BudgetSummary
  ): { targetAmount: number; currentWeekSpent: number; status: 'good' | 'warning' | 'over' } {
    const now = new Date();
    const weekStart = new Date(now.getTime() - now.getDay() * 24 * 60 * 60 * 1000);
    weekStart.setHours(0, 0, 0, 0);

    const weeklyTransactions = transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate >= weekStart && txDate <= now && !tx.isIncome;
    });

    const currentWeekSpent = weeklyTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    const targetAmount = budgetSummary.dailyRecommended * 7;

    let status: 'good' | 'warning' | 'over';
    const usage = targetAmount > 0 ? (currentWeekSpent / targetAmount) * 100 : 0;

    if (usage <= 80) {
      status = 'good';
    } else if (usage <= 100) {
      status = 'warning';
    } else {
      status = 'over';
    }

    return { targetAmount, currentWeekSpent, status };
  }

  /**
   * 카테고리별 분석
   */
  private static analyzeCategorySpending(budgetSummary: BudgetSummary): {
    [category: string]: {
      budgetUsed: number;
      recommendedAdjustment: string;
      priority: 'high' | 'medium' | 'low';
    };
  } {
    const analysis: any = {};

    Object.entries(budgetSummary.budgetsByCategory).forEach(([category, data]) => {
      const budgetUsed = data.progress;
      let recommendedAdjustment: string;
      let priority: 'high' | 'medium' | 'low';

      if (budgetUsed >= 100) {
        recommendedAdjustment = '즉시 지출을 중단하거나 크게 줄이세요';
        priority = 'high';
      } else if (budgetUsed >= 80) {
        recommendedAdjustment = '지출을 절반으로 줄이는 것을 고려해보세요';
        priority = 'high';
      } else if (budgetUsed >= 60) {
        recommendedAdjustment = '지출 속도를 늦춰보세요';
        priority = 'medium';
      } else {
        recommendedAdjustment = '현재 수준을 유지하면 됩니다';
        priority = 'low';
      }

      analysis[category] = {
        budgetUsed,
        recommendedAdjustment,
        priority,
      };
    });

    return analysis;
  }

  /**
   * 인사이트 생성
   */
  private static generateInsights(
    currentMonth: any,
    dailyRecommendation: DailyRecommendation,
    budgetSummary: BudgetSummary
  ): string[] {
    const insights: string[] = [];

    // 예산 진행률 분석
    if (budgetSummary.budgetProgress < 50) {
      insights.push('🎯 이번 달 예산을 매우 잘 관리하고 있습니다! 이 패턴을 유지하세요.');
    } else if (budgetSummary.budgetProgress < 80) {
      insights.push('⚠️ 예산 사용이 조금 빨라지고 있어요. 남은 기간 동안 조심해보세요.');
    } else if (budgetSummary.budgetProgress < 100) {
      insights.push('🚨 예산이 거의 소진되었습니다. 필수 지출만 하도록 주의하세요.');
    } else {
      insights.push('💸 예산을 초과했습니다. 다음 달 예산을 늘리거나 지출 패턴을 재검토해보세요.');
    }

    // 일일 지출 패턴 분석
    if (dailyRecommendation.status === 'under') {
      insights.push('💰 오늘은 절약을 잘했네요! 여유분은 비상금이나 투자에 활용해보세요.');
    } else if (dailyRecommendation.status === 'over') {
      insights.push('📊 오늘 지출이 많았어요. 내일은 계획적인 지출을 해보세요.');
    }

    // 목표 달성 가능성 분석
    if (currentMonth.onTrackToGoal) {
      insights.push('🏆 현재 페이스로는 이번 달 목표를 달성할 수 있을 것 같아요!');
    } else {
      const needToSave = (currentMonth.projectedSpending - currentMonth.totalBudget);
      insights.push(`⚡ 목표 달성을 위해 약 ${needToSave.toLocaleString()}원 정도 절약이 필요해요.`);
    }

    // 카테고리별 권장사항
    const highPriorityCategories = Object.entries(budgetSummary.budgetsByCategory)
      .filter(([_, data]) => data.progress >= 80)
      .map(([category, _]) => category);

    if (highPriorityCategories.length > 0) {
      insights.push(`⚠️ ${highPriorityCategories.join(', ')} 카테고리의 지출을 특히 주의해주세요.`);
    }

    return insights;
  }

  /**
   * 맞춤형 절약 팁 생성
   */
  static generateSavingTips(budgetSummary: BudgetSummary, transactions: Transaction[]): string[] {
    const tips: string[] = [];

    // 가장 지출이 많은 카테고리 찾기
    const categorySpending = Object.entries(budgetSummary.budgetsByCategory)
      .sort(([, a], [, b]) => b.spent - a.spent);

    if (categorySpending.length > 0) {
      const [topCategory, data] = categorySpending[0];

      const categoryTips = {
        food: [
          '집에서 요리해보세요',
          '점심 도시락을 준비해보세요',
          '할인하는 음식점을 찾아보세요'
        ],
        transport: [
          '대중교통 정기권을 활용해보세요',
          '걷거나 자전거를 이용해보세요',
          '카풀이나 공유 교통수단을 이용해보세요'
        ],
        shopping: [
          '쇼핑 목록을 미리 작성해보세요',
          '할인 정보를 확인해보세요',
          '필요한 물건인지 하루 더 생각해보세요'
        ],
        entertainment: [
          '무료 문화 행사를 찾아보세요',
          '집에서 즐길 수 있는 취미를 찾아보세요',
          '구독 서비스를 정리해보세요'
        ]
      };

      const categorySpecificTips = categoryTips[topCategory as keyof typeof categoryTips] || [
        '해당 카테고리의 지출을 줄여보세요',
        '다른 대안을 찾아보세요'
      ];

      tips.push(...categorySpecificTips.slice(0, 2));
    }

    // 일반적인 절약 팁
    tips.push(
      '가계부를 꾸준히 작성해보세요',
      '고정 지출을 주기적으로 점검해보세요',
      '작은 목표부터 차근차근 달성해보세요'
    );

    return tips.slice(0, 5);
  }
}