import React, { useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/stores/authStore';

export default function InitialScreen() {
  const router = useRouter();
  const { isAuthenticated, isInitialized, isLoading, user, userProfile } = useAuthStore();

  useEffect(() => {
    // 인증 상태가 초기화된 후 라우팅 결정
    if (isInitialized && !isLoading) {
      // 라우터가 준비될 때까지 약간의 지연을 추가
      const timer = setTimeout(() => {
        if (isAuthenticated && user) {
          // 로그인된 사용자
          if (userProfile?.onboardingCompleted === false) {
            // 온보딩이 필요한 경우
            router.replace('/onboarding/setup');
          } else {
            // 메인 앱으로 이동
            router.replace('/(tabs)');
          }
        } else {
          // 미로그인 사용자는 웰컴 화면으로
          router.replace('/onboarding/welcome');
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isInitialized, isLoading, isAuthenticated, user, userProfile]);

  // 로딩 화면 표시
  return (
    <View className="flex-1 bg-white items-center justify-center">
      <View className="items-center space-y-4">
        {/* 앱 로고/아이콘 */}
        <Text className="text-6xl mb-4">🏛️</Text>
        <Text className="text-2xl font-bold text-primary-600 mb-2">천마비고</Text>
        <Text className="text-base text-gray-600 mb-8">AI와 함께하는 스마트한 가계부</Text>

        {/* 로딩 인디케이터 */}
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text className="text-sm text-gray-500 mt-4">
          {!isInitialized ? '앱을 준비하고 있습니다...' : '인증 상태를 확인하고 있습니다...'}
        </Text>
      </View>
    </View>
  );
}