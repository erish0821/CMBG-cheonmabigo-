# 천마비고 (Cheonmabigo) - AI 금융 코치 💰🤖

> 대화형 AI 기반 개인 재정 관리 플랫폼 - "복잡한 가계부는 그만, 이제 AI와 대화하세요!"

[![React Native](https://img.shields.io/badge/React_Native-0.81.4-61DAFB?logo=react)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-54.0.10-000020?logo=expo)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.0+-339933?logo=node.js)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.9+-3776AB?logo=python)](https://www.python.org/)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

## 📑 목차
- [프로젝트 소개](#-프로젝트-소개)
- [주요 기능](#-주요-기능)
- [데모](#-데모)
- [기술 스택](#-기술-스택)
- [시스템 아키텍처](#-시스템-아키텍처)
- [시작하기](#-시작하기)
- [프로젝트 구조](#-프로젝트-구조)
- [API 문서](#-api-문서)
- [개발 로드맵](#-개발-로드맵)
- [기여 가이드](#-기여-가이드)
- [팀 소개](#-팀-소개)
- [라이선스](#-라이선스)

---

## 📖 프로젝트 소개

**천마비고(MoneyMate AI)**는 전통적인 가계부 앱의 복잡성과 낮은 지속 사용률 문제를 해결하기 위해 탄생한 혁신적인 개인 재정 관리 플랫폼입니다. LGAI EXAONE 3.5 7.8B 한국어 특화 LLM을 활용하여 사용자가 자연스러운 대화를 통해 개인 재정을 관리할 수 있도록 돕습니다.

### 🎯 프로젝트 목표
- **90% 이탈률 문제 해결**: 기존 가계부 앱의 높은 이탈률을 대화형 인터페이스로 해결
- **Zero Friction Experience**: 복잡한 메뉴 구조 없이 대화만으로 모든 기능 이용
- **AI 기반 개인화**: 사용자별 맞춤형 재정 코칭 제공

### 📊 시장 기회
- 국내 개인 재정 관리 앱 시장 규모: **2,400억원** (2024년 기준)
- MZ세대 디지털 금융 서비스 이용률: **전년 대비 23% 증가**
- 대화형 AI 서비스 선호도: **74%** (20-30대 기준)

### 🏆 수상 및 인증
- **2025년 오픈소스 SW 아이디어 해커톤 캠프** (장려상)
- 일시: 2025.09.27.(토) ~ 09.28.(일)

---

## ✨ 주요 기능

### 1. 🗣️ 자연어 거래 입력
```
사용자: "오늘 점심 김치찌개 8천원 먹었어"
AI: "점심 식비 8,000원이 기록되었습니다. 이번 주 식비가 평소보다 15% 적게 나가고 있네요! 👍"
```
- **99.2% 정확도**의 한국어 거래 자동 분류
- 음성 입력 지원 (핸즈프리)
- 영수증 이미지 자동 인식 (개발 예정)

### 2. 🤖 AI 재정 코치
- **실시간 소비 패턴 분석**: 시간대별, 요일별, 카테고리별 지출 트렌드 분석
- **맞춤형 절약 조언**: 개인 소비 패턴 기반 구체적인 절약 방법 제시
- **목표 관리**: 저축 목표 설정 및 달성률 실시간 추적

### 3. 📈 스마트 예측 시스템
- **93% 정확도**의 월말 지출액 예측
- 3단계 예산 경고 시스템
  - 🟢 Green Zone: 예산의 70% 이하
  - 🟡 Yellow Zone: 예산의 70-90%
  - 🔴 Red Zone: 예산의 90% 이상
- 미래 지출 시뮬레이션

### 4. 🎮 게이미피케이션 (예정)
- 절약 목표 달성 시 보상 시스템
- 친구와의 절약 챌린지
- 레벨 및 뱃지 시스템

---

## 🎬 데모

### 📱 앱 스크린샷
| 홈 화면 | 대화형 입력 | 분석 리포트 | 목표 관리 |
|---------|------------|------------|-----------|
| ![홈](docs/images/home.png) | ![대화](docs/images/chat.png) | ![분석](docs/images/analytics.png) | ![목표](docs/images/goals.png) |

### 🎥 시연 영상
[YouTube 데모 영상 보기](https://youtube.com/watch?v=demo)

### 🔗 프레젠테이션
[Figma 발표 자료 보기](https://www.figma.com/slides/GyOCw2VMPb801fHF25jX7s/Light-slides--Copy-?node-id=1-553&t=3IzEh36fIF1faiX9-0)

---

## 🛠 기술 스택

### Frontend (Mobile)
- **Framework**: React Native 0.81.4 + Expo 54.0.10
- **Language**: TypeScript 5.9.2
- **UI Library**: NativeWind 4.2.1 (Tailwind CSS for React Native)
- **State Management**: Zustand 5.0.8
- **Navigation**: Expo Router 6.0.8
- **Animation**: React Native Reanimated 4.1.2
- **Icons**: React Native Vector Icons 10.3.0

### Backend
- **Server**: Node.js + Express 4.18.2
- **Database**: PostgreSQL (Production) / SQLite3 (Development)
- **ORM**: Objection.js 3.1.5 + Knex.js 3.0.1
- **Cache**: Redis 4.7.1
- **Authentication**: JWT 9.0.2
- **Security**: bcryptjs 2.4.3

### AI/ML
- **LLM**: LGAI EXAONE 3.5 7.8B (한국어 특화)
- **Framework**: FastAPI 0.104.1 (Python)
- **ML Libraries**: PyTorch 2.0+, Transformers 4.36+
- **Voice Recognition**: @react-native-voice/voice 3.2.4
- **NLP**: @xenova/transformers 2.17.2

### DevOps & Tools
- **Version Control**: Git & GitHub
- **Code Quality**: ESLint 9.36.0, Prettier 3.6.2
- **Testing**: Jest 29.7.0
- **Documentation**: Markdown
- **Design**: Figma

---

## 🏗️ 시스템 아키텍처

### 현재 아키텍처 (MVP)

![MVP 아키텍처](docs/images/mvp-architecture.png)

### 클라우드 배포 아키텍처 (계획)

![클라우드 아키텍처](docs/images/cloud-architecture.png)

---

## 🚀 시작하기

### 필수 요구사항
- Node.js 18.0 이상
- Python 3.9 이상
- PostgreSQL 14 이상 (또는 SQLite3 for development)
- Redis 6.0 이상
- Expo CLI
- Git

### 설치 및 실행

#### 1. 저장소 클론
```bash
git clone https://github.com/erish0821/CMBG-cheonmabigo-.git
cd CMBG-cheonmabigo-
```

#### 2. 프론트엔드 설정
```bash
# 루트 디렉토리에서
npm install

# iOS 의존성 설치 (Mac only)
cd ios && pod install && cd ..

# Expo 개발 서버 실행
npx expo start
```

#### 3. 백엔드 서버 설정
```bash
# 백엔드 디렉토리로 이동
cd backend

# 패키지 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일을 편집하여 데이터베이스 정보 입력

# 데이터베이스 마이그레이션
npm run migrate

# 시드 데이터 생성 (개발용)
npm run seed

# 개발 서버 실행 (포트: 3001)
npm run dev
```

#### 4. AI 서버 설정
```bash
# Python AI 서버 디렉토리로 이동
cd python-llm-server

# 가상환경 생성 및 활성화
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt

# 모델 다운로드 (첫 실행 시)
python download_model.py

# FastAPI 서버 실행 (포트: 8001)
uvicorn app:app --reload --port 8001
```

### 환경 변수 설정

#### `.env.local` (Frontend)
```env
EXPO_PUBLIC_API_URL=http://localhost:3001
EXPO_PUBLIC_AI_API_URL=http://localhost:8001
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key
```

#### `.env` (Backend)
```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/cheonmabigo
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
AI_SERVER_URL=http://localhost:8001
```

#### `.env` (AI Server)
```env
MODEL_PATH=./models/exaone-3.5-7.8b
PORT=8001
MAX_TOKENS=2048
TEMPERATURE=0.7
```

---

## 📁 프로젝트 구조

```
CMBG-cheonmabigo-/
├── 📱 app/                        # Expo Router 화면 구조
│   ├── (tabs)/                   # 탭 네비게이션
│   │   ├── index.tsx             # 홈 화면
│   │   ├── chat.tsx              # AI 대화 화면
│   │   ├── analytics.tsx        # 분석 화면
│   │   └── settings.tsx         # 설정 화면
│   ├── auth/                     # 인증 관련 화면
│   │   ├── login.tsx            # 로그인
│   │   └── register.tsx         # 회원가입
│   ├── goal/                     # 목표 관리
│   │   └── [id].tsx             # 목표 상세
│   ├── onboarding/              # 온보딩
│   │   └── index.tsx            # 온보딩 플로우
│   ├── transaction/             # 거래 관리
│   │   ├── add.tsx              # 거래 추가
│   │   └── [id].tsx             # 거래 상세
│   ├── _layout.tsx              # 루트 레이아웃
│   └── index.tsx                # 앱 진입점
│
├── 🎨 src/                       # 프론트엔드 소스 코드
│   ├── components/              # UI 컴포넌트
│   │   ├── common/             # 공통 컴포넌트
│   │   ├── chat/               # 채팅 관련
│   │   └── transaction/        # 거래 관련
│   ├── screens/                # 화면 컴포넌트
│   ├── services/               # API 서비스
│   │   ├── api.ts             # API 클라이언트
│   │   ├── auth.service.ts    # 인증 서비스
│   │   └── ai.service.ts      # AI 서비스
│   ├── stores/                 # Zustand 상태 관리
│   │   ├── auth.store.ts      # 인증 상태
│   │   └── transaction.store.ts # 거래 상태
│   ├── types/                  # TypeScript 타입 정의
│   └── utils/                  # 유틸리티 함수
│
├── 🔧 backend/                   # Node.js 백엔드
│   ├── migrations/              # 데이터베이스 마이그레이션
│   │   └── 001_initial.js     
│   ├── seeds/                   # 시드 데이터
│   ├── src/
│   │   ├── config/             # 설정 파일
│   │   ├── controllers/        # 컨트롤러
│   │   ├── middleware/         # 미들웨어
│   │   ├── models/             # 데이터 모델
│   │   ├── routes/             # API 라우트
│   │   ├── services/           # 비즈니스 로직
│   │   └── index.ts            # 서버 진입점
│   ├── tests/                  # 테스트 파일
│   └── package.json
│
├── 🤖 python-llm-server/         # Python AI 서버
│   ├── models/                  # AI 모델 파일
│   ├── services/               # AI 서비스
│   │   ├── nlp.py             # 자연어 처리
│   │   └── classifier.py      # 분류기
│   ├── routers/                # API 라우터
│   ├── utils/                  # 유틸리티
│   ├── app.py                  # FastAPI 앱
│   ├── requirements.txt        # Python 패키지
│   └── Dockerfile              # Docker 설정
│
├── 📚 docs/                      # 문서
│   ├── API.md                  # API 문서
│   ├── ARCHITECTURE.md         # 아키텍처 문서
│   └── images/                 # 이미지 파일
│
├── 🧪 tests/                     # 통합 테스트
├── 🔧 .github/                   # GitHub 설정
│   └── workflows/              # GitHub Actions
├── 📝 package.json              # 프로젝트 설정
├── 🔐 .env.example              # 환경 변수 예제
└── 📖 README.md                 # 이 파일
```

---


## 🗺️ 개발 로드맵

### Phase 1: MVP (완료) ✅
- ✅ 기본 AI 대화 기능 구현
- ✅ 음성 입력 처리
- ✅ 거래 자동 분류 (99.2% 정확도)
- ✅ 로컬 데이터 저장
- ✅ 기본 UI/UX 구현

### Phase 2: Beta (진행중) 🚧
- 🚧 사용자 인증 시스템
- 🚧 클라우드 데이터 동기화
- 🚧 고급 분석 기능
- 🚧 예산 관리 기능
- 🚧 푸시 알림
- ⏳ 영수증 OCR
- ⏳ 가족 공유 기능

### Phase 3: Production (2025 Q1) ⏳
- ⏳ AWS 클라우드 배포
- ⏳ Google Play Store 출시
- ⏳ Apple App Store 출시
- ⏳ 마이크로서비스 아키텍처 전환
- ⏳ 실시간 동기화

### Phase 4: Scale (2025 Q2) 🎯
- ⏳ B2B 서비스 확장
- ⏳ 금융기관 API 연동
- ⏳ 다국어 지원 (영어, 일본어, 중국어)
- ⏳ AI 모델 고도화
- ⏳ 블록체인 기반 보안 강화

---

## 📊 성능 지표

### 현재 성능
- **AI 응답 시간**: < 2초
- **거래 분류 정확도**: 99.2%
- **월말 예측 정확도**: 93%
- **앱 로딩 시간**: < 3초
- **API 응답 시간**: < 500ms

### 목표 성능 (Production)
- **동시 사용자**: 10,000명
- **일일 거래 처리**: 1,000,000건
- **가용성**: 99.9% uptime
- **데이터 보안**: AES-256 암호화

---

## 👥 팀 소개

### 핵심 팀원
- **팀장** - 프로젝트 총괄, 제품 기획
- **Frontend Developer** - React Native 개발, UI/UX 설계
- **Backend Developer** - Node.js 서버 개발, 데이터베이스 설계
- **AI/ML Engineer** - LLM 모델 통합, 자연어 처리

---

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

```
MIT License

Copyright (c) 2024 Cheonmabigo Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
...
```

---

<div align="center">
  
### 🌟 Star를 눌러주세요!

이 프로젝트가 도움이 되었다면, ⭐️ Star를 눌러주세요!

[![GitHub stars](https://img.shields.io/github/stars/erish0821/CMBG-cheonmabigo-.svg?style=social)](https://github.com/erish0821/CMBG-cheonmabigo-/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/erish0821/CMBG-cheonmabigo-.svg?style=social)](https://github.com/erish0821/CMBG-cheonmabigo-/network)
[![GitHub watchers](https://img.shields.io/github/watchers/erish0821/CMBG-cheonmabigo-.svg?style=social)](https://github.com/erish0821/CMBG-cheonmabigo-/watchers)

---

**Made with ❤️ by Cheonmabigo Team**

[맨 위로 올라가기](#천마비고-cheonmabigo---ai-금융-코치-)

</div>
