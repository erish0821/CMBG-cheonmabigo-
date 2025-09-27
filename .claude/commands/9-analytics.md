# 분석 및 시각화 구현

사용자의 지출 패턴을 분석하고 인사이트를 제공하는 시각화 시스템을 구현합니다.

## 실행할 작업

1. **차트 라이브러리 설치**
   ```bash
   npm install react-native-chart-kit react-native-svg
   npm install victory-native react-native-super-grid
   ```

2. **분석 서비스 구현**
   - `src/services/analytics/AnalyticsService.ts`
   - 지출 패턴 분석
   - 트렌드 계산
   - 예측 모델
   - 통계 계산

3. **차트 컴포넌트**
   - `src/components/charts/SpendingChart.tsx` - 지출 추이 차트
   - `src/components/charts/CategoryPieChart.tsx` - 카테고리별 원형 차트
   - `src/components/charts/BudgetProgressChart.tsx` - 예산 진행률
   - `src/components/charts/ComparisonChart.tsx` - 월별 비교

4. **대시보드 화면**
   - `src/screens/dashboard/DashboardScreen.tsx`
   - 이번 달 지출 요약
   - 예산 진행률 (UI_Style.png 참고)
   - 빠른 기록 버튼
   - 최근 거래 내역

5. **분석 화면**
   - `src/screens/analytics/AnalyticsScreen.tsx`
   - 상세 차트 모음
   - 기간 선택 필터
   - 카테고리 드릴다운
   - 인사이트 카드

6. **인사이트 생성**
   - 지출 증감 분석
   - 이상 거래 탐지
   - 절약 기회 발견
   - 예산 초과 경고
   - 계절성 패턴 분석

7. **예산 시스템**
   - `src/components/budget/BudgetCard.tsx`
   - 카테고리별 예산 설정
   - 실시간 진행률 추적
   - 초과 시 알림
   - 자동 예산 제안

8. **데이터 시각화 타입**
   - 라인 차트: 시간별 지출 추이
   - 파이 차트: 카테고리별 비율
   - 바 차트: 월별 비교
   - 도넛 차트: 예산 진행률
   - 히트맵: 요일별 소비 패턴

9. **인터랙티브 기능**
   - 차트 터치로 상세 정보
   - 줌 인/아웃
   - 기간 슬라이더
   - 드래그로 범위 선택

10. **리포트 생성**
    - 주간/월간 리포트
    - PDF 내보내기
    - 요약 메일 발송
    - 소셜 공유 기능

**분석 데이터 구조**:
```typescript
interface SpendingAnalytics {
  totalSpent: number;
  budgetRemaining: number;
  categoryBreakdown: CategorySpending[];
  monthlyTrend: MonthlyData[];
  insights: Insight[];
  predictions: Prediction[];
}

interface CategorySpending {
  category: CategoryType;
  amount: number;
  percentage: number;
  change: number; // 전월 대비
  budgetUsed: number;
}

interface Insight {
  type: 'warning' | 'tip' | 'achievement';
  title: string;
  description: string;
  actionable: boolean;
  priority: number;
}
```

**차트 스타일링**:
- 보라색 그라데이션 (#7C3AED → #A855F7)
- 둥근 모서리 (16px)
- 미묘한 그림자
- 애니메이션 효과
- 반응형 크기

**대시보드 구성** (UI_Style.png 기반):
```
┌─────────────────────────┐
│ 이번 달 예산            │
│ 500,000원              │
│ [========65%====   ]   │
│ 324,500원 사용         │  
│ 175,500원 남음         │
└─────────────────────────┘

┌─────────────────────────┐
│ 빠른 기록               │
│ [📊] [🎤] [➕]         │
└─────────────────────────┘

┌─────────────────────────┐
│ 오늘의 지출             │
│ 점심 - 김치찌개 12,000원│
└─────────────────────────┘
```

**AI 인사이트 예시**:
- "이번 주 카페비가 평소보다 40% 높습니다"
- "외식비를 20% 줄이면 월 12만원 절약 가능"
- "저축 목표의 65% 달성했네요!"
- "주말 지출이 평일보다 2.3배 높아요"

**추가 인수**: $ARGUMENTS (특정 차트나 분석 타입)

분석 시스템 완료 후 `/10-backend-api` 명령어로 백엔드를 구현하세요.