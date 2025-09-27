import React from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
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
import {
  AnalyticsIcon,
  ChatIcon,
  SettingsIcon,
} from '../../src/components/ui/Icon';

export default function TransactionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // 실제 구현에서는 ID를 사용해 API에서 데이터를 가져옴
  const transactionData = {
    id: id || '1',
    title: '스타벅스 아메리카노',
    amount: -4500,
    category: '카페',
    date: '2024년 9월 26일',
    time: '오후 2:30',
    location: '스타벅스 강남점',
    paymentMethod: '신용카드',
    memo: '오후 회의 전 커피 한 잔',
    tags: ['카페', '커피', '강남'],
  };

  const handleEdit = () => {
    Alert.alert('거래 수정', '거래 내역을 수정하시겠습니까?');
  };

  const handleDelete = () => {
    Alert.alert('거래 삭제', '이 거래 내역을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          router.back();
        },
      },
    ]);
  };

  const handleAnalyze = () => {
    Alert.alert('AI 분석', '이 거래에 대한 AI 분석을 시작합니다.');
  };

  return (
    <Screen safeArea={false} padding="md" scrollable={true}>
      {/* 거래 기본 정보 */}
      <SectionContainer>
        <Card className="mb-4">
          <View className="items-center py-6">
            <H1 className="mb-2">{transactionData.title}</H1>
            <BodyText
              className={`text-3xl font-bold ${
                transactionData.amount > 0
                  ? 'text-success'
                  : 'text-text-primary'
              }`}
            >
              {transactionData.amount > 0 ? '+' : ''}₩
              {Math.abs(transactionData.amount).toLocaleString()}
            </BodyText>
            <Caption className="mt-2 text-primary-600">
              {transactionData.category}
            </Caption>
          </View>
        </Card>
      </SectionContainer>

      {/* 상세 정보 */}
      <SectionContainer>
        <H2 className="mb-4">거래 상세</H2>
        <Card className="mb-4">
          <View className="space-y-4">
            <View className="flex-row justify-between">
              <Label className="text-gray-600">날짜</Label>
              <BodyText>{transactionData.date}</BodyText>
            </View>
            <View className="flex-row justify-between">
              <Label className="text-gray-600">시간</Label>
              <BodyText>{transactionData.time}</BodyText>
            </View>
            <View className="flex-row justify-between">
              <Label className="text-gray-600">장소</Label>
              <BodyText>{transactionData.location}</BodyText>
            </View>
            <View className="flex-row justify-between">
              <Label className="text-gray-600">결제 수단</Label>
              <BodyText>{transactionData.paymentMethod}</BodyText>
            </View>
            {transactionData.memo && (
              <View>
                <Label className="mb-2 text-gray-600">메모</Label>
                <BodyText variant="secondary">{transactionData.memo}</BodyText>
              </View>
            )}
          </View>
        </Card>
      </SectionContainer>

      {/* 태그 */}
      <SectionContainer>
        <H2 className="mb-4">태그</H2>
        <Card className="mb-4">
          <View className="flex-row flex-wrap">
            {transactionData.tags.map((tag, index) => (
              <View
                key={index}
                className="mb-2 mr-2 rounded-full bg-primary-100 px-3 py-1"
              >
                <Caption className="text-primary-700">#{tag}</Caption>
              </View>
            ))}
          </View>
        </Card>
      </SectionContainer>

      {/* AI 분석 */}
      <SectionContainer>
        <H2 className="mb-4">AI 분석</H2>
        <Card className="mb-4">
          <View className="space-y-3">
            <View className="flex-row items-start space-x-3">
              <View className="bg-info mt-1 h-2 w-2 rounded-full" />
              <View className="flex-1">
                <BodyText className="font-medium">패턴 분석</BodyText>
                <BodyText variant="secondary" className="text-sm">
                  평균적으로 오후 2-3시에 카페에서 지출하는 패턴을 보입니다.
                </BodyText>
              </View>
            </View>
            <View className="flex-row items-start space-x-3">
              <View className="mt-1 h-2 w-2 rounded-full bg-warning" />
              <View className="flex-1">
                <BodyText className="font-medium">절약 제안</BodyText>
                <BodyText variant="secondary" className="text-sm">
                  이번 주 카페 지출이 평소보다 20% 높습니다. 텀블러 사용으로
                  할인받아보세요.
                </BodyText>
              </View>
            </View>
          </View>
          <Button
            title="자세한 분석 보기"
            variant="outline"
            size="sm"
            className="mt-4"
            leftIcon={<AnalyticsIcon size="sm" color="primary" />}
            onPress={handleAnalyze}
          />
        </Card>
      </SectionContainer>

      {/* 액션 버튼들 */}
      <SectionContainer>
        <View className="space-y-3">
          <Button
            title="거래 수정"
            variant="primary"
            leftIcon={<SettingsIcon size="sm" color="white" />}
            onPress={handleEdit}
          />
          <Button
            title="AI와 상담하기"
            variant="outline"
            leftIcon={<ChatIcon size="sm" color="primary" />}
            onPress={() => router.push('/chat')}
          />
          <Button
            title="거래 삭제"
            variant="outline"
            onPress={handleDelete}
            className="border-error text-error"
          />
        </View>
      </SectionContainer>
    </Screen>
  );
}
