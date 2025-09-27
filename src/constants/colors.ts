// 천마비고 색상 시스템
export const colors = {
  // Primary 색상 (보라색 계열)
  primary: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6',
    600: '#7c3aed', // 메인 브랜드 컬러
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
  },

  // Secondary 색상 (라이트 퍼플)
  secondary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7', // 보조 컬러
    600: '#9333ea',
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
  },

  // 상태 색상
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // 배경 색상
  background: {
    primary: '#ffffff',
    secondary: '#f9fafb',
    tertiary: '#f3f4f6',
  },

  // 텍스트 색상
  text: {
    primary: '#1f2937',
    secondary: '#6b7280',
    tertiary: '#9ca3af',
    light: '#e5e7eb',
    white: '#ffffff',
  },

  // 그레이 스케일
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // 투명도
  transparent: 'transparent',
  white: '#ffffff',
  black: '#000000',
} as const;

// 그라데이션
export const gradients = {
  primary: 'linear-gradient(135deg, #7c3aed, #a855f7)',
  secondary: 'linear-gradient(135deg, #a855f7, #c084fc)',
  success: 'linear-gradient(135deg, #10b981, #34d399)',
  warning: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
  error: 'linear-gradient(135deg, #ef4444, #f87171)',
} as const;

export type ColorValue = typeof colors;
export type GradientValue = typeof gradients;
