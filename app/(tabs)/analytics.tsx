import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, RefreshControl, Text } from 'react-native';
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
  Label,
} from '../../src/components/ui/Typography';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import {
  AnalyticsIcon,
  ChatIcon,
  SettingsIcon,
} from '../../src/components/ui/Icon';
import { AnalyticsService, AnalyticsData } from '../../src/services/analytics/AnalyticsService';
import {
  SpendingTrendChart,
  CategoryPieChart,
  WeeklyPatternChart,
  BudgetProgressChart,
  InsightCard,
} from '../../src/components/charts';
import { useRouter } from 'expo-router';

export default function AnalyticsScreen() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const periods = [
    { key: 'week' as const, label: '주간' },
    { key: 'month' as const, label: '월간' },
    { key: 'year' as const, label: '연간' },
  ];

  // 데이터 로드 함수
  const loadAnalyticsData = async (forceRefresh = false) => {
    try {
      const data = await AnalyticsService.getAnalyticsData(forceRefresh);
      setAnalyticsData(data);
    } catch (error) {
      console.error('분석 데이터 로드 실패:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // 새로고침 핸들러
  const onRefresh = () => {
    setRefreshing(true);
    loadAnalyticsData(true);
  };

  // 초기 데이터 로드
  useEffect(() => {
    loadAnalyticsData();
  }, []);

  // 로딩 상태
  if (isLoading) {
    return (
      <Screen
        title="분석 중..."
        subtitle="데이터를 분석하고 있습니다"
        safeArea={true}
        scrollable={true}
      >
        <SectionContainer>
          <Card className="p-8">
            <View className="items-center">
              <BodyText>재정 데이터를 분석하고 있습니다...</BodyText>
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
        title="분석 데이터 없음"
        subtitle="거래 내역을 먼저 기록해주세요"
        safeArea={true}
        scrollable={true}
      >
        <SectionContainer>
          <Card className="p-8">
            <View className="items-center space-y-4">
              <H3>분석할 데이터가 없습니다</H3>
              <BodyText className="text-center text-secondary-600">
                AI 코치와 대화하며 거래를 기록하면{'\n'}
                상세한 분석 결과를 확인할 수 있습니다.
              </BodyText>
              <Button
                title="거래 기록하러 가기"
                variant="primary"
                onPress={() => router.push('/chat')}
              />
            </View>
          </Card>
        </SectionContainer>
      </Screen>
    );
  }

  const { summary, monthlyTrends, weeklyPatterns, budgetAnalysis, insights, categoryTrends } = analyticsData;

  return (
    <Screen
      title="지출 분석"
      subtitle="나의 소비 패턴을 한눈에 확인해보세요"
      safeArea={true}
      scrollable={true}
    >
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* 기간 선택 */}
        <SectionContainer>
          <View className="mb-4 flex-row space-x-2">
            {periods.map(period => (
              <TouchableOpacity
                key={period.key}
                className={`flex-1 rounded-lg px-4 py-3 ${
                  selectedPeriod === period.key ? 'bg-primary-600' : 'bg-gray-100'
                }`}
                onPress={() => setSelectedPeriod(period.key)}
              >
                <BodyText
                  className={`text-center font-medium ${
                    selectedPeriod === period.key ? 'text-white' : 'text-gray-600'
                  }`}
                >
                  {period.label}
                </BodyText>
              </TouchableOpacity>
            ))}
          </View>
        </SectionContainer>

        {/* 예산 진행률 */}
        <SectionContainer>
          <BudgetProgressChart data={budgetAnalysis} />
        </SectionContainer>

        {/* 총 지출 요약 */}
        <SectionContainer>
          <H2 className="mb-4">이번 달 요약</H2>
          <Card className="mb-4">
            <View className="space-y-4">
              <View className="items-center py-2">
                <BodyText className="text-3xl font-bold text-primary-600">
                  ₩{summary.totalSpent.toLocaleString()}
                </BodyText>
                <Caption className="mt-1 text-gray-600">
                  총 지출 (거래 {summary.transactionCount}건)
                </Caption>
              </View>

              <View className="flex-row justify-between items-center pt-2 border-t border-gray-200">
                <View className="flex-1 items-center">
                  <BodyText className="text-sm text-gray-500">총 수입</BodyText>
                  <BodyText className="text-lg font-semibold text-green-600">
                    ₩{summary.totalIncome.toLocaleString()}
                  </BodyText>
                </View>
                <View className="flex-1 items-center">
                  <BodyText className="text-sm text-gray-500">순자산 변화</BodyText>
                  <BodyText className={`text-lg font-semibold ${summary.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {summary.netAmount >= 0 ? '+' : ''}₩{summary.netAmount.toLocaleString()}
                  </BodyText>
                </View>
                <View className="flex-1 items-center">
                  <BodyText className="text-sm text-gray-500">평균 거래</BodyText>
                  <BodyText className="text-lg font-semibold text-gray-900">
                    ₩{Math.round(summary.averagePerTransaction).toLocaleString()}
                  </BodyText>
                </View>
              </View>
            </View>
          </Card>
        </SectionContainer>

        {/* AI 인사이트 */}
        {insights.length > 0 && (
          <SectionContainer>
            <H2 className="mb-4">AI 인사이트</H2>
            {insights.map((insight) => (
              <InsightCard
                key={insight.id}
                insight={insight}
                onPress={() => console.log('인사이트 클릭:', insight.title)}
                onActionPress={() => router.push('/chat')}
              />
            ))}
          </SectionContainer>
        )}

        {/* 카테고리별 지출 */}
        <SectionContainer>
          <CategoryPieChart
            data={summary.categoryBreakdown}
            onCategoryPress={(category) => console.log('카테고리 클릭:', category)}
          />
        </SectionContainer>

        {/* 월별 트렌드 */}
        {monthlyTrends.length > 0 && (
          <SectionContainer>
            <SpendingTrendChart
              data={monthlyTrends}
              onPointPress={(point) => console.log('트렌드 포인트 클릭:', point)}
            />
          </SectionContainer>
        )}

        {/* 요일별 패턴 */}
        <SectionContainer>
          <WeeklyPatternChart
            data={weeklyPatterns}
            onDayPress={(pattern) => console.log('요일 패턴 클릭:', pattern)}
          />
        </SectionContainer>

        {/* 카테고리 트렌드 분석 */}
        {categoryTrends.length > 0 && (
          <SectionContainer>
            <H2 className="mb-4">카테고리 트렌드</H2>
            <Card className="mb-4">
              <View className="space-y-3">
                {categoryTrends.map((trend, index) => (
                  <View key={trend.category} className={`${index > 0 ? 'pt-3 border-t border-gray-100' : ''}`}>
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <BodyText className="font-medium">{trend.category}</BodyText>
                        <View className="flex-row items-center mt-1">
                          <BodyText className="text-sm text-gray-600">
                            이번 달: ₩{trend.currentMonth.toLocaleString()}
                          </BodyText>
                          <Text className="mx-2 text-gray-400">|</Text>
                          <BodyText className="text-sm text-gray-600">
                            지난 달: ₩{trend.previousMonth.toLocaleString()}
                          </BodyText>
                        </View>
                      </View>
                      <View className="items-end">
                        <View className="flex-row items-center">
                          <Text className="text-lg mr-1">
                            {trend.trend === 'up' ? '📈' : trend.trend === 'down' ? '📉' : '➡️'}
                          </Text>
                          <BodyText className={`font-semibold ${
                            trend.trend === 'up' ? 'text-red-600' :
                            trend.trend === 'down' ? 'text-green-600' : 'text-gray-600'
                          }`}>
                            {trend.changePercentage > 0 ? '+' : ''}{trend.changePercentage.toFixed(0)}%
                          </BodyText>
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </Card>
          </SectionContainer>
        )}

        {/* 추가 액션 */}
        <SectionContainer>
          <View className="space-y-3">
            <Button
              title="AI 코치와 상담하기"
              variant="primary"
              leftIcon={<ChatIcon size="sm" color="white" />}
              onPress={() => router.push('/chat')}
            />
            <Button
              title="거래 내역 추가하기"
              variant="outline"
              onPress={() => router.push('/chat')}
            />
          </View>
        </SectionContainer>
      </ScrollView>
    </Screen>
  );
}
