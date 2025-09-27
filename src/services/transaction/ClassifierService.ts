/**
 * 거래 분류 서비스
 * AI 결과 + 규칙 기반 분류
 */

import {
  ParsedTransaction,
  CategoryType,
  PaymentMethod,
} from '../../types/transaction';
import {
  CATEGORIES,
  getAmountRangeCategories,
  getTimeBasedCategories,
  INCOME_CATEGORIES,
} from '../../constants/categories';
import { NLPParser } from './NLPParser';

export interface ClassificationResult {
  category: CategoryType;
  subcategory?: string;
  confidence: number;
  reasoning: string[];
}

export class ClassifierService {
  /**
   * 키워드 기반 카테고리 분류
   */
  static classifyByKeywords(text: string, description: string, location?: string): ClassificationResult[] {
    const results: ClassificationResult[] = [];
    const searchText = [text, description, location || ''].join(' ').toLowerCase();

    for (const [categoryType, categoryInfo] of Object.entries(CATEGORIES)) {
      let score = 0;
      const matchedKeywords: string[] = [];

      // 키워드 매칭
      for (const keyword of categoryInfo.keywords) {
        if (searchText.includes(keyword.toLowerCase())) {
          score += 1;
          matchedKeywords.push(keyword);
        }
      }

      // 정확한 브랜드명 매칭 시 가중치 추가
      const exactBrandMatch = categoryInfo.keywords.find(keyword =>
        keyword.length > 2 && searchText.includes(keyword.toLowerCase())
      );

      if (exactBrandMatch) {
        score += 2;
      }

      if (score > 0) {
        const confidence = Math.min(score * 0.2, 1.0);
        const subcategory = this.findSubcategory(searchText, categoryInfo.subcategories);

        results.push({
          category: categoryType as CategoryType,
          subcategory,
          confidence,
          reasoning: [`키워드 매칭: ${matchedKeywords.join(', ')}`],
        });
      }
    }

    return results.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * 금액 기반 카테고리 추론
   */
  static classifyByAmount(amount: number): ClassificationResult[] {
    const suggestedCategories = getAmountRangeCategories(amount);
    const results: ClassificationResult[] = [];

    for (const category of suggestedCategories) {
      const categoryInfo = CATEGORIES[category];
      const averageAmount = categoryInfo.averageAmount || 0;

      // 평균 금액과의 차이로 신뢰도 계산
      let confidence = 0.1;
      if (averageAmount > 0) {
        const ratio = Math.min(amount, averageAmount) / Math.max(amount, averageAmount);
        confidence = ratio * 0.3;
      }

      results.push({
        category,
        confidence,
        reasoning: [`금액 범위 매칭 (₩${amount.toLocaleString()})`],
      });
    }

    return results;
  }

  /**
   * 시간 기반 카테고리 추론
   */
  static classifyByTime(date: Date): ClassificationResult[] {
    const hour = date.getHours();
    const suggestedCategories = getTimeBasedCategories(hour);
    const results: ClassificationResult[] = [];

    for (const category of suggestedCategories) {
      results.push({
        category,
        confidence: 0.2,
        reasoning: [`시간대 패턴 (${hour}시)`],
      });
    }

    return results;
  }

  /**
   * 결제수단 기반 카테고리 추론
   */
  static classifyByPaymentMethod(paymentMethod: PaymentMethod): ClassificationResult[] {
    const results: ClassificationResult[] = [];

    switch (paymentMethod) {
      case PaymentMethod.CASH:
        // 현금은 보통 소액 지출
        results.push({
          category: CategoryType.FOOD,
          confidence: 0.15,
          reasoning: ['현금 결제 → 소액 식비 추정'],
        });
        break;

      case PaymentMethod.MOBILE_PAY:
        // 모바일 페이는 편의점, 카페에서 많이 사용
        results.push({
          category: CategoryType.FOOD,
          confidence: 0.2,
          reasoning: ['모바일 결제 → 편의점/카페 추정'],
        });
        break;

      case PaymentMethod.TRANSFER:
        // 계좌이체는 보통 큰 금액
        results.push({
          category: CategoryType.UTILITIES,
          confidence: 0.15,
          reasoning: ['계좌이체 → 공과금/정기결제 추정'],
        });
        break;

      default:
        // 카드는 범용적이므로 추가 정보 없음
        break;
    }

    return results;
  }

  /**
   * 서브카테고리 찾기
   */
  private static findSubcategory(text: string, subcategories: string[]): string | undefined {
    for (const subcategory of subcategories) {
      const keywords = subcategory.split('/');
      for (const keyword of keywords) {
        if (text.includes(keyword.toLowerCase())) {
          return subcategory;
        }
      }
    }
    return undefined;
  }

  /**
   * 수입 거래 분류
   */
  static classifyIncome(text: string): ClassificationResult {
    const incomeKeywords = {
      '급여/월급': ['월급', '급여', '연봉', '임금'],
      '부업/투잡': ['부업', '투잡', '알바', '아르바이트', '외주'],
      '용돈/선물': ['용돈', '선물받은', '생일선물', '축의금'],
      '상여금/보너스': ['상여금', '보너스', '성과급', '인센티브'],
      '투자수익': ['주식', '투자', '수익', '배당', '펀드'],
      '판매수익': ['판매', '중고', '팔았', '경매'],
    };

    for (const [subcategory, keywords] of Object.entries(incomeKeywords)) {
      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          return {
            category: CategoryType.INCOME,
            subcategory,
            confidence: 0.8,
            reasoning: [`수입 키워드 매칭: ${keyword}`],
          };
        }
      }
    }

    return {
      category: CategoryType.INCOME,
      confidence: 0.5,
      reasoning: ['수입으로 분류'],
    };
  }

  /**
   * 종합적인 분류 결과 계산
   */
  static classifyTransaction(
    originalText: string,
    parsedData: Partial<ParsedTransaction>,
    aiResult?: { category: string; confidence: number }
  ): ClassificationResult {
    const {
      amount = 0,
      description = '',
      location,
      isIncome = false,
      paymentMethod = PaymentMethod.CARD,
    } = parsedData;

    // 수입 거래 처리
    if (isIncome) {
      return this.classifyIncome(originalText);
    }

    // 각 방법별 분류 결과 수집
    const allResults: ClassificationResult[] = [];

    // 1. 키워드 기반 분류 (가장 중요)
    const keywordResults = this.classifyByKeywords(originalText, description, location);
    allResults.push(...keywordResults);

    // 2. AI 결과가 있으면 추가
    if (aiResult) {
      const aiCategory = Object.values(CategoryType).find(cat =>
        cat === aiResult.category || CATEGORIES[cat].name === aiResult.category
      );

      if (aiCategory) {
        allResults.push({
          category: aiCategory,
          confidence: aiResult.confidence,
          reasoning: ['AI 분류 결과'],
        });
      }
    }

    // 3. 금액 기반 분류
    if (amount > 0) {
      const amountResults = this.classifyByAmount(amount);
      allResults.push(...amountResults);
    }

    // 4. 시간 기반 분류
    const timeResults = this.classifyByTime(new Date());
    allResults.push(...timeResults);

    // 5. 결제수단 기반 분류
    const paymentResults = this.classifyByPaymentMethod(paymentMethod);
    allResults.push(...paymentResults);

    // 카테고리별 신뢰도 합산
    const categoryScores = new Map<CategoryType, {
      totalConfidence: number;
      reasoning: string[];
      subcategory?: string;
    }>();

    for (const result of allResults) {
      const current = categoryScores.get(result.category) || {
        totalConfidence: 0,
        reasoning: [],
      };

      current.totalConfidence += result.confidence;
      current.reasoning.push(...result.reasoning);

      if (result.subcategory && !current.subcategory) {
        current.subcategory = result.subcategory;
      }

      categoryScores.set(result.category, current);
    }

    // 최고 점수 카테고리 선택
    let bestCategory: CategoryType = CategoryType.OTHER;
    let bestScore = 0;
    let bestReasoning: string[] = [];
    let bestSubcategory: string | undefined;

    for (const [category, data] of categoryScores.entries()) {
      if (data.totalConfidence > bestScore) {
        bestCategory = category;
        bestScore = data.totalConfidence;
        bestReasoning = data.reasoning;
        bestSubcategory = data.subcategory;
      }
    }

    // 신뢰도가 너무 낮으면 OTHER로 분류
    if (bestScore < 0.1) {
      bestCategory = CategoryType.OTHER;
      bestScore = 0.3;
      bestReasoning = ['분류 기준 부족으로 기타로 분류'];
    }

    // 최종 신뢰도 정규화 (최대 1.0)
    const finalConfidence = Math.min(bestScore, 1.0);

    return {
      category: bestCategory,
      subcategory: bestSubcategory,
      confidence: finalConfidence,
      reasoning: bestReasoning,
    };
  }

  /**
   * 사용자 피드백을 통한 학습 (간단한 구현)
   */
  static async learnFromFeedback(
    originalText: string,
    actualCategory: CategoryType,
    actualSubcategory?: string
  ): Promise<void> {
    // 향후 구현: 사용자 수정 사항을 로컬 학습 데이터로 저장
    // AsyncStorage에 학습 데이터 저장하여 분류 정확도 향상
    console.log('Learning from feedback:', {
      text: originalText,
      category: actualCategory,
      subcategory: actualSubcategory,
    });
  }
}