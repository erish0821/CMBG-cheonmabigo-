import React, { useState } from 'react';
import { View, Modal, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Transaction } from '../../types/transaction';
import { CATEGORIES } from '../../constants/categories';
import { H2, H3, BodyText, Caption } from '../ui/Typography';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { CategorySelector } from './CategorySelector';
import { PaymentMethodSelector } from './PaymentMethodSelector';

interface TransactionConfirmModalProps {
  visible: boolean;
  transaction: Partial<Transaction> | null;
  onConfirm: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
  onEdit?: () => void;
}

export const TransactionConfirmModal: React.FC<TransactionConfirmModalProps> = ({
  visible,
  transaction,
  onConfirm,
  onCancel,
  onEdit,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTransaction, setEditedTransaction] = useState<Partial<Transaction> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (transaction) {
      setEditedTransaction(transaction);
      setIsEditing(false);
    }
  }, [transaction]);

  if (!transaction || !editedTransaction) {
    return null;
  }

  const categoryInfo = CATEGORIES[transaction.category as keyof typeof CATEGORIES];

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true);

      const finalTransaction = {
        userId: editedTransaction.userId || '',
        amount: editedTransaction.amount || 0,
        description: editedTransaction.description || '',
        category: editedTransaction.category!,
        subcategory: editedTransaction.subcategory,
        paymentMethod: editedTransaction.paymentMethod!,
        location: editedTransaction.location,
        date: editedTransaction.date || new Date(),
        isIncome: editedTransaction.isIncome || false,
        tags: editedTransaction.tags || [],
        originalText: editedTransaction.originalText || '',
        aiParsed: editedTransaction.aiParsed || false,
        userModified: isEditing || false,
        confidence: editedTransaction.confidence || 0,
      };

      await onConfirm(finalTransaction);
    } catch (error) {
      console.error('거래 저장 실패:', error);
      Alert.alert('오류', '거래 저장에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    if (onEdit) {
      onEdit();
    }
  };

  const formatAmount = (amount: number) => {
    return `${amount >= 0 ? '+' : ''}₩${Math.abs(amount).toLocaleString()}`;
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onCancel}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View className="flex-1 bg-background">
          {/* Header */}
          <View className="px-6 py-4 bg-white border-b border-gray-200">
            <H2 className="text-center">
              {isEditing ? '거래 정보 수정' : '거래 정보 확인'}
            </H2>
            <Caption className="text-center text-gray-600 mt-1">
              {isEditing ? '정보를 수정하고 저장하세요' : 'AI가 분석한 결과를 확인하세요'}
            </Caption>
          </View>

          <ScrollView className="flex-1 p-6">
            {/* 거래 금액 */}
            <Card className="mb-4">
              <View className="items-center py-6">
                <View className="flex-row items-center mb-2">
                  <BodyText className="text-2xl mr-2">{categoryInfo?.icon || '💰'}</BodyText>
                  <H2 className={`text-3xl font-bold ${
                    editedTransaction.isIncome ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatAmount(editedTransaction.amount || 0)}
                  </H2>
                </View>
                <Caption className="text-gray-600">
                  {editedTransaction.isIncome ? '수입' : '지출'}
                </Caption>
              </View>
            </Card>

            {/* 거래 상세 정보 */}
            <Card className="mb-4">
              <H3 className="mb-4">거래 정보</H3>

              {isEditing ? (
                <View className="space-y-4">
                  <Input
                    label="거래 내용"
                    value={editedTransaction.description || ''}
                    onChangeText={(text) => setEditedTransaction(prev => ({ ...prev, description: text }))}
                    placeholder="예: 스타벅스 아메리카노"
                  />

                  <CategorySelector
                    selectedCategory={editedTransaction.category}
                    onSelect={(category) => setEditedTransaction(prev => ({ ...prev, category }))}
                  />

                  <PaymentMethodSelector
                    selectedMethod={editedTransaction.paymentMethod}
                    onSelect={(method) => setEditedTransaction(prev => ({ ...prev, paymentMethod: method }))}
                  />

                  <Input
                    label="위치 (선택사항)"
                    value={editedTransaction.location || ''}
                    onChangeText={(text) => setEditedTransaction(prev => ({ ...prev, location: text }))}
                    placeholder="예: 강남역 스타벅스"
                  />

                </View>
              ) : (
                <View className="space-y-3">
                  <View className="flex-row justify-between">
                    <BodyText className="text-gray-600">거래 내용</BodyText>
                    <BodyText className="font-semibold">{editedTransaction.description}</BodyText>
                  </View>

                  <View className="flex-row justify-between">
                    <BodyText className="text-gray-600">카테고리</BodyText>
                    <View className="flex-row items-center">
                      <BodyText className="mr-2">{categoryInfo?.icon}</BodyText>
                      <BodyText className="font-semibold">{categoryInfo?.name}</BodyText>
                    </View>
                  </View>

                  {editedTransaction.subcategory && (
                    <View className="flex-row justify-between">
                      <BodyText className="text-gray-600">세부 카테고리</BodyText>
                      <BodyText className="font-semibold">{editedTransaction.subcategory}</BodyText>
                    </View>
                  )}

                  <View className="flex-row justify-between">
                    <BodyText className="text-gray-600">결제 수단</BodyText>
                    <BodyText className="font-semibold">
                      {editedTransaction.paymentMethod === 'card' ? '카드' :
                       editedTransaction.paymentMethod === 'cash' ? '현금' :
                       editedTransaction.paymentMethod === 'transfer' ? '계좌이체' : '기타'}
                    </BodyText>
                  </View>

                  <View className="flex-row justify-between">
                    <BodyText className="text-gray-600">날짜</BodyText>
                    <BodyText className="font-semibold">{formatDate(editedTransaction.date || new Date())}</BodyText>
                  </View>

                  {editedTransaction.location && (
                    <View className="flex-row justify-between">
                      <BodyText className="text-gray-600">위치</BodyText>
                      <BodyText className="font-semibold">📍 {editedTransaction.location}</BodyText>
                    </View>
                  )}

                </View>
              )}
            </Card>

            {/* AI 분석 정보 */}
            {editedTransaction.aiParsed && editedTransaction.confidence && (
              <Card className="mb-4">
                <H3 className="mb-3">AI 분석 정보</H3>
                <View className="space-y-2">
                  <View className="flex-row justify-between">
                    <BodyText className="text-gray-600">신뢰도</BodyText>
                    <BodyText className="font-semibold">
                      {Math.round(editedTransaction.confidence * 100)}%
                    </BodyText>
                  </View>
                  {editedTransaction.originalText && (
                    <View>
                      <BodyText className="text-gray-600 mb-1">원본 텍스트</BodyText>
                      <BodyText className="italic text-gray-700">
                        "{editedTransaction.originalText}"
                      </BodyText>
                    </View>
                  )}
                </View>
              </Card>
            )}
          </ScrollView>

          {/* Footer Buttons */}
          <View className="p-6 bg-white border-t border-gray-200">
            {isEditing ? (
              <View className="space-y-3">
                <Button
                  title={isSubmitting ? "저장 중..." : "저장하기"}
                  variant="primary"
                  onPress={handleConfirm}
                  disabled={isSubmitting}
                />
                <Button
                  title="취소"
                  variant="outline"
                  onPress={() => setIsEditing(false)}
                />
              </View>
            ) : (
              <View className="space-y-3">
                <Button
                  title={isSubmitting ? "저장 중..." : "확인 및 저장"}
                  variant="primary"
                  onPress={handleConfirm}
                  disabled={isSubmitting}
                />
                <View className="flex-row space-x-3">
                  <View className="flex-1">
                    <Button
                      title="수정하기"
                      variant="outline"
                      onPress={handleEdit}
                    />
                  </View>
                  <View className="flex-1">
                    <Button
                      title="취소"
                      variant="outline"
                      onPress={onCancel}
                    />
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};