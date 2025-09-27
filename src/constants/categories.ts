/**
 * 한국 소비 패턴 기반 카테고리 시스템
 * MZ세대 (25-39세) 소비 행태 반영
 */

import { CategoryType, CategoryInfo } from '../types/transaction';

export const CATEGORIES: Record<CategoryType, CategoryInfo> = {
  [CategoryType.FOOD]: {
    type: CategoryType.FOOD,
    name: '식비',
    icon: '🍽️',
    color: '#EF4444',
    subcategories: [
      '카페/음료',
      '식당/외식',
      '배달음식',
      '편의점',
      '마트/식재료',
      '술집/주점',
      '베이커리',
      '디저트'
    ],
    keywords: [
      // 카페/음료
      '스타벅스', '투썸플레이스', '이디야', '폴바셋', '할리스', '커피빈', '카페',
      '아메리카노', '라떼', '에스프레소', '프라푸치노', '음료',

      // 식당/외식
      '김치찌개', '된장찌개', '불고기', '삼겹살', '치킨', '피자', '햄버거', '초밥',
      '파스타', '스테이크', '족발', '보쌈', '곱창', '마라탕', '쌀국수',
      '맥도날드', '버거킹', 'KFC', '롯데리아', '서브웨이',

      // 배달음식
      '배달의민족', '요기요', '쿠팡이츠', '배달', '치킨', '중국집', '야식',

      // 편의점
      'GS25', 'CU', '세븐일레븐', '이마트24', '편의점', '도시락', '삼각김밥',

      // 마트
      '이마트', '홈플러스', '롯데마트', '코스트코', '마트', '장보기', '식재료'
    ],
    averageAmount: 15000
  },

  [CategoryType.TRANSPORT]: {
    type: CategoryType.TRANSPORT,
    name: '교통비',
    icon: '🚇',
    color: '#3B82F6',
    subcategories: [
      '지하철/버스',
      '택시/우버',
      '기차/고속버스',
      '항공료',
      '주차비',
      '톨게이트',
      '자동차관리',
      '대중교통'
    ],
    keywords: [
      '지하철', '버스', '택시', '카카오택시', '우버', 'T머니', '교통카드',
      'KTX', '무궁화호', '고속버스', '시외버스', '항공', '비행기',
      '주차', '주차비', '톨게이트', '하이패스', '기름값', '주유소',
      'SK에너지', 'GS칼텍스', 'S-Oil', '현대오일뱅크'
    ],
    averageAmount: 5000
  },

  [CategoryType.ENTERTAINMENT]: {
    type: CategoryType.ENTERTAINMENT,
    name: '문화생활',
    icon: '🎬',
    color: '#8B5CF6',
    subcategories: [
      '영화/연극',
      '콘서트/공연',
      '게임/오락',
      '스포츠/운동',
      '독서',
      '여행/숙박',
      '노래방',
      '볼링/당구'
    ],
    keywords: [
      // 영화/연극
      'CGV', '롯데시네마', '메가박스', '영화', '영화표', '팝콘', '연극', '뮤지컬',

      // 게임/오락
      '스팀', 'PlayStation', 'Xbox', '닌텐도', 'PC방', '오락실', '게임',

      // 스포츠/운동
      '헬스장', '피트니스', '수영장', '골프', '테니스', '클라이밍', '요가', '필라테스',

      // 여행/숙박
      '호텔', '펜션', '에어비앤비', '모텔', '숙박', '여행', '관광',

      // 기타
      '노래방', '볼링장', '당구장', '찜질방', '스파'
    ],
    averageAmount: 25000
  },

  [CategoryType.SHOPPING]: {
    type: CategoryType.SHOPPING,
    name: '쇼핑',
    icon: '🛍️',
    color: '#F59E0B',
    subcategories: [
      '의류/패션',
      '화장품/뷰티',
      '전자제품',
      '생활용품',
      '온라인쇼핑',
      '서적/문구',
      '선물/기념품',
      '신발/가방'
    ],
    keywords: [
      // 의류/패션
      '유니클로', 'H&M', 'ZARA', '무신사', '29CM', '브랜디', '옷', '의류',

      // 화장품/뷰티
      '올리브영', '롭스', '아리따움', '미샤', '더페이스샵', '이니스프리', '화장품',

      // 전자제품
      '삼성', 'LG', '애플', '아이폰', '갤럭시', '맥북', '아이패드', '전자제품',

      // 온라인쇼핑
      '쿠팡', '11번가', 'G마켓', '옥션', '티몬', 'SSG', '네이버쇼핑', '온라인',

      // 생활용품
      '다이소', '아트박스', '텐바이텐', '무료배송', '생활용품', '인테리어'
    ],
    averageAmount: 35000
  },

  [CategoryType.HEALTHCARE]: {
    type: CategoryType.HEALTHCARE,
    name: '의료/건강',
    icon: '🏥',
    color: '#10B981',
    subcategories: [
      '병원/의원',
      '약국',
      '건강검진',
      '치과',
      '한의원',
      '안경/렌즈',
      '건강식품',
      '의료기기'
    ],
    keywords: [
      '병원', '의원', '클리닉', '응급실', '약국', '처방전', '의료비',
      '건강검진', '치과', '한의원', '침', '한약', '안경', '렌즈',
      '건강기능식품', '비타민', '영양제', '헬스케어'
    ],
    averageAmount: 20000
  },

  [CategoryType.EDUCATION]: {
    type: CategoryType.EDUCATION,
    name: '교육/학습',
    icon: '📚',
    color: '#6366F1',
    subcategories: [
      '온라인강의',
      '학원/과외',
      '도서/전자책',
      '어학학습',
      '자격증',
      '세미나/워크샵',
      '구독서비스',
      '문구/학용품'
    ],
    keywords: [
      '인프런', '유데미', '패스트캠퍼스', '클래스101', '온라인강의', '강의',
      '학원', '과외', '토익', '토플', '영어', '중국어', '일본어',
      '교보문고', '예스24', '알라딘', '도서', '책', '전자책',
      '자격증', '시험', '세미나', '워크샵', '컨퍼런스'
    ],
    averageAmount: 50000
  },

  [CategoryType.UTILITIES]: {
    type: CategoryType.UTILITIES,
    name: '공과금/정기결제',
    icon: '💡',
    color: '#84CC16',
    subcategories: [
      '전기/가스/수도',
      '인터넷/통신',
      '구독서비스',
      '보험료',
      '멤버십',
      '클라우드저장소',
      '스트리밍서비스',
      '기타정기결제'
    ],
    keywords: [
      // 공과금
      '한국전력', '도시가스', '수도요금', '전기요금', '가스비', '수도비',

      // 통신
      'SKT', 'KT', 'LG유플러스', '휴대폰요금', '인터넷요금', '와이파이',

      // 구독서비스
      '넷플릭스', '디즈니플러스', '티빙', '웨이브', '왓챠', '멜론', '지니', '스포티파이',
      '유튜브프리미엄', '구글드라이브', '아이클라우드', '드롭박스',

      // 보험/멤버십
      '보험료', '멤버십', '연회비', '정기결제', '구독'
    ],
    averageAmount: 30000
  },

  [CategoryType.HOUSING]: {
    type: CategoryType.HOUSING,
    name: '주거비',
    icon: '🏠',
    color: '#DC2626',
    subcategories: [
      '월세/관리비',
      '인테리어/가구',
      '가전제품',
      '청소/세탁',
      '수리/보수',
      '이사비용',
      '보증금',
      '부동산수수료'
    ],
    keywords: [
      '월세', '관리비', '전세', '보증금', '부동산', '이사', '용달',
      '이케아', '한샘', '가구', '침대', '소파', '책상', '의자',
      '냉장고', '세탁기', '에어컨', '청소기', '전자레인지',
      '청소', '세탁소', '수리', '보수', '리모델링'
    ],
    averageAmount: 100000
  },

  [CategoryType.INCOME]: {
    type: CategoryType.INCOME,
    name: '수입',
    icon: '💰',
    color: '#059669',
    subcategories: [
      '급여/월급',
      '부업/투잡',
      '용돈/선물',
      '상여금/보너스',
      '투자수익',
      '판매수익',
      '프리랜서',
      '기타수입'
    ],
    keywords: [
      '급여', '월급', '연봉', '상여금', '보너스', '수당',
      '부업', '투잡', '알바', '아르바이트', '용돈', '선물받은돈',
      '주식', '투자', '수익', '배당', '판매', '중고판매',
      '프리랜서', '외주', 'consulting'
    ],
    averageAmount: 2500000
  },

  [CategoryType.OTHER]: {
    type: CategoryType.OTHER,
    name: '기타',
    icon: '📦',
    color: '#6B7280',
    subcategories: [
      '미분류',
      '기부/후원',
      '벌금/과태료',
      '은행수수료',
      'ATM수수료',
      '기타지출',
      '분실/도난',
      '예상치못한지출'
    ],
    keywords: [
      '기타', '미분류', '모름', '기부', '후원', '벌금', '과태료',
      '수수료', 'ATM', '은행', '분실', '도난', '기타지출'
    ],
    averageAmount: 10000
  }
};

// 카테고리 배열 (순서대로 표시)
export const CATEGORY_LIST = [
  CategoryType.FOOD,
  CategoryType.TRANSPORT,
  CategoryType.SHOPPING,
  CategoryType.ENTERTAINMENT,
  CategoryType.UTILITIES,
  CategoryType.HEALTHCARE,
  CategoryType.EDUCATION,
  CategoryType.HOUSING,
  CategoryType.INCOME,
  CategoryType.OTHER
];

// 수입 vs 지출 구분
export const INCOME_CATEGORIES = [CategoryType.INCOME];
export const EXPENSE_CATEGORIES = CATEGORY_LIST.filter(cat => cat !== CategoryType.INCOME);

// 금액대별 카테고리 추론 도우미
export const getAmountRangeCategories = (amount: number): CategoryType[] => {
  if (amount <= 5000) {
    return [CategoryType.TRANSPORT, CategoryType.FOOD];
  } else if (amount <= 15000) {
    return [CategoryType.FOOD, CategoryType.TRANSPORT];
  } else if (amount <= 30000) {
    return [CategoryType.ENTERTAINMENT, CategoryType.SHOPPING];
  } else if (amount <= 100000) {
    return [CategoryType.SHOPPING, CategoryType.HEALTHCARE, CategoryType.EDUCATION];
  } else {
    return [CategoryType.HOUSING, CategoryType.INCOME, CategoryType.EDUCATION];
  }
};

// 시간대별 카테고리 추론
export const getTimeBasedCategories = (hour: number): CategoryType[] => {
  if (hour >= 6 && hour <= 10) {
    // 아침: 카페, 교통비
    return [CategoryType.FOOD, CategoryType.TRANSPORT];
  } else if (hour >= 11 && hour <= 14) {
    // 점심: 식비
    return [CategoryType.FOOD];
  } else if (hour >= 15 && hour <= 18) {
    // 오후: 카페, 쇼핑
    return [CategoryType.FOOD, CategoryType.SHOPPING];
  } else if (hour >= 19 && hour <= 23) {
    // 저녁/밤: 식비, 엔터테인먼트
    return [CategoryType.FOOD, CategoryType.ENTERTAINMENT];
  } else {
    // 새벽: 배달음식, 엔터테인먼트
    return [CategoryType.FOOD, CategoryType.ENTERTAINMENT];
  }
};