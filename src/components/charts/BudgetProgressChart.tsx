/**
 * 예산 진행률 차트 컴포넌트
 * 예산 사용률과 잔여 금액을 원형 프로그레스 바로 표시
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { BudgetAnalysis } from '../../services/analytics/AnalyticsService';

interface BudgetProgressChartProps {
  data: BudgetAnalysis;
  size?: number;
  onBudgetPress?: () => void;
}

export const BudgetProgressChart: React.FC<BudgetProgressChartProps> = ({
  data,
  size = 180,
  onBudgetPress,
}) => {
  // 예산 상태에 따른 색상 결정
  const getStatusColor = () => {
    if (data.usagePercentage >= 90) return '#EF4444'; // 빨강
    if (data.usagePercentage >= 70) return '#F59E0B'; // 주황
    if (data.usagePercentage >= 50) return '#3B82F6'; // 파랑
    return '#10B981'; // 초록
  };

  const getStatusText = () => {
    if (data.usagePercentage >= 90) return '위험';
    if (data.usagePercentage >= 70) return '주의';
    if (data.usagePercentage >= 50) return '보통';
    return '양호';
  };

  const statusColor = getStatusColor();

  // 차트 데이터
  const chartData = [
    {
      value: data.usagePercentage,
      color: statusColor,
      text: `${data.usagePercentage.toFixed(0)}%`,
    },
    {
      value: 100 - data.usagePercentage,
      color: '#F3F4F6',
      text: '',
    },
  ];

  // 일일 평균 지출과 권장 지출 비교
  const spendingStatus = data.dailyAverageSpent > data.recommendedDailySpending ? 'over' : 'under';
  const spendingDiff = Math.abs(data.dailyAverageSpent - data.recommendedDailySpending);

  return (
    <TouchableOpacity
      className="bg-white rounded-2xl p-4 shadow-sm active:bg-gray-50"
      onPress={onBudgetPress}
    >
      {/* 차트 헤더 */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-bold text-gray-900">
          예산 진행률
        </Text>
        <View className="flex-row items-center">
          <View
            className="w-3 h-3 rounded-full mr-2"
            style={{ backgroundColor: statusColor }}
          />
          <Text className="text-sm font-medium" style={{ color: statusColor }}>
            {getStatusText()}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center">
        {/* 원형 프로그레스 차트 */}
        <View className="items-center justify-center">
          <PieChart
            data={chartData}
            radius={size / 2}
            innerRadius={size / 2 - 20}
            centerLabelComponent={() => (
              <View className="items-center">
                <Text className="text-2xl font-bold" style={{ color: statusColor }}>
                  {data.usagePercentage.toFixed(0)}%
                </Text>
                <Text className="text-xs text-gray-500">사용됨</Text>
              </View>
            )}
            strokeWidth={0}
            showText={false}
            donut
            sectionAutoFocus={false}
          />
        </View>

        {/* 상세 정보 */}
        <View className="flex-1 ml-6 space-y-3">
          {/* 예산 정보 */}
          <View>
            <Text className="text-sm text-gray-500">이번 달 예산</Text>
            <Text className="text-xl font-bold text-gray-900">
              ₩{data.totalBudget.toLocaleString()}
            </Text>
          </View>

          {/* 사용 금액 */}
          <View>
            <Text className="text-sm text-gray-500">사용 금액</Text>
            <Text className="text-lg font-semibold" style={{ color: statusColor }}>
              ₩{data.spentAmount.toLocaleString()}
            </Text>
          </View>

          {/* 남은 금액 */}
          <View>
            <Text className="text-sm text-gray-500">잔여 예산</Text>
            <Text className="text-lg font-semibold text-green-600">
              ₩{data.remainingAmount.toLocaleString()}
            </Text>
          </View>
        </View>
      </View>

      {/* 하단 분석 */}
      <View className="mt-4 pt-3 border-t border-gray-100">
        <View className="space-y-3">
          {/* 일일 지출 분석 */}
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text className="text-sm text-gray-500">일평균 지출</Text>
              <Text className="text-lg font-semibold text-gray-900">
                ₩{Math.round(data.dailyAverageSpent).toLocaleString()}
              </Text>
            </View>
            <View className="flex-1 items-end">
              <Text className="text-sm text-gray-500">권장 일지출</Text>
              <Text className="text-lg font-semibold text-blue-600">
                ₩{Math.round(data.recommendedDailySpending).toLocaleString()}
              </Text>
            </View>
          </View>

          {/* 예산 관리 상태 */}
          <View className="bg-gray-50 rounded-lg p-3">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-sm font-medium text-gray-900">
                  {data.isOnTrack ? '✅ 예산 계획대로 진행 중' : '⚠️ 예산 초과 위험'}
                </Text>
                <Text className="text-xs text-gray-600 mt-1">
                  남은 {data.daysRemaining}일 동안 일평균 ₩{Math.round(data.recommendedDailySpending).toLocaleString()} 이하 지출 권장
                </Text>
              </View>
            </View>

            {/* 지출 패턴 분석 */}
            {spendingStatus === 'over' && (
              <View className="mt-2 p-2 bg-red-50 rounded">
                <Text className="text-xs text-red-700">
                  현재 일평균 지출이 권장량보다 ₩{Math.round(spendingDiff).toLocaleString()} 많습니다.
                  지출을 줄이시거나 예산을 조정해보세요.
                </Text>
              </View>
            )}

            {spendingStatus === 'under' && data.usagePercentage < 50 && (
              <View className="mt-2 p-2 bg-green-50 rounded">
                <Text className="text-xs text-green-700">
                  예산을 잘 관리하고 있습니다! 현재 페이스로 진행하면 ₩{Math.round(spendingDiff * data.daysRemaining).toLocaleString()} 절약 가능합니다.
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};