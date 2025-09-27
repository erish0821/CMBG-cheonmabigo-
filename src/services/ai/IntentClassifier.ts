import { MessageIntent } from '../../types/ai';

/**
 * 한국어 특화 의도 분류 시스템
 * 재정 관리 도메인에 특화된 NLP 분류기
 */
export class IntentClassifier {
  private transactionPatterns = {
    keywords: [
      '원',
      '만원',
      '천원',
      '백원',
      '돈',
      '지출',
      '결제',
      '샀',
      '구매',
      '사용',
      '썼',
      '냈',
      '결제했',
      '주문했',
      '계산했',
      '계산',
      '값',
      '비용',
      '요금',
    ],
    amounts: /(\d+(?:[,.\s]\d+)*)\s*(?:만원|천원|백원|원)/g,
    verbs: ['샀', '했', '냈', '썼', '구매했', '결제했', '주문했', '계산했'],
  };

  private advicePatterns = {
    keywords: [
      '어떻게',
      '방법',
      '팁',
      '조언',
      '추천',
      '어떤',
      '뭘',
      '뭐가',
      '뭐를',
      '절약',
      '관리',
      '계획',
      '도움',
      '가이드',
      '알려줘',
      '알려주세요',
      '궁금해',
      '궁금한',
      '문의',
      '질문',
    ],
    questions: ['어떻게', '어떤', '뭘', '뭐가', '뭐를', '왜', '언제', '어디서'],
    requests: [
      '알려줘',
      '알려주세요',
      '도와줘',
      '도와주세요',
      '추천해',
      '추천해줘',
    ],
  };

  private goalPatterns = {
    keywords: [
      '목표',
      '저축',
      '모으',
      '계획',
      '예산',
      '설정',
      '세우',
      '잡',
      '정해',
      '달성',
      '이루',
      '준비',
      '마련',
      '적금',
      '예금',
      '투자',
      '모아야',
    ],
    futureIndicators: [
      '할',
      '계획',
      '예정',
      '생각',
      '하려고',
      '할까',
      '해야',
      '하고싶어',
    ],
    amounts: ['얼마', '몇', '얼마나', '어느정도'],
  };

  private analysisPatterns = {
    keywords: [
      '분석',
      '현황',
      '상태',
      '상황',
      '얼마',
      '지출',
      '통계',
      '패턴',
      '트렌드',
      '비교',
      '확인',
      '체크',
      '점검',
      '리포트',
      '내역',
      '요약',
      '정리',
      '보여줘',
      '알려줘',
    ],
    timeIndicators: [
      '이번달',
      '저번달',
      '이달',
      '지난달',
      '올해',
      '작년',
      '최근',
      '요즘',
    ],
    categories: [
      '식비',
      '교통비',
      '쇼핑',
      '카페',
      '의료',
      '문화',
      '주거',
      '통신',
    ],
  };

  private greetingPatterns = {
    keywords: [
      '안녕',
      '안녕하세요',
      '안녕하십니까',
      '반가',
      '반갑',
      '처음',
      '시작',
      '시작해',
      '시작할게',
      'hello',
      'hi',
      '헬로',
      '하이',
    ],
    politeness: ['요', '습니다', '세요', '십시오', '해요', '이에요', '예요'],
  };

  private contextAnalyzer = {
    negativeWords: ['아니', '안', '못', '없', '싫', '어려워', '힘들어'],
    positiveWords: ['좋', '괜찮', '만족', '행복', '기뻐', '다행'],
    urgencyWords: ['급해', '빨리', '즉시', '바로', '지금', '당장', '서둘러'],
  };

  /**
   * 메시지 의도 분류
   */
  classifyIntent(message: string): {
    intent: MessageIntent;
    confidence: number;
    features: string[];
  } {
    const normalizedMessage = this.normalizeText(message);
    const scores = this.calculateIntentScores(normalizedMessage);

    // 최고 점수 의도 선택
    const intents = Object.keys(scores) as MessageIntent[];
    const bestIntent = intents.reduce((a, b) =>
      scores[a] > scores[b] ? a : b
    );

    const confidence = scores[bestIntent];
    const features = this.extractFeatures(normalizedMessage, bestIntent);

    return {
      intent: bestIntent,
      confidence,
      features,
    };
  }

  /**
   * 다중 의도 감지
   */
  detectMultipleIntents(message: string): Array<{
    intent: MessageIntent;
    confidence: number;
    segment: string;
  }> {
    const sentences = this.splitIntoSentences(message);
    const results: Array<{
      intent: MessageIntent;
      confidence: number;
      segment: string;
    }> = [];

    sentences.forEach(sentence => {
      const classification = this.classifyIntent(sentence);
      if (classification.confidence > 0.3) {
        results.push({
          intent: classification.intent,
          confidence: classification.confidence,
          segment: sentence,
        });
      }
    });

    return results;
  }

  /**
   * 텍스트 정규화
   */
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * 의도별 점수 계산
   */
  private calculateIntentScores(text: string): Record<MessageIntent, number> {
    const scores: Record<MessageIntent, number> = {
      transaction_record: 0,
      financial_advice: 0,
      goal_setting: 0,
      spending_analysis: 0,
      general_question: 0,
      greeting: 0,
      unknown: 0,
    };

    // 거래 기록 점수
    scores.transaction_record = this.calculateTransactionScore(text);

    // 재정 조언 점수
    scores.financial_advice = this.calculateAdviceScore(text);

    // 목표 설정 점수
    scores.goal_setting = this.calculateGoalScore(text);

    // 지출 분석 점수
    scores.spending_analysis = this.calculateAnalysisScore(text);

    // 인사 점수
    scores.greeting = this.calculateGreetingScore(text);

    // 일반 질문 점수 (기본값)
    scores.general_question = 0.2;

    // 점수 정규화
    const maxScore = Math.max(...Object.values(scores));
    if (maxScore > 0) {
      Object.keys(scores).forEach(key => {
        scores[key as MessageIntent] = scores[key as MessageIntent] / maxScore;
      });
    }

    return scores;
  }

  /**
   * 거래 기록 점수 계산
   */
  private calculateTransactionScore(text: string): number {
    let score = 0;

    // 금액 패턴 확인
    const amountMatches = text.match(this.transactionPatterns.amounts);
    if (amountMatches) {
      score += 0.6; // 금액이 있으면 높은 점수
    }

    // 거래 키워드 확인
    const keywordMatches = this.transactionPatterns.keywords.filter(keyword =>
      text.includes(keyword)
    );
    score += keywordMatches.length * 0.1;

    // 동사 패턴 확인
    const verbMatches = this.transactionPatterns.verbs.filter(verb =>
      text.includes(verb)
    );
    score += verbMatches.length * 0.15;

    // 상점명이나 장소 패턴
    if (this.hasLocationPattern(text)) {
      score += 0.2;
    }

    return Math.min(score, 1.0);
  }

  /**
   * 조언 요청 점수 계산
   */
  private calculateAdviceScore(text: string): number {
    let score = 0;

    // 질문 패턴 확인
    const questionMatches = this.advicePatterns.questions.filter(question =>
      text.includes(question)
    );
    score += questionMatches.length * 0.2;

    // 요청 패턴 확인
    const requestMatches = this.advicePatterns.requests.filter(request =>
      text.includes(request)
    );
    score += requestMatches.length * 0.25;

    // 조언 키워드 확인
    const keywordMatches = this.advicePatterns.keywords.filter(keyword =>
      text.includes(keyword)
    );
    score += keywordMatches.length * 0.1;

    // 물음표 확인
    if (text.includes('?') || text.includes('？')) {
      score += 0.15;
    }

    return Math.min(score, 1.0);
  }

  /**
   * 목표 설정 점수 계산
   */
  private calculateGoalScore(text: string): number {
    let score = 0;

    // 목표 키워드 확인
    const keywordMatches = this.goalPatterns.keywords.filter(keyword =>
      text.includes(keyword)
    );
    score += keywordMatches.length * 0.2;

    // 미래 지시어 확인
    const futureMatches = this.goalPatterns.futureIndicators.filter(indicator =>
      text.includes(indicator)
    );
    score += futureMatches.length * 0.2;

    // 금액 질문 패턴
    const amountMatches = this.goalPatterns.amounts.filter(amount =>
      text.includes(amount)
    );
    score += amountMatches.length * 0.15;

    return Math.min(score, 1.0);
  }

  /**
   * 분석 요청 점수 계산
   */
  private calculateAnalysisScore(text: string): number {
    let score = 0;

    // 분석 키워드 확인
    const keywordMatches = this.analysisPatterns.keywords.filter(keyword =>
      text.includes(keyword)
    );
    score += keywordMatches.length * 0.2;

    // 시간 지시어 확인
    const timeMatches = this.analysisPatterns.timeIndicators.filter(indicator =>
      text.includes(indicator)
    );
    score += timeMatches.length * 0.25;

    // 카테고리 언급 확인
    const categoryMatches = this.analysisPatterns.categories.filter(category =>
      text.includes(category)
    );
    score += categoryMatches.length * 0.15;

    return Math.min(score, 1.0);
  }

  /**
   * 인사 점수 계산
   */
  private calculateGreetingScore(text: string): number {
    let score = 0;

    // 인사 키워드 확인
    const keywordMatches = this.greetingPatterns.keywords.filter(keyword =>
      text.includes(keyword)
    );
    score += keywordMatches.length * 0.4;

    // 짧은 메시지는 인사일 가능성 높음
    if (text.length < 20) {
      score += 0.2;
    }

    // 존댓말 확인
    const politenessMatches = this.greetingPatterns.politeness.filter(polite =>
      text.includes(polite)
    );
    score += politenessMatches.length * 0.1;

    return Math.min(score, 1.0);
  }

  /**
   * 장소 패턴 확인
   */
  private hasLocationPattern(text: string): boolean {
    const locationKeywords = [
      '에서',
      '점',
      '마트',
      '카페',
      '병원',
      '약국',
      '백화점',
      '마켓',
      '스타벅스',
      '맥도날드',
      '버거킹',
      'gs25',
      '세븐일레븐',
      '이마트',
    ];

    return locationKeywords.some(keyword => text.includes(keyword));
  }

  /**
   * 특징 추출
   */
  private extractFeatures(text: string, intent: MessageIntent): string[] {
    const features: string[] = [];

    // 의도별 특징 추출
    switch (intent) {
      case 'transaction_record':
        const amounts = text.match(this.transactionPatterns.amounts);
        if (amounts) features.push(`amount:${amounts[0]}`);

        const locations = this.extractLocations(text);
        locations.forEach(loc => features.push(`location:${loc}`));
        break;

      case 'financial_advice':
        if (text.includes('어떻게')) features.push('question:how');
        if (text.includes('추천')) features.push('request:recommend');
        break;

      case 'goal_setting':
        if (text.includes('저축')) features.push('goal:savings');
        if (text.includes('예산')) features.push('goal:budget');
        break;

      case 'spending_analysis':
        this.analysisPatterns.timeIndicators.forEach(indicator => {
          if (text.includes(indicator)) features.push(`time:${indicator}`);
        });
        break;
    }

    // 감정 분석
    const sentiment = this.analyzeSentiment(text);
    if (sentiment !== 'neutral') {
      features.push(`sentiment:${sentiment}`);
    }

    return features;
  }

  /**
   * 장소명 추출
   */
  private extractLocations(text: string): string[] {
    const locations: string[] = [];

    // 패턴 매칭으로 장소명 추출
    const patterns = [
      /([가-힣A-Za-z0-9]+(?:점|마트|카페|병원|약국))/g,
      /(스타벅스|맥도날드|버거킹|gs25|세븐일레븐|이마트)/gi,
    ];

    patterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        locations.push(...matches);
      }
    });

    return locations;
  }

  /**
   * 감정 분석
   */
  private analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    const negativeCount = this.contextAnalyzer.negativeWords.filter(word =>
      text.includes(word)
    ).length;

    const positiveCount = this.contextAnalyzer.positiveWords.filter(word =>
      text.includes(word)
    ).length;

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  /**
   * 문장 분리
   */
  private splitIntoSentences(text: string): string[] {
    return text
      .split(/[.!?。！？]/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  /**
   * 의도 변경 추적
   */
  trackIntentTransition(
    previousIntent: MessageIntent,
    currentIntent: MessageIntent
  ): {
    isTransition: boolean;
    transitionType: 'natural' | 'abrupt' | 'related';
  } {
    const relatedIntents: Record<MessageIntent, MessageIntent[]> = {
      transaction_record: ['spending_analysis', 'goal_setting'],
      financial_advice: ['goal_setting', 'spending_analysis'],
      goal_setting: ['financial_advice', 'transaction_record'],
      spending_analysis: ['financial_advice', 'transaction_record'],
      greeting: ['general_question', 'financial_advice'],
      general_question: ['financial_advice', 'transaction_record'],
      unknown: [],
    };

    if (previousIntent === currentIntent) {
      return { isTransition: false, transitionType: 'natural' };
    }

    const isRelated =
      relatedIntents[previousIntent]?.includes(currentIntent) || false;

    return {
      isTransition: true,
      transitionType: isRelated ? 'related' : 'abrupt',
    };
  }
}
