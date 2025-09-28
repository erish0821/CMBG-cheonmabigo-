import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/stores/authStore';
import { useBudgetStore } from '../src/stores/budgetStore';
import { transactionStorage } from '../src/services/storage/TransactionStorage';

export default function InitialScreen() {
  const router = useRouter();
  const { isAuthenticated, isInitialized, isLoading, user, userProfile } = useAuthStore();
  const { loadBudgetSummary, createDefaultBudgets, budgetSummary } = useBudgetStore();
  const [isMigrating, setIsMigrating] = useState(false);

  useEffect(() => {
    // 데이터 마이그레이션 수행 (앱 시작 시 한 번만)
    const performDataMigration = async () => {
      try {
        setIsMigrating(true);
        console.log('데이터 마이그레이션 시작...');

        // 기존 공용 테스트 데이터 제거
        await transactionStorage.clearLegacyData();

        console.log('데이터 마이그레이션 완료');
      } catch (error) {
        console.error('데이터 마이그레이션 실패:', error);
      } finally {
        setIsMigrating(false);
      }
    };

    // 최초 실행 시 마이그레이션 수행
    performDataMigration();
  }, []);

  useEffect(() => {
    // 사용자가 로그인되면 예산 정보 로드
    const loadUserBudgetData = async () => {
      if (isAuthenticated && user && !isMigrating) {
        try {
          console.log('사용자 예산 정보 로딩 시작:', user.id);
          await loadBudgetSummary(user.id);

          // 예산이 없으면 기본 예산 생성 (사용자 설정 예산이 있는지 먼저 확인)
          const hasUserBudgets = localStorage.getItem(`budgets_${user.id}`);
          if ((!budgetSummary || budgetSummary.totalBudget === 0) && !hasUserBudgets) {
            console.log('기본 예산 생성 시작...');
            await createDefaultBudgets(user.id);
          } else if (hasUserBudgets) {
            console.log('사용자 설정 예산이 이미 존재합니다. 기본 예산 생성을 건너뜁니다.');
          }
        } catch (error) {
          console.error('예산 정보 로딩 실패:', error);
        }
      }
    };

    loadUserBudgetData();
  }, [isAuthenticated, user, isMigrating]);

  useEffect(() => {
    // 인증 상태가 초기화된 후 라우팅 결정 (마이그레이션 완료 후)
    if (isInitialized && !isLoading && !isMigrating) {
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
          {isMigrating
            ? '데이터를 초기화하고 있습니다...'
            : !isInitialized
            ? '앱을 준비하고 있습니다...'
            : '인증 상태를 확인하고 있습니다...'
          }
        </Text>
      </View>
    </View>
  );
}