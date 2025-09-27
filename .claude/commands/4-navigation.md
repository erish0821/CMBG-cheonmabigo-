# 내비게이션 구조 설정

Expo Router를 사용하여 앱의 내비게이션 시스템을 구축합니다.

## 실행할 작업

1. **Expo Router 설치 및 설정**
   ```bash
   npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar
   ```

2. **앱 진입점 설정**
   - `app/_layout.tsx` - 루트 레이아웃
   - `app/(tabs)/_layout.tsx` - 탭 네비게이션 레이아웃
   - expo-router 설정 파일

3. **하단 탭 네비게이션 구성**
   - 홈 탭: 메인 대시보드
   - AI 대화 탭: 채팅 인터페이스
   - 분석 탭: 지출 분석 및 차트
   - 설정 탭: 사용자 설정

4. **화면 파일 생성**
   - `app/(tabs)/index.tsx` - 홈 화면 (대시보드)
   - `app/(tabs)/chat.tsx` - AI 채팅 화면
   - `app/(tabs)/analytics.tsx` - 분석 화면
   - `app/(tabs)/settings.tsx` - 설정 화면

5. **모달 및 스택 네비게이션**
   - `app/transaction/[id].tsx` - 거래 상세 화면
   - `app/goal/create.tsx` - 목표 생성 화면
   - `app/onboarding/` - 온보딩 플로우

6. **네비게이션 애니메이션**
   - 부드러운 화면 전환
   - 탭 간 애니메이션
   - 모달 프레젠테이션 스타일

7. **타입 안전성**
   - 네비게이션 타입 정의
   - 라우트 파라미터 타입
   - TypeScript 설정

8. **네비게이션 헬퍼**
   - 네비게이션 유틸리티 함수
   - 딥링크 처리
   - 백 버튼 핸들링

**화면 구조**:
```
app/
├── _layout.tsx
├── (tabs)/
│   ├── _layout.tsx
│   ├── index.tsx         # 홈 (대시보드)
│   ├── chat.tsx          # AI 대화
│   ├── analytics.tsx     # 분석
│   └── settings.tsx      # 설정
├── transaction/
│   └── [id].tsx
├── goal/
│   └── create.tsx
└── onboarding/
    ├── welcome.tsx
    └── setup.tsx
```

**추가 인수**: $ARGUMENTS (특정 화면이나 네비게이션 옵션)

내비게이션 설정 완료 후 `/5-ai-integration` 명령어로 AI 통합을 시작하세요.