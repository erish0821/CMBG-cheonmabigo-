# 시스템 상태 확인

천마비고 앱의 전반적인 시스템 상태를 점검하고 이상 유무를 확인합니다.

## 실행할 작업

1. **개발 환경 상태 확인**
   ```bash
   # Node.js 및 React Native 환경 체크
   echo "📋 Development Environment Status Check"
   echo "=================================="
   
   echo "Node.js version:"
   node --version
   
   echo "NPM version:"
   npm --version
   
   echo "React Native CLI:"
   npx react-native --version
   
   echo "iOS Simulator:"
   xcrun simctl list devices | grep "Booted" || echo "No iOS simulators running"
   
   echo "Android Emulator:"
   adb devices
   ```

2. **프로젝트 의존성 상태**
   ```typescript
   // 패키지 버전 및 호환성 체크
   export const checkDependencies = async () => {
     console.log('📦 Checking Dependencies...');
     
     const packageJson = require('../../package.json');
     const dependencies = packageJson.dependencies;
     const devDependencies = packageJson.devDependencies;
     
     console.log('Main Dependencies:');
     Object.entries(dependencies).forEach(([name, version]) => {
       console.log(`  ${name}: ${version}`);
     });
     
     console.log('\nDev Dependencies:');
     Object.entries(devDependencies).forEach(([name, version]) => {
       console.log(`  ${name}: ${version}`);
     });
     
     // 보안 취약점 체크
     try {
       const audit = await execAsync('npm audit --json');
       const auditResult = JSON.parse(audit);
       console.log(`\n🔒 Security Audit: ${auditResult.metadata.totalDependencies} packages checked`);
       console.log(`Vulnerabilities: ${auditResult.metadata.vulnerabilities.total}`);
     } catch (error) {
       console.log('Security audit failed:', error.message);
     }
   };
   ```

3. **백엔드 API 연결 상태**
   ```typescript
   // API 서버 헬스 체크
   export const checkBackendHealth = async () => {
     console.log('🌐 Backend API Health Check...');
     
     const endpoints = [
       { name: 'API Server', url: Config.API_BASE_URL + '/health' },
       { name: 'AI Service', url: Config.EXAONE_API_ENDPOINT + '/health' },
       { name: 'Database', url: Config.API_BASE_URL + '/health/db' },
       { name: 'Redis', url: Config.API_BASE_URL + '/health/redis' }
     ];
     
     for (const endpoint of endpoints) {
       try {
         const startTime = Date.now();
         const response = await fetch(endpoint.url, { 
           timeout: 5000,
           headers: { 'User-Agent': 'CheonmaBigo-HealthCheck' }
         });
         const endTime = Date.now();
         
         if (response.ok) {
           console.log(`✅ ${endpoint.name}: OK (${endTime - startTime}ms)`);
         } else {
           console.log(`❌ ${endpoint.name}: Failed (${response.status})`);
         }
       } catch (error) {
         console.log(`❌ ${endpoint.name}: Error - ${error.message}`);
       }
     }
   };
   ```

4. **데이터베이스 연결 및 상태**
   ```typescript
   // 로컬 저장소 상태 확인
   export const checkLocalStorage = async () => {
     console.log('💾 Local Storage Status...');
     
     try {
       // AsyncStorage 체크
       const keys = await AsyncStorage.getAllKeys();
       console.log(`AsyncStorage: ${keys.length} keys stored`);
       
       // 사용자 데이터 확인
       const userData = await AsyncStorage.getItem('user');
       console.log('User data:', userData ? 'Present' : 'Not found');
       
       // 토큰 상태 확인
       const accessToken = await AuthManager.getAccessToken();
       const refreshToken = await AuthManager.getRefreshToken();
       console.log('Access token:', accessToken ? 'Present' : 'Missing');
       console.log('Refresh token:', refreshToken ? 'Present' : 'Missing');
       
       // MMKV 상태 (if using)
       if (storage) {
         const allKeys = storage.getAllKeys();
         console.log(`MMKV storage: ${allKeys.length} keys`);
       }
       
     } catch (error) {
       console.error('Local storage check failed:', error);
     }
   };
   ```

5. **앱 상태 및 성능**
   ```typescript
   // 현재 앱 상태 점검
   export const checkAppState = () => {
     console.log('📱 App State Check...');
     
     // 메모리 사용량
     if (performance.memory) {
       const memory = performance.memory;
       console.log('Memory usage:', {
         used: `${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB`,
         total: `${Math.round(memory.totalJSHeapSize / 1024 / 1024)}MB`,
         limit: `${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)}MB`
       });
     }
     
     // 현재 라우트
     const currentRoute = getCurrentRoute();
     console.log('Current route:', currentRoute);
     
     // 활성 모달
     const activeModals = getActiveModals();
     console.log('Active modals:', activeModals.length);
     
     // 네트워크 상태
     NetInfo.fetch().then(state => {
       console.log('Network:', {
         connected: state.isConnected,
         type: state.type,
         strength: state.details?.strength
       });
     });
   };
   ```

6. **AI 서비스 상태**
   ```typescript
   // AI 모델 연결 및 성능 체크
   export const checkAIStatus = async () => {
     console.log('🤖 AI Service Status...');
     
     try {
       // 모델 로드 상태
       const modelStatus = await ExaoneService.getModelStatus();
       console.log('Model status:', modelStatus);
       
       // 테스트 요청
       const testPrompts = [
         '김치찌개 8천원 먹었어',
         '스타벅스 아메리카노 5500원',
         '지하철비 1370원'
       ];
       
       for (const prompt of testPrompts) {
         const startTime = Date.now();
         try {
           const response = await ExaoneService.processMessage(prompt);
           const endTime = Date.now();
           console.log(`✅ AI Response (${endTime - startTime}ms):`, {
             prompt: prompt.substring(0, 20) + '...',
             confidence: response.confidence,
             success: true
           });
         } catch (error) {
           console.log(`❌ AI Request failed:`, error.message);
         }
       }
       
     } catch (error) {
       console.error('AI status check failed:', error);
     }
   };
   ```

7. **권한 및 보안 상태**
   ```typescript
   // 권한 상태 확인
   export const checkPermissions = async () => {
     console.log('🔐 Permissions Status...');
     
     try {
       // 마이크 권한
       const micPermission = await check(PERMISSIONS.ANDROID.RECORD_AUDIO);
       console.log('Microphone permission:', micPermission);
       
       // 카메라 권한 (영수증 촬영용)
       const cameraPermission = await check(PERMISSIONS.ANDROID.CAMERA);
       console.log('Camera permission:', cameraPermission);
       
       // 저장소 권한
       const storagePermission = await check(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
       console.log('Storage permission:', storagePermission);
       
       // 생체 인증 가능 여부
       const biometricType = await TouchID.isSupported();
       console.log('Biometric support:', biometricType);
       
     } catch (error) {
       console.error('Permission check failed:', error);
     }
   };
   ```

8. **빌드 및 버전 정보**
   ```typescript
   // 빌드 정보 확인
   export const checkBuildInfo = () => {
     console.log('🏗️ Build Information...');
     
     const buildInfo = {
       appName: DeviceInfo.getApplicationName(),
       version: DeviceInfo.getVersion(),
       buildNumber: DeviceInfo.getBuildNumber(),
       bundleId: DeviceInfo.getBundleId(),
       environment: Config.ENVIRONMENT,
       debugMode: __DEV__,
       platform: Platform.OS,
       platformVersion: Platform.Version,
       device: DeviceInfo.getDeviceId(),
       systemName: DeviceInfo.getSystemName(),
       systemVersion: DeviceInfo.getSystemVersion()
     };
     
     console.log('Build info:', buildInfo);
     return buildInfo;
   };
   ```

9. **종합 상태 리포트**
   ```typescript
   // 전체 시스템 상태 종합 체크
   export const generateStatusReport = async () => {
     console.log('📊 Generating System Status Report...');
     console.log('=====================================');
     
     const report = {
       timestamp: new Date().toISOString(),
       environment: Config.ENVIRONMENT,
       checks: {}
     };
     
     try {
       // 각 상태 체크 실행
       report.checks.dependencies = await checkDependencies();
       report.checks.backend = await checkBackendHealth();
       report.checks.localStorage = await checkLocalStorage();
       report.checks.appState = checkAppState();
       report.checks.aiStatus = await checkAIStatus();
       report.checks.permissions = await checkPermissions();
       report.checks.buildInfo = checkBuildInfo();
       
       // 전체 상태 요약
       const overallStatus = Object.values(report.checks).every(check => 
         check.status === 'healthy'
       ) ? 'HEALTHY' : 'ISSUES_DETECTED';
       
       console.log('\n📋 Status Report Summary:');
       console.log(`Overall Status: ${overallStatus}`);
       console.log(`Generated: ${report.timestamp}`);
       
       // 리포트를 파일로 저장 (개발 환경에서)
       if (__DEV__) {
         await AsyncStorage.setItem('lastStatusReport', JSON.stringify(report));
         console.log('Status report saved to AsyncStorage');
       }
       
       return report;
       
     } catch (error) {
       console.error('Status report generation failed:', error);
       return { error: error.message, timestamp: new Date().toISOString() };
     }
   };
   ```

10. **자동 상태 모니터링**
    ```typescript
    // 백그라운드 상태 모니터링
    export const startStatusMonitoring = () => {
      if (!__DEV__) return; // 개발 환경에서만 실행
      
      console.log('🔄 Starting automatic status monitoring...');
      
      // 5분마다 상태 체크
      const monitoringInterval = setInterval(async () => {
        try {
          const report = await generateStatusReport();
          
          // 문제 감지 시 알림
          if (report.checks?.backend?.status === 'unhealthy') {
            console.warn('⚠️ Backend connection issues detected');
          }
          
          if (report.checks?.aiStatus?.status === 'unhealthy') {
            console.warn('⚠️ AI service issues detected');
          }
          
        } catch (error) {
          console.error('Status monitoring error:', error);
        }
      }, 5 * 60 * 1000); // 5분
      
      // 앱 종료 시 모니터링 중단
      return () => {
        clearInterval(monitoringInterval);
        console.log('Status monitoring stopped');
      };
    };
    ```

**상태 체크 결과 해석**:
- ✅ 정상: 모든 시스템이 정상 작동
- ⚠️ 경고: 일부 기능에 문제 있음
- ❌ 오류: 심각한 문제로 기능 중단

**자주 확인할 항목**:
- API 서버 연결 상태
- AI 모델 응답 시간
- 로컬 저장소 용량
- 메모리 사용량
- 네트워크 연결 품질

**추가 인수**: $ARGUMENTS (특정 시스템이나 체크 항목)