# 거래 기록 시스템 구현

AI가 자연어로 입력된 거래 내용을 분석하고 자동으로 분류하여 저장하는 시스템을 구현합니다.

## 실행할 작업

1. **거래 데이터 모델 정의**
   ```typescript
   interface Transaction {
     id: string;
     amount: number;
     description: string;
     category: CategoryType;
     subcategory?: string;
     date: Date;
     paymentMethod: PaymentMethod;
     location?: string;
     isIncome: boolean;
     tags: string[];
     confidence: number; // AI 분류 신뢰도
     userId: string;
     createdAt: Date;
     updatedAt: Date;
   }
   ```

2. **카테고리 시스템**
   - `src/constants/categories.ts` - 카테고리 정의
   - 주요 카테고리: 식비, 교통비, 문화생활, 쇼핑, 의료 등
   - 한국 소비 패턴 기반 세부 카테고리
   - 아이콘 및 색상 매핑

3. **거래 분류 엔진**
   - `src/services/transaction/ClassifierService.ts`
   - AI 기반 자동 분류
   - 키워드 매칭
   - 금액 범위 기반 추론
   - 시간대/요일 패턴 분석

4. **자연어 파싱**
   - `src/services/transaction/NLPParser.ts`
   - 금액 추출 (한국어 숫자 처리)
   - 상호명 인식
   - 날짜/시간 추출
   - 결제 수단 추출

5. **거래 저장소**
   - `src/services/storage/TransactionStorage.ts`
   - 로컬 SQLite 데이터베이스
   - 오프라인 우선 저장
   - 동기화 대기열
   - 백업 및 복원

6. **거래 CRUD 기능**
   - 생성: AI 파싱 결과로 자동 생성
   - 조회: 날짜, 카테고리, 금액별 필터링
   - 수정: 사용자 피드백으로 정확도 향상
   - 삭제: 소프트 삭제 및 복원

7. **거래 확인 UI**
   - `src/components/transaction/TransactionCard.tsx`
   - AI 분류 결과 표시
   - 확인/수정 버튼
   - 카테고리 변경 옵션
   - 신뢰도 표시

8. **거래 내역 화면**
   - `src/screens/transaction/TransactionList.tsx`
   - 무한 스크롤 리스트
   - 검색 기능
   - 필터링 옵션
   - 정렬 (날짜, 금액, 카테고리)

9. **패턴 학습**
   - 사용자 수정 사항 학습
   - 개인화된 분류 모델
   - 자주 방문하는 장소 학습
   - 반복 거래 패턴 인식

10. **예산 연동**
    - 카테고리별 예산 체크
    - 초과 시 경고
    - 남은 예산 계산
    - 월별 누적 금액

**거래 처리 플로우**:
```
1. 사용자 입력 ("스타벅스에서 아메리카노 5500원 샀어")
2. NLP 파싱 → 금액: 5500, 상호: 스타벅스, 품목: 아메리카노
3. AI 분류 → 카테고리: 식비 > 카페/음료
4. 확신도 계산 → 95% 신뢰도
5. 거래 생성 및 저장
6. 사용자 확인 요청
7. 예산 업데이트
```

**카테고리 구조**:
```typescript
enum CategoryType {
  FOOD = 'food',           // 식비
  TRANSPORT = 'transport', // 교통비
  ENTERTAINMENT = 'entertainment', // 문화생활
  SHOPPING = 'shopping',   // 쇼핑
  HEALTHCARE = 'healthcare', // 의료
  EDUCATION = 'education', // 교육
  UTILITIES = 'utilities', // 공과금
  OTHER = 'other'         // 기타
}

enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  TRANSFER = 'transfer',
  MOBILE_PAY = 'mobile_pay'
}
```

**AI 파싱 예시**:
```typescript
const parseTransactionText = (text: string): ParsedTransaction => {
  // "김치찌개 8천원" → amount: 8000, category: FOOD
  // "지하철 1,500원" → amount: 1500, category: TRANSPORT  
  // "영화표 12000원" → amount: 12000, category: ENTERTAINMENT
}
```

**추가 인수**: $ARGUMENTS (특정 카테고리나 기능)

거래 시스템 완료 후 `/9-analytics` 명령어로 분석 기능을 구현하세요.