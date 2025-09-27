# 성능 최적화

천마비고 앱의 성능을 최적화하여 빠르고 부드러운 사용자 경험을 제공합니다.

## 실행할 작업

1. **번들 크기 최적화**
   ```bash
   # 번들 분석
   npm install --save-dev @react-native-community/cli-plugin-metro
   npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android-bundle.js --assets-dest android-assets --analyze
   
   # 불필요한 패키지 제거
   npm install --save-dev depcheck
   npx depcheck
   ```

2. **코드 스플리팅**
   ```typescript
   // src/utils/LazyLoad.ts
   import React, { Suspense } from 'react';
   import { ActivityIndicator, View } from 'react-native';

   // 화면 지연 로딩
   const LazyAnalyticsScreen = React.lazy(() => 
     import('../screens/analytics/AnalyticsScreen')
   );
   const LazySettingsScreen = React.lazy(() => 
     import('../screens/settings/SettingsScreen')
   );

   // 로딩 컴포넌트
   const LoadingFallback = () => (
     <View className="flex-1 justify-center items-center">
       <ActivityIndicator size="large" color="#7C3AED" />
     </View>
   );

   // 지연 로딩 래퍼
   export const withLazyLoading = (Component: React.ComponentType) => {
     return (props: any) => (
       <Suspense fallback={<LoadingFallback />}>
         <Component {...props} />
       </Suspense>
     );
   };
   ```

3. **이미지 최적화**
   ```typescript
   // src/components/optimized/OptimizedImage.tsx
   import React, { useState } from 'react';
   import { Image, ImageProps, ActivityIndicator } from 'react-native';
   import FastImage from 'react-native-fast-image';

   interface OptimizedImageProps extends Omit<ImageProps, 'source'> {
     uri: string;
     placeholder?: string;
     priority?: 'low' | 'normal' | 'high';
   }

   export const OptimizedImage: React.FC<OptimizedImageProps> = ({
     uri,
     placeholder,
     priority = 'normal',
     ...props
   }) => {
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState(false);

     return (
       <FastImage
         source={{
           uri,
           priority: FastImage.priority[priority],
           cache: FastImage.cacheControl.immutable,
         }}
         onLoadStart={() => setLoading(true)}
         onLoad={() => setLoading(false)}
         onError={() => {
           setError(true);
           setLoading(false);
         }}
         fallback={placeholder}
         {...props}
       >
         {loading && (
           <ActivityIndicator 
             size="small" 
             color="#7C3AED"
             style={{ position: 'absolute', alignSelf: 'center' }}
           />
         )}
       </FastImage>
     );
   };
   ```

4. **리스트 가상화**
   ```typescript
   // src/components/optimized/VirtualizedTransactionList.tsx
   import React, { memo, useCallback } from 'react';
   import { FlatList, ListRenderItem } from 'react-native';
   import { TransactionCard } from '../transaction/TransactionCard';

   interface VirtualizedTransactionListProps {
     transactions: Transaction[];
     onTransactionPress: (transaction: Transaction) => void;
   }

   const ITEM_HEIGHT = 80;

   export const VirtualizedTransactionList: React.FC<VirtualizedTransactionListProps> = memo(({
     transactions,
     onTransactionPress
   }) => {
     const renderItem: ListRenderItem<Transaction> = useCallback(({ item }) => (
       <TransactionCard 
         transaction={item} 
         onPress={() => onTransactionPress(item)}
       />
     ), [onTransactionPress]);

     const getItemLayout = useCallback((data: any, index: number) => ({
       length: ITEM_HEIGHT,
       offset: ITEM_HEIGHT * index,
       index,
     }), []);

     const keyExtractor = useCallback((item: Transaction) => item.id, []);

     return (
       <FlatList
         data={transactions}
         renderItem={renderItem}
         keyExtractor={keyExtractor}
         getItemLayout={getItemLayout}
         removeClippedSubviews={true}
         maxToRenderPerBatch={10}
         updateCellsBatchingPeriod={50}
         initialNumToRender={10}
         windowSize={10}
         maintainVisibleContentPosition={{
           minIndexForVisible: 0,
           autoscrollToTopThreshold: 100,
         }}
       />
     );
   });
   ```

5. **메모이제이션 최적화**
   ```typescript
   // src/hooks/useMemoizedCalculations.ts
   import { useMemo } from 'react';
   import { Transaction } from '../types';

   export const useMemoizedCalculations = (transactions: Transaction[]) => {
     const totalSpent = useMemo(() => 
       transactions
         .filter(t => !t.isIncome)
         .reduce((sum, t) => sum + t.amount, 0),
       [transactions]
     );

     const categoryBreakdown = useMemo(() => {
       const breakdown: Record<string, number> = {};
       transactions
         .filter(t => !t.isIncome)
         .forEach(t => {
           breakdown[t.category] = (breakdown[t.category] || 0) + t.amount;
         });
       return breakdown;
     }, [transactions]);

     const monthlyTrend = useMemo(() => {
       const months: Record<string, number> = {};
       transactions.forEach(t => {
         const month = t.date.toISOString().slice(0, 7);
         months[month] = (months[month] || 0) + t.amount;
       });
       return Object.entries(months).map(([month, amount]) => ({ month, amount }));
     }, [transactions]);

     return { totalSpent, categoryBreakdown, monthlyTrend };
   };
   ```

6. **상태 업데이트 최적화**
   ```typescript
   // src/hooks/useOptimizedStore.ts
   import { useAppStore } from '../stores';
   import { shallow } from 'zustand/shallow';

   // 필요한 상태만 구독하여 불필요한 리렌더링 방지
   export const useTransactionSummary = () => {
     return useAppStore(
       (state) => ({
         totalTransactions: state.transactions.length,
         totalAmount: state.transactions.reduce((sum, t) => sum + t.amount, 0),
         isLoading: state.isLoading,
       }),
       shallow
     );
   };

   export const useTransactionActions = () => {
     return useAppStore(
       (state) => ({
         addTransaction: state.addTransaction,
         updateTransaction: state.updateTransaction,
         deleteTransaction: state.deleteTransaction,
       }),
       shallow
     );
   };
   ```

7. **AI 응답 최적화**
   ```typescript
   // src/services/ai/OptimizedExaoneService.ts
   export class OptimizedExaoneService {
     private static cache = new Map<string, AIResponse>();
     private static requestQueue: Array<{ text: string; resolve: Function; reject: Function }> = [];
     private static isProcessing = false;

     // 응답 캐싱
     static async processMessageWithCache(text: string): Promise<AIResponse> {
       const cacheKey = this.generateCacheKey(text);
       
       if (this.cache.has(cacheKey)) {
         return this.cache.get(cacheKey)!;
       }

       const response = await this.processMessage(text);
       this.cache.set(cacheKey, response);
       
       // 캐시 크기 제한
       if (this.cache.size > 100) {
         const firstKey = this.cache.keys().next().value;
         this.cache.delete(firstKey);
       }

       return response;
     }

     // 배치 처리
     static async batchProcessMessages(texts: string[]): Promise<AIResponse[]> {
       return Promise.all(texts.map(text => this.processMessageWithCache(text)));
     }

     // 요청 큐잉
     static async queueMessage(text: string): Promise<AIResponse> {
       return new Promise((resolve, reject) => {
         this.requestQueue.push({ text, resolve, reject });
         this.processQueue();
       });
     }

     private static async processQueue() {
       if (this.isProcessing || this.requestQueue.length === 0) return;

       this.isProcessing = true;
       const batch = this.requestQueue.splice(0, 3); // 3개씩 배치 처리

       try {
         const results = await this.batchProcessMessages(
           batch.map(item => item.text)
         );

         batch.forEach((item, index) => {
           item.resolve(results[index]);
         });
       } catch (error) {
         batch.forEach(item => item.reject(error));
       }

       this.isProcessing = false;
       this.processQueue(); // 남은 큐 처리
     }
   }
   ```

8. **네트워크 최적화**
   ```typescript
   // src/services/api/OptimizedApiClient.ts
   export class OptimizedApiClient {
     private cache = new Map<string, { data: any; timestamp: number }>();
     private requestsInFlight = new Map<string, Promise<any>>();

     async get<T>(url: string, options: RequestOptions = {}): Promise<T> {
       const cacheKey = this.generateCacheKey(url, options);
       
       // 캐시 확인
       if (options.cache && this.isCacheValid(cacheKey, options.cacheTTL)) {
         return this.cache.get(cacheKey)!.data;
       }

       // 중복 요청 방지
       if (this.requestsInFlight.has(cacheKey)) {
         return this.requestsInFlight.get(cacheKey)!;
       }

       const requestPromise = this.makeRequest<T>(url, { method: 'GET', ...options });
       this.requestsInFlight.set(cacheKey, requestPromise);

       try {
         const data = await requestPromise;
         
         if (options.cache) {
           this.cache.set(cacheKey, { data, timestamp: Date.now() });
         }

         return data;
       } finally {
         this.requestsInFlight.delete(cacheKey);
       }
     }

     // 요청 압축
     async batchRequests<T>(requests: BatchRequest[]): Promise<T[]> {
       const response = await this.makeRequest('/api/batch', {
         method: 'POST',
         body: JSON.stringify({ requests }),
       });

       return response.results;
     }
   }
   ```

9. **렌더링 최적화**
   ```typescript
   // src/components/optimized/MemoizedComponents.tsx
   import React, { memo } from 'react';

   // 거래 카드 메모이제이션
   export const MemoizedTransactionCard = memo<TransactionCardProps>(({ transaction, onPress }) => {
     return (
       <TransactionCard transaction={transaction} onPress={onPress} />
     );
   }, (prevProps, nextProps) => {
     // 깊은 비교 대신 필요한 속성만 비교
     return (
       prevProps.transaction.id === nextProps.transaction.id &&
       prevProps.transaction.amount === nextProps.transaction.amount &&
       prevProps.transaction.description === nextProps.transaction.description
     );
   });

   // 차트 컴포넌트 메모이제이션
   export const MemoizedChart = memo<ChartProps>(({ data, type }) => {
     return <Chart data={data} type={type} />;
   }, (prevProps, nextProps) => {
     return (
       prevProps.type === nextProps.type &&
       JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data)
     );
   });
   ```

10. **배터리 및 성능 모니터링**
    ```typescript
    // src/utils/PerformanceMonitor.ts
    export class PerformanceMonitor {
      private static metrics: Record<string, number[]> = {};

      static startMeasure(name: string): void {
        performance.mark(`${name}-start`);
      }

      static endMeasure(name: string): number {
        performance.mark(`${name}-end`);
        performance.measure(name, `${name}-start`, `${name}-end`);
        
        const entries = performance.getEntriesByName(name);
        const duration = entries[entries.length - 1].duration;
        
        if (!this.metrics[name]) {
          this.metrics[name] = [];
        }
        this.metrics[name].push(duration);

        // 메트릭 정리 (최근 100개만 유지)
        if (this.metrics[name].length > 100) {
          this.metrics[name] = this.metrics[name].slice(-100);
        }

        return duration;
      }

      static getAverageTime(name: string): number {
        const times = this.metrics[name] || [];
        return times.reduce((sum, time) => sum + time, 0) / times.length;
      }

      static reportSlowOperations(): void {
        Object.entries(this.metrics).forEach(([name, times]) => {
          const avg = times.reduce((sum, time) => sum + time, 0) / times.length;
          if (avg > 100) { // 100ms 이상인 경우
            console.warn(`Slow operation detected: ${name} - ${avg.toFixed(2)}ms`);
          }
        });
      }
    }

    // 사용 예시
    export const withPerformanceTracking = (name: string) => 
      (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
        const method = descriptor.value;
        descriptor.value = function (...args: any[]) {
          PerformanceMonitor.startMeasure(name);
          const result = method.apply(this, args);
          
          if (result instanceof Promise) {
            return result.finally(() => {
              PerformanceMonitor.endMeasure(name);
            });
          } else {
            PerformanceMonitor.endMeasure(name);
            return result;
          }
        };
      };
    ```

**성능 목표**:
- 앱 시작 시간: < 3초
- 화면 전환: < 500ms
- AI 응답: < 2초
- 리스트 스크롤: 60fps 유지
- 메모리 사용량: < 200MB

**모니터링 도구**:
- Flipper를 통한 네트워크 및 레이아웃 분석
- React Native Performance Monitor
- Metro Bundle Analyzer
- Android/iOS 프로파일링 도구

**추가 인수**: $ARGUMENTS (특정 최적화 영역)

성능 최적화 완료 후 `/17-deployment` 명령어로 배포를 준비하세요.