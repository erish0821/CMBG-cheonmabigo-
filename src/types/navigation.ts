// Expo Router의 타입 시스템을 사용하므로 React Navigation 타입은 간소화

// 루트 스택 파라미터 타입
export type RootStackParamList = {
  '(tabs)': TabParamList | undefined;
  'transaction/[id]': { id: string };
  'goal/create': undefined;
  'onboarding/welcome': undefined;
  'onboarding/setup': undefined;
};

// 하단 탭 파라미터 타입
export type TabParamList = {
  index: undefined; // 홈 화면
  chat: undefined; // AI 채팅 화면
  analytics: undefined; // 분석 화면
  settings: undefined; // 설정 화면
};

// 각 화면별 Props 타입 (간소화)
export type HomeScreenProps = { route?: { params?: TabParamList['index'] } };
export type ChatScreenProps = { route?: { params?: TabParamList['chat'] } };
export type AnalyticsScreenProps = {
  route?: { params?: TabParamList['analytics'] };
};
export type SettingsScreenProps = {
  route?: { params?: TabParamList['settings'] };
};

export type TransactionDetailScreenProps = {
  route?: { params?: RootStackParamList['transaction/[id]'] };
};
export type GoalCreateScreenProps = {
  route?: { params?: RootStackParamList['goal/create'] };
};
export type OnboardingWelcomeScreenProps = {
  route?: { params?: RootStackParamList['onboarding/welcome'] };
};
export type OnboardingSetupScreenProps = {
  route?: { params?: RootStackParamList['onboarding/setup'] };
};

// useNavigation 훅을 위한 타입
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

// 라우팅 유틸리티 타입
export type RouteName = keyof RootStackParamList;
export type TabName = keyof TabParamList;

// 네비게이션 관련 이벤트 타입
export interface NavigationEvent {
  type: 'navigate' | 'back' | 'reset';
  target?: RouteName;
  params?: any;
}

// 딥링크 타입
export interface DeepLinkParams {
  screen: RouteName;
  params?: Record<string, any>;
}

// 네비게이션 상태 타입
export interface NavigationState {
  index: number;
  routes: Array<{
    key: string;
    name: RouteName;
    params?: any;
  }>;
}
