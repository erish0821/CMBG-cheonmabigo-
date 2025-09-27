# 디자인 시스템 구현

천마비고 앱의 일관된 디자인을 위한 컴포넌트 시스템과 스타일 가이드를 구축합니다.

## 실행할 작업

1. **색상 팔레트 정의**
   - Primary: Purple/Violet (#7C3AED)
   - Secondary: Light Purple (#A855F7)
   - Background: Clean White (#FFFFFF)
   - Text: Dark Gray (#1F2937)
   - Success: Green (#10B981)
   - Warning: Orange (#F59E0B)
   - Error: Red (#EF4444)

2. **기본 UI 컴포넌트 생성**
   - `src/components/ui/Button.tsx` - 둥근 버튼, 원형 액션 버튼
   - `src/components/ui/Card.tsx` - 그림자가 있는 카드 (16px 둥근 모서리)
   - `src/components/ui/Input.tsx` - 텍스트 입력 필드
   - `src/components/ui/ProgressBar.tsx` - 그라데이션 보라색 진행률 바
   - `src/components/ui/Typography.tsx` - 텍스트 스타일 컴포넌트

3. **타이포그래피 시스템**
   - 제목 스타일 (H1, H2, H3)
   - 본문 텍스트 스타일
   - 캡션 및 라벨 스타일
   - 시스템 폰트 설정 (Inter/System)

4. **레이아웃 컴포넌트**
   - `src/components/layout/Screen.tsx` - 기본 화면 레이아웃
   - `src/components/layout/Container.tsx` - 컨테이너 컴포넌트
   - `src/components/layout/SafeAreaWrapper.tsx` - Safe Area 처리

5. **아이콘 시스템**
   - 외곽선 스타일 아이콘 설정
   - 일관된 크기 및 굵기
   - 아이콘 컴포넌트 생성

6. **테마 설정**
   - 색상 상수 파일 생성 (`src/constants/colors.ts`)
   - 스타일 유틸리티 함수
   - 다크모드 대응 준비

7. **Storybook 설정 (선택사항)**
   - 컴포넌트 문서화
   - 디자인 시스템 시각화

**UI_Style.png 참고사항**:
- 카드 기반 레이아웃
- 보라색 액센트 컬러
- 둥근 모서리 (16px radius)
- 미니멀한 디자인

**추가 인수**: $ARGUMENTS (특정 컴포넌트나 스타일 지정)

디자인 시스템 완료 후 `/4-navigation` 명령어로 내비게이션을 설정하세요.