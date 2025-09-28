/**
 * 자연어 파싱 서비스
 * AI 결과 후처리 및 한국어 패턴 분석
 */

import { ParsedTransaction, CategoryType, PaymentMethod } from '../../types/transaction';

export class NLPParser {
  // 한국어 숫자 패턴
  private static readonly KOREAN_NUMBERS = {
    '천': 1000,
    '만': 10000,
    '억': 100000000,
    '조': 1000000000000,
  };

  // 금액 추출 정규식
  private static readonly AMOUNT_PATTERNS = [
    /(\d{1,3}(?:,\d{3})*)\s*원/g,              // 12,000원
    /(\d+)\s*천\s*원?/g,                       // 12천원
    /(\d+)\s*만\s*원?/g,                       // 5만원
    /(\d+)\s*만\s*(\d+)\s*천\s*원?/g,          // 5만2천원
    /(\d+)\s*원/g,                             // 5000원
  ];

  // 결제수단 키워드
  private static readonly PAYMENT_KEYWORDS = {
    [PaymentMethod.CASH]: ['현금', '돈', '지폐', '동전'],
    [PaymentMethod.CARD]: ['카드', '체크카드', '신용카드', '삼성페이', '애플페이'],
    [PaymentMethod.TRANSFER]: ['계좌이체', '이체', '송금', '무통장입금'],
    [PaymentMethod.MOBILE_PAY]: ['카카오페이', '네이버페이', '페이코', '토스', '모바일결제', '간편결제'],
  };

  // 장소/상호명 패턴
  private static readonly LOCATION_PATTERNS = [
    /(?:에서|에|으로|로|에게)\s*(.+?)(?:\s|$)/g,    // "에서 스타벅스"
    /(.+?)(?:에서|에)\s/g,                         // "스타벅스에서"
  ];

  // 시간 표현 패턴
  private static readonly TIME_PATTERNS = [
    /(오늘|어제|그저께|내일|모레)/,
    /(\d{1,2})시(?:\s*(\d{1,2})분)?/,
    /(아침|점심|저녁|밤|새벽)/,
    /(오전|오후)\s*(\d{1,2})시/,
  ];

  /**
   * 텍스트에서 금액 추출
   */
  static extractAmount(text: string): number {
    let amount = 0;

    // 패턴별로 금액 추출 시도
    for (const pattern of this.AMOUNT_PATTERNS) {
      const matches = [...text.matchAll(pattern)];

      for (const match of matches) {
        if (pattern.source.includes('만.*천')) {
          // "5만2천원" 형태
          const manAmount = parseInt(match[1]) * 10000;
          const cheonAmount = parseInt(match[2]) * 1000;
          amount = Math.max(amount, manAmount + cheonAmount);
        } else if (pattern.source.includes('만')) {
          // "5만원" 형태
          amount = Math.max(amount, parseInt(match[1]) * 10000);
        } else if (pattern.source.includes('천')) {
          // "12천원" 형태
          amount = Math.max(amount, parseInt(match[1]) * 1000);
        } else {
          // 일반 숫자
          const cleanNumber = match[1].replace(/,/g, '');
          amount = Math.max(amount, parseInt(cleanNumber));
        }
      }
    }

    // 금액이 너무 작으면 0으로 처리
    return amount < 10 ? 0 : amount;
  }

  /**
   * 결제수단 추출
   */
  static extractPaymentMethod(text: string): PaymentMethod {
    const lowerText = text.toLowerCase();

    for (const [method, keywords] of Object.entries(this.PAYMENT_KEYWORDS)) {
      for (const keyword of keywords) {
        if (lowerText.includes(keyword)) {
          return method as PaymentMethod;
        }
      }
    }

    // 기본값: 카드
    return PaymentMethod.CARD;
  }

  /**
   * 장소/상호명 추출
   */
  static extractLocation(text: string): string | undefined {
    // 위치 패턴 매칭
    for (const pattern of this.LOCATION_PATTERNS) {
      const matches = [...text.matchAll(pattern)];
      if (matches.length > 0) {
        const location = matches[0][1]?.trim();
        if (location && location.length > 0 && location.length < 50) {
          return location;
        }
      }
    }

    // 패턴으로 추출 실패 시, 일반적인 상호명 추출
    const commonBrands = [
      '스타벅스', '투썸플레이스', '이디야', '폴바셋', '할리스',
      '맥도날드', '버거킹', 'KFC', '롯데리아', '서브웨이',
      'GS25', 'CU', '세븐일레븐', '이마트24',
      '이마트', '홈플러스', '롯데마트', '코스트코'
    ];

    for (const brand of commonBrands) {
      if (text.includes(brand)) {
        return brand;
      }
    }

    return undefined;
  }

  /**
   * 시간 정보 추출 및 날짜 계산
   */
  static extractDate(text: string): Date {
    const now = new Date();

    // 상대적 날짜 표현
    if (text.includes('어제')) {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday;
    } else if (text.includes('그저께')) {
      const dayBeforeYesterday = new Date(now);
      dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);
      return dayBeforeYesterday;
    } else if (text.includes('내일')) {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    } else if (text.includes('모레')) {
      const dayAfterTomorrow = new Date(now);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
      return dayAfterTomorrow;
    }

    // 시간 표현이 있으면 오늘 날짜에 시간 설정
    const timeMatch = text.match(/(\d{1,2})시(?:\s*(\d{1,2})분)?/);
    if (timeMatch) {
      const hour = parseInt(timeMatch[1]);
      const minute = timeMatch[2] ? parseInt(timeMatch[2]) : 0;

      const result = new Date(now);
      result.setHours(hour, minute, 0, 0);
      return result;
    }

    // 기본값: 현재 시간
    return now;
  }

  /**
   * 수입/지출 판단
   */
  static isIncome(text: string): boolean {
    const incomeKeywords = [
      '받았', '입금', '월급', '급여', '상여금', '보너스', '용돈',
      '수익', '판매', '환불', '캐시백', '적립', '리워드',
      '벌었', '벌어', '소득', '수입', '수당', '배당', '이자',
      '수령', '지급받', '들어왔', '입출금'
    ];

    return incomeKeywords.some(keyword => text.includes(keyword));
  }

  /**
   * 설명 텍스트 정리
   */
  static cleanDescription(text: string, extractedLocation?: string): string {
    let cleaned = text;

    // 금액 정보 제거
    for (const pattern of this.AMOUNT_PATTERNS) {
      cleaned = cleaned.replace(pattern, '');
    }

    // 결제수단 정보 제거
    Object.values(this.PAYMENT_KEYWORDS).flat().forEach(keyword => {
      cleaned = cleaned.replace(new RegExp(keyword, 'gi'), '');
    });

    // 시간 정보 제거
    this.TIME_PATTERNS.forEach(pattern => {
      cleaned = cleaned.replace(pattern, '');
    });

    // 불필요한 조사, 어미 제거
    cleaned = cleaned.replace(/[에서|에|으로|로|에게|을|를|이|가|은|는|의]\s*/g, '');

    // 공백 정리
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    // 장소명이 설명에 포함되어 있으면 제거
    if (extractedLocation && cleaned.includes(extractedLocation)) {
      cleaned = cleaned.replace(extractedLocation, '').trim();
    }

    // 너무 짧거나 비어있으면 원본 텍스트의 주요 부분 반환
    if (!cleaned || cleaned.length < 2) {
      // 원본에서 의미있는 단어 추출
      const words = text.split(/\s+/).filter(word =>
        word.length > 1 &&
        !this.AMOUNT_PATTERNS.some(p => p.test(word)) &&
        !Object.values(this.PAYMENT_KEYWORDS).flat().some(k => word.includes(k))
      );

      return words.slice(0, 3).join(' ') || '거래';
    }

    return cleaned;
  }

  /**
   * 신뢰도 계산
   */
  static calculateConfidence(
    originalText: string,
    extractedAmount: number,
    extractedLocation?: string
  ): number {
    let confidence = 0.5; // 기본 신뢰도

    // 금액이 명확히 추출되었으면 +0.3
    if (extractedAmount > 0) {
      confidence += 0.3;
    }

    // 장소가 추출되었으면 +0.2
    if (extractedLocation) {
      confidence += 0.2;
    }

    // 결제수단이 명시되어 있으면 +0.1
    const hasPaymentMethod = Object.values(this.PAYMENT_KEYWORDS)
      .flat()
      .some(keyword => originalText.includes(keyword));

    if (hasPaymentMethod) {
      confidence += 0.1;
    }

    // 텍스트가 길고 구체적이면 추가 점수
    if (originalText.length > 10) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * 메인 파싱 함수
   */
  static parseTransactionText(text: string): Partial<ParsedTransaction> {
    const amount = this.extractAmount(text);
    const paymentMethod = this.extractPaymentMethod(text);
    const location = this.extractLocation(text);
    const date = this.extractDate(text);
    const isIncome = this.isIncome(text);
    const description = this.cleanDescription(text, location);
    const confidence = this.calculateConfidence(text, amount, location);

    return {
      amount,
      description,
      paymentMethod,
      location,
      isIncome,
      confidence,
      originalText: text,
      date,
      category: CategoryType.OTHER, // 기본값, 나중에 분류기에서 결정
      tags: [],
    };
  }
}