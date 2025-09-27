/**
 * 거래 확인 컴포넌트
 * AI 분류 결과 확인 및 수정 인터페이스
 */

import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { ParsedTransaction, CategoryType } from '../../types/transaction';
import { CATEGORIES, CATEGORY_LIST } from '../../constants/categories';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { BodyText, Caption, H3, Label } from '../ui/Typography';

export interface TransactionConfirmProps {
  originalText: string;
  parsedData: ParsedTransaction;
  onConfirm: (confirmedData: ParsedTransaction) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function TransactionConfirm({
  originalText,
  parsedData,
  onConfirm,
  onCancel,
  isLoading = false,
}: TransactionConfirmProps) {
  const [editedData, setEditedData] = useState<ParsedTransaction>(parsedData);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const categoryInfo = CATEGORIES[editedData.category];
  const isIncome = editedData.isIncome;

  const handleCategoryChange = (category: CategoryType) => {
    setEditedData(prev => ({
      ...prev,
      category,
      subcategory: undefined, // 카테고리 변경 시 서브카테고리 초기화
    }));
    setShowCategoryPicker(false);
  };

  const handleSubcategoryChange = (subcategory: string) => {
    setEditedData(prev => ({
      ...prev,
      subcategory,
    }));
  };

  const handleAmountChange = () => {
    Alert.prompt(
      '금액 수정',
      '올바른 금액을 입력해주세요',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '확인',
          onPress: (value?: string) => {
            const amount = parseInt(value?.replace(/[^0-9]/g, '') || '0');
            if (amount > 0) {
              setEditedData(prev => ({ ...prev, amount }));
            }
          },
        },
      ],
      'plain-text',
      editedData.amount.toString()
    );
  };

  const handleDescriptionChange = () => {
    Alert.prompt(
      '설명 수정',
      '거래 설명을 입력해주세요',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '확인',
          onPress: (value?: string) => {
            if (value && value.trim()) {
              setEditedData(prev => ({ ...prev, description: value.trim() }));
            }
          },
        },
      ],
      'plain-text',
      editedData.description
    );
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceText = (confidence: number): string => {
    if (confidence >= 0.8) return '높음';
    if (confidence >= 0.6) return '보통';
    return '낮음';
  };

  return (
    <View className="flex-1 bg-white">
      {/* 원본 입력 */}
      <Card className="m-4 p-4">
        <H3 className="mb-2">입력하신 내용</H3>
        <BodyText className="text-gray-700">"{originalText}"</BodyText>
      </Card>

      {/* AI 분석 결과 */}
      <Card className="mx-4 mb-4 p-4">
        <View className="mb-3 flex-row items-center justify-between">
          <H3>AI 분석 결과</H3>
          <View className="flex-row items-center">
            <Text className="mr-1">🤖</Text>
            <Caption className={getConfidenceColor(editedData.confidence)}>
              신뢰도 {getConfidenceText(editedData.confidence)}
            </Caption>
          </View>
        </View>

        {/* 금액 */}
        <View className="mb-4 flex-row items-center justify-between">
          <Label className="text-gray-600">금액</Label>
          <View className="flex-row items-center">
            <BodyText className={`text-lg font-bold ${isIncome ? 'text-green-600' : 'text-gray-900'}`}>
              {isIncome ? '+' : '-'}₩{Math.abs(editedData.amount).toLocaleString()}
            </BodyText>
            <Button
              title="수정"
              variant="outline"
              size="sm"
              className="ml-2"
              onPress={handleAmountChange}
            />
          </View>
        </View>

        {/* 설명 */}
        <View className="mb-4 flex-row items-center justify-between">
          <Label className="text-gray-600">설명</Label>
          <View className="flex-1 flex-row items-center justify-end">
            <BodyText className="mr-2 flex-1 text-right" numberOfLines={1}>
              {editedData.description}
            </BodyText>
            <Button
              title="수정"
              variant="outline"
              size="sm"
              onPress={handleDescriptionChange}
            />
          </View>
        </View>

        {/* 카테고리 */}
        <View className="mb-4">
          <Label className="mb-2 text-gray-600">카테고리</Label>
          <View className="flex-row items-center justify-between">
            <View className="flex-1 flex-row items-center">
              <Text className="mr-2 text-xl">{categoryInfo.icon}</Text>
              <BodyText className="font-medium">{categoryInfo.name}</BodyText>
              {editedData.subcategory && (
                <Caption className="ml-2 text-gray-500">
                  {'>'} {editedData.subcategory}
                </Caption>
              )}
            </View>
            <Button
              title="변경"
              variant="outline"
              size="sm"
              onPress={() => setShowCategoryPicker(true)}
            />
          </View>
        </View>

        {/* 서브카테고리 */}
        {categoryInfo.subcategories.length > 0 && (
          <View className="mb-4">
            <Label className="mb-2 text-gray-600">세부 카테고리</Label>
            <View className="flex-row flex-wrap">
              {categoryInfo.subcategories.map((subcategory, index) => (
                <Button
                  key={index}
                  title={subcategory}
                  variant={editedData.subcategory === subcategory ? 'primary' : 'outline'}
                  size="sm"
                  className="mb-2 mr-2"
                  onPress={() => handleSubcategoryChange(subcategory)}
                />
              ))}
            </View>
          </View>
        )}

        {/* 장소 */}
        {editedData.location && (
          <View className="mb-4 flex-row items-center justify-between">
            <Label className="text-gray-600">장소</Label>
            <BodyText>📍 {editedData.location}</BodyText>
          </View>
        )}

        {/* 결제수단 */}
        <View className="flex-row items-center justify-between">
          <Label className="text-gray-600">결제수단</Label>
          <BodyText>
            {editedData.paymentMethod === 'cash' && '현금'}
            {editedData.paymentMethod === 'card' && '카드'}
            {editedData.paymentMethod === 'transfer' && '계좌이체'}
            {editedData.paymentMethod === 'mobile_pay' && '모바일결제'}
          </BodyText>
        </View>
      </Card>

      {/* 카테고리 선택기 */}
      {showCategoryPicker && (
        <Card className="mx-4 mb-4 p-4">
          <H3 className="mb-3">카테고리 선택</H3>
          <View className="flex-row flex-wrap">
            {CATEGORY_LIST.map((category) => {
              const info = CATEGORIES[category];
              const isSelected = editedData.category === category;

              return (
                <Button
                  key={category}
                  title={`${info.icon} ${info.name}`}
                  variant={isSelected ? 'primary' : 'outline'}
                  size="sm"
                  className="mb-2 mr-2"
                  onPress={() => handleCategoryChange(category)}
                />
              );
            })}
          </View>
          <Button
            title="취소"
            variant="outline"
            className="mt-2"
            onPress={() => setShowCategoryPicker(false)}
          />
        </Card>
      )}

      {/* 액션 버튼 */}
      <View className="flex-row space-x-3 p-4">
        <Button
          title="취소"
          variant="outline"
          className="flex-1"
          onPress={onCancel}
          disabled={isLoading}
        />
        <Button
          title={isLoading ? '저장 중...' : '확인'}
          variant="primary"
          className="flex-1"
          onPress={() => onConfirm(editedData)}
          disabled={isLoading}
        />
      </View>
    </View>
  );
}