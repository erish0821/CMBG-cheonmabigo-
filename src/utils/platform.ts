import { Platform } from 'react-native';

/**
 * 플랫폼별 조건부 실행 유틸리티
 */
export const PlatformUtils = {
  /**
   * 현재 플랫폼이 웹인지 확인
   */
  isWeb: Platform.OS === 'web',

  /**
   * 현재 플랫폼이 Android인지 확인
   */
  isAndroid: Platform.OS === 'android',

  /**
   * 현재 플랫폼이 iOS인지 확인 (미사용이지만 확장성을 위해)
   */
  isIOS: Platform.OS === 'ios',

  /**
   * 모바일 플랫폼인지 확인 (Android만 사용)
   */
  isMobile: Platform.OS === 'android',

  /**
   * 플랫폼별 조건부 값 반환
   */
  select: <T>(options: { web?: T; android?: T; default?: T }): T => {
    if (Platform.OS === 'web' && options.web !== undefined) {
      return options.web;
    }
    if (Platform.OS === 'android' && options.android !== undefined) {
      return options.android;
    }
    if (options.default !== undefined) {
      return options.default;
    }
    throw new Error('플랫폼별 값이 정의되지 않았습니다.');
  },

  /**
   * 플랫폼별 컴포넌트 선택
   */
  selectComponent: <T extends React.ComponentType<any>>(options: {
    web?: T;
    android?: T;
    default?: T;
  }): T => {
    return PlatformUtils.select(options);
  },

  /**
   * 웹에서만 실행
   */
  runOnWeb: (callback: () => void): void => {
    if (PlatformUtils.isWeb) {
      callback();
    }
  },

  /**
   * Android에서만 실행
   */
  runOnAndroid: (callback: () => void): void => {
    if (PlatformUtils.isAndroid) {
      callback();
    }
  },

  /**
   * 모바일에서만 실행
   */
  runOnMobile: (callback: () => void): void => {
    if (PlatformUtils.isMobile) {
      callback();
    }
  },
};

/**
 * 플랫폼별 스타일 헬퍼
 */
export const PlatformStyles = {
  /**
   * 플랫폼별 조건부 스타일 적용
   */
  conditional: (webStyle: string, androidStyle: string): string => {
    return PlatformUtils.select({
      web: webStyle,
      android: androidStyle,
      default: webStyle,
    });
  },

  /**
   * 웹 전용 스타일
   */
  webOnly: (style: string): string => {
    return PlatformUtils.isWeb ? style : '';
  },

  /**
   * Android 전용 스타일
   */
  androidOnly: (style: string): string => {
    return PlatformUtils.isAndroid ? style : '';
  },

  /**
   * 모바일 전용 스타일
   */
  mobileOnly: (style: string): string => {
    return PlatformUtils.isMobile ? style : '';
  },
};

/**
 * 플랫폼별 API 호출 헬퍼
 */
export const PlatformAPI = {
  /**
   * 플랫폼별 기본 URL 설정
   */
  getBaseURL: (): string => {
    return PlatformUtils.select({
      web: 'http://localhost:3001', // 웹에서는 로컬 개발 서버
      android: 'http://10.0.2.2:3001', // Android 에뮬레이터에서는 호스트 접근
      default: 'http://localhost:3001',
    });
  },

  /**
   * 플랫폼별 저장소 접근
   */
  getStorageKey: (key: string): string => {
    const prefix = PlatformUtils.select({
      web: 'web_',
      android: 'mobile_',
      default: '',
    });
    return `${prefix}${key}`;
  },
};

/**
 * 플랫폼별 기능 지원 여부 확인
 */
export const PlatformFeatures = {
  /**
   * 음성 인식 지원 여부
   */
  speechRecognition: PlatformUtils.select({
    web: typeof window !== 'undefined' && 'webkitSpeechRecognition' in window,
    android: true, // React Native Voice 라이브러리 사용
    default: false,
  }),

  /**
   * 클립보드 지원 여부
   */
  clipboard: true, // Expo Clipboard는 모든 플랫폼 지원

  /**
   * 파일 다운로드 지원 여부
   */
  fileDownload: PlatformUtils.select({
    web: true, // Blob + URL.createObjectURL 사용
    android: true, // React Native Share 사용
    default: false,
  }),

  /**
   * 생체 인증 지원 여부
   */
  biometricAuth: PlatformUtils.select({
    web: false, // 웹에서는 WebAuthn 사용 가능하지만 복잡함
    android: true, // Expo LocalAuthentication 사용
    default: false,
  }),

  /**
   * 푸시 알림 지원 여부
   */
  pushNotifications: PlatformUtils.select({
    web: typeof window !== 'undefined' && 'Notification' in window,
    android: true, // Expo Notifications 사용
    default: false,
  }),
};