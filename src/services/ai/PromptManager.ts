import {
  PromptTemplate,
  MessageIntent,
  UserContext,
  ExtractedTransaction,
} from '../../types/ai';

/**
 * 천마비고 AI 프롬프트 관리자
 * 한국어 특화 프롬프트 템플릿 및 컨텍스트 관리
 */
export class PromptManager {
  private templates: Map<string, PromptTemplate> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  private initializeTemplates() {
    // 시스템 프롬프트
    this.addTemplate({
      id: 'system_prompt',
      name: '천마비고 시스템 프롬프트',
      template: `당신은 "천마비고"라는 이름의 도움이 되는 한국 개인 재정 관리 AI 어시스턴트입니다.

역할과 성격:
- 친근하고 자연스러운 대화 톤으로 소통
- 개인화된 재정 조언과 실용적인 팁 제공
- 사용자의 지출 패턴을 분석하고 건설적인 피드백 제공
- 긍정적이고 격려하는 태도 유지
- 한국의 금융 문화와 생활 패턴에 맞는 조언

주요 기능:
1. 자연어로 입력된 거래 내용을 정확히 분류하고 기록
2. 개인 맞춤형 예산 관리 및 절약 방법 제시
3. 저축 목표 설정 및 달성 가이드
4. 지출 패턴 분석 및 트렌드 설명
5. 한국 금융 상품 및 투자 정보 제공

응답 규칙:
- 간결하고 이해하기 쉬운 한국어 사용
- 구체적인 금액과 비율 데이터 활용
- 단계별 실행 가능한 조언 제공
- 이모지 적절히 활용 (💰, 📊, 🎯 등)
- 질문이나 거래 내용에 따라 적절한 의도 분류

현재 날짜: {{currentDate}}
사용자 정보: {{userContext}}`,
      variables: ['currentDate', 'userContext'],
      category: 'transaction',
    });

    // 거래 기록 프롬프트
    this.addTemplate({
      id: 'transaction_extraction',
      name: '거래 정보 추출',
      template: `사용자가 입력한 다음 메시지에서 거래 정보를 추출해주세요:

입력: "{{userInput}}"

다음 JSON 형식으로 응답해주세요:
{
  "intent": "transaction_record",
  "transaction": {
    "amount": 금액 (숫자),
    "description": "거래 설명",
    "category": "카테고리 (식비, 교통비, 쇼핑, 카페, 의료, 기타 등)",
    "location": "장소/상호명 (있는 경우)",
    "paymentMethod": "결제수단 (카드, 현금, 계좌이체, 모바일페이 등)",
    "type": "expense 또는 income",
    "date": "{{currentDate}}"
  },
  "response": "친근한 톤으로 거래가 기록되었음을 알리는 메시지"
}

한국어 표현 처리 규칙:
- "만원" = 10,000원, "천원" = 1,000원
- "점심값", "밥값" → 식비
- "버스비", "지하철비", "택시비" → 교통비
- "스타벅스", "커피" → 카페
- 상호명이 있으면 location에 포함`,
      variables: ['userInput', 'currentDate'],
      category: 'transaction',
    });

    // 재정 조언 프롬프트
    this.addTemplate({
      id: 'financial_advice',
      name: '재정 조언 생성',
      template: `사용자의 질문에 대해 개인화된 재정 조언을 제공해주세요.

질문: "{{userInput}}"

사용자 컨텍스트:
- 이번 달 지출: {{monthlySpending}}원
- 예산: {{monthlyBudget}}원
- 주요 지출 카테고리: {{topCategories}}
- 저축 목표: {{savingsGoals}}

다음 형식으로 응답해주세요:
{
  "intent": "financial_advice",
  "response": "구체적이고 실행 가능한 조언 (3-4문장)",
  "suggestions": ["실천 가능한 팁 1", "실천 가능한 팁 2", "실천 가능한 팁 3"],
  "analysis": "현재 재정 상태에 대한 간단한 분석"
}

조언 원칙:
- 한국의 생활비 수준과 문화 고려
- 구체적인 금액과 비율 제시
- 실현 가능한 단계별 방법 제안
- 긍정적이고 격려하는 톤`,
      variables: [
        'userInput',
        'monthlySpending',
        'monthlyBudget',
        'topCategories',
        'savingsGoals',
      ],
      category: 'advice',
    });

    // 지출 분석 프롬프트
    this.addTemplate({
      id: 'spending_analysis',
      name: '지출 분석',
      template: `사용자의 지출 패턴을 분석하고 인사이트를 제공해주세요.

분석 요청: "{{userInput}}"

지출 데이터:
{{spendingData}}

다음 형식으로 응답해주세요:
{
  "intent": "spending_analysis",
  "response": "분석 결과 요약 (2-3문장)",
  "insights": [
    "주요 인사이트 1",
    "주요 인사이트 2",
    "주요 인사이트 3"
  ],
  "recommendations": [
    "개선 제안 1",
    "개선 제안 2"
  ],
  "trends": "지출 트렌드 설명"
}

분석 포인트:
- 카테고리별 지출 비중
- 전월 대비 변화율
- 예산 대비 달성율
- 절약 기회 식별`,
      variables: ['userInput', 'spendingData'],
      category: 'analysis',
    });

    // 목표 설정 프롬프트
    this.addTemplate({
      id: 'goal_setting',
      name: '목표 설정 도움',
      template: `사용자의 저축 목표 설정을 도와주세요.

요청: "{{userInput}}"

현재 재정 상황:
- 월 수입: {{monthlyIncome}}원
- 월 평균 지출: {{monthlySpending}}원
- 현재 저축액: {{currentSavings}}원

다음 형식으로 응답해주세요:
{
  "intent": "goal_setting",
  "goal": {
    "title": "목표 제목",
    "targetAmount": 목표 금액,
    "recommendedMonthlyAmount": 월 저축 권장액,
    "timeframe": 달성 예상 기간,
    "priority": "high/medium/low"
  },
  "response": "목표 설정에 대한 격려와 조언",
  "strategy": [
    "달성 전략 1",
    "달성 전략 2",
    "달성 전략 3"
  ]
}

목표 설정 원칙:
- 현실적이고 달성 가능한 목표
- 단계별 마일스톤 제시
- 구체적인 실행 방법 포함`,
      variables: [
        'userInput',
        'monthlyIncome',
        'monthlySpending',
        'currentSavings',
      ],
      category: 'goal',
    });

    // 인사 및 일반 대화 프롬프트
    this.addTemplate({
      id: 'general_conversation',
      name: '일반 대화',
      template: `사용자와 자연스럽고 친근한 대화를 나누세요.

사용자 메시지: "{{userInput}}"

다음 형식으로 응답해주세요:
{
  "intent": "{{detectedIntent}}",
  "response": "친근하고 도움이 되는 응답",
  "suggestions": ["관련된 재정 관리 질문이나 기능 제안"]
}

대화 원칙:
- 자연스럽고 친근한 한국어
- 재정 관리와 연결될 수 있는 방향으로 유도
- 사용자의 감정과 상황 공감
- 적절한 이모지 사용`,
      variables: ['userInput', 'detectedIntent'],
      category: 'advice',
    });
  }

  private addTemplate(template: PromptTemplate) {
    this.templates.set(template.id, template);
  }

  /**
   * 프롬프트 템플릿 가져오기
   */
  getTemplate(id: string): PromptTemplate | undefined {
    return this.templates.get(id);
  }

  /**
   * 변수를 포함한 프롬프트 생성
   */
  generatePrompt(templateId: string, variables: Record<string, any>): string {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    let prompt = template.template;

    // 변수 치환
    template.variables.forEach(variable => {
      const value = variables[variable] || '';
      const regex = new RegExp(`{{${variable}}}`, 'g');
      prompt = prompt.replace(regex, String(value));
    });

    return prompt;
  }

  /**
   * 시스템 프롬프트 생성
   */
  generateSystemPrompt(userContext?: UserContext): string {
    const currentDate = new Date().toLocaleDateString('ko-KR');
    const contextString = userContext
      ? this.formatUserContext(userContext)
      : '새로운 사용자';

    return this.generatePrompt('system_prompt', {
      currentDate,
      userContext: contextString,
    });
  }

  /**
   * 거래 추출 프롬프트 생성
   */
  generateTransactionPrompt(userInput: string): string {
    const currentDate = new Date().toISOString().split('T')[0];

    return this.generatePrompt('transaction_extraction', {
      userInput,
      currentDate,
    });
  }

  /**
   * 재정 조언 프롬프트 생성
   */
  generateAdvicePrompt(userInput: string, userContext: UserContext): string {
    return this.generatePrompt('financial_advice', {
      userInput,
      monthlySpending: this.calculateMonthlySpending(userContext),
      monthlyBudget: userContext.monthlyBudget || 0,
      topCategories: this.getTopCategories(userContext),
      savingsGoals: this.formatSavingsGoals(userContext),
    });
  }

  /**
   * 지출 분석 프롬프트 생성
   */
  generateAnalysisPrompt(userInput: string, userContext: UserContext): string {
    return this.generatePrompt('spending_analysis', {
      userInput,
      spendingData: this.formatSpendingData(userContext),
    });
  }

  /**
   * 목표 설정 프롬프트 생성
   */
  generateGoalPrompt(userInput: string, userContext: UserContext): string {
    return this.generatePrompt('goal_setting', {
      userInput,
      monthlyIncome: this.calculateMonthlyIncome(userContext),
      monthlySpending: this.calculateMonthlySpending(userContext),
      currentSavings: this.calculateCurrentSavings(userContext),
    });
  }

  /**
   * 일반 대화 프롬프트 생성
   */
  generateGeneralPrompt(
    userInput: string,
    detectedIntent: MessageIntent
  ): string {
    return this.generatePrompt('general_conversation', {
      userInput,
      detectedIntent,
    });
  }

  // 헬퍼 메소드들
  private formatUserContext(userContext: UserContext): string {
    const monthlySpending = this.calculateMonthlySpending(userContext);
    const topCategory = this.getTopCategories(userContext);

    return `월 평균 지출: ${monthlySpending.toLocaleString()}원, 주요 지출: ${topCategory}`;
  }

  private calculateMonthlySpending(userContext: UserContext): number {
    const now = new Date();
    const thisMonth = userContext.recentTransactions.filter(t => {
      const transactionDate = new Date(t.date);
      return (
        transactionDate.getMonth() === now.getMonth() &&
        transactionDate.getFullYear() === now.getFullYear()
      );
    });

    return thisMonth.reduce((sum, t) => sum + t.amount, 0);
  }

  private calculateMonthlyIncome(userContext: UserContext): number {
    // 수입 거래 계산 (실제 구현에서는 별도 수입 데이터 필요)
    return 0; // 임시값
  }

  private calculateCurrentSavings(userContext: UserContext): number {
    // 현재 저축액 계산 (실제 구현에서는 별도 저축 데이터 필요)
    return 0; // 임시값
  }

  private getTopCategories(userContext: UserContext): string {
    const categorySpending = new Map<string, number>();

    userContext.recentTransactions.forEach(t => {
      const current = categorySpending.get(t.category) || 0;
      categorySpending.set(t.category, current + t.amount);
    });

    const sorted = Array.from(categorySpending.entries()).sort(
      (a, b) => b[1] - a[1]
    );

    return sorted
      .slice(0, 3)
      .map(([category]) => category)
      .join(', ');
  }

  private formatSavingsGoals(userContext: UserContext): string {
    return (
      userContext.savingsGoals
        .map(goal => `${goal.title}: ${goal.targetAmount?.toLocaleString()}원`)
        .join(', ') || '설정된 목표 없음'
    );
  }

  private formatSpendingData(userContext: UserContext): string {
    const categorySpending = new Map<string, number>();

    userContext.recentTransactions.forEach(t => {
      const current = categorySpending.get(t.category) || 0;
      categorySpending.set(t.category, current + t.amount);
    });

    return Array.from(categorySpending.entries())
      .map(([category, amount]) => `${category}: ${amount.toLocaleString()}원`)
      .join('\n');
  }
}
