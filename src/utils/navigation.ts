import { useRouter, usePathname, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { Alert, Linking } from 'react-native';
import type {
  RootStackParamList,
  TabParamList,
  RouteName,
  TabName,
  DeepLinkParams,
  NavigationEvent,
} from '../types/navigation';

// 네비게이션 유틸리티 훅
export function useNavigationUtils() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useLocalSearchParams();

  // 안전한 네비게이션 (에러 처리 포함)
  const navigateTo = useCallback(
    (screen: RouteName, params?: any, options?: { replace?: boolean }) => {
      try {
        const route = params
          ? `/${screen}?${new URLSearchParams(params).toString()}`
          : `/${screen}`;

        if (options?.replace) {
          router.replace(route as any);
        } else {
          router.push(route as any);
        }
      } catch (error) {
        console.error('Navigation error:', error);
        Alert.alert('네비게이션 오류', '페이지를 이동할 수 없습니다.');
      }
    },
    [router]
  );

  // 탭 화면으로 이동
  const navigateToTab = useCallback(
    (tab: TabName, params?: any) => {
      try {
        const route = tab === 'index' ? '/' : `/${tab}`;
        router.push(route);
      } catch (error) {
        console.error('Tab navigation error:', error);
        Alert.alert('네비게이션 오류', '탭을 이동할 수 없습니다.');
      }
    },
    [router]
  );

  // 뒤로 가기 (안전 처리)
  const goBack = useCallback(
    (fallbackRoute?: RouteName) => {
      try {
        if (router.canGoBack()) {
          router.back();
        } else if (fallbackRoute) {
          navigateTo(fallbackRoute);
        } else {
          router.replace('/');
        }
      } catch (error) {
        console.error('Go back error:', error);
        router.replace('/');
      }
    },
    [router, navigateTo]
  );

  // 현재 경로 정보
  const currentRoute = useMemo(() => {
    return {
      pathname,
      params,
      isTabRoute: ['/', '/chat', '/analytics', '/settings'].includes(pathname),
      isModalRoute:
        pathname.includes('transaction/') || pathname.includes('goal/'),
      isOnboardingRoute: pathname.includes('onboarding/'),
    };
  }, [pathname, params]);

  return {
    navigateTo,
    navigateToTab,
    goBack,
    currentRoute,
  };
}

// 딥링크 처리 유틸리티
export class DeepLinkHandler {
  private static instance: DeepLinkHandler;

  static getInstance(): DeepLinkHandler {
    if (!DeepLinkHandler.instance) {
      DeepLinkHandler.instance = new DeepLinkHandler();
    }
    return DeepLinkHandler.instance;
  }

  // 딥링크 파싱
  parseDeepLink(url: string): DeepLinkParams | null {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;

      // 경로 매핑
      const routeMapping: Record<string, RouteName> = {
        '/': '(tabs)',
        '/home': '(tabs)',
        '/chat': '(tabs)',
        '/analytics': '(tabs)',
        '/settings': '(tabs)',
        '/onboarding': 'onboarding/welcome',
        '/setup': 'onboarding/setup',
      };

      // 동적 라우트 처리
      if (pathname.startsWith('/transaction/')) {
        const id = pathname.split('/')[2];
        return {
          screen: 'transaction/[id]',
          params: { id },
        };
      }

      if (pathname.startsWith('/goal/')) {
        return {
          screen: 'goal/create',
          params: {},
        };
      }

      const screen = routeMapping[pathname];
      if (screen) {
        return {
          screen,
          params: Object.fromEntries(urlObj.searchParams),
        };
      }

      return null;
    } catch (error) {
      console.error('Deep link parsing error:', error);
      return null;
    }
  }

  // 딥링크 실행
  async handleDeepLink(url: string, router: any): Promise<boolean> {
    const deepLink = this.parseDeepLink(url);

    if (!deepLink) {
      return false;
    }

    try {
      const route = deepLink.params
        ? `/${deepLink.screen}?${new URLSearchParams(deepLink.params).toString()}`
        : `/${deepLink.screen}`;

      router.push(route);
      return true;
    } catch (error) {
      console.error('Deep link handling error:', error);
      return false;
    }
  }

  // 앱 외부 링크 열기
  async openExternalLink(url: string): Promise<boolean> {
    try {
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
        return true;
      } else {
        Alert.alert('링크 오류', '이 링크를 열 수 없습니다.');
        return false;
      }
    } catch (error) {
      console.error('External link error:', error);
      Alert.alert('링크 오류', '링크를 여는 중 오류가 발생했습니다.');
      return false;
    }
  }
}

// 네비게이션 이벤트 추적
export class NavigationTracker {
  private static events: NavigationEvent[] = [];
  private static listeners: Array<(event: NavigationEvent) => void> = [];

  // 이벤트 기록
  static trackEvent(event: NavigationEvent) {
    this.events.push({
      ...event,
      timestamp: new Date(),
    } as NavigationEvent & { timestamp: Date });

    // 최근 100개 이벤트만 유지
    if (this.events.length > 100) {
      this.events = this.events.slice(-100);
    }

    // 리스너들에게 알림
    this.listeners.forEach(listener => listener(event));
  }

  // 이벤트 리스너 등록
  static addListener(listener: (event: NavigationEvent) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // 네비게이션 히스토리 가져오기
  static getNavigationHistory(): NavigationEvent[] {
    return [...this.events];
  }

  // 통계 정보
  static getNavigationStats() {
    const totalEvents = this.events.length;
    const navigateEvents = this.events.filter(
      e => e.type === 'navigate'
    ).length;
    const backEvents = this.events.filter(e => e.type === 'back').length;

    return {
      total: totalEvents,
      navigate: navigateEvents,
      back: backEvents,
      ratio: totalEvents > 0 ? backEvents / totalEvents : 0,
    };
  }
}

// 라우트 보호 유틸리티
export function useRouteGuard() {
  const { navigateTo, currentRoute } = useNavigationUtils();

  const requireAuth = useCallback(
    (callback: () => void) => {
      // 실제 앱에서는 인증 상태 확인
      const isAuthenticated = true; // 임시

      if (isAuthenticated) {
        callback();
      } else {
        Alert.alert(
          '로그인 필요',
          '이 기능을 사용하려면 로그인이 필요합니다.',
          [
            { text: '취소', style: 'cancel' },
            {
              text: '로그인',
              onPress: () => navigateTo('onboarding/welcome'),
            },
          ]
        );
      }
    },
    [navigateTo]
  );

  const requireOnboarding = useCallback(
    (callback: () => void) => {
      // 실제 앱에서는 온보딩 완료 상태 확인
      const isOnboardingComplete = true; // 임시

      if (isOnboardingComplete) {
        callback();
      } else {
        Alert.alert('초기 설정 필요', '먼저 초기 설정을 완료해주세요.', [
          { text: '취소', style: 'cancel' },
          {
            text: '설정하기',
            onPress: () => navigateTo('onboarding/setup'),
          },
        ]);
      }
    },
    [navigateTo]
  );

  return {
    requireAuth,
    requireOnboarding,
    currentRoute,
  };
}

// 백 버튼 처리 훅
export function useBackHandler() {
  const { goBack, currentRoute } = useNavigationUtils();

  const handleBackPress = useCallback(() => {
    // 중요한 화면에서는 확인 다이얼로그 표시
    const criticalRoutes = ['onboarding/setup', 'goal/create'];

    if (criticalRoutes.some(route => currentRoute.pathname.includes(route))) {
      Alert.alert(
        '나가기',
        '작성 중인 내용이 저장되지 않습니다. 정말 나가시겠습니까?',
        [
          { text: '취소', style: 'cancel' },
          {
            text: '나가기',
            style: 'destructive',
            onPress: () => goBack(),
          },
        ]
      );
      return true; // 기본 백 버튼 동작 방지
    }

    goBack();
    return true;
  }, [goBack, currentRoute]);

  return { handleBackPress };
}
