# 배포 준비

천마비고 앱을 프로덕션 환경에 배포하기 위한 빌드, 설정 및 배포 프로세스를 구성합니다.

## 실행할 작업

1. **환경 설정**
   ```bash
   # 환경 변수 관리
   npm install react-native-config
   npm install --save-dev @types/react-native-config
   
   # 보안 설정
   npm install react-native-keychain
   npm install react-native-secure-key-store
   ```

2. **환경별 설정 파일**
   ```bash
   # .env.development
   API_BASE_URL=http://localhost:3000/api
   EXAONE_API_ENDPOINT=http://localhost:8080
   LOG_LEVEL=debug
   ENVIRONMENT=development
   
   # .env.staging
   API_BASE_URL=https://staging-api.cheonmabigo.app/api
   EXAONE_API_ENDPOINT=https://staging-ai.cheonmabigo.app
   LOG_LEVEL=info
   ENVIRONMENT=staging
   
   # .env.production
   API_BASE_URL=https://api.cheonmabigo.app/api
   EXAONE_API_ENDPOINT=https://ai.cheonmabigo.app
   LOG_LEVEL=error
   ENVIRONMENT=production
   SENTRY_DSN=https://your-sentry-dsn
   ```

3. **앱 아이콘 및 스플래시 화면**
   ```typescript
   // 아이콘 설정
   // ios/천마비고/Images.xcassets/AppIcon.appiconset/
   // android/app/src/main/res/mipmap-*/ic_launcher.png
   
   // 스플래시 화면 설정
   npm install react-native-splash-screen
   
   // src/components/SplashScreen.tsx
   import SplashScreen from 'react-native-splash-screen';
   
   export const hideSplashScreen = () => {
     setTimeout(() => {
       SplashScreen.hide();
     }, 2000);
   };
   ```

4. **Android 빌드 설정**
   ```gradle
   // android/app/build.gradle
   android {
     compileSdkVersion 34
     buildToolsVersion "34.0.0"
     
     defaultConfig {
       applicationId "com.cheonmabigo.app"
       minSdkVersion 21
       targetSdkVersion 34
       versionCode 1
       versionName "1.0.0"
       multiDexEnabled true
     }
     
     signingConfigs {
       release {
         if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
           storeFile file(MYAPP_UPLOAD_STORE_FILE)
           storePassword MYAPP_UPLOAD_STORE_PASSWORD
           keyAlias MYAPP_UPLOAD_KEY_ALIAS
           keyPassword MYAPP_UPLOAD_KEY_PASSWORD
         }
       }
     }
     
     buildTypes {
       debug {
         signingConfig signingConfigs.debug
         minifyEnabled false
         proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
       }
       release {
         signingConfig signingConfigs.release
         minifyEnabled true
         proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
       }
     }
   }
   ```

5. **iOS 빌드 설정**
   ```xml
   <!-- ios/천마비고/Info.plist -->
   <dict>
     <key>CFBundleDisplayName</key>
     <string>천마비고</string>
     <key>CFBundleIdentifier</key>
     <string>com.cheonmabigo.app</string>
     <key>CFBundleVersion</key>
     <string>1</string>
     <key>CFBundleShortVersionString</key>
     <string>1.0.0</string>
     
     <!-- 권한 설정 -->
     <key>NSMicrophoneUsageDescription</key>
     <string>음성으로 거래를 기록하기 위해 마이크 권한이 필요합니다</string>
     <key>NSCameraUsageDescription</key>
     <string>영수증을 촬영하기 위해 카메라 권한이 필요합니다</string>
     
     <!-- 보안 설정 -->
     <key>NSAppTransportSecurity</key>
     <dict>
       <key>NSAllowsArbitraryLoads</key>
       <false/>
       <key>NSExceptionDomains</key>
       <dict>
         <key>cheonmabigo.app</key>
         <dict>
           <key>NSExceptionRequiresForwardSecrecy</key>
           <false/>
           <key>NSExceptionMinimumTLSVersion</key>
           <string>TLSv1.0</string>
           <key>NSIncludesSubdomains</key>
           <true/>
         </dict>
       </dict>
     </dict>
   </dict>
   ```

6. **코드 서명 및 인증서**
   ```bash
   # iOS 인증서 설정
   # 1. Apple Developer 계정에서 인증서 생성
   # 2. Provisioning Profile 생성
   # 3. Xcode에서 자동 서명 설정
   
   # Android 키스토어 생성
   keytool -genkeypair -v -storetype PKCS12 -keystore cheonmabigo-upload-key.keystore -alias cheonmabigo-key-alias -keyalg RSA -keysize 2048 -validity 10000
   
   # gradle.properties에 키스토어 정보 추가
   MYAPP_UPLOAD_STORE_FILE=cheonmabigo-upload-key.keystore
   MYAPP_UPLOAD_KEY_ALIAS=cheonmabigo-key-alias
   MYAPP_UPLOAD_STORE_PASSWORD=***
   MYAPP_UPLOAD_KEY_PASSWORD=***
   ```

7. **빌드 자동화**
   ```yaml
   # .github/workflows/build.yml
   name: Build and Deploy
   
   on:
     push:
       branches: [main, develop]
     pull_request:
       branches: [main]
   
   jobs:
     test:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: '18'
         - run: npm ci
         - run: npm run test
         - run: npm run test:e2e
   
     build-android:
       needs: test
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: '18'
         - uses: actions/setup-java@v3
           with:
             distribution: 'temurin'
             java-version: '11'
         
         - run: npm ci
         - run: cd android && ./gradlew assembleRelease
         
         - uses: actions/upload-artifact@v3
           with:
             name: android-apk
             path: android/app/build/outputs/apk/release/
   
     build-ios:
       needs: test
       runs-on: macos-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: '18'
         
         - run: npm ci
         - run: cd ios && pod install
         - run: cd ios && xcodebuild -workspace 천마비고.xcworkspace -scheme 천마비고 -configuration Release archive
   ```

8. **에러 모니터링 설정**
   ```bash
   npm install @sentry/react-native
   ```
   
   ```typescript
   // src/services/monitoring/SentryConfig.ts
   import * as Sentry from '@sentry/react-native';
   import Config from 'react-native-config';
   
   export const initSentry = () => {
     Sentry.init({
       dsn: Config.SENTRY_DSN,
       environment: Config.ENVIRONMENT,
       debug: __DEV__,
       beforeSend(event) {
         // 민감한 정보 필터링
         if (event.exception) {
           const error = event.exception.values?.[0];
           if (error?.value?.includes('password') || error?.value?.includes('token')) {
             return null;
           }
         }
         return event;
       },
     });
   };
   
   export const logError = (error: Error, extra?: Record<string, any>) => {
     if (__DEV__) {
       console.error(error);
     } else {
       Sentry.captureException(error, { extra });
     }
   };
   ```

9. **앱 스토어 배포 준비**
   ```markdown
   # App Store Connect 설정
   
   ## iOS App Store
   1. 앱 정보 입력
      - 이름: 천마비고
      - 부제목: 대화하는 AI 가계부
      - 카테고리: 금융
      - 연령 등급: 4+
   
   2. 스크린샷 준비 (각 디바이스별)
      - iPhone 6.7" (1290 x 2796)
      - iPhone 6.5" (1242 x 2688)
      - iPhone 5.5" (1242 x 2208)
      - iPad Pro 12.9" (2048 x 2732)
   
   3. 앱 설명
      - 한국어 설명문 작성
      - 키워드 최적화
      - 개인정보 처리방침 URL
   
   ## Google Play Store
   1. 앱 정보
      - 제목: 천마비고 - AI 가계부
      - 짧은 설명: 대화만으로 완성되는 스마트 가계부
      - 자세한 설명: 긴 설명문
      - 카테고리: 금융
   
   2. 그래픽 요소
      - 앱 아이콘 (512 x 512)
      - 피처 그래픽 (1024 x 500)
      - 스크린샷 (최소 2개, 최대 8개)
   
   3. 출시 설정
      - 국가/지역: 대한민국
      - 콘텐츠 등급
      - 개인정보처리방침
   ```

10. **배포 스크립트**
    ```bash
    #!/bin/bash
    # scripts/deploy.sh
    
    set -e
    
    ENVIRONMENT=${1:-staging}
    
    echo "🚀 Starting deployment for $ENVIRONMENT"
    
    # 환경별 설정 적용
    cp .env.$ENVIRONMENT .env
    
    # 의존성 설치
    echo "📦 Installing dependencies..."
    npm ci
    
    # 테스트 실행
    echo "🧪 Running tests..."
    npm run test
    npm run test:e2e
    
    # 빌드
    echo "🏗️ Building app..."
    if [ "$ENVIRONMENT" = "production" ]; then
      # 프로덕션 빌드
      npm run build:prod
    else
      # 스테이징 빌드
      npm run build:staging
    fi
    
    echo "✅ Deployment completed successfully!"
    ```

**배포 체크리스트**:
- [ ] 모든 테스트 통과
- [ ] 환경 변수 설정 완료
- [ ] 앱 아이콘 및 스플래시 화면 적용
- [ ] 권한 설정 확인
- [ ] 코드 서명 인증서 설정
- [ ] 에러 모니터링 설정
- [ ] 앱 스토어 정보 입력
- [ ] 개인정보처리방침 작성
- [ ] 출시 노트 작성

**보안 설정**:
- API 키 암호화
- 네트워크 보안 (SSL Pinning)
- 코드 난독화 (ProGuard/R8)
- 루팅/탈옥 탐지
- 개인정보 암호화

**모니터링 설정**:
- 크래시 리포팅 (Sentry)
- 사용자 행동 분석 (Firebase Analytics)
- 성능 모니터링 (Firebase Performance)
- 푸시 알림 (FCM)

**추가 인수**: $ARGUMENTS (특정 플랫폼이나 환경)

배포 준비 완료 후 debug 커맨드들을 생성합니다.