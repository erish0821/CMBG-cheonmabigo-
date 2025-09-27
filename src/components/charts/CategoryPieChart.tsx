/**
 * 카테고리별 지출 파이 차트 컴포넌트
 * 카테고리별 지출 비율을 원형 차트로 표시
 */

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { CategorySpending, CategoryType } from '../../types/transaction';
import { CATEGORIES } from '../../constants/categories';

interface CategoryPieChartProps {
  data: CategorySpending[];
  size?: number;
  showPercentages?: boolean;
  onCategoryPress?: (category: CategoryType) => void;
}

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({
  data,
  size = 200,
  showPercentages = true,
  onCategoryPress,
}) => {
  // 색상 팔레트 (카테고리별 고정 색상)
  const categoryColors: Record<CategoryType, string> = {
    [CategoryType.FOOD]: '#EF4444',
    [CategoryType.TRANSPORT]: '#F59E0B',
    [CategoryType.ENTERTAINMENT]: '#8B5CF6',
    [CategoryType.SHOPPING]: '#EC4899',
    [CategoryType.HEALTHCARE]: '#10B981',
    [CategoryType.EDUCATION]: '#3B82F6',
    [CategoryType.UTILITIES]: '#6B7280',
    [CategoryType.HOUSING]: '#84CC16',
    [CategoryType.INCOME]: '#059669',
    [CategoryType.OTHER]: '#9CA3AF',
  };

  // 차트 데이터 변환
  const pieData = data
    .filter(item => item.amount > 0)
    .slice(0, 8) // 상위 8개 카테고리만 표시
    .map((item, index) => {
      const categoryInfo = CATEGORIES[item.category];
      return {
        value: item.amount,
        color: categoryColors[item.category],
        text: showPercentages ? `${item.percentage.toFixed(0)}%` : '',
        label: categoryInfo.name,
        category: item.category,
        originalData: item,
        focused: false,
      };
    });

  // 총 금액 계산
  const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);

  const handleSlicePress = (item: any) => {
    if (onCategoryPress && item.category) {
      onCategoryPress(item.category);
    }
  };

  return (
    <View className="bg-white rounded-2xl p-4 shadow-sm">
      {/* 차트 헤더 */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-bold text-gray-900">
          카테고리별 지출
        </Text>
        <Text className="text-sm text-gray-500">
          총 {(totalAmount / 10000).toFixed(0)}만원
        </Text>
      </View>

      <View className="flex-row">
        {/* 파이 차트 */}
        <View className="flex-1 items-center justify-center">
          <PieChart
            data={pieData}
            radius={size / 2}
            innerRadius={size / 4}
            centerLabelComponent={() => (
              <View className="items-center">
                <Text className="text-xs text-gray-500">이번 달</Text>
                <Text className="text-sm font-bold text-gray-900">
                  {(totalAmount / 10000).toFixed(0)}만원
                </Text>
              </View>
            )}
            // 스타일링
            strokeWidth={2}
            strokeColor="#FFFFFF"
            // 애니메이션
            animationDuration={1000}
            // 인터랙션
            onPress={handleSlicePress}
            focusOnPress
            // 레이블
            showText={showPercentages}
            textColor="#FFFFFF"
            textSize={12}
            fontWeight="bold"
            // 그라데이션 효과
            showGradient={false}
          />
        </View>

        {/* 범례 */}
        <View className="flex-1 ml-4">
          <ScrollView showsVerticalScrollIndicator={false}>
            {pieData.map((item, index) => {
              const categoryInfo = CATEGORIES[item.category];
              return (
                <TouchableOpacity
                  key={item.category}
                  className="flex-row items-center mb-3 p-2 rounded-lg active:bg-gray-50"
                  onPress={() => handleSlicePress(item)}
                >
                  <View
                    className="w-4 h-4 rounded-full mr-3"
                    style={{ backgroundColor: item.color }}
                  />
                  <View className="flex-1">
                    <View className="flex-row items-center">
                      <Text className="text-xs mr-1">{categoryInfo.icon}</Text>
                      <Text className="text-sm font-medium text-gray-900 flex-1">
                        {categoryInfo.name}
                      </Text>
                    </View>
                    <Text className="text-xs text-gray-500">
                      {(item.value / 10000).toFixed(0)}만원 ({item.originalData.percentage.toFixed(0)}%)
                    </Text>
                    <Text className="text-xs text-gray-400">
                      {item.originalData.transactionCount}건
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>

      {/* 하단 통계 */}
      <View className="mt-4 pt-3 border-t border-gray-100">
        <View className="flex-row justify-between">
          <View className="flex-1 items-center">
            <Text className="text-xs text-gray-500">최대 지출</Text>
            <View className="flex-row items-center mt-1">
              <Text className="text-xs mr-1">
                {CATEGORIES[data[0]?.category]?.icon}
              </Text>
              <Text className="text-sm font-semibold text-gray-900">
                {CATEGORIES[data[0]?.category]?.name}
              </Text>
            </View>
            <Text className="text-xs text-gray-600">
              {(data[0]?.amount / 10000).toFixed(0)}만원
            </Text>
          </View>

          <View className="flex-1 items-center">
            <Text className="text-xs text-gray-500">평균 거래</Text>
            <Text className="text-sm font-semibold text-gray-900 mt-1">
              {data.length > 0 ? (totalAmount / data.reduce((sum, item) => sum + item.transactionCount, 0) / 1000).toFixed(0) : 0}천원
            </Text>
            <Text className="text-xs text-gray-600">
              건당 평균
            </Text>
          </View>

          <View className="flex-1 items-center">
            <Text className="text-xs text-gray-500">활성 카테고리</Text>
            <Text className="text-sm font-semibold text-gray-900 mt-1">
              {data.filter(item => item.amount > 0).length}개
            </Text>
            <Text className="text-xs text-gray-600">
              총 {Object.keys(CategoryType).length - 1}개 중
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};