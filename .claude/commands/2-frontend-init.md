# 프론트엔드 초기화 및 NativeWind 설정

React Native 프로젝트에 Tailwind CSS (NativeWind)를 설정하고 기본 스타일링 환경을 구축합니다.

## 실행할 작업

1. **NativeWind 설치**
   ```bash
   npm install nativewind react-native-reanimated react-native-safe-area-context@5.4.0
   npm install --dev tailwindcss@^3.4.17 prettier-plugin-tailwindcss@^0.5.11
   ```

2. **Tailwind CSS 설정**
   - `npx tailwindcss init` 실행
   - tailwind.config.js 파일 설정
   - content 경로 추가: `["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"]`

3. **글로벌 CSS 파일 생성**
   - global.css 파일 생성
   - Tailwind directives 추가:
     ```css
     @tailwind base;
     @tailwind components;
     @tailwind utilities;
     ```

4. **Metro 설정**
   - metro.config.js 파일 업데이트
   - NativeWind 플러그인 추가
   - withNativeWind 설정

5. **Babel 설정**
   - babel.config.js에 NativeWind preset 추가

6. **TypeScript 타입 설정**
   - nativewind-env.d.ts 파일 생성
   - 타입 정의 추가

7. **테스트 컴포넌트 생성**
   - 기본 스타일 테스트용 컴포넌트 작성
   - 보라색 테마 색상 확인

**추가 인수**: $ARGUMENTS (특정 설정 옵션)

설정 완료 후 `/3-design-system` 명령어로 디자인 시스템을 구축하세요.