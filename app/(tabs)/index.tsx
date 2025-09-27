import React, { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl, Text } from 'react-native';
import {
  Screen,
  Container,
  SectionContainer,
} from '../../src/components/layout';
import {
  H1,
  H2,
  H3,
  BodyText,
  Caption,
} from '../../src/components/ui/Typography';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { AddIcon, AnalyticsIcon, HomeIcon } from '../../src/components/ui/Icon';
import { useRouter } from 'expo-router';
import { AnalyticsService, AnalyticsData } from '../../src/services/analytics/AnalyticsService';
import { transactionStorage } from '../../src/services/storage/TransactionStorage';
import { Transaction } from '../../src/types/transaction';
import { CATEGORIES } from '../../src/constants/categories';
import { BudgetProgressChart, InsightCard } from '../../src/components/charts';
import { useAuthStore } from '../../src/stores/authStore';
import { useBudgetStore } from '../../src/stores/budgetStore';
import { SpendingRecommendationService } from '../../src/services/analytics/SpendingRecommendationService';

export default function HomeScreen() {
  const router = useRouter();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dailyRecommendation, setDailyRecommendation] = useState<any>(null);

  // 스토어 연결
  const { user, isAuthenticated, isInitialized } = useAuthStore();
  const { budgetSummary, loadBudgetSummary, updateBudgetSpending } = useBudgetStore();

  // 데이터 로드 함수
  const loadData = async (forceRefresh = false) => {
    if (!isAuthenticated || !user) {
      setIsLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const [analytics, recent] = await Promise.all([
        AnalyticsService.getAnalyticsData(forceRefresh),
        transactionStorage.getRecentTransactions(5),
      ]);

      setAnalyticsData(analytics);
      setRecentTransactions(recent);

      // 새로운 예산 시스템 데이터 로드
      await updateBudgetSpending(user.id);
      await loadBudgetSummary(user.id);

      // 일일 권장 지출 로드
      const recommendation = await SpendingRecommendationService.calculateDailyRecommendation(user.id);
      setDailyRecommendation(recommendation);

    } catch (error) {
      console.error('대시보드 데이터 로드 실패:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // 새로고침 핸들러
  const onRefresh = () => {
    setRefreshing(true);
    loadData(true);
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadData();
  }, []);

  // 사용자나 인증 상태 변화 시 데이터 새로고침
  useEffect(() => {
    if (isAuthenticated && user) {
      loadData(true);
    }
  }, [user, isAuthenticated]);

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
    <Screen
      title="안녕하세요! 👋"
      subtitle="오늘도 현명한 소비를 시작해보세요"
      safeArea={true}
      scrollable={true}
    >
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* 예산 진행률 */}
        <SectionContainer>
          <H2 className="mb-4">이번 달 예산</H2>
          <BudgetProgressChart
            data={budgetAnalysis}
            onBudgetPress={() => router.push('/analytics')}
          />
        </SectionContainer>

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

        {/* 빠른 작업 */}
        <SectionContainer>
          <H2 className="mb-4">빠른 작업</H2>
          <View className="mb-4 flex-row space-x-3">
            <Card className="flex-1">
              <Button
                title="지출 기록"
                variant="primary"
                leftIcon={<AddIcon size="sm" color="white" />}
                onPress={() => router.push('/chat')}
              />
            </Card>
            <Card className="flex-1">
              <Button
                title="분석 보기"
                variant="outline"
                leftIcon={<AnalyticsIcon size="sm" color="primary" />}
                onPress={() => router.push('/analytics')}
              />
            </Card>
          </View>
        </SectionContainer>

        {/* 최근 거래 */}
        <SectionContainer>
          <View className="mb-4 flex-row items-center justify-between">
            <H2>최근 거래</H2>
            <Button
              title="전체 보기"
              variant="outline"
              size="sm"
              onPress={() => router.push('/analytics')}
            />
          </View>

          {recentTransactions.length > 0 ? (
            recentTransactions.map(transaction => {
              const categoryInfo = CATEGORIES[transaction.category];
              const timeAgo = getTimeAgo(transaction.date);

              return (
                <Card
                  key={transaction.id}
                  className="mb-3"
                  onPress={() => router.push('/analytics')}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <View className="flex-row items-center mb-1">
                        <Text className="text-lg mr-2">{categoryInfo.icon}</Text>
                        <H3 className="flex-1">{transaction.description}</H3>
                      </View>
                      <View className="flex-row items-center space-x-2">
                        <Caption className="text-primary-600">
                          {categoryInfo.name}
                        </Caption>
                        {transaction.subcategory && (
                          <>
                            <Caption>•</Caption>
                            <Caption>{transaction.subcategory}</Caption>
                          </>
                        )}
                        <Caption>•</Caption>
                        <Caption>{timeAgo}</Caption>
                        {transaction.location && (
                          <>
                            <Caption>•</Caption>
                            <Caption>📍 {transaction.location}</Caption>
                          </>
                        )}
                      </View>
                    </View>
                    <BodyText
                      className={`text-lg font-semibold ${
                        transaction.isIncome ? 'text-success' : 'text-text-primary'
                      }`}
                    >
                      {transaction.isIncome ? '+' : ''}₩
                      {Math.abs(transaction.amount).toLocaleString()}
                    </BodyText>
                  </View>
                </Card>
              );
            })
          ) : (
            <Card className="p-6">
              <View className="items-center">
                <BodyText className="text-secondary-600 text-center">
                  아직 거래 내역이 없습니다.{'\n'}
                  AI 코치와 대화하며 첫 지출을 기록해보세요!
                </BodyText>
                <Button
                  title="지출 기록하기"
                  variant="primary"
                  size="sm"
                  leftIcon={<AddIcon size="sm" color="white" />}
                  onPress={() => router.push('/chat')}
                  className="mt-4"
                />
              </View>
            </Card>
          )}
        </SectionContainer>

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
    </Screen>
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
