# 천마비고 프로젝트 초기 설정

React Native 프로젝트를 생성하고 기본 개발 환경을 설정합니다.

## 실행할 작업

1. **React Native CLI 프로젝트 생성**
   - 현재 hackathon 폴더에서: `npx @react-native-community/cli@latest init . --template react-native-template-typescript`
   - 또는 새 폴더에 생성 후 파일들을 이동: `npx @react-native-community/cli@latest init CheonmaBigoTemp --template react-native-template-typescript && mv CheonmaBigoTemp/* . && rm -rf CheonmaBigoTemp`
   - TypeScript 템플릿 사용으로 타입 안전성 확보

2. **기본 디렉토리 구조 설정**
   ```
   src/
   ├── components/
   ├── screens/
   ├── services/
   ├── utils/
   ├── types/
   └── constants/
   ```

3. **필수 의존성 설치**
   - React Native Reanimated
   - React Native Safe Area Context
   - React Native Gesture Handler
   - TypeScript 타입 정의

4. **개발 도구 설정**
   - ESLint 설정
   - Prettier 설정
   - TypeScript 설정 확인
   - .gitignore 업데이트

5. **프로젝트 구조 검증**
   - 기본 실행 테스트 (iOS/Android)
   - Hot reload 확인
   - 타입 체크 실행

**추가 인수**: $ARGUMENTS (프로젝트 옵션 지정)

모든 설정이 완료되면 다음 단계인 `/2-frontend-init` 명령어를 실행하세요.