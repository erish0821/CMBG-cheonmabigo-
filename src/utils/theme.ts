import { colors, gradients } from '../constants/colors';
import {
  spacing,
  borderRadius,
  shadows,
  typography,
} from '../constants/design';

// 테마 타입 정의
export interface Theme {
  colors: {
    primary: Record<string, string>;
    secondary: Record<string, string>;
    success: string;
    warning: string;
    error: string;
    info: string;
    background: {
      primary: string;
      secondary: string;
      tertiary: string;
    };
    text: {
      primary: string;
      secondary: string;
      tertiary: string;
      light: string;
      white: string;
    };
    gray: Record<string, string>;
    transparent: string;
    white: string;
    black: string;
  };
  gradients: typeof gradients;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  shadows: typeof shadows;
  typography: typeof typography;
  isDark: boolean;
}

// 기본 라이트 테마
export const lightTheme: Theme = {
  colors,
  gradients,
  spacing,
  borderRadius,
  shadows,
  typography,
  isDark: false,
};

// 다크 테마 (미래 확장용)
export const darkTheme: Theme = {
  colors: {
    ...colors,
    // 다크 모드에서는 색상 반전
    background: {
      ...colors.background,
      primary: '#111827',
      secondary: '#1f2937',
      tertiary: '#374151',
    },
    text: {
      ...colors.text,
      primary: '#f9fafb',
      secondary: '#d1d5db',
      tertiary: '#9ca3af',
      light: '#6b7280',
    },
    gray: {
      ...colors.gray,
      50: '#111827',
      100: '#1f2937',
      200: '#374151',
      300: '#4b5563',
      400: '#6b7280',
      500: '#9ca3af',
      600: '#d1d5db',
      700: '#e5e7eb',
      800: '#f3f4f6',
      900: '#f9fafb',
    },
  },
  gradients,
  spacing,
  borderRadius,
  shadows,
  typography,
  isDark: true,
};

// 테마 유틸리티 함수들
export const getTheme = (isDark: boolean = false): Theme => {
  return isDark ? darkTheme : lightTheme;
};

// 색상 유틸리티
export const getColorValue = (
  colorPath: string,
  theme: Theme = lightTheme
): string => {
  const paths = colorPath.split('.');
  let value: any = theme.colors;

  for (const path of paths) {
    value = value[path];
    if (value === undefined) {
      console.warn(`Color path "${colorPath}" not found in theme`);
      return theme.colors.gray[500];
    }
  }

  return value;
};

// 그림자 유틸리티
export const getShadowValue = (shadowName: keyof typeof shadows): string => {
  return shadows[shadowName];
};

// 간격 유틸리티
export const getSpacingValue = (spacingName: keyof typeof spacing): number => {
  return spacing[spacingName];
};

// 타이포그래피 스타일 생성
export const createTextStyle = (
  size: keyof typeof typography.size,
  weight: keyof typeof typography.fontWeight,
  lineHeight: keyof typeof typography.lineHeight = 'normal'
) => {
  return {
    fontSize: typography.size[size],
    fontWeight: typography.fontWeight[weight],
    lineHeight: typography.size[size] * typography.lineHeight[lineHeight],
  };
};

// 반응형 유틸리티 (미래 확장용)
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

export const getResponsiveValue = <T>(
  values: Partial<Record<keyof typeof breakpoints, T>>,
  screenWidth: number,
  fallback: T
): T => {
  const breakpointEntries = Object.entries(breakpoints).sort(
    ([, a], [, b]) => b - a
  ); // 큰 것부터 정렬

  for (const [key, value] of breakpointEntries) {
    if (screenWidth >= value && values[key as keyof typeof breakpoints]) {
      return values[key as keyof typeof breakpoints] as T;
    }
  }

  return fallback;
};
