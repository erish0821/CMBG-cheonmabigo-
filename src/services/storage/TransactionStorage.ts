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
import { apiClient } from '../api/apiClient';

/**
 * 프론트엔드 카테고리를 백엔드 카테고리로 변환
 */
function mapCategoryToBackend(frontendCategory: CategoryType): string {
  const categoryMap: Record<CategoryType, string> = {
    [CategoryType.FOOD]: 'FOOD_DINING',
    [CategoryType.TRANSPORT]: 'TRANSPORTATION',
    [CategoryType.ENTERTAINMENT]: 'ENTERTAINMENT',
    [CategoryType.SHOPPING]: 'SHOPPING',
    [CategoryType.HEALTHCARE]: 'HEALTHCARE',
    [CategoryType.EDUCATION]: 'EDUCATION',
    [CategoryType.UTILITIES]: 'UTILITY',
    [CategoryType.HOUSING]: 'OTHER', // 백엔드에 HOUSING이 없어서 OTHER로 매핑
    [CategoryType.INCOME]: 'INCOME',
    [CategoryType.OTHER]: 'OTHER'
  };

  return categoryMap[frontendCategory] || 'OTHER';
}

/**
 * 프론트엔드 결제수단을 백엔드 결제수단으로 변환
 */
function mapPaymentMethodToBackend(frontendPaymentMethod: string): string {
  const paymentMethodMap: Record<string, string> = {
    'card': 'CARD',
    'cash': 'CASH',
    'transfer': 'TRANSFER',
    'mobile_pay': 'MOBILE_PAY'
  };

  return paymentMethodMap[frontendPaymentMethod] || 'CARD';
}

export class TransactionStorage {
  private cache: Map<string, Transaction[]> = new Map();
  private metadata: Map<string, TransactionMetadata> = new Map();

  /**
   * 사용자별 저장소 키 생성
   */
  private getUserStorageKey(userId: string): string {
    return `${TRANSACTION_STORAGE_KEY}_${userId}`;
  }

  /**
   * 사용자별 메타데이터 키 생성
   */
  private getUserMetadataKey(userId: string): string {
    return `${TRANSACTION_METADATA_KEY}_${userId}`;
  }

  /**
   * 현재 로그인한 사용자 ID 가져오기
   */
  private async getCurrentUserId(): Promise<string> {
    try {
      const { useAuthStore } = await import('../../stores/authStore');
      const user = useAuthStore.getState().user;
      if (!user) {
        throw new Error('로그인되지 않은 상태입니다.');
      }
      return user.id.toString();
    } catch (error) {
      console.error('사용자 정보 가져오기 실패:', error);
      throw new Error('사용자 인증이 필요합니다.');
    }
  }

  /**
   * 모든 거래 조회 (사용자별)
   */
  async getAllTransactions(): Promise<Transaction[]> {
    const userId = await this.getCurrentUserId();

    if (this.cache.has(userId)) {
      return this.cache.get(userId)!;
    }

    try {
      const data = await AsyncStorage.getItem(this.getUserStorageKey(userId));
      if (!data) {
        this.cache.set(userId, []);
        return [];
      }

      const transactions: Transaction[] = JSON.parse(data).map((tx: any) => ({
        ...tx,
        date: new Date(tx.date),
        createdAt: new Date(tx.createdAt),
        updatedAt: new Date(tx.updatedAt),
      }));

      this.cache.set(userId, transactions);
      return transactions;
    } catch (error) {
      console.error('Failed to load transactions:', error);
      return [];
    }
  }

  /**
   * 거래 저장 (메모리 캐시 + AsyncStorage) - 사용자별
   */
  async saveTransactions(transactions: Transaction[]): Promise<void> {
    const userId = await this.getCurrentUserId();

    try {
      const serialized = transactions.map(tx => ({
        ...tx,
        date: tx.date.toISOString(),
        createdAt: tx.createdAt.toISOString(),
        updatedAt: tx.updatedAt.toISOString(),
      }));

      await AsyncStorage.setItem(this.getUserStorageKey(userId), JSON.stringify(serialized));
      this.cache.set(userId, transactions);

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
    console.log('거래 추가 시작:', transaction);

    try {
      // 사용자 ID 가져오기
      const userId = await this.getCurrentUserId();
      console.log('사용자 ID 타입 및 값:', typeof userId, '|', userId);

      // 1. 백엔드 API에 거래 저장 (user_id는 JWT에서 자동 설정됨)
      const requestData = {
        amount: transaction.amount,
        description: transaction.description,
        category: mapCategoryToBackend(transaction.category),
        subcategory: transaction.subcategory,
        is_income: transaction.isIncome,
        payment_method: mapPaymentMethodToBackend(transaction.paymentMethod),
        location: transaction.location,
        tags: transaction.tags,
        confidence: transaction.confidence,
        original_text: transaction.originalText,
        ai_parsed: transaction.aiParsed,
        user_modified: transaction.userModified,
        transaction_date: transaction.date,
      };

      console.log('백엔드로 전송할 데이터:', JSON.stringify(requestData, null, 2));

      const apiResponse = await apiClient.post('/transactions', requestData);

      console.log('백엔드 API 응답:', apiResponse);

      if (apiResponse.success && apiResponse.data) {
        // 백엔드에서 생성된 거래로 로컬 스토리지 업데이트
        const backendTransaction = apiResponse.data;
        const newTransaction: Transaction = {
          id: backendTransaction.id.toString(),
          amount: backendTransaction.amount,
          description: backendTransaction.description,
          category: backendTransaction.category,
          subcategory: backendTransaction.subcategory,
          isIncome: backendTransaction.is_income,
          paymentMethod: backendTransaction.payment_method,
          location: backendTransaction.location,
          tags: backendTransaction.tags || [],
          confidence: backendTransaction.confidence,
          originalText: backendTransaction.original_text,
          aiParsed: backendTransaction.ai_parsed,
          userModified: backendTransaction.user_modified,
          date: new Date(backendTransaction.transaction_date),
          createdAt: new Date(backendTransaction.created_at),
          updatedAt: new Date(backendTransaction.updated_at),
        };

        // 로컬 스토리지에도 저장
        const transactions = await this.getAllTransactions();
        const updatedTransactions = [newTransaction, ...transactions];
        await this.saveTransactions(updatedTransactions);

        console.log('거래 추가 성공 (백엔드 + 로컬):', newTransaction);
        return newTransaction;
      }
    } catch (error) {
      console.error('백엔드 API 호출 실패, 로컬 저장소만 사용:', error);
    }

    // 백엔드 실패 시 로컬 저장소만 사용 (기존 로직)
    const transactions = await this.getAllTransactions();

    const newTransaction: Transaction = {
      ...transaction,
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedTransactions = [newTransaction, ...transactions];
    await this.saveTransactions(updatedTransactions);

    console.log('거래 추가 완료 (로컬만):', newTransaction);
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
   * 메타데이터 조회 (사용자별)
   */
  async getMetadata(): Promise<TransactionMetadata | null> {
    const userId = await this.getCurrentUserId();

    if (this.metadata.has(userId)) {
      return this.metadata.get(userId)!;
    }

    try {
      const data = await AsyncStorage.getItem(this.getUserMetadataKey(userId));
      if (!data) {
        return null;
      }

      const metadata = JSON.parse(data);
      metadata.lastUpdated = new Date(metadata.lastUpdated);

      this.metadata.set(userId, metadata);
      return metadata;
    } catch (error) {
      console.error('Failed to load metadata:', error);
      return null;
    }
  }

  /**
   * 메타데이터 업데이트 (사용자별)
   */
  async updateMetadata(updates: Partial<TransactionMetadata>): Promise<void> {
    const userId = await this.getCurrentUserId();

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

      await AsyncStorage.setItem(this.getUserMetadataKey(userId), JSON.stringify({
        ...updated,
        lastUpdated: updated.lastUpdated.toISOString(),
      }));

      this.metadata.set(userId, updated);
    } catch (error) {
      console.error('Failed to update metadata:', error);
    }
  }

  /**
   * 캐시 무효화 (사용자별)
   */
  clearCache(userId?: string): void {
    if (userId) {
      this.cache.delete(userId);
      this.metadata.delete(userId);
    } else {
      this.cache.clear();
      this.metadata.clear();
    }
  }

  /**
   * 사용자별 데이터 삭제
   */
  async clearUserData(userId?: string): Promise<void> {
    try {
      const targetUserId = userId || (await this.getCurrentUserId());
      const userStorageKey = this.getUserStorageKey(targetUserId);
      const userMetadataKey = this.getUserMetadataKey(targetUserId);

      await AsyncStorage.multiRemove([userStorageKey, userMetadataKey]);
      this.clearCache(targetUserId);
    } catch (error) {
      console.error('Failed to clear user data:', error);
      throw new Error('사용자 데이터 삭제에 실패했습니다.');
    }
  }

  /**
   * 모든 사용자 데이터 삭제 (관리자 용도)
   */
  async clearAllData(): Promise<void> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const transactionKeys = allKeys.filter(key =>
        key.startsWith(TRANSACTION_STORAGE_KEY) ||
        key.startsWith(TRANSACTION_METADATA_KEY)
      );

      if (transactionKeys.length > 0) {
        await AsyncStorage.multiRemove(transactionKeys);
      }

      this.clearCache();
    } catch (error) {
      console.error('Failed to clear all data:', error);
      throw new Error('전체 데이터 삭제에 실패했습니다.');
    }
  }

  /**
   * 기존 공용 테스트 데이터 제거 (마이그레이션 용도)
   */
  async clearLegacyData(): Promise<void> {
    try {
      console.log('기존 공용 테스트 데이터 제거 중...');

      // 기존 공용 키들 제거
      const legacyKeys = [
        'cheonmabigo_transactions',
        'cheonmabigo_transaction_metadata',
        '@CheonmaBigo:transactions',
        '@CheonmaBigo:transaction_metadata'
      ];

      await AsyncStorage.multiRemove(legacyKeys);
      console.log('기존 공용 테스트 데이터 제거 완료');
    } catch (error) {
      console.error('기존 데이터 제거 실패:', error);
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

  /**
   * 로컬 거래 데이터를 백엔드 API로 동기화
   */
  async syncLocalTransactionsToBackend(): Promise<{success: number, failed: number}> {
    console.log('로컬 거래 데이터를 백엔드로 동기화 시작...');

    try {
      const localTransactions = await this.getAllTransactions();
      let successCount = 0;
      let failedCount = 0;

      for (const transaction of localTransactions) {
        try {
          // 이미 백엔드에 있는지 확인 (ID가 숫자가 아니면 로컬 전용 거래)
          if (transaction.id.startsWith('tx_')) {
            console.log('로컬 거래를 백엔드로 동기화:', transaction.description);

            // 사용자 ID 가져오기
            const userId = await this.getCurrentUserId();

            const syncRequestData = {
              amount: transaction.amount,
              description: transaction.description,
              category: mapCategoryToBackend(transaction.category),
              subcategory: transaction.subcategory,
              is_income: transaction.isIncome,
              payment_method: mapPaymentMethodToBackend(transaction.paymentMethod),
              location: transaction.location,
              tags: transaction.tags,
              confidence: transaction.confidence,
              original_text: transaction.originalText,
              ai_parsed: transaction.aiParsed,
              user_modified: transaction.userModified,
              transaction_date: transaction.date,
            };

            console.log('동기화 요청 데이터:', JSON.stringify(syncRequestData, null, 2));

            const apiResponse = await apiClient.post('/transactions', syncRequestData);

            if (apiResponse.success) {
              successCount++;
              console.log('백엔드 동기화 성공:', transaction.description);
            } else {
              failedCount++;
              console.error('백엔드 동기화 실패:', transaction.description);
            }
          }
        } catch (error) {
          console.error('거래 동기화 오류:', transaction.description, error);
          failedCount++;
        }
      }

      console.log(`동기화 완료: 성공 ${successCount}개, 실패 ${failedCount}개`);
      return { success: successCount, failed: failedCount };
    } catch (error) {
      console.error('백엔드 동기화 전체 실패:', error);
      throw new Error('백엔드 동기화에 실패했습니다.');
    }
  }
}

// 싱글톤 인스턴스 생성
export const transactionStorage = new TransactionStorage();

// 기본 내보내기
export default TransactionStorage;