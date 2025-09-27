# 에러 수정 및 디버깅

천마비고 개발 중 발생하는 일반적인 에러들을 진단하고 수정합니다.

## 실행할 작업

1. **일반적인 React Native 에러 해결**
   ```bash
   # Metro 캐시 클리어
   npx react-native start --reset-cache
   
   # 노드 모듈 재설치
   rm -rf node_modules && npm install
   
   # iOS 재빌드
   cd ios && rm -rf build && pod install && cd ..
   
   # Android 클린 빌드
   cd android && ./gradlew clean && cd ..
   ```

2. **TypeScript 타입 에러 수정**
   ```typescript
   // 일반적인 타입 에러 패턴들
   
   // 1. Props 인터페이스 누락
   interface ComponentProps {
     title: string;
     onPress?: () => void;
     children?: React.ReactNode;
   }
   
   // 2. useState 타입 지정
   const [user, setUser] = useState<User | null>(null);
   const [loading, setLoading] = useState<boolean>(false);
   
   // 3. API 응답 타입 정의
   interface APIResponse<T> {
     success: boolean;
     data?: T;
     error?: string;
   }
   
   // 4. Event 핸들러 타입
   const handlePress = useCallback((event: GestureResponderEvent) => {
     // 핸들러 로직
   }, []);
   ```

3. **AI 서비스 연결 문제 해결**
   ```typescript
   // EXAONE API 연결 디버깅
   export const debugAIConnection = async () => {
     try {
       console.log('🔍 AI 연결 상태 확인 중...');
       
       // 1. 환경 변수 확인
       console.log('Environment:', Config.ENVIRONMENT);
       console.log('API Endpoint:', Config.EXAONE_API_ENDPOINT);
       
       // 2. 네트워크 연결 테스트
       const response = await fetch(Config.EXAONE_API_ENDPOINT + '/health');
       console.log('Network Status:', response.status);
       
       // 3. 토큰 검증
       const token = await AuthManager.getAccessToken();
       console.log('Token exists:', !!token);
       
       // 4. 테스트 요청
       const testResponse = await ExaoneService.processMessage('테스트');
       console.log('AI Response:', testResponse);
       
       return true;
     } catch (error) {
       console.error('❌ AI 연결 실패:', error);
       return false;
     }
   };
   ```

4. **네이티브 모듈 연결 문제**
   ```bash
   # iOS 링킹 문제 해결
   cd ios
   pod deintegrate
   pod cache clean --all
   pod install
   
   # Android 링킹 문제 해결
   cd android
   ./gradlew clean
   ./gradlew build
   
   # React Native 재연결
   npx react-native unlink
   npx react-native link
   ```

5. **상태 관리 디버깅**
   ```typescript
   // Zustand 상태 디버깅
   export const debugStore = () => {
     const state = useAppStore.getState();
     
     console.log('🏪 Store Debug Info:');
     console.log('- Auth State:', {
       isAuthenticated: state.isAuthenticated,
       user: state.user?.id,
       error: state.error
     });
     
     console.log('- Transaction State:', {
       count: state.transactions.length,
       isLoading: state.isLoading,
       lastTransaction: state.transactions[0]?.id
     });
     
     console.log('- Analytics State:', {
       summary: !!state.summary,
       lastUpdated: state.lastUpdated
     });
   };
   
   // 상태 변화 추적
   useAppStore.subscribe((state, prevState) => {
     if (__DEV__) {
       console.log('State changed:', {
         prev: prevState,
         current: state
       });
     }
   });
   ```

6. **UI 렌더링 문제 해결**
   ```typescript
   // 컴포넌트 렌더링 디버깅
   export const DebugComponent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
     const renderCount = useRef(0);
     
     useEffect(() => {
       renderCount.current += 1;
       console.log(`Component rendered ${renderCount.current} times`);
     });
     
     return (
       <View>
         {__DEV__ && (
           <Text style={{ fontSize: 10, color: 'red' }}>
             Renders: {renderCount.current}
           </Text>
         )}
         {children}
       </View>
     );
   };
   
   // 스타일 디버깅
   export const debugStyles = (styles: any) => {
     if (__DEV__) {
       console.log('Applied styles:', styles);
     }
     return styles;
   };
   ```

7. **네트워크 요청 디버깅**
   ```typescript
   // API 요청 로깅
   export const debugApiRequest = (url: string, options: RequestInit) => {
     if (__DEV__) {
       console.log('🌐 API Request:', {
         url,
         method: options.method,
         headers: options.headers,
         body: options.body
       });
     }
   };
   
   // 응답 로깅
   export const debugApiResponse = (url: string, response: Response, data: any) => {
     if (__DEV__) {
       console.log('📥 API Response:', {
         url,
         status: response.status,
         data
       });
     }
   };
   ```

8. **메모리 누수 디버깅**
   ```typescript
   // 메모리 사용량 모니터링
   export const monitorMemory = () => {
     if (__DEV__) {
       const checkMemory = () => {
         if (performance.memory) {
           console.log('Memory usage:', {
             used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + ' MB',
             total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) + ' MB',
             limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024) + ' MB'
           });
         }
       };
       
       setInterval(checkMemory, 10000); // 10초마다 체크
     }
   };
   
   // 리스너 정리 확인
   export const useCleanupListener = (eventName: string, listener: Function) => {
     useEffect(() => {
       const subscription = EventEmitter.addListener(eventName, listener);
       
       return () => {
         subscription?.remove();
         console.log(`Cleaned up listener for ${eventName}`);
       };
     }, [eventName, listener]);
   };
   ```

9. **성능 병목 지점 찾기**
   ```typescript
   // 렌더링 성능 프로파일링
   export const withPerformanceTracking = <T extends {}>(
     Component: React.ComponentType<T>,
     componentName: string
   ) => {
     return React.memo((props: T) => {
       const startTime = performance.now();
       
       useEffect(() => {
         const endTime = performance.now();
         console.log(`${componentName} render time: ${endTime - startTime}ms`);
       });
       
       return <Component {...props} />;
     });
   };
   
   // 비동기 작업 성능 추적
   export const trackAsyncOperation = async <T>(
     operation: () => Promise<T>,
     operationName: string
   ): Promise<T> => {
     const startTime = performance.now();
     
     try {
       const result = await operation();
       const endTime = performance.now();
       console.log(`${operationName} completed in ${endTime - startTime}ms`);
       return result;
     } catch (error) {
       const endTime = performance.now();
       console.error(`${operationName} failed after ${endTime - startTime}ms:`, error);
       throw error;
     }
   };
   ```

10. **로그 레벨 관리**
    ```typescript
    // 로그 레벨 시스템
    enum LogLevel {
      DEBUG = 0,
      INFO = 1,
      WARN = 2,
      ERROR = 3
    }
    
    class Logger {
      private static level: LogLevel = __DEV__ ? LogLevel.DEBUG : LogLevel.ERROR;
      
      static debug(message: string, ...args: any[]) {
        if (this.level <= LogLevel.DEBUG) {
          console.log(`🐛 [DEBUG] ${message}`, ...args);
        }
      }
      
      static info(message: string, ...args: any[]) {
        if (this.level <= LogLevel.INFO) {
          console.log(`ℹ️ [INFO] ${message}`, ...args);
        }
      }
      
      static warn(message: string, ...args: any[]) {
        if (this.level <= LogLevel.WARN) {
          console.warn(`⚠️ [WARN] ${message}`, ...args);
        }
      }
      
      static error(message: string, ...args: any[]) {
        if (this.level <= LogLevel.ERROR) {
          console.error(`❌ [ERROR] ${message}`, ...args);
        }
      }
    }
    ```

**일반적인 에러 패턴들**:

1. **Metro 에러**: 캐시 문제, 포트 충돌
2. **타입 에러**: 인터페이스 불일치, null 체크 누락
3. **네이티브 모듈**: 링킹 문제, 권한 설정
4. **상태 관리**: 불변성 위반, 무한 루프
5. **네트워크**: CORS, 인증 토큰 만료
6. **UI**: 레이아웃 문제, 스타일 충돌

**디버깅 도구**:
- React Native Debugger
- Flipper
- Chrome DevTools
- Xcode Instruments (iOS)
- Android Studio Profiler

**추가 인수**: $ARGUMENTS (특정 에러 타입이나 영역)