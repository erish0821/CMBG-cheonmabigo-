import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  Screen,
  SectionContainer,
} from '../../src/components/layout';
import {
  H2,
  H3,
  BodyText,
  Caption,
} from '../../src/components/ui/Typography';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { AddIcon, AnalyticsIcon } from '../../src/components/ui/Icon';
import { useRouter } from 'expo-router';
import { AnalyticsService, AnalyticsData } from '../../src/services/analytics/AnalyticsService';
import { transactionStorage } from '../../src/services/storage/TransactionStorage';
import { Transaction, CategoryType } from '../../src/types/transaction';
import { CATEGORIES } from '../../src/constants/categories';
import { BudgetProgressChart, InsightCard } from '../../src/components/charts';
import { useAuthStore } from '../../src/stores/authStore';
import { useBudgetStore } from '../../src/stores/budgetStore';
import { AppHeader } from '../../src/components/ui/AppHeader';

export default function HomeScreen() {
  const router = useRouter();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  // 스토어 연결
  const { user, isAuthenticated } = useAuthStore();
  const { budgetSummary, loadBudgetSummary, updateBudgetSpending } = useBudgetStore();

  // 데이터 로드 함수
  const loadData = useCallback(async (forceRefresh = false) => {
    if (!isAuthenticated || !user) {
      setIsLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      // 첫 로드 시에만 로컬 거래를 백엔드로 동기화
      if (forceRefresh) {
        try {
          console.log('로컬 거래 데이터를 백엔드로 동기화 시작...');
          const syncResult = await transactionStorage.syncLocalTransactionsToBackend();
          console.log('동기화 결과:', syncResult);

          if (syncResult.success > 0) {
            console.log(`${syncResult.success}개의 로컬 거래가 백엔드로 동기화되었습니다.`);
          }
        } catch (syncError) {
          console.error('거래 동기화 실패:', syncError);
        }
      }

      const [analytics, recent] = await Promise.all([
        AnalyticsService.getAnalyticsData(forceRefresh),
        transactionStorage.getRecentTransactions(5),
      ]);

      setAnalyticsData(analytics);
      setRecentTransactions(recent);

      // 새로운 예산 시스템 데이터 로드
      await updateBudgetSpending(user.id);
      await loadBudgetSummary(user.id);

    } catch (error) {
      console.error('대시보드 데이터 로드 실패:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated, user, updateBudgetSpending, loadBudgetSummary]);

  // 새로고침 핸들러
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData(true);
  }, [loadData]);

  // 화면에 포커스될 때마다 데이터 새로고침 (거래 추가 후 실시간 업데이트를 위해)
  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated && user) {
        console.log('홈 화면 포커스됨, 데이터 새로고침 시작');
        loadData(true);
      }
    }, [isAuthenticated, user, loadData])
  );

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadData();
  }, [loadData]);

  // 로딩 상태
  if (isLoading) {
    return (
      <Screen
        title="로딩 중..."
        subtitle="데이터를 불러오고 있습니다"
        safeArea={true}
        scrollable={true}
      >
        <SectionContainer>
          <Card className="p-8">
            <View className="items-center">
              <BodyText>데이터를 분석하고 있습니다...</BodyText>
            </View>
          </Card>
        </SectionContainer>
      </Screen>
    );
  }

  // 데이터가 없는 경우
  if (!analyticsData) {
    return (
      <Screen
        title="안녕하세요! 👋"
        subtitle="첫 거래를 기록해보세요"
        safeArea={true}
        scrollable={true}
      >
        <SectionContainer>
          <Card className="p-8">
            <View className="items-center space-y-4">
              <H3>아직 거래 내역이 없습니다</H3>
              <BodyText className="text-center text-secondary-600">
                AI 코치와 대화하며 첫 지출을 기록해보세요!
              </BodyText>
              <Button
                title="지출 기록하러 가기"
                variant="primary"
                leftIcon={<AddIcon size="sm" color="white" />}
                onPress={() => router.push('/chat')}
              />
            </View>
          </Card>
        </SectionContainer>
      </Screen>
    );
  }

  const { summary, budgetAnalysis, insights } = analyticsData;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <AppHeader 
        title="천마비고"
        subtitle="대화하는 AI 가계부"
        showAvatar={true}
      />

      <ScrollView
        className="flex-1 pb-20 px-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* 예산 진행률 */}
        {budgetSummary && (
          <SectionContainer>
            <H2 className="mb-4">이번 달 예산</H2>
            <BudgetProgressChart
              data={{
                totalBudget: budgetSummary.totalBudget,
                spentAmount: budgetSummary.totalSpent,
                remainingAmount: budgetSummary.totalRemaining,
                usagePercentage: budgetSummary.budgetProgress,
                dailyAverageSpent: budgetSummary.totalSpent / new Date().getDate(),
                recommendedDailySpending: budgetSummary.dailyRecommended,
                daysRemaining: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate(),
                isOnTrack: budgetSummary.status === 'good',
              }}
              onBudgetPress={() => router.push('/analytics')}
            />
          </SectionContainer>
        )}

        {/* AI 인사이트 */}
        {insights.length > 0 && (
          <SectionContainer>
            <H2 className="mb-4">AI 인사이트</H2>
            {insights.slice(0, 2).map((insight) => (
              <InsightCard
                key={insight.id}
                insight={insight}
                onPress={() => router.push('/analytics')}
                onActionPress={() => router.push('/analytics')}
              />
            ))}
            {insights.length > 2 && (
              <Button
                title={`${insights.length - 2}개 인사이트 더보기`}
                variant="outline"
                size="sm"
                onPress={() => router.push('/analytics')}
              />
            )}
          </SectionContainer>
        )}

        {/* 빠른 기록 */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Pretendard' }}>
            빠른 기록
          </Text>
          <View className="flex-row justify-around items-center px-4">
            {/* 영수증 촬영 */}
            <TouchableOpacity
              className="items-center flex-1 mx-2"
              onPress={() => router.push('/chat')}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <View className="w-16 h-16 rounded-full bg-emerald-100 items-center justify-center mb-3 border border-emerald-200">
                <Text className="text-2xl">📄</Text>
              </View>
              <Text className="text-sm text-gray-700 text-center font-medium" style={{ fontFamily: 'Pretendard' }}>
                영수증 촬영
              </Text>
            </TouchableOpacity>

            {/* 음성 입력 */}
            <TouchableOpacity
              className="items-center flex-1 mx-2"
              onPress={() => router.push('/chat')}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <View className="w-16 h-16 rounded-full bg-purple-600 items-center justify-center mb-3">
                <Text className="text-2xl text-white">🎤</Text>
              </View>
              <Text className="text-sm text-gray-700 text-center font-medium" style={{ fontFamily: 'Pretendard' }}>
                음성 입력
              </Text>
            </TouchableOpacity>

            {/* 직접 입력 */}
            <TouchableOpacity
              className="items-center flex-1 mx-2"
              onPress={() => router.push('/chat')}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <View className="w-16 h-16 rounded-full bg-blue-100 items-center justify-center mb-3 border border-blue-200">
                <Text className="text-2xl text-blue-600 font-bold">+</Text>
              </View>
              <Text className="text-sm text-gray-700 text-center font-medium" style={{ fontFamily: 'Pretendard' }}>
                직접 입력
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 오늘의 지출 */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Pretendard' }}>
              오늘의 지출
            </Text>
            <TouchableOpacity onPress={() => router.push('/analytics')}>
              <Text className="text-sm text-purple-600" style={{ fontFamily: 'Pretendard' }}>
                전체보기 &gt;
              </Text>
            </TouchableOpacity>
          </View>

          {recentTransactions.length > 0 ? (
            recentTransactions.map(transaction => {
              const categoryInfo = CATEGORIES[transaction.category] || CATEGORIES[CategoryType.OTHER];
              const timeAgo = getTimeAgo(transaction.date);

              // categoryInfo null 체크
              if (!categoryInfo) {
                return null;
              }

              return (
                <View
                  key={transaction.id}
                  className="flex-row items-center justify-between py-3 border-b border-gray-100"
                >
                  <View className="flex-row items-center flex-1">
                    <View className="w-10 h-10 rounded-full bg-red-100 items-center justify-center mr-3">
                      <Text className="text-lg">{categoryInfo.icon}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="font-medium text-gray-900">
                        {transaction.description}
                      </Text>
                      <Text className="text-sm text-gray-500">
                        {categoryInfo.name} • {timeAgo}
                      </Text>
                    </View>
                  </View>
                  <Text
                    className={`text-lg font-semibold ${
                      transaction.isIncome ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {transaction.isIncome ? '+' : '-'}₩{Math.abs(transaction.amount).toLocaleString()}
                  </Text>
                </View>
              );
            })
          ) : (
            <View className="items-center py-8">
              <Text className="text-4xl mb-4">💳</Text>
              <Text className="text-lg font-medium text-gray-900 mb-2" style={{ fontFamily: 'Pretendard' }}>
                아직 지출이 없어요
              </Text>
              <Text className="text-sm text-gray-500 text-center mb-4" style={{ fontFamily: 'Pretendard' }}>
                AI 코치와 대화하며 첫 지출을 기록해보세요!
              </Text>
              <TouchableOpacity
                className="bg-purple-600 px-6 py-3 rounded-xl"
                onPress={() => router.push('/chat')}
              >
                <Text className="text-white font-semibold" style={{ fontFamily: 'Pretendard' }}>
                  지출 기록하기
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* 월간 요약 */}
        <SectionContainer>
          <H2 className="mb-4">이번 달 요약</H2>
          <Card className="mb-4">
            <View className="space-y-4">
              <View className="flex-row justify-between items-center">
                <BodyText variant="secondary">총 지출</BodyText>
                <H3 className="text-red-600">
                  ₩{summary.totalSpent.toLocaleString()}
                </H3>
              </View>

              <View className="flex-row justify-between items-center">
                <BodyText variant="secondary">총 수입</BodyText>
                <H3 className="text-green-600">
                  ₩{summary.totalIncome.toLocaleString()}
                </H3>
              </View>

              <View className="border-t border-gray-200 pt-4">
                <View className="flex-row justify-between items-center">
                  <BodyText variant="secondary">순자산 변화</BodyText>
                  <H3 className={summary.netAmount >= 0 ? "text-green-600" : "text-red-600"}>
                    {summary.netAmount >= 0 ? '+' : ''}₩{summary.netAmount.toLocaleString()}
                  </H3>
                </View>
              </View>

              <View className="flex-row justify-between items-center">
                <BodyText variant="secondary">거래 건수</BodyText>
                <BodyText className="font-semibold">
                  {summary.transactionCount}건
                </BodyText>
              </View>
            </View>
          </Card>
        </SectionContainer>
      </ScrollView>
    </SafeAreaView>
  );
}

// 시간 경과 표시 헬퍼 함수
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffDays > 0) {
    return `${diffDays}일 전`;
  } else if (diffHours > 0) {
    return `${diffHours}시간 전`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes}분 전`;
  } else {
    return '방금 전';
  }
}
