/**
 * AsyncStorage 기반 거래 저장소 서비스
 * 8단계: 가벼운 로컬 저장소 구현
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Transaction,
  TransactionFilter,
  TransactionSummary,
  TransactionMetadata,
  CategorySpending,
  CategoryType,
  TRANSACTION_STORAGE_KEY,
  TRANSACTION_METADATA_KEY,
} from '../../types/transaction';
import { CATEGORIES } from '../../constants/categories';

export class TransactionStorage {
  private cache: Transaction[] | null = null;
  private metadata: TransactionMetadata | null = null;

  /**
   * 모든 거래 조회
   */
  async getAllTransactions(): Promise<Transaction[]> {
    if (this.cache) {
      return this.cache;
    }

    try {
      const data = await AsyncStorage.getItem(TRANSACTION_STORAGE_KEY);
      if (!data) {
        this.cache = [];
        return [];
      }

      const transactions: Transaction[] = JSON.parse(data).map((tx: any) => ({
        ...tx,
        date: new Date(tx.date),
        createdAt: new Date(tx.createdAt),
        updatedAt: new Date(tx.updatedAt),
      }));

      this.cache = transactions;
      return transactions;
    } catch (error) {
      console.error('Failed to load transactions:', error);
      return [];
    }
  }

  /**
   * 거래 저장 (메모리 캐시 + AsyncStorage)
   */
  async saveTransactions(transactions: Transaction[]): Promise<void> {
    try {
      const serialized = transactions.map(tx => ({
        ...tx,
        date: tx.date.toISOString(),
        createdAt: tx.createdAt.toISOString(),
        updatedAt: tx.updatedAt.toISOString(),
      }));

      await AsyncStorage.setItem(TRANSACTION_STORAGE_KEY, JSON.stringify(serialized));
      this.cache = transactions;

      // 메타데이터 업데이트
      await this.updateMetadata({
        lastUpdated: new Date(),
        totalTransactions: transactions.length,
      });
    } catch (error) {
      console.error('Failed to save transactions:', error);
      throw new Error('거래 저장에 실패했습니다.');
    }
  }

  /**
   * 새 거래 추가
   */
  async addTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    const transactions = await this.getAllTransactions();

    const newTransaction: Transaction = {
      ...transaction,
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedTransactions = [newTransaction, ...transactions];
    await this.saveTransactions(updatedTransactions);

    return newTransaction;
  }

  /**
   * 거래 수정
   */
  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction | null> {
    const transactions = await this.getAllTransactions();
    const index = transactions.findIndex(tx => tx.id === id);

    if (index === -1) {
      return null;
    }

    const updatedTransaction: Transaction = {
      ...transactions[index],
      ...updates,
      updatedAt: new Date(),
    };

    transactions[index] = updatedTransaction;
    await this.saveTransactions(transactions);

    return updatedTransaction;
  }

  /**
   * 거래 삭제
   */
  async deleteTransaction(id: string): Promise<boolean> {
    const transactions = await this.getAllTransactions();
    const filteredTransactions = transactions.filter(tx => tx.id !== id);

    if (filteredTransactions.length === transactions.length) {
      return false; // 삭제할 거래가 없음
    }

    await this.saveTransactions(filteredTransactions);
    return true;
  }

  /**
   * 거래 검색/필터링
   */
  async getTransactions(filter?: TransactionFilter): Promise<Transaction[]> {
    const allTransactions = await this.getAllTransactions();

    if (!filter) {
      return allTransactions;
    }

    return allTransactions.filter(tx => {
      // 날짜 필터
      if (filter.startDate && tx.date < filter.startDate) return false;
      if (filter.endDate && tx.date > filter.endDate) return false;

      // 카테고리 필터
      if (filter.categories && !filter.categories.includes(tx.category)) return false;

      // 결제수단 필터
      if (filter.paymentMethods && !filter.paymentMethods.includes(tx.paymentMethod)) return false;

      // 금액 범위 필터
      if (filter.minAmount && Math.abs(tx.amount) < filter.minAmount) return false;
      if (filter.maxAmount && Math.abs(tx.amount) > filter.maxAmount) return false;

      // 수입/지출 필터
      if (filter.isIncome !== undefined && tx.isIncome !== filter.isIncome) return false;

      // 검색어 필터
      if (filter.searchText) {
        const searchLower = filter.searchText.toLowerCase();
        const matchText = [
          tx.description,
          tx.location || '',
          tx.originalText || '',
          ...tx.tags,
        ].join(' ').toLowerCase();

        if (!matchText.includes(searchLower)) return false;
      }

      return true;
    });
  }

  /**
   * 특정 기간의 거래 요약 통계
   */
  async getTransactionSummary(startDate?: Date, endDate?: Date): Promise<TransactionSummary> {
    const filter: TransactionFilter = {};
    if (startDate) filter.startDate = startDate;
    if (endDate) filter.endDate = endDate;

    const transactions = await this.getTransactions(filter);

    const totalSpent = transactions
      .filter(tx => !tx.isIncome)
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

    const totalIncome = transactions
      .filter(tx => tx.isIncome)
      .reduce((sum, tx) => sum + tx.amount, 0);

    // 카테고리별 지출 분석
    const categoryMap = new Map<CategoryType, CategorySpending>();

    transactions.filter(tx => !tx.isIncome).forEach(tx => {
      const current = categoryMap.get(tx.category) || {
        category: tx.category,
        amount: 0,
        percentage: 0,
        transactionCount: 0,
        averageAmount: 0,
      };

      current.amount += Math.abs(tx.amount);
      current.transactionCount += 1;
      categoryMap.set(tx.category, current);
    });

    const categoryBreakdown = Array.from(categoryMap.values()).map(cat => ({
      ...cat,
      percentage: totalSpent > 0 ? (cat.amount / totalSpent) * 100 : 0,
      averageAmount: cat.transactionCount > 0 ? cat.amount / cat.transactionCount : 0,
    })).sort((a, b) => b.amount - a.amount);

    // 가장 많이 지출한 날 찾기
    const dailySpending = new Map<string, number>();
    transactions.filter(tx => !tx.isIncome).forEach(tx => {
      const dateKey = tx.date.toISOString().split('T')[0];
      dailySpending.set(dateKey, (dailySpending.get(dateKey) || 0) + Math.abs(tx.amount));
    });

    const topSpendingEntry = Array.from(dailySpending.entries())
      .sort((a, b) => b[1] - a[1])[0];

    const topSpendingDay = topSpendingEntry ? new Date(topSpendingEntry[0]) : new Date();

    return {
      totalSpent,
      totalIncome,
      netAmount: totalIncome - totalSpent,
      transactionCount: transactions.length,
      categoryBreakdown,
      topSpendingDay,
      averagePerTransaction: transactions.length > 0 ? totalSpent / transactions.filter(tx => !tx.isIncome).length : 0,
    };
  }

  /**
   * 월별 거래 통계
   */
  async getMonthlyTransactions(year: number, month: number): Promise<Transaction[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    return this.getTransactions({ startDate, endDate });
  }

  /**
   * 최근 거래 조회
   */
  async getRecentTransactions(limit: number = 10): Promise<Transaction[]> {
    const transactions = await this.getAllTransactions();
    return transactions
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  /**
   * 메타데이터 조회
   */
  async getMetadata(): Promise<TransactionMetadata | null> {
    if (this.metadata) {
      return this.metadata;
    }

    try {
      const data = await AsyncStorage.getItem(TRANSACTION_METADATA_KEY);
      if (!data) {
        return null;
      }

      const metadata = JSON.parse(data);
      metadata.lastUpdated = new Date(metadata.lastUpdated);

      this.metadata = metadata;
      return metadata;
    } catch (error) {
      console.error('Failed to load metadata:', error);
      return null;
    }
  }

  /**
   * 메타데이터 업데이트
   */
  async updateMetadata(updates: Partial<TransactionMetadata>): Promise<void> {
    try {
      const current = await this.getMetadata();
      const updated: TransactionMetadata = {
        lastUpdated: new Date(),
        totalTransactions: 0,
        userPreferences: {
          defaultPaymentMethod: 'card' as any,
          favoriteCategories: [],
          customSubcategories: {
            [CategoryType.FOOD]: [],
            [CategoryType.TRANSPORT]: [],
            [CategoryType.ENTERTAINMENT]: [],
            [CategoryType.SHOPPING]: [],
            [CategoryType.HEALTHCARE]: [],
            [CategoryType.EDUCATION]: [],
            [CategoryType.UTILITIES]: [],
            [CategoryType.HOUSING]: [],
            [CategoryType.INCOME]: [],
            [CategoryType.OTHER]: [],
          },
        },
        ...current,
        ...updates,
      };

      await AsyncStorage.setItem(TRANSACTION_METADATA_KEY, JSON.stringify({
        ...updated,
        lastUpdated: updated.lastUpdated.toISOString(),
      }));

      this.metadata = updated;
    } catch (error) {
      console.error('Failed to update metadata:', error);
    }
  }

  /**
   * 캐시 무효화
   */
  clearCache(): void {
    this.cache = null;
    this.metadata = null;
  }

  /**
   * 전체 데이터 삭제 (개발/테스트 용도)
   */
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([TRANSACTION_STORAGE_KEY, TRANSACTION_METADATA_KEY]);
      this.clearCache();
    } catch (error) {
      console.error('Failed to clear all data:', error);
      throw new Error('데이터 삭제에 실패했습니다.');
    }
  }

  /**
   * 데이터 내보내기 (백업용)
   */
  async exportData(): Promise<{transactions: Transaction[], metadata: TransactionMetadata | null}> {
    const transactions = await this.getAllTransactions();
    const metadata = await this.getMetadata();

    return { transactions, metadata };
  }

  /**
   * 데이터 가져오기 (복원용)
   */
  async importData(data: {transactions: Transaction[], metadata?: TransactionMetadata}): Promise<void> {
    try {
      await this.saveTransactions(data.transactions);

      if (data.metadata) {
        await this.updateMetadata(data.metadata);
      }
    } catch (error) {
      console.error('Failed to import data:', error);
      throw new Error('데이터 가져오기에 실패했습니다.');
    }
  }
}

// 싱글톤 인스턴스 생성
export const transactionStorage = new TransactionStorage();

// 기본 내보내기
export default TransactionStorage;