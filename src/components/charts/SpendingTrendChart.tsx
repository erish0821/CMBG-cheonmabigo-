/**
 * 지출 트렌드 차트 컴포넌트
 * 월별 지출/수입 트렌드를 라인 차트로 표시
 */

import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { MonthlyTrend } from '../../services/analytics/AnalyticsService';

interface SpendingTrendChartProps {
  data: MonthlyTrend[];
  height?: number;
  showIncome?: boolean;
  onPointPress?: (point: MonthlyTrend) => void;
}

const { width: screenWidth } = Dimensions.get('window');

export const SpendingTrendChart: React.FC<SpendingTrendChartProps> = ({
  data,
  height = 250,
  showIncome = true,
  onPointPress,
}) => {
  // 차트 데이터 변환
  const spendingData = data.map((item, index) => ({
    value: item.totalSpent / 10000, // 만원 단위로 변환
    label: item.month,
    dataPointText: `${(item.totalSpent / 10000).toFixed(0)}만원`,
    originalData: item,
    index,
  }));

  const incomeData = showIncome ? data.map((item, index) => ({
    value: item.totalIncome / 10000,
    label: item.month,
    dataPointText: `${(item.totalIncome / 10000).toFixed(0)}만원`,
    originalData: item,
    index,
  })) : [];

  const maxValue = Math.max(
    ...data.map(item => Math.max(item.totalSpent, item.totalIncome))
  ) / 10000;

  const handlePointPress = (item: any, index: number) => {
    if (onPointPress && item.originalData) {
      onPointPress(item.originalData);
    }
  };

  return (
    <View className="bg-white rounded-2xl p-4 shadow-sm">
      {/* 차트 헤더 */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-bold text-gray-900">
          지출 트렌드
        </Text>
        <View className="flex-row space-x-4">
          <View className="flex-row items-center">
            <View className="w-3 h-3 bg-red-500 rounded-full mr-2" />
            <Text className="text-sm text-gray-600">지출</Text>
          </View>
          {showIncome && (
            <View className="flex-row items-center">
              <View className="w-3 h-3 bg-green-500 rounded-full mr-2" />
              <Text className="text-sm text-gray-600">수입</Text>
            </View>
          )}
        </View>
      </View>

      {/* 차트 */}
      <View style={{ paddingLeft: 10 }}>
        <LineChart
          data={spendingData}
          data2={showIncome ? incomeData : undefined}
          width={screenWidth - 80}
          height={height}
          spacing={50}
          initialSpacing={30}
          endSpacing={30}
          adjustToWidth
          // 스타일링
          color="#EF4444"
          color2="#10B981"
          thickness={3}
          thickness2={3}
          curved
          // 데이터 포인트
          dataPointsColor="#EF4444"
          dataPointsColor2="#10B981"
          dataPointsRadius={6}
          dataPointsWidth={3}
          // 그리드
          showVerticalLines
          verticalLinesColor="#F3F4F6"
          // Y축
          yAxisColor="#E5E7EB"
          yAxisThickness={1}
          yAxisTextStyle={{
            color: '#6B7280',
            fontSize: 12,
          }}
          yAxisLabelSuffix="만원"
          noOfSections={4}
          maxValue={Math.ceil(maxValue / 10) * 10}
          // X축
          xAxisColor="#E5E7EB"
          xAxisThickness={1}
          xAxisLabelTextStyle={{
            color: '#6B7280',
            fontSize: 12,
          }}
          // 애니메이션
          animateOnDataChange
          animationDuration={1000}
          // 인터랙션
          // onDataPointClick={handlePointPress}
          // 그라데이션 (옵션) - 웹 호환성을 위해 비활성화
          // areaChart
          // startFillColor="#EF444420"
          // startOpacity={0.4}
          // endOpacity={0.1}
          // startFillColor2="#10B98120"
          // startOpacity2={0.4}
          // endOpacity2={0.1}
        />
      </View>

      {/* 차트 하단 정보 */}
      <View className="mt-4 pt-3 border-t border-gray-100">
        <View className="flex-row justify-between">
          <View className="flex-1">
            <Text className="text-sm text-gray-500">평균 지출</Text>
            <Text className="text-lg font-semibold text-gray-900">
              {(data.reduce((sum, item) => sum + item.totalSpent, 0) / data.length / 10000).toFixed(0)}만원
            </Text>
          </View>
          {showIncome && (
            <View className="flex-1">
              <Text className="text-sm text-gray-500">평균 수입</Text>
              <Text className="text-lg font-semibold text-gray-900">
                {(data.reduce((sum, item) => sum + item.totalIncome, 0) / data.length / 10000).toFixed(0)}만원
              </Text>
            </View>
          )}
          <View className="flex-1">
            <Text className="text-sm text-gray-500">평균 순자산</Text>
            <Text className="text-lg font-semibold text-green-600">
              {(data.reduce((sum, item) => sum + item.netAmount, 0) / data.length / 10000).toFixed(0)}만원
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};