// 한국어 음성 인식 최적화 유틸리티

export interface KoreanNumberMap {
  [key: string]: number;
}

// 한국어 숫자 변환 맵
export const koreanNumbers: KoreanNumberMap = {
  // 기본 숫자
  '영': 0, '공': 0, '제로': 0,
  '일': 1, '하나': 1, '한': 1,
  '이': 2, '둘': 2, '두': 2,
  '삼': 3, '셋': 3, '세': 3,
  '사': 4, '넷': 4, '네': 4,
  '오': 5, '다섯': 5,
  '육': 6, '여섯': 6,
  '칠': 7, '일곱': 7,
  '팔': 8, '여덟': 8,
  '구': 9, '아홉': 9,
  '십': 10, '열': 10,

  // 단위 (십은 이미 위에 있으므로 제거)
  '백': 100, '천': 1000,
  '만': 10000, '억': 100000000,
  '조': 1000000000000,
};

// 금액 단위 변환
export const koreanCurrency: { [key: string]: number } = {
  '원': 1,
  '십원': 10, '십 원': 10,
  '백원': 100, '백 원': 100,
  '천원': 1000, '천 원': 1000,
  '만원': 10000, '만 원': 10000,
  '십만원': 100000, '십만 원': 100000,
  '백만원': 1000000, '백만 원': 1000000,
  '천만원': 10000000, '천만 원': 10000000,
  '억원': 100000000, '억 원': 100000000,
};

// 카테고리 매핑
export const categoryMapping: { [key: string]: string } = {
  // 식비
  '음식': '식비', '식사': '식비', '밥': '식비', '점심': '식비', '저녁': '식비', '아침': '식비',
  '커피': '카페', '카페': '카페', '스타벅스': '카페', '이디야': '카페',
  '치킨': '식비', '피자': '식비', '햄버거': '식비', '김치찌개': '식비', '삼겹살': '식비',

  // 교통
  '지하철': '교통비', '버스': '교통비', '택시': '교통비', '우버': '교통비',
  '기름': '교통비', '주유': '교통비', '톨게이트': '교통비', '주차': '교통비',

  // 쇼핑
  '옷': '의류', '신발': '의류', '가방': '의류', '화장품': '뷰티',
  '마트': '생필품', '편의점': '생필품', '세븐일레븐': '생필품', 'GS25': '생필품',

  // 문화/여가
  '영화': '문화', '영화관': '문화', 'CGV': '문화', '롯데시네마': '문화',
  '노래방': '문화', 'PC방': '문화', '게임': '문화',

  // 의료
  '병원': '의료비', '약국': '의료비', '치과': '의료비', '안과': '의료비',

  // 교육
  '학원': '교육비', '책': '교육비', '강의': '교육비', '수업료': '교육비',

  // 기타
  '선물': '기타', '경조사': '기타', '기부': '기타',
};

// 장소 매핑
export const locationMapping: { [key: string]: string } = {
  // 프랜차이즈
  '스타벅스': '스타벅스 카페',
  '맥도날드': '맥도날드',
  '버거킹': '버거킹',
  '롯데마트': '롯데마트',
  '이마트': '이마트',
  '홈플러스': '홈플러스',

  // 일반 장소
  '집근처': '집 근처',
  '회사근처': '회사 근처',
  '강남': '강남역',
  '홍대': '홍대입구역',
  '신촌': '신촌역',
};

/**
 * 한국어 텍스트에서 숫자를 추출하고 변환
 */
export function extractKoreanNumber(text: string): number | null {
  // 아라비아 숫자 먼저 확인
  const arabicMatch = text.match(/\d+/);
  if (arabicMatch) {
    return parseInt(arabicMatch[0], 10);
  }

  // 한국어 숫자 처리
  let result = 0;
  let tempNum = 0;

  // 단어별로 분리
  const words = text.split(/\s+/);

  for (const word of words) {
    if (koreanNumbers.hasOwnProperty(word)) {
      const num = koreanNumbers[word];

      if (num >= 10000) {
        // 만 이상의 단위
        result += tempNum * num;
        tempNum = 0;
      } else if (num >= 10) {
        // 십, 백, 천
        if (tempNum === 0) tempNum = 1;
        tempNum *= num;
      } else {
        // 1-9
        tempNum += num;
      }
    }
  }

  result += tempNum;
  return result > 0 ? result : null;
}

/**
 * 한국어 금액 표현을 숫자로 변환
 */
export function parseKoreanAmount(text: string): number | null {
  // "오천원", "5000원", "오천 원" 등의 패턴 처리
  const cleanText = text.replace(/\s+/g, '');

  // 원 단위 직접 매칭
  for (const [pattern, amount] of Object.entries(koreanCurrency)) {
    if (cleanText.includes(pattern)) {
      const beforeUnit = cleanText.split(pattern)[0];
      if (beforeUnit) {
        const multiplier = extractKoreanNumber(beforeUnit) || 1;
        return multiplier * (amount / (pattern.includes('원') ? 1 : 1));
      } else {
        return amount;
      }
    }
  }

  // 숫자 + 원 패턴
  const numberMatch = extractKoreanNumber(cleanText);
  if (numberMatch && cleanText.includes('원')) {
    return numberMatch;
  }

  return null;
}

/**
 * 카테고리 추론
 */
export function inferCategory(text: string): string {
  const lowerText = text.toLowerCase();

  for (const [keyword, category] of Object.entries(categoryMapping)) {
    if (lowerText.includes(keyword)) {
      return category;
    }
  }

  return '기타';
}

/**
 * 장소 정규화
 */
export function normalizeLocation(text: string): string {
  for (const [keyword, location] of Object.entries(locationMapping)) {
    if (text.includes(keyword)) {
      return location;
    }
  }

  return text;
}

/**
 * 음성 텍스트에서 거래 정보 추출
 */
export interface ExtractedTransaction {
  amount: number | null;
  category: string;
  location: string | null;
  description: string;
  confidence: number;
}

export function extractTransactionFromVoice(text: string): ExtractedTransaction {
  const amount = parseKoreanAmount(text);
  const category = inferCategory(text);
  const location = normalizeLocation(text);

  // 신뢰도 계산 (금액이 있으면 높은 신뢰도)
  let confidence = 0.5;
  if (amount) confidence += 0.3;
  if (category !== '기타') confidence += 0.2;

  return {
    amount,
    category,
    location: location !== text ? location : null,
    description: text,
    confidence,
  };
}

/**
 * 음성 텍스트 정제 (불필요한 표현 제거)
 */
export function cleanVoiceText(text: string): string {
  return text
    .replace(/음\.\.\.|어\.\.\.|그\.\.\./g, '') // 말더듬 제거
    .replace(/\s+/g, ' ') // 여러 공백을 하나로
    .trim();
}

/**
 * 음성 명령어 감지
 */
export interface VoiceCommand {
  type: 'expense' | 'inquiry' | 'setting' | 'unknown';
  action: string;
  parameters: any;
}

export function detectVoiceCommand(text: string): VoiceCommand {
  const lowerText = text.toLowerCase();

  // 지출 기록 명령
  if (lowerText.includes('썼어') || lowerText.includes('지출') ||
      lowerText.includes('샀어') || lowerText.includes('결제')) {
    return {
      type: 'expense',
      action: 'record',
      parameters: extractTransactionFromVoice(text),
    };
  }

  // 조회 명령
  if (lowerText.includes('얼마') || lowerText.includes('조회') ||
      lowerText.includes('확인') || lowerText.includes('알려줘')) {
    return {
      type: 'inquiry',
      action: 'balance_check',
      parameters: {},
    };
  }

  return {
    type: 'unknown',
    action: 'chat',
    parameters: { text },
  };
}