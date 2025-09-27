/**
 * 분석 서비스
 * 실제 거래 데이터 기반 통계 및 인사이트 생성
 */

import {
  Transaction,
  TransactionSummary,
  CategorySpending,
  CategoryType,
  PaymentMethod,
} from '../../types/transaction';
import { transactionStorage } from '../storage/TransactionStorage';
import { CATEGORIES } from '../../constants/categories';

export interface MonthlyTrend {
  month: string;
  year: number;
  totalSpent: number;
  totalIncome: number;
  netAmount: number;
  transactionCount: number;
}

export interface WeeklyPattern {
  dayOfWeek: number; // 0=일요일, 6=토요일
  dayName: string;
  averageSpent: number;
  transactionCount: number;
  topCategory: CategoryType;
}

export interface BudgetAnalysis {
  totalBudget: number;
  spentAmount: number;
  remainingAmount: number;
  usagePercentage: number;
  daysRemaining: number;
  dailyAverageSpent: number;
  recommendedDailySpending: number;
  isOnTrack: boolean;
}

export interface AIInsight {
  id: string;
  type: 'warning' | 'tip' | 'achievement' | 'prediction';
  title: string;
  description: string;
  actionable: boolean;
  priority: number; // 1-5, 높을수록 중요
  category?: CategoryType;
  data?: any;
}

export interface AnalyticsData {
  summary: TransactionSummary;
  monthlyTrends: MonthlyTrend[];
  weeklyPatterns: WeeklyPattern[];
  budgetAnalysis: BudgetAnalysis;
  insights: AIInsight[];
  categoryTrends: CategoryTrendData[];
}

export interface CategoryTrendData {
  category: CategoryType;
  currentMonth: number;
  previousMonth: number;
  changePercentage: number;
  trend: 'up' | 'down' | 'stable';
}

export class AnalyticsService {
  private static cache: AnalyticsData | null = null;
  private static lastCacheTime: Date | null = null;
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5분

  /**
   * 전체 분석 데이터 조회
   */
  static async getAnalyticsData(forceRefresh = false): Promise<AnalyticsData> {
    // 캐시 확인
    if (!forceRefresh && this.cache && this.lastCacheTime) {
      const now = new Date();
      const cacheAge = now.getTime() - this.lastCacheTime.getTime();
      if (cacheAge < this.CACHE_DURATION) {
        return this.cache;
      }
    }

    // 새로운 분석 데이터 생성
    const transactions = await transactionStorage.getAllTransactions();

    const summary = await this.generateSummary(transactions);
    const monthlyTrends = this.generateMonthlyTrends(transactions);
    const weeklyPatterns = this.generateWeeklyPatterns(transactions);
    const budgetAnalysis = this.generateBudgetAnalysis(transactions);
    const categoryTrends = this.generateCategoryTrends(transactions);
    const insights = this.generateInsights(transactions, summary, budgetAnalysis, categoryTrends);

    const analyticsData: AnalyticsData = {
      summary,
      monthlyTrends,
      weeklyPatterns,
      budgetAnalysis,
      insights,
      categoryTrends,
    };

    // 캐시 업데이트
    this.cache = analyticsData;
    this.lastCacheTime = new Date();

    return analyticsData;
  }

  /**
   * 거래 요약 생성
   */
  private static async generateSummary(transactions: Transaction[]): Promise<TransactionSummary> {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // 이번 달 거래만 필터링
    const currentMonthTransactions = transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
    });

    const expenses = currentMonthTransactions.filter(tx => !tx.isIncome);
    const income = currentMonthTransactions.filter(tx => tx.isIncome);

    const totalSpent = expenses.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    const totalIncome = income.reduce((sum, tx) => sum + tx.amount, 0);

    // 카테고리별 지출 분석
    const categoryBreakdown = this.generateCategoryBreakdown(expenses);

    // 최대 지출일 찾기
    const dailySpending = new Map<string, number>();
    expenses.forEach(tx => {
      const dateKey = new Date(tx.date).toDateString();
      dailySpending.set(dateKey, (dailySpending.get(dateKey) || 0) + Math.abs(tx.amount));
    });

    let topSpendingDay = now;
    let maxSpent = 0;
    dailySpending.forEach((amount, dateString) => {
      if (amount > maxSpent) {
        maxSpent = amount;
        topSpendingDay = new Date(dateString);
      }
    });

    return {
      totalSpent,
      totalIncome,
      netAmount: totalIncome - totalSpent,
      transactionCount: currentMonthTransactions.length,
      categoryBreakdown,
      topSpendingDay,
      averagePerTransaction: currentMonthTransactions.length > 0
        ? totalSpent / expenses.length
        : 0,
    };
  }

  /**
   * 카테고리별 지출 분석
   */
  private static generateCategoryBreakdown(expenses: Transaction[]): CategorySpending[] {
    const categoryMap = new Map<CategoryType, number[]>();

    // 카테고리별 거래 금액 수집
    expenses.forEach(tx => {
      if (!categoryMap.has(tx.category)) {
        categoryMap.set(tx.category, []);
      }
      categoryMap.get(tx.category)!.push(Math.abs(tx.amount));
    });

    const totalSpent = expenses.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

    // 카테고리별 통계 계산
    const breakdown: CategorySpending[] = [];
    categoryMap.forEach((amounts, category) => {
      const categoryTotal = amounts.reduce((sum, amount) => sum + amount, 0);
      breakdown.push({
        category,
        amount: categoryTotal,
        percentage: totalSpent > 0 ? (categoryTotal / totalSpent) * 100 : 0,
        transactionCount: amounts.length,
        averageAmount: amounts.length > 0 ? categoryTotal / amounts.length : 0,
      });
    });

    // 금액 순으로 정렬
    return breakdown.sort((a, b) => b.amount - a.amount);
  }

  /**
   * 월별 트렌드 분석
   */
  private static generateMonthlyTrends(transactions: Transaction[]): MonthlyTrend[] {
    const monthlyData = new Map<string, {
      expenses: number;
      income: number;
      count: number;
    }>();

    transactions.forEach(tx => {
      const date = new Date(tx.date);
      const key = `${date.getFullYear()}-${date.getMonth()}`;

      if (!monthlyData.has(key)) {
        monthlyData.set(key, { expenses: 0, income: 0, count: 0 });
      }

      const data = monthlyData.get(key)!;
      if (tx.isIncome) {
        data.income += tx.amount;
      } else {
        data.expenses += Math.abs(tx.amount);
      }
      data.count += 1;
    });

    const trends: MonthlyTrend[] = [];
    monthlyData.forEach((data, key) => {
      const [year, month] = key.split('-').map(Number);
      const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월',
                         '7월', '8월', '9월', '10월', '11월', '12월'];

      trends.push({
        month: monthNames[month],
        year,
        totalSpent: data.expenses,
        totalIncome: data.income,
        netAmount: data.income - data.expenses,
        transactionCount: data.count,
      });
    });

    // 최근 6개월만 반환
    return trends
      .sort((a, b) => b.year - a.year || b.month.localeCompare(a.month))
      .slice(0, 6)
      .reverse();
  }

  /**
   * 요일별 패턴 분석
   */
  private static generateWeeklyPatterns(transactions: Transaction[]): WeeklyPattern[] {
    const expenses = transactions.filter(tx => !tx.isIncome);
    const weeklyData = new Map<number, number[]>();

    expenses.forEach(tx => {
      const dayOfWeek = new Date(tx.date).getDay();
      if (!weeklyData.has(dayOfWeek)) {
        weeklyData.set(dayOfWeek, []);
      }
      weeklyData.get(dayOfWeek)!.push(Math.abs(tx.amount));
    });

    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const patterns: WeeklyPattern[] = [];

    for (let i = 0; i < 7; i++) {
      const amounts = weeklyData.get(i) || [];
      const totalSpent = amounts.reduce((sum, amount) => sum + amount, 0);

      // 해당 요일의 주요 카테고리 찾기
      const dayTransactions = expenses.filter(tx => new Date(tx.date).getDay() === i);
      const categoryCount = new Map<CategoryType, number>();
      dayTransactions.forEach(tx => {
        categoryCount.set(tx.category, (categoryCount.get(tx.category) || 0) + 1);
      });

      let topCategory = CategoryType.OTHER;
      let maxCount = 0;
      categoryCount.forEach((count, category) => {
        if (count > maxCount) {
          maxCount = count;
          topCategory = category;
        }
      });

      patterns.push({
        dayOfWeek: i,
        dayName: dayNames[i],
        averageSpent: amounts.length > 0 ? totalSpent / amounts.length : 0,
        transactionCount: amounts.length,
        topCategory,
      });
    }

    return patterns;
  }

  /**
   * 예산 분석
   */
  private static generateBudgetAnalysis(transactions: Transaction[]): BudgetAnalysis {
    const totalBudget = 1660000; // 기본 예산 (나중에 사용자 설정으로 변경)

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // 이번 달 지출만 계산
    const currentMonthExpenses = transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return !tx.isIncome &&
             txDate.getMonth() === currentMonth &&
             txDate.getFullYear() === currentYear;
    });

    const spentAmount = currentMonthExpenses.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    const remainingAmount = totalBudget - spentAmount;
    const usagePercentage = (spentAmount / totalBudget) * 100;

    // 이번 달 남은 일수 계산
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const currentDay = now.getDate();
    const daysRemaining = daysInMonth - currentDay + 1;

    // 일평균 지출 및 권장 지출 계산
    const dailyAverageSpent = currentDay > 0 ? spentAmount / currentDay : 0;
    const recommendedDailySpending = daysRemaining > 0 ? remainingAmount / daysRemaining : 0;

    // 예산 관리 상태 평가
    const expectedSpentByNow = (totalBudget / daysInMonth) * currentDay;
    const isOnTrack = spentAmount <= expectedSpentByNow;

    return {
      totalBudget,
      spentAmount,
      remainingAmount,
      usagePercentage,
      daysRemaining,
      dailyAverageSpent,
      recommendedDailySpending,
      isOnTrack,
    };
  }

  /**
   * 카테고리 트렌드 분석
   */
  private static generateCategoryTrends(transactions: Transaction[]): CategoryTrendData[] {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const categoryTrends: CategoryTrendData[] = [];

    Object.values(CategoryType).forEach(category => {
      if (category === CategoryType.INCOME) return; // 수입 제외

      // 이번 달 지출
      const currentMonthAmount = transactions
        .filter(tx => {
          const txDate = new Date(tx.date);
          return !tx.isIncome &&
                 tx.category === category &&
                 txDate.getMonth() === currentMonth &&
                 txDate.getFullYear() === currentYear;
        })
        .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

      // 지난 달 지출
      const previousMonthAmount = transactions
        .filter(tx => {
          const txDate = new Date(tx.date);
          return !tx.isIncome &&
                 tx.category === category &&
                 txDate.getMonth() === previousMonth &&
                 txDate.getFullYear() === previousYear;
        })
        .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

      // 변화율 계산
      const changePercentage = previousMonthAmount > 0
        ? ((currentMonthAmount - previousMonthAmount) / previousMonthAmount) * 100
        : currentMonthAmount > 0 ? 100 : 0;

      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (Math.abs(changePercentage) > 5) {
        trend = changePercentage > 0 ? 'up' : 'down';
      }

      categoryTrends.push({
        category,
        currentMonth: currentMonthAmount,
        previousMonth: previousMonthAmount,
        changePercentage,
        trend,
      });
    });

    return categoryTrends.filter(trend => trend.currentMonth > 0 || trend.previousMonth > 0);
  }

  /**
   * AI 인사이트 생성
   */
  private static generateInsights(
    transactions: Transaction[],
    summary: TransactionSummary,
    budgetAnalysis: BudgetAnalysis,
    categoryTrends: CategoryTrendData[]
  ): AIInsight[] {
    const insights: AIInsight[] = [];

    // 1. 예산 관련 인사이트
    if (budgetAnalysis.usagePercentage > 90) {
      insights.push({
        id: 'budget-warning',
        type: 'warning',
        title: '예산 초과 위험',
        description: `예산의 ${budgetAnalysis.usagePercentage.toFixed(0)}%를 사용했습니다. 남은 기간 동안 일 평균 ₩${Math.round(budgetAnalysis.recommendedDailySpending).toLocaleString()} 이하로 지출하세요.`,
        actionable: true,
        priority: 5,
        data: { budgetUsage: budgetAnalysis.usagePercentage }
      });
    } else if (budgetAnalysis.usagePercentage < 50 && budgetAnalysis.daysRemaining < 10) {
      insights.push({
        id: 'budget-achievement',
        type: 'achievement',
        title: '절약 성공! 🎉',
        description: `예산의 ${budgetAnalysis.usagePercentage.toFixed(0)}%만 사용하여 ₩${budgetAnalysis.remainingAmount.toLocaleString()}를 절약했습니다!`,
        actionable: false,
        priority: 3,
      });
    }

    // 2. 카테고리 변화 인사이트
    categoryTrends.forEach(trend => {
      if (Math.abs(trend.changePercentage) > 20 && trend.currentMonth > 10000) {
        const categoryInfo = CATEGORIES[trend.category];
        const direction = trend.trend === 'up' ? '증가' : '감소';
        const emoji = trend.trend === 'up' ? '📈' : '📉';

        insights.push({
          id: `category-trend-${trend.category}`,
          type: trend.trend === 'up' ? 'warning' : 'achievement',
          title: `${categoryInfo.name} 지출 ${direction} ${emoji}`,
          description: `지난달 대비 ${Math.abs(trend.changePercentage).toFixed(0)}% ${direction}했습니다 (₩${trend.currentMonth.toLocaleString()})`,
          actionable: trend.trend === 'up',
          priority: trend.trend === 'up' ? 4 : 2,
          category: trend.category,
          data: { changePercentage: trend.changePercentage }
        });
      }
    });

    // 3. 저축 목표 관련 인사이트
    const savingsRate = summary.totalIncome > 0 ? (summary.netAmount / summary.totalIncome) * 100 : 0;
    if (savingsRate > 20) {
      insights.push({
        id: 'savings-achievement',
        type: 'achievement',
        title: '저축 목표 달성 중! 💪',
        description: `수입의 ${savingsRate.toFixed(0)}%를 저축하고 있습니다. 훌륭한 금융 관리입니다!`,
        actionable: false,
        priority: 3,
        data: { savingsRate }
      });
    } else if (savingsRate < 10) {
      insights.push({
        id: 'savings-tip',
        type: 'tip',
        title: '저축률 개선 기회',
        description: `현재 저축률은 ${savingsRate.toFixed(0)}%입니다. 작은 지출 줄이기로도 저축을 늘릴 수 있어요.`,
        actionable: true,
        priority: 3,
        data: { savingsRate }
      });
    }

    // 4. 주요 지출 카테고리 분석
    const topCategory = summary.categoryBreakdown[0];
    if (topCategory && topCategory.percentage > 40) {
      const categoryInfo = CATEGORIES[topCategory.category];
      insights.push({
        id: 'top-category-warning',
        type: 'warning',
        title: `${categoryInfo.name} 지출 집중`,
        description: `전체 지출의 ${topCategory.percentage.toFixed(0)}%가 ${categoryInfo.name}입니다. 다양한 분야의 지출 균형을 고려해보세요.`,
        actionable: true,
        priority: 3,
        category: topCategory.category,
        data: { percentage: topCategory.percentage }
      });
    }

    // 5. 거래 빈도 분석
    if (summary.transactionCount < 10) {
      insights.push({
        id: 'transaction-frequency',
        type: 'tip',
        title: '거래 기록 늘리기',
        description: `이번 달 ${summary.transactionCount}건의 거래를 기록했습니다. 소액 지출도 기록하면 더 정확한 분석이 가능해요.`,
        actionable: true,
        priority: 2,
        data: { transactionCount: summary.transactionCount }
      });
    }

    // 우선순위 순으로 정렬하고 최대 5개만 반환
    return insights
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 5);
  }

  /**
   * 캐시 초기화
   */
  static clearCache(): void {
    this.cache = null;
    this.lastCacheTime = null;
  }

  /**
   * 특정 기간 데이터 조회
   */
  static async getTransactionsByPeriod(
    startDate: Date,
    endDate: Date
  ): Promise<Transaction[]> {
    const allTransactions = await transactionStorage.getAllTransactions();

    return allTransactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate >= startDate && txDate <= endDate;
    });
  }

  /**
   * 카테고리별 상세 분석
   */
  static async getCategoryAnalysis(category: CategoryType): Promise<{
    transactions: Transaction[];
    monthlyData: { month: string; amount: number }[];
    averageAmount: number;
    frequency: number;
    topSubcategories: { subcategory: string; amount: number; count: number }[];
  }> {
    const allTransactions = await transactionStorage.getAllTransactions();
    const categoryTransactions = allTransactions.filter(
      tx => tx.category === category && !tx.isIncome
    );

    // 월별 데이터
    const monthlyMap = new Map<string, number>();
    categoryTransactions.forEach(tx => {
      const month = new Date(tx.date).toISOString().substring(0, 7);
      monthlyMap.set(month, (monthlyMap.get(month) || 0) + Math.abs(tx.amount));
    });

    const monthlyData = Array.from(monthlyMap.entries())
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6); // 최근 6개월

    // 서브카테고리 분석
    const subcategoryMap = new Map<string, { amount: number; count: number }>();
    categoryTransactions.forEach(tx => {
      if (tx.subcategory) {
        const current = subcategoryMap.get(tx.subcategory) || { amount: 0, count: 0 };
        subcategoryMap.set(tx.subcategory, {
          amount: current.amount + Math.abs(tx.amount),
          count: current.count + 1
        });
      }
    });

    const topSubcategories = Array.from(subcategoryMap.entries())
      .map(([subcategory, data]) => ({ subcategory, ...data }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    const totalAmount = categoryTransactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    const averageAmount = categoryTransactions.length > 0 ? totalAmount / categoryTransactions.length : 0;

    return {
      transactions: categoryTransactions.slice(0, 20), // 최근 20개 거래
      monthlyData,
      averageAmount,
      frequency: categoryTransactions.length,
      topSubcategories,
    };
  }
}