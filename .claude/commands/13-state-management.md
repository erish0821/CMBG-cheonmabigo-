# 상태 관리 시스템

Zustand를 사용하여 천마비고 앱의 전역 상태를 관리하고 로컬 저장소와 동기화합니다.

## 실행할 작업

1. **상태 관리 라이브러리 설치**
   ```bash
   npm install zustand immer
   npm install @react-native-async-storage/async-storage
   npm install react-native-mmkv react-native-mmkv-flipper-plugin
   ```

2. **Zustand 스토어 설정**
   ```typescript
   // src/stores/index.ts
   import { create } from 'zustand';
   import { devtools } from 'zustand/middleware';
   import { immer } from 'zustand/middleware/immer';
   
   // 스토어 결합
   export const useAppStore = create(
     devtools(
       immer((set, get) => ({
         ...useAuthStore(set, get),
         ...useTransactionStore(set, get),
         ...useAnalyticsStore(set, get),
         ...useBudgetStore(set, get),
       }))
     )
   );
   ```

3. **인증 상태 스토어**
   ```typescript
   // src/stores/authStore.ts
   interface AuthState {
     isAuthenticated: boolean;
     user: User | null;
     isLoading: boolean;
     error: string | null;
   }

   interface AuthActions {
     login: (email: string, password: string) => Promise<void>;
     logout: () => Promise<void>;
     refreshToken: () => Promise<void>;
     clearError: () => void;
     setUser: (user: User) => void;
   }

   export const authStore = (set: any, get: any) => ({
     // 상태
     isAuthenticated: false,
     user: null,
     isLoading: false,
     error: null,

     // 액션
     login: async (email: string, password: string) => {
       set((state: any) => {
         state.isLoading = true;
         state.error = null;
       });

       try {
         const response = await authApi.login(email, password);
         await AuthManager.storeTokens(response.accessToken, response.refreshToken);
         
         set((state: any) => {
           state.isAuthenticated = true;
           state.user = response.user;
           state.isLoading = false;
         });
       } catch (error) {
         set((state: any) => {
           state.error = error.message;
           state.isLoading = false;
         });
       }
     },

     logout: async () => {
       await AuthManager.clearTokens();
       set((state: any) => {
         state.isAuthenticated = false;
         state.user = null;
         state.error = null;
       });
     }
   });
   ```

4. **거래 상태 스토어**
   ```typescript
   // src/stores/transactionStore.ts
   interface TransactionState {
     transactions: Transaction[];
     currentTransaction: Transaction | null;
     isLoading: boolean;
     error: string | null;
     filters: TransactionFilters;
     pagination: {
       page: number;
       limit: number;
       total: number;
     };
   }

   export const transactionStore = (set: any, get: any) => ({
     transactions: [],
     currentTransaction: null,
     isLoading: false,
     error: null,
     filters: {
       category: null,
       dateRange: null,
       amountRange: null,
     },
     pagination: {
       page: 1,
       limit: 20,
       total: 0,
     },

     // 거래 목록 조회
     fetchTransactions: async (filters?: TransactionFilters) => {
       set((state: any) => { state.isLoading = true; });
       
       try {
         const response = await transactionApi.getTransactions(filters);
         set((state: any) => {
           state.transactions = response.data;
           state.pagination = response.pagination;
           state.isLoading = false;
         });
       } catch (error) {
         set((state: any) => {
           state.error = error.message;
           state.isLoading = false;
         });
       }
     },

     // 거래 추가
     addTransaction: async (transaction: CreateTransactionDto) => {
       try {
         const newTransaction = await transactionApi.createTransaction(transaction);
         set((state: any) => {
           state.transactions.unshift(newTransaction);
         });
         return newTransaction;
       } catch (error) {
         set((state: any) => { state.error = error.message; });
         throw error;
       }
     },

     // 옵티미스틱 업데이트
     updateTransactionOptimistic: (id: string, updates: Partial<Transaction>) => {
       set((state: any) => {
         const index = state.transactions.findIndex((t: Transaction) => t.id === id);
         if (index !== -1) {
           Object.assign(state.transactions[index], updates);
         }
       });
     }
   });
   ```

5. **분석 데이터 스토어**
   ```typescript
   // src/stores/analyticsStore.ts
   interface AnalyticsState {
     summary: SpendingSummary | null;
     categoryBreakdown: CategorySpending[];
     monthlyTrend: MonthlyData[];
     insights: Insight[];
     isLoading: boolean;
     lastUpdated: Date | null;
   }

   export const analyticsStore = (set: any, get: any) => ({
     summary: null,
     categoryBreakdown: [],
     monthlyTrend: [],
     insights: [],
     isLoading: false,
     lastUpdated: null,

     fetchAnalytics: async (period: AnalyticsPeriod) => {
       const state = get();
       
       // 캐시 확인 (5분 이내면 스킵)
       if (state.lastUpdated && 
           Date.now() - state.lastUpdated.getTime() < 5 * 60 * 1000) {
         return;
       }

       set((state: any) => { state.isLoading = true; });
       
       try {
         const [summary, breakdown, trend, insights] = await Promise.all([
           analyticsApi.getSummary(period),
           analyticsApi.getCategoryBreakdown(period),
           analyticsApi.getMonthlyTrend(period),
           analyticsApi.getInsights(period)
         ]);

         set((state: any) => {
           state.summary = summary;
           state.categoryBreakdown = breakdown;
           state.monthlyTrend = trend;
           state.insights = insights;
           state.lastUpdated = new Date();
           state.isLoading = false;
         });
       } catch (error) {
         set((state: any) => {
           state.error = error.message;
           state.isLoading = false;
         });
       }
     }
   });
   ```

6. **퍼시스턴스 설정**
   ```typescript
   // src/stores/persistence.ts
   import { StateStorage } from 'zustand/middleware';
   import { MMKV } from 'react-native-mmkv';

   const storage = new MMKV({
     id: 'cheonmabigo-storage',
     encryptionKey: 'your-encryption-key'
   });

   export const zustandStorage: StateStorage = {
     setItem: (name, value) => {
       return storage.set(name, value);
     },
     getItem: (name) => {
       const value = storage.getString(name);
       return value ?? null;
     },
     removeItem: (name) => {
       return storage.delete(name);
     },
   };

   // 퍼시스턴트 스토어 생성
   export const usePersistentStore = create(
     persist(
       (set, get) => ({
         // 지속되어야 하는 상태만
         user: null,
         settings: defaultSettings,
         lastSyncTime: null,
       }),
       {
         name: 'cheonmabigo-storage',
         storage: zustandStorage,
         partialize: (state) => ({
           user: state.user,
           settings: state.settings,
         }),
       }
     )
   );
   ```

7. **동기화 관리**
   ```typescript
   // src/services/SyncService.ts
   export class SyncService {
     static async syncToServer() {
       const state = useAppStore.getState();
       const localTransactions = state.transactions.filter(t => !t.synced);
       
       for (const transaction of localTransactions) {
         try {
           await transactionApi.syncTransaction(transaction);
           useAppStore.getState().markTransactionSynced(transaction.id);
         } catch (error) {
           console.error('Sync failed for transaction:', transaction.id);
         }
       }
     }

     static async syncFromServer() {
       const lastSync = usePersistentStore.getState().lastSyncTime;
       const updates = await transactionApi.getUpdates(lastSync);
       
       useAppStore.getState().applyServerUpdates(updates);
       usePersistentStore.getState().setLastSyncTime(new Date());
     }
   }
   ```

8. **리액트 훅 래퍼**
   ```typescript
   // src/hooks/useStore.ts
   export const useAuth = () => {
     return useAppStore((state) => ({
       isAuthenticated: state.isAuthenticated,
       user: state.user,
       login: state.login,
       logout: state.logout,
     }));
   };

   export const useTransactions = () => {
     return useAppStore((state) => ({
       transactions: state.transactions,
       isLoading: state.isLoading,
       fetchTransactions: state.fetchTransactions,
       addTransaction: state.addTransaction,
     }));
   };

   export const useAnalytics = () => {
     return useAppStore((state) => ({
       summary: state.summary,
       insights: state.insights,
       fetchAnalytics: state.fetchAnalytics,
     }));
   };
   ```

9. **오프라인 지원**
   ```typescript
   // src/stores/offlineStore.ts
   interface OfflineState {
     isOnline: boolean;
     pendingActions: PendingAction[];
     conflictResolution: 'client' | 'server' | 'manual';
   }

   export const offlineStore = (set: any, get: any) => ({
     isOnline: true,
     pendingActions: [],
     conflictResolution: 'client' as const,

     addPendingAction: (action: PendingAction) => {
       set((state: any) => {
         state.pendingActions.push(action);
       });
     },

     processPendingActions: async () => {
       const state = get();
       if (!state.isOnline || state.pendingActions.length === 0) return;

       for (const action of state.pendingActions) {
         try {
           await action.execute();
           set((state: any) => {
             state.pendingActions = state.pendingActions.filter(a => a.id !== action.id);
           });
         } catch (error) {
           console.error('Failed to process pending action:', error);
         }
       }
     }
   });
   ```

10. **디버깅 도구**
    ```typescript
    // src/stores/devtools.ts
    if (__DEV__) {
      // Redux DevTools 연동
      const devtools = require('zustand/middleware').devtools;
      
      // 상태 변화 로깅
      useAppStore.subscribe((state, prevState) => {
        console.log('State changed:', { prev: prevState, current: state });
      });
    }
    ```

**스토어 구조**:
```
stores/
├── authStore.ts          # 인증 상태
├── transactionStore.ts   # 거래 데이터
├── analyticsStore.ts     # 분석 데이터
├── budgetStore.ts        # 예산 관리
├── settingsStore.ts      # 앱 설정
├── offlineStore.ts       # 오프라인 동기화
└── index.ts             # 스토어 결합
```

**상태 최적화**:
- 셀렉터 사용으로 불필요한 리렌더링 방지
- 상태 분할로 관심사 분리
- 미들웨어 활용한 로깅 및 퍼시스턴스
- 옵티미스틱 업데이트로 UX 향상

**추가 인수**: $ARGUMENTS (특정 스토어나 기능)

상태 관리 완료 후 `/14-gamification` 명령어로 게임화 요소를 구현하세요.