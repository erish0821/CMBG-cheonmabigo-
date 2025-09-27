import { pythonLLMService } from './PythonLLMService';
import { CreateBudgetRequest } from '../../types/budget';
import { NLPParser } from '../transaction/NLPParser';

export interface BudgetParseResult {
  success: boolean;
  budgetData?: Partial<CreateBudgetRequest>;
  error?: string;
  needsMoreInfo?: string[];
}

export class BudgetLLMService {
  /**
   * 자연어를 예산 데이터로 파싱
   */
  static async parseBudgetFromText(text: string): Promise<BudgetParseResult> {
    try {
      // 1단계: 기본 정보 추출
      const basicInfo = this.extractBasicBudgetInfo(text);

      // 2단계: LLM을 통한 컨텍스트 이해
      const llmResult = await this.getLLMBudgetAnalysis(text);

      // 3단계: 결과 통합
      const budgetData = this.combineBudgetInfo(basicInfo, llmResult);

      // 4단계: 유효성 검사
      const validation = this.validateBudgetData(budgetData);

      if (!validation.isValid) {
        return {
          success: false,
          error: '예산 정보가 불완전합니다.',
          needsMoreInfo: validation.missingFields,
        };
      }

      return {
        success: true,
        budgetData,
      };
    } catch (error) {
      console.error('예산 파싱 실패:', error);
      return {
        success: false,
        error: '예산 정보를 파악할 수 없습니다.',
      };
    }
  }

  /**
   * 예산 관련 질문 응답 생성
   */
  static async getBudgetAdvice(
    question: string,
    currentBudgets?: any,
    spendingData?: any
  ): Promise<string> {
    try {
      const prompt = this.buildBudgetAdvicePrompt(question, currentBudgets, spendingData);
      const response = await pythonLLMService.getFinancialAdvice(prompt);
      return response;
    } catch (error) {
      console.error('예산 조언 생성 실패:', error);
      return '죄송합니다. 예산 관련 조언을 제공할 수 없습니다.';
    }
  }

  /**
   * 기본 예산 정보 추출
   */
  private static extractBasicBudgetInfo(text: string): Partial<CreateBudgetRequest> {
    const budgetData: Partial<CreateBudgetRequest> = {};

    // 금액 추출
    const amountPatterns = [
      /(\d{1,3}(?:,\d{3})*|\d+)만원/g,
      /(\d{1,3}(?:,\d{3})*|\d+)원/g,
      /(\d{1,3}(?:,\d{3})*|\d+)/g,
    ];

    for (const pattern of amountPatterns) {
      const match = text.match(pattern);
      if (match) {
        let amount = parseInt(match[0].replace(/[^\d]/g, ''));
        if (match[0].includes('만원')) {
          amount *= 10000;
        }
        budgetData.amount = amount;
        break;
      }
    }

    // 카테고리 추출
    const categoryKeywords = {
      food: ['식비', '음식', '먹을거리', '식당', '음식점', '카페', '커피'],
      transport: ['교통비', '교통', '버스', '지하철', '택시', '기름값', '주유'],
      shopping: ['쇼핑', '옷', '의류', '화장품', '생필품', '마트'],
      entertainment: ['여가', '오락', '영화', '게임', '취미', '놀이'],
      health: ['병원', '의료', '약', '건강', '헬스장', '운동'],
      education: ['교육', '학원', '책', '강의', '수업'],
      utilities: ['관리비', '전기세', '가스비', '수도세', '통신비', '인터넷'],
      others: ['기타', '잡비', '기타지출'],
    };

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        budgetData.category = category;
        break;
      }
    }

    // 기간 추출
    if (text.includes('월') || text.includes('한달') || text.includes('매월')) {
      budgetData.period = 'monthly';
    } else if (text.includes('주') || text.includes('일주일') || text.includes('매주')) {
      budgetData.period = 'weekly';
    } else if (text.includes('일') || text.includes('하루') || text.includes('매일')) {
      budgetData.period = 'daily';
    } else if (text.includes('년') || text.includes('연간') || text.includes('매년')) {
      budgetData.period = 'yearly';
    }

    // 이름 생성
    if (budgetData.category && budgetData.period) {
      const categoryNames = {
        food: '식비',
        transport: '교통비',
        shopping: '쇼핑',
        entertainment: '여가비',
        health: '의료비',
        education: '교육비',
        utilities: '공과금',
        others: '기타',
      };

      const periodNames = {
        daily: '일일',
        weekly: '주간',
        monthly: '월간',
        yearly: '연간',
      };

      budgetData.name = `${periodNames[budgetData.period]} ${categoryNames[budgetData.category]}`;
    }

    return budgetData;
  }

  /**
   * LLM을 통한 예산 분석
   */
  private static async getLLMBudgetAnalysis(text: string): Promise<any> {
    try {
      const prompt = `다음 텍스트에서 예산 설정 정보를 추출해주세요:
"${text}"

다음 정보를 JSON 형태로 응답해주세요:
- name: 예산 이름
- category: 카테고리 (food, transport, shopping, entertainment, health, education, utilities, others 중 하나)
- amount: 금액 (숫자만)
- period: 기간 (daily, weekly, monthly, yearly 중 하나)
- description: 설명

예시: {"name": "월간 식비", "category": "food", "amount": 300000, "period": "monthly", "description": "한달 식비 예산"}`;

      const response = await pythonLLMService.getFinancialAdvice(prompt);

      // JSON 추출 시도
      const jsonMatch = response.match(/\{[^}]+\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return {};
    } catch (error) {
      console.warn('LLM 예산 분석 실패:', error);
      return {};
    }
  }

  /**
   * 예산 정보 통합
   */
  private static combineBudgetInfo(
    basicInfo: Partial<CreateBudgetRequest>,
    llmResult: any
  ): Partial<CreateBudgetRequest> {
    return {
      ...basicInfo,
      ...llmResult,
      startDate: new Date(),
      isRecurring: true,
    };
  }

  /**
   * 예산 데이터 유효성 검사
   */
  private static validateBudgetData(budgetData: Partial<CreateBudgetRequest>): {
    isValid: boolean;
    missingFields: string[];
  } {
    const requiredFields = ['name', 'category', 'amount', 'period'];
    const missingFields: string[] = [];

    for (const field of requiredFields) {
      if (!budgetData[field as keyof CreateBudgetRequest]) {
        missingFields.push(field);
      }
    }

    // 금액이 0 이하인 경우
    if (budgetData.amount && budgetData.amount <= 0) {
      missingFields.push('amount');
    }

    return {
      isValid: missingFields.length === 0,
      missingFields,
    };
  }

  /**
   * 예산 조언 프롬프트 구성
   */
  private static buildBudgetAdvicePrompt(
    question: string,
    currentBudgets?: any,
    spendingData?: any
  ): string {
    let prompt = `사용자의 예산 관련 질문에 한국어로 친근하게 답변해주세요.\n\n질문: ${question}\n\n`;

    if (currentBudgets) {
      prompt += `현재 예산 정보:\n`;
      currentBudgets.forEach((budget: any) => {
        prompt += `- ${budget.name}: ${budget.amount.toLocaleString()}원 (${budget.spent.toLocaleString()}원 사용)\n`;
      });
      prompt += '\n';
    }

    if (spendingData) {
      prompt += `최근 지출 패턴:\n`;
      prompt += `- 총 지출: ${spendingData.totalSpent?.toLocaleString()}원\n`;
      prompt += `- 일일 평균: ${spendingData.dailyAverage?.toLocaleString()}원\n\n`;
    }

    prompt += `답변 시 다음을 고려해주세요:
- 구체적이고 실행 가능한 조언
- 한국의 생활비 수준에 맞는 현실적인 제안
- 긍정적이고 격려하는 톤
- 200자 이내의 간결한 답변`;

    return prompt;
  }

  /**
   * 예산 설정 의도 감지
   */
  static detectBudgetIntent(text: string): {
    isBudgetRequest: boolean;
    intentType: 'create' | 'modify' | 'query' | 'advice' | null;
    confidence: number;
  } {
    const budgetKeywords = [
      '예산', '예산설정', '예산잡기', '한도', '제한',
      '월 예산', '식비 예산', '교통비 예산',
      '얼마까지', '얼마나 써도', '한달에 얼마',
    ];

    const createKeywords = ['설정', '잡고싶다', '정하고싶다', '만들어', '추가'];
    const modifyKeywords = ['변경', '수정', '늘리고', '줄이고', '바꾸고'];
    const queryKeywords = ['얼마', '현재', '지금', '확인'];
    const adviceKeywords = ['조언', '추천', '어떻게', '방법', '팁'];

    let isBudgetRequest = false;
    let confidence = 0;

    // 예산 관련 키워드 체크
    for (const keyword of budgetKeywords) {
      if (text.includes(keyword)) {
        isBudgetRequest = true;
        confidence += 0.3;
      }
    }

    if (!isBudgetRequest) {
      return { isBudgetRequest: false, intentType: null, confidence: 0 };
    }

    // 의도 분류
    let intentType: 'create' | 'modify' | 'query' | 'advice' | null = null;
    let maxScore = 0;

    const intentScores = {
      create: createKeywords.filter(k => text.includes(k)).length,
      modify: modifyKeywords.filter(k => text.includes(k)).length,
      query: queryKeywords.filter(k => text.includes(k)).length,
      advice: adviceKeywords.filter(k => text.includes(k)).length,
    };

    for (const [intent, score] of Object.entries(intentScores)) {
      if (score > maxScore) {
        maxScore = score;
        intentType = intent as 'create' | 'modify' | 'query' | 'advice';
      }
    }

    // 기본적으로 생성으로 간주 (금액이 포함된 경우)
    if (!intentType && /\d+/.test(text)) {
      intentType = 'create';
    }

    confidence = Math.min(confidence + (maxScore * 0.2), 1.0);

    return {
      isBudgetRequest,
      intentType,
      confidence,
    };
  }
}