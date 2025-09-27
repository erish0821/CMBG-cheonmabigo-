/**
 * 거래 카드 컴포넌트
 * AI 분류 결과 표시 및 확인/수정 기능
 */

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Transaction, CategoryType } from '../../types/transaction';
import { CATEGORIES } from '../../constants/categories';
import { Card } from '../ui/Card';
import { BodyText, Caption, Label } from '../ui/Typography';

export interface TransactionCardProps {
  transaction: Transaction;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
  compact?: boolean;
}

export function TransactionCard({
  transaction,
  onPress,
  onEdit,
  onDelete,
  showActions = true,
  compact = false,
}: TransactionCardProps) {
  const categoryInfo = CATEGORIES[transaction.category];
  const isIncome = transaction.isIncome;
  const amountColor = isIncome ? 'text-green-600' : 'text-gray-900';
  const amountPrefix = isIncome ? '+' : '-';

  const formatAmount = (amount: number): string => {
    return `${amountPrefix}₩${Math.abs(amount).toLocaleString()}`;
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isYesterday) {
      return '어제';
    }

    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getConfidenceText = (confidence: number): string => {
    if (confidence >= 0.8) return '높음';
    if (confidence >= 0.6) return '보통';
    return '낮음';
  };

  if (compact) {
    return (
      <Pressable onPress={onPress}>
        <Card className="mb-2 p-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 flex-row items-center">
              <Text className="mr-3 text-xl">{categoryInfo.icon}</Text>
              <View className="flex-1">
                <BodyText className="font-medium" numberOfLines={1}>
                  {transaction.description}
                </BodyText>
                {transaction.location && (
                  <Caption className="text-gray-500" numberOfLines={1}>
                    {transaction.location}
                  </Caption>
                )}
              </View>
            </View>
            <View className="items-end">
              <BodyText className={`font-bold ${amountColor}`}>
                {formatAmount(transaction.amount)}
              </BodyText>
              <Caption className="text-gray-500">
                {formatDate(transaction.date)}
              </Caption>
            </View>
          </View>
        </Card>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress}>
      <Card className="mb-4 p-4">
        {/* 헤더 */}
        <View className="mb-3 flex-row items-start justify-between">
          <View className="flex-1 flex-row items-start">
            <View className="mr-3 items-center">
              <Text className="text-2xl">{categoryInfo.icon}</Text>
              <Caption className="mt-1 text-center text-xs" style={{ color: categoryInfo.color }}>
                {categoryInfo.name}
              </Caption>
            </View>
            <View className="flex-1">
              <BodyText className="mb-1 text-lg font-semibold">
                {transaction.description}
              </BodyText>
              {transaction.location && (
                <Caption className="mb-1 text-gray-600">
                  📍 {transaction.location}
                </Caption>
              )}
              {transaction.subcategory && (
                <Caption className="text-gray-500">
                  {transaction.subcategory}
                </Caption>
              )}
            </View>
          </View>
          <View className="items-end">
            <BodyText className={`text-xl font-bold ${amountColor}`}>
              {formatAmount(transaction.amount)}
            </BodyText>
            <Caption className="text-gray-500">
              {formatDate(transaction.date)}
            </Caption>
          </View>
        </View>

        {/* AI 분류 정보 */}
        {transaction.aiParsed && (
          <View className="mb-3 flex-row items-center justify-between">
            <View className="flex-1 flex-row items-center">
              <Text className="mr-2">🤖</Text>
              <Caption className="text-gray-600">AI 분류</Caption>
              {transaction.userModified && (
                <View className="ml-2 rounded-full bg-blue-100 px-2 py-1">
                  <Caption className="text-xs text-blue-800">수정됨</Caption>
                </View>
              )}
            </View>
            <View
              className={`rounded-full px-2 py-1 ${getConfidenceColor(transaction.confidence)}`}
            >
              <Caption className="text-xs font-medium">
                신뢰도 {getConfidenceText(transaction.confidence)}
              </Caption>
            </View>
          </View>
        )}

        {/* 태그 */}
        {transaction.tags.length > 0 && (
          <View className="mb-3 flex-row flex-wrap">
            {transaction.tags.map((tag, index) => (
              <View
                key={index}
                className="mb-1 mr-2 rounded-full bg-gray-100 px-2 py-1"
              >
                <Caption className="text-gray-700">#{tag}</Caption>
              </View>
            ))}
          </View>
        )}

        {/* 결제 정보 */}
        <View className="mb-3 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Caption className="text-gray-500">결제수단:</Caption>
            <Caption className="ml-1 font-medium">
              {transaction.paymentMethod === 'cash' && '현금'}
              {transaction.paymentMethod === 'card' && '카드'}
              {transaction.paymentMethod === 'transfer' && '계좌이체'}
              {transaction.paymentMethod === 'mobile_pay' && '모바일결제'}
            </Caption>
          </View>
          <Caption className="text-gray-500">
            {transaction.createdAt.toLocaleDateString('ko-KR')}
          </Caption>
        </View>

        {/* 액션 버튼 */}
        {showActions && (
          <View className="flex-row justify-end space-x-2 border-t border-gray-100 pt-3">
            {onEdit && (
              <Pressable
                onPress={onEdit}
                className="rounded-lg bg-gray-100 px-3 py-2"
              >
                <Caption className="font-medium text-gray-700">수정</Caption>
              </Pressable>
            )}
            {onDelete && (
              <Pressable
                onPress={onDelete}
                className="rounded-lg bg-red-100 px-3 py-2"
              >
                <Caption className="font-medium text-red-700">삭제</Caption>
              </Pressable>
            )}
          </View>
        )}
      </Card>
    </Pressable>
  );
}