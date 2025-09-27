import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
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

export default function AnalyticsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<
    'week' | 'month' | 'year'
  >('month');

  const periods = [
    { key: 'week' as const, label: '주간' },
    { key: 'month' as const, label: '월간' },
    { key: 'year' as const, label: '연간' },
  ];

  const categoryData = [
    { name: '식비', amount: 450000, percentage: 36, color: '#ef4444' },
    { name: '교통비', amount: 180000, percentage: 14, color: '#f59e0b' },
    { name: '카페', amount: 120000, percentage: 10, color: '#10b981' },
    { name: '쇼핑', amount: 300000, percentage: 24, color: '#8b5cf6' },
    { name: '기타', amount: 195000, percentage: 16, color: '#6b7280' },
  ];

  const insights = [
    {
      title: '식비 지출 증가',
      description: '지난달 대비 15% 증가했어요',
      type: 'warning' as const,
      action: '절약 팁 보기',
    },
    {
      title: '교통비 절약 성공',
      description: '대중교통 이용으로 20% 절약했어요',
      type: 'success' as const,
      action: '계속 유지하기',
    },
    {
      title: '저축 목표 달성 가능',
      description: '현재 패턴으로 목표 달성 예상돼요',
      type: 'info' as const,
      action: '목표 조정하기',
    },
  ];

  return (
    <Screen
      title="지출 분석"
      subtitle="나의 소비 패턴을 한눈에 확인해보세요"
      safeArea={true}
      scrollable={true}
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

      {/* 총 지출 요약 */}
      <SectionContainer>
        <H2 className="mb-4">이번 달 지출</H2>
        <Card className="mb-4">
          <View className="items-center py-4">
            <BodyText className="text-4xl font-bold text-primary-600">
              ₩1,245,000
            </BodyText>
            <Caption className="mt-2 text-gray-600">
              지난달 대비 8% 증가
            </Caption>
          </View>
        </Card>
      </SectionContainer>

      {/* 카테고리별 지출 */}
      <SectionContainer>
        <H2 className="mb-4">카테고리별 지출</H2>
        <Card className="mb-4">
          {categoryData.map((category, index) => (
            <View key={category.name} className={`${index > 0 ? 'mt-4' : ''}`}>
              <View className="mb-2 flex-row items-center justify-between">
                <View className="flex-row items-center space-x-2">
                  <View
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <Label>{category.name}</Label>
                </View>
                <View className="items-end">
                  <BodyText className="font-semibold">
                    ₩{category.amount.toLocaleString()}
                  </BodyText>
                  <Caption>{category.percentage}%</Caption>
                </View>
              </View>
              <ProgressBar
                progress={category.percentage}
                className="h-2"
                showGradient={false}
                style={{ backgroundColor: category.color }}
              />
            </View>
          ))}
        </Card>
      </SectionContainer>

      {/* AI 인사이트 */}
      <SectionContainer>
        <H2 className="mb-4">AI 인사이트</H2>
        {insights.map((insight, index) => (
          <Card key={index} className="mb-3">
            <View className="flex-row items-start space-x-3">
              <View
                className={`mt-1 h-2 w-2 rounded-full ${
                  insight.type === 'warning'
                    ? 'bg-warning'
                    : insight.type === 'success'
                      ? 'bg-success'
                      : 'bg-info'
                }`}
              />
              <View className="flex-1">
                <H3 className="mb-1">{insight.title}</H3>
                <BodyText variant="secondary" className="mb-3">
                  {insight.description}
                </BodyText>
                <Button
                  title={insight.action}
                  variant="outline"
                  size="sm"
                  leftIcon={<ChatIcon size="xs" color="primary" />}
                />
              </View>
            </View>
          </Card>
        ))}
      </SectionContainer>

      {/* 월별 트렌드 */}
      <SectionContainer>
        <H2 className="mb-4">월별 지출 트렌드</H2>
        <Card className="mb-4">
          <View className="py-4">
            {/* 간단한 차트 표시 (실제 구현시 차트 라이브러리 사용) */}
            <View className="flex-row items-end justify-between space-x-2">
              {[
                { month: '1월', amount: 1100000 },
                { month: '2월', amount: 950000 },
                { month: '3월', amount: 1200000 },
                { month: '4월', amount: 1350000 },
                { month: '5월', amount: 1245000 },
              ].map((data, index) => (
                <View key={data.month} className="flex-1 items-center">
                  <View
                    className="w-full bg-primary-200"
                    style={{
                      height: (data.amount / 1500000) * 100,
                      minHeight: 20,
                    }}
                  />
                  <Caption className="mt-2">{data.month}</Caption>
                  <Caption className="text-xs text-gray-500">
                    {Math.round(data.amount / 10000)}만원
                  </Caption>
                </View>
              ))}
            </View>
          </View>
        </Card>
      </SectionContainer>

      {/* 예산 vs 실제 */}
      <SectionContainer>
        <H2 className="mb-4">예산 vs 실제</H2>
        <Card className="mb-4">
          <View className="space-y-4">
            <View>
              <View className="mb-2 flex-row items-center justify-between">
                <Label>예산</Label>
                <BodyText>₩1,660,000</BodyText>
              </View>
              <ProgressBar progress={100} color="success" className="h-2" />
            </View>
            <View>
              <View className="mb-2 flex-row items-center justify-between">
                <Label>실제 지출</Label>
                <BodyText className="text-primary-600">₩1,245,000</BodyText>
              </View>
              <ProgressBar progress={75} className="h-2" />
            </View>
            <View className="bg-success-50 rounded-lg p-3">
              <BodyText className="text-center font-medium text-success">
                예산 대비 ₩415,000 절약 중! 🎉
              </BodyText>
            </View>
          </View>
        </Card>
      </SectionContainer>
    </Screen>
  );
}
