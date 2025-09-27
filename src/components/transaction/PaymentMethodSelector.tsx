import React, { useState } from 'react';
import { View, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { PaymentMethod } from '../../types/transaction';
import { H3, BodyText, Caption } from '../ui/Typography';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface PaymentMethodSelectorProps {
  selectedMethod?: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
  label?: string;
}

const PAYMENT_METHODS = {
  card: {
    name: '카드',
    icon: '💳',
    description: '신용카드, 체크카드',
  },
  cash: {
    name: '현금',
    icon: '💵',
    description: '현금 결제',
  },
  transfer: {
    name: '계좌이체',
    icon: '🏦',
    description: '온라인 이체, 무통장입금',
  },
  mobile: {
    name: '모바일결제',
    icon: '📱',
    description: '삼성페이, 애플페이, 페이코 등',
  },
  other: {
    name: '기타',
    icon: '🔄',
    description: '기타 결제 수단',
  },
} as const;

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onSelect,
  label = "결제 수단",
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const selectedMethodInfo = selectedMethod ? PAYMENT_METHODS[selectedMethod] : null;

  const handleSelect = (method: PaymentMethod) => {
    onSelect(method);
    setIsModalVisible(false);
  };

  const paymentMethodEntries = Object.entries(PAYMENT_METHODS) as [PaymentMethod, typeof PAYMENT_METHODS[PaymentMethod]][];

  return (
    <>
      <View>
        <Caption className="text-gray-600 mb-2">{label}</Caption>
        <TouchableOpacity
          onPress={() => setIsModalVisible(true)}
          className="border border-gray-300 rounded-lg p-4 bg-white"
        >
          {selectedMethodInfo ? (
            <View className="flex-row items-center">
              <BodyText className="text-2xl mr-3">{selectedMethodInfo.icon}</BodyText>
              <View className="flex-1">
                <BodyText className="font-semibold">{selectedMethodInfo.name}</BodyText>
                <Caption className="text-gray-600">{selectedMethodInfo.description}</Caption>
              </View>
            </View>
          ) : (
            <BodyText className="text-gray-500">결제 수단을 선택하세요</BodyText>
          )}
        </TouchableOpacity>
      </View>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View className="flex-1 bg-background">
          {/* Header */}
          <View className="px-6 py-4 bg-white border-b border-gray-200">
            <H3 className="text-center">결제 수단 선택</H3>
            <Caption className="text-center text-gray-600 mt-1">
              사용한 결제 수단을 선택하세요
            </Caption>
          </View>

          <ScrollView className="flex-1 p-6">
            <View className="space-y-3">
              {paymentMethodEntries.map(([methodKey, methodData]) => (
                <TouchableOpacity
                  key={methodKey}
                  onPress={() => handleSelect(methodKey)}
                >
                  <Card className={`${
                    selectedMethod === methodKey
                      ? 'border-primary-500 bg-primary-50'
                      : ''
                  }`}>
                    <View className="flex-row items-center">
                      <View className="w-12 h-12 rounded-full bg-gray-100 mr-4 items-center justify-center">
                        <BodyText className="text-2xl">{methodData.icon}</BodyText>
                      </View>
                      <View className="flex-1">
                        <BodyText className="font-semibold text-lg">
                          {methodData.name}
                        </BodyText>
                        <Caption className="text-gray-600 mt-1">
                          {methodData.description}
                        </Caption>
                      </View>
                      {selectedMethod === methodKey && (
                        <View className="w-6 h-6 rounded-full bg-primary-500 items-center justify-center">
                          <BodyText className="text-white text-sm">✓</BodyText>
                        </View>
                      )}
                    </View>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Footer */}
          <View className="p-6 bg-white border-t border-gray-200">
            <Button
              title="취소"
              variant="outline"
              onPress={() => setIsModalVisible(false)}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};