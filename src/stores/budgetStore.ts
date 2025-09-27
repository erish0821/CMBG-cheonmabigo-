import { create } from 'zustand';
import { Budget, BudgetSummary, CreateBudgetRequest, UpdateBudgetRequest, BudgetAnalytics } from '../types/budget';
import { BudgetService } from '../services/budget/BudgetService';

export interface BudgetState {
  // 상태
  budgets: Budget[];
  activeBudgets: Budget[];
  budgetSummary: BudgetSummary | null;
  selectedBudget: Budget | null;
  budgetAnalytics: BudgetAnalytics | null;
  isLoading: boolean;
  isCreating: boolean;
  error: string | null;

  // 액션
  loadBudgets: (userId: number) => Promise<void>;
  loadBudgetSummary: (userId: number) => Promise<void>;
  createBudget: (userId: number, budgetData: CreateBudgetRequest) => Promise<Budget>;
  updateBudget: (userId: number, budgetId: string, updates: UpdateBudgetRequest) => Promise<void>;
  deleteBudget: (userId: number, budgetId: string) => Promise<void>;
  selectBudget: (budgetId: string | null) => void;
  loadBudgetAnalytics: (userId: number, budgetId: string) => Promise<void>;
  updateBudgetSpending: (userId: number) => Promise<void>;
  createDefaultBudgets: (userId: number) => Promise<void>;
  clearError: () => void;
  clearBudgets: () => void;
}

export const useBudgetStore = create<BudgetState>((set, get) => ({
  // 초기 상태
  budgets: [],
  activeBudgets: [],
  budgetSummary: null,
  selectedBudget: null,
  budgetAnalytics: null,
  isLoading: false,
  isCreating: false,
  error: null,

  // 예산 목록 로드
  loadBudgets: async (userId: number) => {
    set({ isLoading: true, error: null });

    try {
      const [allBudgets, activeBudgets] = await Promise.all([
        BudgetService.getAllBudgets(userId),
        BudgetService.getActiveBudgets(userId)
      ]);

      set({
        budgets: allBudgets,
        activeBudgets,
        isLoading: false,
      });
    } catch (error: any) {
      console.error('예산 로드 실패:', error);
      set({
        error: error.message || '예산을 불러올 수 없습니다.',
        isLoading: false,
      });
    }
  },

  // 예산 요약 로드
  loadBudgetSummary: async (userId: number) => {
    try {
      const summary = await BudgetService.getBudgetSummary(userId);
      set({ budgetSummary: summary });
    } catch (error: any) {
      console.error('예산 요약 로드 실패:', error);
      set({ error: error.message || '예산 요약을 불러올 수 없습니다.' });
    }
  },

  // 새 예산 생성
  createBudget: async (userId: number, budgetData: CreateBudgetRequest) => {
    set({ isCreating: true, error: null });

    try {
      const newBudget = await BudgetService.createBudget(userId, budgetData);

      // 로컬 상태 업데이트
      set(state => ({
        budgets: [...state.budgets, newBudget],
        activeBudgets: newBudget.isActive
          ? [...state.activeBudgets, newBudget]
          : state.activeBudgets,
        isCreating: false,
      }));

      // 예산 요약 새로고침
      await get().loadBudgetSummary(userId);

      return newBudget;
    } catch (error: any) {
      console.error('예산 생성 실패:', error);
      set({
        error: error.message || '예산 생성에 실패했습니다.',
        isCreating: false,
      });
      throw error;
    }
  },

  // 예산 업데이트
  updateBudget: async (userId: number, budgetId: string, updates: UpdateBudgetRequest) => {
    set({ error: null });

    try {
      const updatedBudget = await BudgetService.updateBudget(userId, budgetId, updates);

      // 로컬 상태 업데이트
      set(state => ({
        budgets: state.budgets.map(budget =>
          budget.id === budgetId ? updatedBudget : budget
        ),
        activeBudgets: state.activeBudgets.map(budget =>
          budget.id === budgetId ? updatedBudget : budget
        ).filter(budget => budget.isActive),
        selectedBudget: state.selectedBudget?.id === budgetId
          ? updatedBudget
          : state.selectedBudget,
      }));

      // 예산 요약 새로고침
      await get().loadBudgetSummary(userId);
    } catch (error: any) {
      console.error('예산 업데이트 실패:', error);
      set({ error: error.message || '예산 업데이트에 실패했습니다.' });
      throw error;
    }
  },

  // 예산 삭제
  deleteBudget: async (userId: number, budgetId: string) => {
    set({ error: null });

    try {
      await BudgetService.deleteBudget(userId, budgetId);

      // 로컬 상태 업데이트
      set(state => ({
        budgets: state.budgets.filter(budget => budget.id !== budgetId),
        activeBudgets: state.activeBudgets.filter(budget => budget.id !== budgetId),
        selectedBudget: state.selectedBudget?.id === budgetId
          ? null
          : state.selectedBudget,
      }));

      // 예산 요약 새로고침
      await get().loadBudgetSummary(userId);
    } catch (error: any) {
      console.error('예산 삭제 실패:', error);
      set({ error: error.message || '예산 삭제에 실패했습니다.' });
      throw error;
    }
  },

  // 예산 선택
  selectBudget: (budgetId: string | null) => {
    const { budgets } = get();
    const selectedBudget = budgetId
      ? budgets.find(budget => budget.id === budgetId) || null
      : null;

    set({ selectedBudget });
  },

  // 예산 분석 데이터 로드
  loadBudgetAnalytics: async (userId: number, budgetId: string) => {
    set({ isLoading: true, error: null });

    try {
      const analytics = await BudgetService.getBudgetAnalytics(userId, budgetId);
      set({
        budgetAnalytics: analytics,
        isLoading: false,
      });
    } catch (error: any) {
      console.error('예산 분석 로드 실패:', error);
      set({
        error: error.message || '예산 분석 데이터를 불러올 수 없습니다.',
        isLoading: false,
      });
    }
  },

  // 예산별 지출 업데이트
  updateBudgetSpending: async (userId: number) => {
    try {
      await BudgetService.updateBudgetSpending(userId);

      // 최신 데이터로 새로고침
      await Promise.all([
        get().loadBudgets(userId),
        get().loadBudgetSummary(userId),
      ]);
    } catch (error: any) {
      console.error('예산 지출 업데이트 실패:', error);
      set({ error: error.message || '예산 지출을 업데이트할 수 없습니다.' });
    }
  },

  // 기본 예산 생성
  createDefaultBudgets: async (userId: number) => {
    set({ isCreating: true, error: null });

    try {
      const defaultBudgets = await BudgetService.createDefaultBudgets(userId);

      // 로컬 상태 업데이트
      set(state => ({
        budgets: [...state.budgets, ...defaultBudgets],
        activeBudgets: [...state.activeBudgets, ...defaultBudgets.filter(b => b.isActive)],
        isCreating: false,
      }));

      // 예산 요약 새로고침
      await get().loadBudgetSummary(userId);

      console.log('기본 예산 생성 완료:', defaultBudgets.length);
    } catch (error: any) {
      console.error('기본 예산 생성 실패:', error);
      set({
        error: error.message || '기본 예산 생성에 실패했습니다.',
        isCreating: false,
      });
      throw error;
    }
  },

  // 에러 클리어
  clearError: () => {
    set({ error: null });
  },

  // 예산 데이터 초기화
  clearBudgets: () => {
    set({
      budgets: [],
      activeBudgets: [],
      budgetSummary: null,
      selectedBudget: null,
      budgetAnalytics: null,
      error: null,
    });
  },
}));