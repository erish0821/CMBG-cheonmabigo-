/**
 * AI 인사이트 카드 컴포넌트
 * AI가 생성한 재정 인사이트를 카드 형태로 표시
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { AIInsight } from '../../services/analytics/AnalyticsService';
import { CATEGORIES } from '../../constants/categories';

interface InsightCardProps {
  insight: AIInsight;
  onPress?: (insight: AIInsight) => void;
  onActionPress?: (insight: AIInsight) => void;
}

export const InsightCard: React.FC<InsightCardProps> = ({
  insight,
  onPress,
  onActionPress,
}) => {
  // 인사이트 타입별 스타일링
  const getCardStyle = () => {
    switch (insight.type) {
      case 'warning':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: '⚠️',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          titleColor: 'text-red-800',
          actionBg: 'bg-red-600',
        };
      case 'tip':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: '💡',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          titleColor: 'text-blue-800',
          actionBg: 'bg-blue-600',
        };
      case 'achievement':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          icon: '🎉',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          titleColor: 'text-green-800',
          actionBg: 'bg-green-600',
        };
      case 'prediction':
        return {
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          icon: '🔮',
          iconBg: 'bg-purple-100',
          iconColor: 'text-purple-600',
          titleColor: 'text-purple-800',
          actionBg: 'bg-purple-600',
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          icon: 'ℹ️',
          iconBg: 'bg-gray-100',
          iconColor: 'text-gray-600',
          titleColor: 'text-gray-800',
          actionBg: 'bg-gray-600',
        };
    }
  };

  const style = getCardStyle();

  // 우선순위에 따른 표시
  const getPriorityIndicator = () => {
    if (insight.priority >= 4) return '🔥';
    if (insight.priority >= 3) return '📌';
    return '';
  };

  return (
    <TouchableOpacity
      className={`${style.bg} ${style.border} border rounded-2xl p-4 mb-3 active:opacity-80`}
      onPress={() => onPress?.(insight)}
    >
      {/* 카드 헤더 */}
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-row items-center flex-1">
          <View className={`${style.iconBg} w-10 h-10 rounded-full items-center justify-center mr-3`}>
            <Text className="text-lg">{style.icon}</Text>
          </View>

          <View className="flex-1">
            <View className="flex-row items-center">
              <Text className={`text-lg font-bold ${style.titleColor} flex-1`}>
                {insight.title}
              </Text>
              {getPriorityIndicator() && (
                <Text className="text-sm ml-2">{getPriorityIndicator()}</Text>
              )}
            </View>

            {/* 카테고리 표시 */}
            {insight.category && (
              <View className="flex-row items-center mt-1">
                <Text className="text-xs mr-1">
                  {CATEGORIES[insight.category]?.icon}
                </Text>
                <Text className="text-xs text-gray-600">
                  {CATEGORIES[insight.category]?.name}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* 인사이트 내용 */}
      <Text className="text-sm text-gray-700 leading-5 mb-3">
        {insight.description}
      </Text>

      {/* 데이터 표시 (있는 경우) */}
      {insight.data && (
        <View className="bg-white bg-opacity-50 rounded-lg p-2 mb-3">
          {insight.data.budgetUsage && (
            <Text className="text-xs text-gray-600">
              예산 사용률: {insight.data.budgetUsage.toFixed(1)}%
            </Text>
          )}
          {insight.data.changePercentage && (
            <Text className="text-xs text-gray-600">
              변화율: {insight.data.changePercentage > 0 ? '+' : ''}{insight.data.changePercentage.toFixed(1)}%
            </Text>
          )}
          {insight.data.savingsRate && (
            <Text className="text-xs text-gray-600">
              저축률: {insight.data.savingsRate.toFixed(1)}%
            </Text>
          )}
          {insight.data.percentage && (
            <Text className="text-xs text-gray-600">
              비율: {insight.data.percentage.toFixed(1)}%
            </Text>
          )}
          {insight.data.transactionCount && (
            <Text className="text-xs text-gray-600">
              거래 건수: {insight.data.transactionCount}건
            </Text>
          )}
        </View>
      )}

      {/* 액션 버튼 */}
      {insight.actionable && (
        <View className="flex-row">
          <TouchableOpacity
            className={`${style.actionBg} px-4 py-2 rounded-lg flex-1`}
            onPress={() => onActionPress?.(insight)}
          >
            <Text className="text-white text-sm font-medium text-center">
              {insight.type === 'warning' ? '해결책 보기' :
               insight.type === 'tip' ? '팁 더보기' :
               insight.type === 'prediction' ? '예측 상세' : '자세히 보기'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 우선순위 표시 (높은 우선순위만) */}
      {insight.priority >= 4 && (
        <View className="absolute top-2 right-2">
          <View className="bg-red-500 w-3 h-3 rounded-full" />
        </View>
      )}
    </TouchableOpacity>
  );
};