import { ViewStyle, TextStyle, ImageStyle } from 'react-native';

// 공통 스타일 유틸리티
export type Style = ViewStyle | TextStyle | ImageStyle;

// Tailwind-like 유틸리티 클래스를 스타일 객체로 변환
export const tw = (className: string): Style => {
  const classes = className.split(' ').filter(Boolean);
  let style: Style = {};

  classes.forEach(cls => {
    const classStyle = parseClass(cls);
    if (classStyle) {
      style = { ...style, ...classStyle };
    }
  });

  return style;
};

// 개별 클래스를 스타일로 파싱
const parseClass = (className: string): Style | null => {
  // Flexbox
  if (className === 'flex') return { display: 'flex' };
  if (className === 'flex-1') return { flex: 1 };
  if (className === 'flex-row') return { flexDirection: 'row' };
  if (className === 'flex-col') return { flexDirection: 'column' };
  if (className === 'items-center') return { alignItems: 'center' };
  if (className === 'items-start') return { alignItems: 'flex-start' };
  if (className === 'items-end') return { alignItems: 'flex-end' };
  if (className === 'justify-center') return { justifyContent: 'center' };
  if (className === 'justify-start') return { justifyContent: 'flex-start' };
  if (className === 'justify-end') return { justifyContent: 'flex-end' };
  if (className === 'justify-between')
    return { justifyContent: 'space-between' };

  // Margins & Padding
  const marginMatch = className.match(/^m-(\d+)$/);
  if (marginMatch) return { margin: parseInt(marginMatch[1]) * 4 };

  const paddingMatch = className.match(/^p-(\d+)$/);
  if (paddingMatch) return { padding: parseInt(paddingMatch[1]) * 4 };

  // Background Colors
  if (className === 'bg-white') return { backgroundColor: '#ffffff' };
  if (className === 'bg-primary-600') return { backgroundColor: '#7c3aed' };
  if (className === 'bg-secondary-500') return { backgroundColor: '#a855f7' };

  // Text Colors
  if (className === 'text-white') return { color: '#ffffff' };
  if (className === 'text-primary-600') return { color: '#7c3aed' };

  // Border Radius
  if (className === 'rounded') return { borderRadius: 4 };
  if (className === 'rounded-lg') return { borderRadius: 8 };
  if (className === 'rounded-xl') return { borderRadius: 16 };

  return null;
};

// 조건부 스타일 유틸리티
export const conditionalStyle = (
  condition: boolean,
  trueStyle: Style,
  falseStyle: Style = {}
): Style => {
  return condition ? trueStyle : falseStyle;
};

// 스타일 병합 유틸리티
export const mergeStyles = (...styles: (Style | undefined)[]): Style => {
  return styles
    .filter((style): style is Style => Boolean(style))
    .reduce((acc, style) => ({ ...acc, ...style }), {} as Style);
};

// 그림자 스타일 생성
export const createShadow = (
  elevation: number = 2,
  shadowColor: string = '#000',
  shadowOpacity: number = 0.1
): ViewStyle => {
  return {
    shadowColor,
    shadowOffset: {
      width: 0,
      height: elevation,
    },
    shadowOpacity,
    shadowRadius: elevation * 1.5,
    elevation, // Android
  };
};

// 버튼 스타일 프리셋
export const buttonStyles = {
  primary: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  secondary: {
    backgroundColor: '#a855f7',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#7c3aed',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
};

// 카드 스타일 프리셋
export const cardStyles = {
  default: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    ...createShadow(2),
  },
  elevated: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    ...createShadow(8),
  },
  outlined: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
};

// 텍스트 스타일 프리셋
export const textStyles = {
  h1: {
    fontSize: 36,
    fontWeight: 'bold' as const,
    lineHeight: 45,
    color: '#1f2937',
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 30,
    color: '#1f2937',
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 25,
    color: '#1f2937',
  },
  body: {
    fontSize: 16,
    fontWeight: 'normal' as const,
    lineHeight: 24,
    color: '#1f2937',
  },
  caption: {
    fontSize: 14,
    fontWeight: 'normal' as const,
    lineHeight: 20,
    color: '#6b7280',
  },
  label: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
    color: '#1f2937',
  },
};

// 애니메이션 이징 함수
export const easingFunctions = {
  linear: 'linear',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
} as const;

// 디바이스별 스타일 유틸리티
export const getDeviceSpecificStyle = (
  phoneStyle: Style,
  tabletStyle: Style = {},
  screenWidth: number
): Style => {
  const isTablet = screenWidth >= 768;
  return isTablet ? { ...phoneStyle, ...tabletStyle } : phoneStyle;
};
