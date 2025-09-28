# 천마비고 (Cheonma-Bigo) 전체 시스템 개요

## 🎯 프로젝트 개요

**천마비고**는 자연어 상호작용을 통한 대화형 AI 재정 코치 모바일 애플리케이션입니다.
사용자가 AI와 대화만으로 재정을 관리할 수 있어, 기존 복잡한 가계부 앱의 한계를 극복합니다.

### 핵심 가치
- **대화형 UX**: 친구와 채팅하듯 쉬운 재정 관리
- **AI 코치**: 개인화된 재정 조언과 인사이트
- **한국어 특화**: EXAONE 모델 기반 한국 문화/언어 최적화
- **모바일 최우선**: MZ세대를 위한 직관적 모바일 경험

---

## 🏗️ 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend (React Native)                     │
├─────────────────────────────────────────────────────────────────┤
│  📱 UI Layer                │  🎨 Components                     │
│  • Screens (홈/채팅/분석/설정)  │  • UI Components (Button/Card)   │
│  • Navigation (Expo Router)  │  • Chat Components                │
│  • State Management (Zustand)│  • Voice Components               │
├─────────────────────────────────────────────────────────────────┤
│  🤖 AI Service Layer                                            │
│  • CheonmaBigoAI (통합 AI 서비스)                                 │
│  • ExaoneService (LGAI 모델)                                    │
│  • Intent Classification                                        │
│  • Response Processing                                          │
├─────────────────────────────────────────────────────────────────┤
│  💾 Data Layer                                                 │
│  • Local Storage (AsyncStorage)                                │
│  • Chat Store (대화 기록)                                        │
│  • User Context (사용자 데이터)                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📱 Frontend 아키텍처 상세

### 1. 기술 스택

| 분야 | 기술 | 버전 | 목적 |
|------|------|------|------|
| **Framework** | React Native | 0.81.4 | 크로스 플랫폼 모바일 개발 |
| **Language** | TypeScript | 5.9.2 | 타입 안전성과 개발 경험 향상 |
| **Navigation** | Expo Router | 6.0.8 | 파일 기반 내비게이션 |
| **Styling** | NativeWind | 4.2.1 | Tailwind CSS for React Native |
| **State** | Zustand | 5.0.8 | 간단하고 강력한 상태 관리 |
| **Animation** | Reanimated | 4.1.2 | 고성능 애니메이션 |
| **AI** | @xenova/transformers | 2.17.2 | EXAONE 모델 통합 |
| **Voice** | @react-native-voice/voice | 3.2.4 | 음성 인식 |

### 2. 폴더 구조

```
src/
├── components/           # 재사용 가능한 UI 컴포넌트
│   ├── ui/              # 기본 UI 요소 (Button, Card, Input 등)
│   ├── chat/            # 채팅 관련 컴포넌트
│   ├── layout/          # 레이아웃 컴포넌트
│   └── voice/           # 음성 입력 컴포넌트
├── screens/             # 화면별 컴포넌트
│   └── chat/            # 채팅 화면
├── services/            # 비즈니스 로직 및 외부 서비스
│   ├── ai/              # AI 관련 서비스 (EXAONE, 프롬프트 등)
│   └── voice/           # 음성 처리 서비스
├── stores/              # 전역 상태 관리 (Zustand)
├── types/               # TypeScript 타입 정의
├── utils/               # 유틸리티 함수
└── constants/           # 상수 정의 (색상, 디자인 등)

app/                     # Expo Router 라우팅
├── (tabs)/              # 탭 네비게이션
│   ├── index.tsx        # 홈 화면
│   ├── chat.tsx         # AI 채팅 화면
│   ├── analytics.tsx    # 분석 화면
│   └── settings.tsx     # 설정 화면
├── transaction/         # 거래 상세 화면
├── goal/                # 목표 설정 화면
└── onboarding/          # 온보딩 화면
```

### 3. 컴포넌트 구조

```typescript
// 기본 UI 컴포넌트
export interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
}

// 채팅 관련 컴포넌트
export interface MessageBubbleProps {
  message: ChatMessage;
  isUser: boolean;
  timestamp: Date;
}

// 레이아웃 컴포넌트
export interface ScreenProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  scrollable?: boolean;
}
```

---

## 🤖 AI 시스템 아키텍처

### 1. AI 서비스 계층 구조

```
CheonmaBigoAI (통합 AI 서비스)
├── ExaoneService          # LGAI EXAONE 3.5 7.8B 모델 처리
├── PromptManager          # 시스템 프롬프트 및 컨텍스트 관리
├── ResponseParser         # AI 응답 파싱 및 구조화
├── IntentClassifier       # 사용자 의도 분류
└── AIOptimizer           # 캐싱, 최적화, 메트릭
```

### 2. 핵심 AI 기능

| 기능 | 클래스 | 설명 |
|------|-------|------|
| **메시지 처리** | `CheonmaBigoAI.processMessage()` | 사용자 입력을 종합적으로 처리 |
| **거래 추출** | `CheonmaBigoAI.recordTransaction()` | "커피 5천원" → Transaction 객체 |
| **재정 조언** | `CheonmaBigoAI.getFinancialAdvice()` | 개인화된 재정 조언 생성 |
| **지출 분석** | `CheonmaBigoAI.analyzeSpending()` | 패턴 분석 및 인사이트 |
| **의도 분류** | `IntentClassifier.classifyIntent()` | 5가지 의도로 분류 |

### 3. 의도 분류 시스템

```typescript
export type MessageIntent =
  | 'transaction_record'    // 거래 기록: "커피 5천원 샀어"
  | 'financial_advice'     // 재정 조언: "돈 어떻게 모으지?"
  | 'spending_analysis'    // 지출 분석: "이번 달 얼마 썼지?"
  | 'goal_setting'         // 목표 설정: "100만원 모으고 싶어"
  | 'general_question'     // 일반 질문: "안녕하세요"
  | 'greeting'             // 인사: "안녕"
  | 'unknown';             // 알 수 없음
```

### 4. 응답 처리 플로우

```
사용자 입력
    ↓
의도 분류 (IntentClassifier)
    ↓
캐시 확인 (AIOptimizer)
    ↓
EXAONE 모델 처리 (ExaoneService)
    ↓
응답 파싱 (ResponseParser)
    ↓
거래 정보 추출 (필요시)
    ↓
응답 캐싱 및 메트릭 업데이트
    ↓
사용자에게 응답 반환
```

---

## 📊 데이터 모델

### 1. 핵심 타입 정의

```typescript
// 거래 정보
interface Transaction {
  id: string;
  title: string;           // "스타벅스 아메리카노"
  amount: number;          // 5000
  category: string;        // "카페/음료"
  date: Date;             // 거래 일시
  location?: string;       // "강남역점"
  paymentMethod: PaymentMethod;  // "card"
  memo?: string;          // 추가 메모
  tags: string[];         // ["커피", "간식"]
  isRecurring: boolean;   // 정기 결제 여부
}

// 사용자 컨텍스트
interface UserContext {
  recentTransactions: Transaction[];
  monthlyBudget?: number;
  savingsGoals: Goal[];
  preferences: UserPreferences;
  spendingPatterns: SpendingPattern[];
}

// AI 응답
interface AIResponse {
  id: string;
  content: string;         // "커피값 5천원 기록했어요! ☕"
  intent: MessageIntent;   // "transaction_record"
  confidence: number;      // 0.95
  suggestions?: string[];  // ["예산 확인하기", "절약 팁 보기"]
  extractedData?: any;     // 추출된 구조화 데이터
  metadata: {
    tokensUsed: number;
    responseTime: number;
    modelVersion: string;
  };
}

// 채팅 메시지
interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  type: 'text' | 'transaction' | 'insight' | 'suggestion';
  timestamp: Date;
  metadata?: Record<string, any>;
}
```

### 2. 상태 관리 (Zustand)

```typescript
// 채팅 스토어
interface ChatStore {
  messages: ChatMessage[];
  isLoading: boolean;
  currentSessionId?: string;
  
  // Actions
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
  setLoading: (loading: boolean) => void;
  startNewSession: () => void;
}

// 사용자 스토어 (예정)
interface UserStore {
  user?: User;
  transactions: Transaction[];
  goals: Goal[];
  
  // Actions
  addTransaction: (transaction: Transaction) => void;
  updateGoal: (goalId: string, updates: Partial<Goal>) => void;
}
```

---

## 🎨 디자인 시스템

### 1. 색상 팔레트

```typescript
const colors = {
  // Primary Colors (메인 보라색)
  primary: {
    50: '#f3e8ff',
    500: '#7c3aed',   // 메인 브랜드 컬러
    600: '#6d28d9',
    900: '#4c1d95',
  },
  
  // Neutral Colors
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    500: '#6b7280',
    900: '#1f2937',   // 텍스트 색상
  },
  
  // Status Colors
  success: '#10b981',   // 녹색
  warning: '#f59e0b',   // 주황색
  error: '#ef4444',     // 빨간색
  info: '#3b82f6',      // 파란색
};
```

### 2. 타이포그래피

```typescript
const typography = {
  heading: {
    h1: { fontSize: 32, fontWeight: '700', lineHeight: 40 },
    h2: { fontSize: 24, fontWeight: '600', lineHeight: 32 },
    h3: { fontSize: 20, fontWeight: '600', lineHeight: 28 },
  },
  body: {
    large: { fontSize: 18, fontWeight: '400', lineHeight: 28 },
    medium: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
    small: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  },
};
```

### 3. 컴포넌트 스타일

```typescript
// 버튼 변형
const buttonVariants = {
  primary: 'bg-primary-500 text-white',
  secondary: 'bg-neutral-100 text-neutral-900',
  outline: 'border-2 border-primary-500 text-primary-500',
  ghost: 'text-primary-500 hover:bg-primary-50',
};

// 카드 스타일
const cardStyles = {
  base: 'bg-white rounded-2xl shadow-sm border border-neutral-100',
  elevated: 'bg-white rounded-2xl shadow-lg',
  highlighted: 'bg-primary-50 border-primary-200',
};
```

---

## 📱 화면 구성

### 1. 탭 구조

| 탭 | 화면명 | 파일 경로 | 주요 기능 |
|----|--------|-----------|----------|
| 🏠 | 홈 | `app/(tabs)/index.tsx` | 대시보드, 최근 거래, 퀵액션 |
| 💬 | AI 상담 | `app/(tabs)/chat.tsx` | AI와 채팅, 거래 기록, 조언 |
| 📊 | 분석 | `app/(tabs)/analytics.tsx` | 지출 분석, 차트, 인사이트 |
| ⚙️ | 설정 | `app/(tabs)/settings.tsx` | 앱 설정, 계정 관리 |

### 2. 모달 화면

| 화면 | 파일 경로 | 설명 |
|------|-----------|------|
| 거래 상세 | `app/transaction/[id].tsx` | 개별 거래 상세 정보 |
| 목표 생성 | `app/goal/create.tsx` | 저축/예산 목표 설정 |
| 온보딩 | `app/onboarding/*` | 초기 설정 및 가이드 |

### 3. 주요 화면 레이아웃

```typescript
// 채팅 화면 구조
<ChatScreen>
  <ChatHeader />           // 상단 헤더 (AI 상태, 설정)
  <MessageList />          // 메시지 리스트 (스크롤 가능)
  <TypingIndicator />      // AI 응답 대기 표시
  <MessageInput />         // 텍스트/음성 입력
  <VoiceInput />          // 음성 녹음 버튼
</ChatScreen>

// 홈 화면 구조
<HomeScreen>
  <WelcomeHeader />        // 인사말 및 요약
  <QuickActions />         // 빠른 액션 버튼들
  <RecentTransactions />   // 최근 거래 목록
  <InsightCards />         // AI 인사이트 카드
  <GoalProgress />         // 목표 진행률
</HomeScreen>
```

---

## 🔧 개발 환경 설정

### 1. 필수 설정

```bash
# 프로젝트 설정
npm install
npx expo install

# 개발 서버 실행
npm run start        # Expo 개발 서버
npm run ios         # iOS 시뮬레이터
npm run android     # Android 에뮬레이터

# 코드 품질
npm run lint        # ESLint 검사
npm run typecheck   # TypeScript 타입 검사
npm run format      # Prettier 포맷팅
```

### 2. 환경 변수 (.env)

```bash
# Hugging Face Token (EXAONE 모델용)
EXPO_PUBLIC_HF_TOKEN=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
HF_TOKEN=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

# EXAONE 모델 설정
EXPO_PUBLIC_EXAONE_MODEL=LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct
```

### 3. 개발 도구

| 도구 | 용도 | 설정 |
|------|------|------|
| **ESLint** | 코드 품질 검사 | `eslint.config.js` |
| **Prettier** | 코드 포맷팅 | `.prettierrc` |
| **TypeScript** | 타입 검사 | `tsconfig.json` |
| **Tailwind** | 스타일링 | `nativewind.config.js` |

---

## 🚀 개발 로드맵

### Phase 1: 기반 구조 (완료)
- ✅ 프로젝트 설정 및 의존성 설치
- ✅ 기본 네비게이션 구조
- ✅ 디자인 시스템 컴포넌트
- ✅ AI 서비스 기반 구조
- ✅ 타입 정의 및 상태 관리

### Phase 2: 핵심 기능 (현재 진행)
- 🔄 채팅 인터페이스 구현
- 🔄 음성 입력 시스템
- 🔄 EXAONE 모델 통합
- 🔄 거래 기록 시스템
- 🔄 기본 분석 기능

### Phase 3: 고급 기능 (예정)
- ⏳ 예산 관리 시스템
- ⏳ 목표 설정 및 추적
- ⏳ 데이터 시각화
- ⏳ 알림 시스템
- ⏳ 온보딩 플로우

### Phase 4: 최적화 (예정)
- ⏳ 성능 최적화
- ⏳ 오프라인 지원
- ⏳ 백엔드 통합
- ⏳ 테스트 추가
- ⏳ 배포 준비

---

## 📋 다음 단계 가이드

### 즉시 시작 가능한 작업

1. **채팅 인터페이스 완성** (6번 명령어)
   - `MessageBubble` 컴포넌트 구현
   - `MessageInput` 컴포넌트 개선
   - 실시간 채팅 플로우 연결

2. **음성 입력 구현** (7번 명령어)
   - React Native Voice 설정
   - 음성 → 텍스트 변환
   - UI/UX 개선

3. **거래 시스템 구축** (8번 명령어)
   - 거래 데이터 저장
   - 카테고리 분류
   - 거래 내역 화면

### 개발 우선순위

| 우선순위 | 기능 | 예상 시간 | 의존성 |
|----------|------|-----------|--------|
| **높음** | 채팅 UI 완성 | 1-2일 | 기존 컴포넌트 |
| **높음** | AI 응답 연결 | 2-3일 | EXAONE 모델 |
| **중간** | 음성 입력 | 2-3일 | 권한 설정 |
| **중간** | 거래 저장소 | 2-3일 | AsyncStorage |
| **낮음** | 분석 차트 | 3-4일 | 거래 데이터 |

---

## 🎯 성공 기준

### 기술적 목표
- **성능**: 앱 시작 < 3초, AI 응답 < 2초
- **안정성**: 크래시율 < 0.1%
- **접근성**: VoiceOver/TalkBack 지원
- **오프라인**: 기본 기능 오프라인 동작

### 사용자 경험 목표
- **직관성**: 첫 사용에서 5분 내 거래 기록 성공
- **정확성**: AI 거래 추출 정확도 > 90%
- **유용성**: 일일 활성 사용자 유지율 > 70%
- **만족도**: 앱스토어 평점 > 4.5점

---

이 문서는 천마비고 프로젝트의 전체적인 구조와 개발 방향을 제시합니다. 
프론트엔드 개발 시 이 문서를 참고하여 일관된 아키텍처와 코드 품질을 유지하세요.

마지막 업데이트: 2025-01-27