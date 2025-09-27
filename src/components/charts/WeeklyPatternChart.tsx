/**
 * 요일별 지출 패턴 차트 컴포넌트
 * 요일별 평균 지출과 거래 빈도를 바 차트로 표시
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { WeeklyPattern } from '../../services/analytics/AnalyticsService';
import { CATEGORIES } from '../../constants/categories';

interface WeeklyPatternChartProps {
  data: WeeklyPattern[];
  height?: number;
  showTransactionCount?: boolean;
  onDayPress?: (pattern: WeeklyPattern) => void;
}

export const WeeklyPatternChart: React.FC<WeeklyPatternChartProps> = ({
  data,
  height = 220,
  showTransactionCount = true,
  onDayPress,
}) => {
  // 차트 데이터 변환
  const barData = data.map((pattern, index) => {
    const isWeekend = pattern.dayOfWeek === 0 || pattern.dayOfWeek === 6;
    return {
      value: pattern.averageSpent / 1000, // 천원 단위로 변환
      label: pattern.dayName,
      frontColor: isWeekend ? '#8B5CF6' : '#3B82F6',
      spacing: index === 0 ? 0 : 10,
      labelWidth: 30,
      labelTextStyle: {
        color: '#6B7280',
        fontSize: 12,
        fontWeight: '500' as const,
      },
      topLabelComponent: () => (
        <View className="items-center">
          <Text className="text-xs font-semibold text-gray-700">
            {(pattern.averageSpent / 1000).toFixed(0)}k
          </Text>
          {showTransactionCount && (
            <Text className="text-xs text-gray-500">
              {pattern.transactionCount}건
            </Text>
          )}
        </View>
      ),
      originalData: pattern,
    };
  });

  const maxValue = Math.max(...data.map(p => p.averageSpent)) / 1000;

  const handleBarPress = (item: any, index: number) => {
    if (onDayPress && item.originalData) {
      onDayPress(item.originalData);
    }
  };

  // 통계 계산
  const weekdayAverage = data
    .filter(p => p.dayOfWeek !== 0 && p.dayOfWeek !== 6)
    .reduce((sum, p) => sum + p.averageSpent, 0) / 5;

  const weekendAverage = data
    .filter(p => p.dayOfWeek === 0 || p.dayOfWeek === 6)
    .reduce((sum, p) => sum + p.averageSpent, 0) / 2;

  const mostActiveDay = data.reduce((prev, current) =>
    prev.transactionCount > current.transactionCount ? prev : current
  );

  const highestSpendingDay = data.reduce((prev, current) =>
    prev.averageSpent > current.averageSpent ? prev : current
  );

  return (
    <View className="bg-white rounded-2xl p-4 shadow-sm">
      {/* 차트 헤더 */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-bold text-gray-900">
          요일별 지출 패턴
        </Text>
        <View className="flex-row space-x-2">
          <View className="flex-row items-center">
            <View className="w-3 h-3 bg-blue-500 rounded mr-2" />
            <Text className="text-xs text-gray-600">평일</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-3 h-3 bg-purple-500 rounded mr-2" />
            <Text className="text-xs text-gray-600">주말</Text>
          </View>
        </View>
      </View>

      {/* 차트 */}
      <View className="items-center">
        <BarChart
          data={barData}
          width={300}
          height={height}
          spacing={15}
          initialSpacing={10}
          endSpacing={10}
          // 스타일링
          barWidth={35}
          barBorderRadius={6}
          showGradient
          gradientColor="#E0E7FF"
          // Y축
          yAxisColor="#E5E7EB"
          yAxisThickness={1}
          yAxisTextStyle={{
            color: '#6B7280',
            fontSize: 11,
          }}
          yAxisLabelSuffix="k"
          noOfSections={4}
          maxValue={Math.ceil(maxValue / 10) * 10}
          // X축
          xAxisColor="#E5E7EB"
          xAxisThickness={1}
          hideRules={false}
          rulesColor="#F3F4F6"
          rulesType="solid"
          // 애니메이션
          animationDuration={800}
          // 인터랙션
          onPress={handleBarPress}
          // 레이블
          showValuesAsTopLabel
          topLabelTextStyle={{
            color: '#374151',
            fontSize: 11,
            fontWeight: 'bold',
          }}
        />
      </View>

      {/* 하단 인사이트 */}
      <View className="mt-4 pt-3 border-t border-gray-100">
        <View className="space-y-3">
          {/* 평일 vs 주말 비교 */}
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text className="text-sm text-gray-500">평일 평균</Text>
              <Text className="text-lg font-semibold text-blue-600">
                {(weekdayAverage / 1000).toFixed(0)}천원
              </Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-sm text-gray-500">주말 평균</Text>
              <Text className="text-lg font-semibold text-purple-600">
                {(weekendAverage / 1000).toFixed(0)}천원
              </Text>
            </View>
            <View className="flex-1 items-end">
              <Text className="text-sm text-gray-500">
                {weekendAverage > weekdayAverage ? '주말이' : '평일이'}
              </Text>
              <Text className="text-lg font-semibold text-gray-900">
                {Math.abs((weekendAverage - weekdayAverage) / Math.min(weekendAverage, weekdayAverage) * 100).toFixed(0)}% 높음
              </Text>
            </View>
          </View>

          {/* 패턴 분석 */}
          <View className="flex-row justify-between">
            <View className="flex-1">
              <Text className="text-xs text-gray-500">최고 지출일</Text>
              <View className="flex-row items-center mt-1">
                <Text className="text-sm font-medium text-gray-900">
                  {highestSpendingDay.dayName}요일
                </Text>
                <Text className="text-xs text-gray-600 ml-2">
                  {CATEGORIES[highestSpendingDay.topCategory]?.icon} {CATEGORIES[highestSpendingDay.topCategory]?.name}
                </Text>
              </View>
            </View>

            <View className="flex-1 items-end">
              <Text className="text-xs text-gray-500">가장 활발한 날</Text>
              <View className="flex-row items-center mt-1">
                <Text className="text-sm font-medium text-gray-900">
                  {mostActiveDay.dayName}요일
                </Text>
                <Text className="text-xs text-gray-600 ml-2">
                  {mostActiveDay.transactionCount}건
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};