import {
  AIResponse,
  MessageIntent,
  ExtractedData,
  ExtractedTransaction,
  ExtractedGoal,
  ExtractedAnalysis,
  EntityExtractionResult,
  SentimentAnalysis,
} from '../../types/ai';

/**
 * EXAONE 모델 응답 파싱 및 처리 클래스
 * 한국어 자연어 처리 및 엔티티 추출 전담
 */
export class ResponseParser {
  private currencyKeywords = ['원', '만원', '천원', '백원'];
  private categoryKeywords = {
    식비: [
      '밥',
      '점심',
      '저녁',
      '아침',
      '식사',
      '음식',
      '김치찌개',
      '삼겹살',
      '치킨',
    ],
    교통비: ['버스', '지하철', '택시', '기차', '비행기', '우버', '교통카드'],
    카페: ['커피', '스타벅스', '이디야', '카페', '라떼', '아메리카노', '음료'],
    쇼핑: ['옷', '신발', '화장품', '쇼핑', '백화점', '마트', '온라인'],
    의료: ['병원', '약국', '치료', '진료', '의료', '건강검진'],
    문화: ['영화', '공연', '콘서트', '전시', '도서', '게임'],
    기타: [],
  };

  private paymentMethodKeywords = {
    카드: ['카드', '체크카드', '신용카드'],
    현금: ['현금', '지폐', '동전'],
    계좌이체: ['이체', '송금', '계좌'],
    모바일페이: ['페이', '삼성페이', '애플페이', '카카오페이', '네이버페이'],
  };

  /**
   * AI 모델 응답을 파싱하여 구조화된 데이터로 변환
   */
  parseResponse(rawResponse: string, originalInput: string): AIResponse {
    try {
      // JSON 응답 시도
      const jsonResponse = this.tryParseJSON(rawResponse);
      if (jsonResponse) {
        return this.parseJSONResponse(jsonResponse, originalInput);
      }

      // 일반 텍스트 응답 처리
      return this.parseTextResponse(rawResponse, originalInput);
    } catch (error) {
      console.error('Response parsing error:', error);
      return this.createErrorResponse(originalInput, error);
    }
  }

  /**
   * JSON 형식 응답 파싱
   */
  private parseJSONResponse(
    jsonResponse: any,
    originalInput: string
  ): AIResponse {
    const id = this.generateResponseId();
    const intent = this.detectIntent(jsonResponse.intent || originalInput);
    const confidence = this.calculateConfidence(jsonResponse, originalInput);

    return {
      id,
      content: jsonResponse.response || jsonResponse.content || '',
      intent,
      confidence,
      extractedData: this.extractDataFromJSON(jsonResponse),
      suggestions: jsonResponse.suggestions || [],
      metadata: {
        tokensUsed: this.estimateTokens(
          originalInput + JSON.stringify(jsonResponse)
        ),
        responseTime: Date.now(),
        modelVersion: 'EXAONE-3.5-7.8B',
      },
    };
  }

  /**
   * 텍스트 응답 파싱
   */
  private parseTextResponse(
    textResponse: string,
    originalInput: string
  ): AIResponse {
    const id = this.generateResponseId();
    const intent = this.detectIntent(originalInput);
    const extractedData = this.extractDataFromText(originalInput, textResponse);
    const confidence = this.calculateTextConfidence(
      originalInput,
      textResponse
    );

    return {
      id,
      content: textResponse,
      intent,
      confidence,
      extractedData,
      suggestions: this.generateSuggestions(intent),
      metadata: {
        tokensUsed: this.estimateTokens(originalInput + textResponse),
        responseTime: Date.now(),
        modelVersion: 'EXAONE-3.5-7.8B',
      },
    };
  }

  /**
   * 의도 분류
   */
  detectIntent(input: string): MessageIntent {
    const lowerInput = input.toLowerCase();

    // 거래 기록 패턴
    if (this.hasTransactionPattern(lowerInput)) {
      return 'transaction_record';
    }

    // 목표 설정 패턴
    if (this.hasGoalPattern(lowerInput)) {
      return 'goal_setting';
    }

    // 분석 요청 패턴
    if (this.hasAnalysisPattern(lowerInput)) {
      return 'spending_analysis';
    }

    // 조언 요청 패턴
    if (this.hasAdvicePattern(lowerInput)) {
      return 'financial_advice';
    }

    // 인사 패턴
    if (this.hasGreetingPattern(lowerInput)) {
      return 'greeting';
    }

    return 'general_question';
  }

  /**
   * 거래 패턴 감지
   */
  private hasTransactionPattern(input: string): boolean {
    const transactionKeywords = [
      '원',
      '만원',
      '천원',
      '지출',
      '결제',
      '샀',
      '구매',
      '사용',
      '점심',
      '저녁',
      '커피',
      '택시',
      '버스',
      '쇼핑',
    ];

    return (
      transactionKeywords.some(keyword => input.includes(keyword)) &&
      this.extractAmount(input) !== null
    );
  }

  /**
   * 목표 설정 패턴 감지
   */
  private hasGoalPattern(input: string): boolean {
    const goalKeywords = ['목표', '저축', '모으', '계획', '예산', '설정'];
    return goalKeywords.some(keyword => input.includes(keyword));
  }

  /**
   * 분석 요청 패턴 감지
   */
  private hasAnalysisPattern(input: string): boolean {
    const analysisKeywords = [
      '분석',
      '얼마',
      '지출',
      '통계',
      '패턴',
      '트렌드',
      '비교',
    ];
    return analysisKeywords.some(keyword => input.includes(keyword));
  }

  /**
   * 조언 요청 패턴 감지
   */
  private hasAdvicePattern(input: string): boolean {
    const adviceKeywords = [
      '어떻게',
      '방법',
      '팁',
      '조언',
      '추천',
      '절약',
      '관리',
    ];
    return adviceKeywords.some(keyword => input.includes(keyword));
  }

  /**
   * 인사 패턴 감지
   */
  private hasGreetingPattern(input: string): boolean {
    const greetingKeywords = ['안녕', '안녕하세요', '반가', '처음', '시작'];
    return greetingKeywords.some(keyword => input.includes(keyword));
  }

  /**
   * JSON에서 데이터 추출
   */
  private extractDataFromJSON(jsonResponse: any): ExtractedData | undefined {
    const extractedData: ExtractedData = {};

    // 거래 정보 추출
    if (jsonResponse.transaction) {
      extractedData.transaction = {
        amount: jsonResponse.transaction.amount,
        description: jsonResponse.transaction.description,
        category: jsonResponse.transaction.category,
        location: jsonResponse.transaction.location,
        paymentMethod: jsonResponse.transaction.paymentMethod,
        date: jsonResponse.transaction.date
          ? new Date(jsonResponse.transaction.date)
          : new Date(),
        type: jsonResponse.transaction.type || 'expense',
      };
    }

    // 목표 정보 추출
    if (jsonResponse.goal) {
      extractedData.goal = {
        title: jsonResponse.goal.title,
        targetAmount: jsonResponse.goal.targetAmount,
        targetDate: jsonResponse.goal.targetDate
          ? new Date(jsonResponse.goal.targetDate)
          : undefined,
        category: jsonResponse.goal.category,
        priority: jsonResponse.goal.priority || 'medium',
      };
    }

    // 분석 정보 추출
    if (jsonResponse.analysis) {
      extractedData.analysis = {
        period: jsonResponse.analysis.period,
        category: jsonResponse.analysis.category,
        type: jsonResponse.analysis.type,
      };
    }

    return Object.keys(extractedData).length > 0 ? extractedData : undefined;
  }

  /**
   * 텍스트에서 데이터 추출
   */
  private extractDataFromText(
    originalInput: string,
    response: string
  ): ExtractedData | undefined {
    const intent = this.detectIntent(originalInput);

    if (intent === 'transaction_record') {
      const transaction = this.extractTransactionFromText(originalInput);
      return transaction ? { transaction } : undefined;
    }

    return undefined;
  }

  /**
   * 텍스트에서 거래 정보 추출
   */
  private extractTransactionFromText(
    input: string
  ): ExtractedTransaction | null {
    const amount = this.extractAmount(input);
    if (amount === null) return null;

    const description = this.extractDescription(input);
    const category = this.extractCategory(input);
    const location = this.extractLocation(input);
    const paymentMethod = this.extractPaymentMethod(input);

    return {
      amount,
      description,
      category: category || '기타',
      location,
      paymentMethod,
      date: new Date(),
      type: 'expense',
    };
  }

  /**
   * 금액 추출
   */
  private extractAmount(input: string): number | null {
    // "만원" 패턴
    const manwonMatch = input.match(/(\d+(?:[.,]\d+)?)만원/);
    if (manwonMatch) {
      return parseFloat(manwonMatch[1].replace(',', '')) * 10000;
    }

    // "천원" 패턴
    const cheonwonMatch = input.match(/(\d+(?:[.,]\d+)?)천원/);
    if (cheonwonMatch) {
      return parseFloat(cheonwonMatch[1].replace(',', '')) * 1000;
    }

    // "원" 패턴
    const wonMatch = input.match(/(\d+(?:[.,]\d+)?)원/);
    if (wonMatch) {
      return parseFloat(wonMatch[1].replace(',', ''));
    }

    // 숫자만 있는 경우
    const numberMatch = input.match(/\d{3,}/);
    if (numberMatch) {
      return parseInt(numberMatch[0]);
    }

    return null;
  }

  /**
   * 설명 추출
   */
  private extractDescription(input: string): string {
    // 금액 부분 제거
    const withoutAmount = input
      .replace(/\d+(?:[.,]\d+)?(?:만원|천원|원)/g, '')
      .trim();

    // 특수 문자 및 불필요한 단어 제거
    return (
      withoutAmount.replace(/[에서|에|을|를|이|가|은|는|의]/g, '').trim() ||
      '지출'
    );
  }

  /**
   * 카테고리 추출
   */
  private extractCategory(input: string): string | undefined {
    for (const [category, keywords] of Object.entries(this.categoryKeywords)) {
      if (keywords.some(keyword => input.includes(keyword))) {
        return category;
      }
    }
    return undefined;
  }

  /**
   * 장소 추출
   */
  private extractLocation(input: string): string | undefined {
    // 상호명 패턴 (한글 + 영문 조합)
    const locationMatch = input.match(
      /([가-힣A-Za-z]+(?:\s[가-힣A-Za-z]+)*(?:점|마트|카페|병원|약국))/
    );
    if (locationMatch) {
      return locationMatch[1];
    }

    // 브랜드명
    const brands = [
      '스타벅스',
      '맥도날드',
      '버거킹',
      'GS25',
      '세븐일레븐',
      '이마트',
    ];
    for (const brand of brands) {
      if (input.includes(brand)) {
        return brand;
      }
    }

    return undefined;
  }

  /**
   * 결제수단 추출
   */
  private extractPaymentMethod(input: string): string | undefined {
    for (const [method, keywords] of Object.entries(
      this.paymentMethodKeywords
    )) {
      if (keywords.some(keyword => input.includes(keyword))) {
        return method;
      }
    }
    return undefined;
  }

  /**
   * 신뢰도 계산
   */
  private calculateConfidence(
    jsonResponse: any,
    originalInput: string
  ): number {
    let confidence = 0.5; // 기본값

    // JSON 형식이면 신뢰도 상승
    if (jsonResponse.intent) confidence += 0.2;
    if (jsonResponse.transaction || jsonResponse.goal || jsonResponse.analysis)
      confidence += 0.2;

    // 금액이 정확히 추출되면 신뢰도 상승
    if (this.extractAmount(originalInput) !== null) confidence += 0.1;

    return Math.min(confidence, 1.0);
  }

  /**
   * 텍스트 신뢰도 계산
   */
  private calculateTextConfidence(
    originalInput: string,
    response: string
  ): number {
    let confidence = 0.3; // 텍스트 응답 기본값

    // 키워드 매칭으로 신뢰도 계산
    const intent = this.detectIntent(originalInput);
    if (intent !== 'unknown') confidence += 0.2;

    // 응답 품질 평가
    if (response.length > 10) confidence += 0.1;
    if (
      response.includes('원') ||
      response.includes('예산') ||
      response.includes('저축')
    )
      confidence += 0.1;

    return Math.min(confidence, 0.8); // 텍스트 응답 최대 신뢰도 제한
  }

  /**
   * 제안사항 생성
   */
  private generateSuggestions(intent: MessageIntent): string[] {
    const suggestions: Record<MessageIntent, string[]> = {
      transaction_record: [
        '이번 달 지출 분석 보기',
        '비슷한 카테고리 지출 확인',
        '예산 대비 현황 확인',
      ],
      financial_advice: [
        '절약 팁 더 보기',
        '예산 계획 세우기',
        '저축 목표 설정',
      ],
      goal_setting: [
        '목표 달성 전략 보기',
        '월별 저축 계획',
        '목표 진행상황 확인',
      ],
      spending_analysis: [
        '카테고리별 상세 분석',
        '월별 트렌드 보기',
        '절약 기회 찾기',
      ],
      greeting: [
        '오늘 지출 기록하기',
        '이번 달 현황 보기',
        '저축 목표 설정하기',
      ],
      general_question: [
        '가계부 기능 알아보기',
        'AI 조언 받기',
        '지출 분석하기',
      ],
      unknown: [],
    };

    return suggestions[intent] || [];
  }

  /**
   * 토큰 수 추정
   */
  private estimateTokens(text: string): number {
    // 한국어는 대략 1글자당 1.5토큰으로 추정
    return Math.ceil(text.length * 1.5);
  }

  /**
   * JSON 파싱 시도
   */
  private tryParseJSON(text: string): any | null {
    try {
      // 코드 블록 제거
      const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleaned);
    } catch {
      // 부분 JSON 추출 시도
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch {
          return null;
        }
      }
      return null;
    }
  }

  /**
   * 에러 응답 생성
   */
  private createErrorResponse(originalInput: string, error: any): AIResponse {
    return {
      id: this.generateResponseId(),
      content:
        '죄송합니다. 메시지를 처리하는 중 오류가 발생했습니다. 다시 시도해 주세요.',
      intent: 'unknown',
      confidence: 0.0,
      suggestions: ['다시 시도하기', '다른 방식으로 말해보기'],
      metadata: {
        tokensUsed: this.estimateTokens(originalInput),
        responseTime: Date.now(),
        modelVersion: 'EXAONE-3.5-7.8B',
      },
    };
  }

  /**
   * 응답 ID 생성
   */
  private generateResponseId(): string {
    return `resp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
