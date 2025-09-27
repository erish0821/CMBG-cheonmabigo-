import React from 'react';
import { View, ScrollView } from 'react-native';
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
} from '../../src/components/ui/Typography';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { AddIcon, AnalyticsIcon, HomeIcon } from '../../src/components/ui/Icon';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <Screen
      title="안녕하세요! 👋"
      subtitle="오늘도 현명한 소비를 시작해보세요"
      safeArea={true}
      scrollable={true}
    >
      {/* 이번 달 요약 */}
      <SectionContainer>
        <H2 className="mb-4">이번 달 요약</H2>
        <Card className="mb-4">
          <View className="mb-4">
            <View className="mb-2 flex-row items-center justify-between">
              <H3>총 지출</H3>
              <BodyText className="text-2xl font-bold text-primary-600">
                ₩1,245,000
              </BodyText>
            </View>
            <Caption className="text-secondary-600">예산의 75% 사용 중</Caption>
          </View>
          <ProgressBar progress={75} className="mb-2" />
          <BodyText variant="secondary" className="text-sm">
            예산 한도까지 ₩415,000 남았습니다
          </BodyText>
        </Card>
      </SectionContainer>

      {/* 빠른 작업 */}
      <SectionContainer>
        <H2 className="mb-4">빠른 작업</H2>
        <View className="mb-4 flex-row space-x-3">
          <Card className="flex-1">
            <Button
              title="지출 기록"
              variant="primary"
              leftIcon={<AddIcon size="sm" color="white" />}
              onPress={() => router.push('/chat')}
            />
          </Card>
          <Card className="flex-1">
            <Button
              title="분석 보기"
              variant="outline"
              leftIcon={<AnalyticsIcon size="sm" color="primary" />}
              onPress={() => router.push('/analytics')}
            />
          </Card>
        </View>
      </SectionContainer>

      {/* 최근 거래 */}
      <SectionContainer>
        <View className="mb-4 flex-row items-center justify-between">
          <H2>최근 거래</H2>
          <Button
            title="전체 보기"
            variant="outline"
            size="sm"
            onPress={() => router.push('/analytics')}
          />
        </View>

        {/* 거래 내역 */}
        {[
          {
            id: '1',
            title: '스타벅스 아메리카노',
            amount: -4500,
            category: '카페',
            date: '오늘',
          },
          {
            id: '2',
            title: '점심 - 김치찌개',
            amount: -8000,
            category: '식비',
            date: '오늘',
          },
          {
            id: '3',
            title: '월급',
            amount: 3200000,
            category: '수입',
            date: '어제',
          },
        ].map(transaction => (
          <Card
            key={transaction.id}
            className="mb-3"
            onPress={() => router.push(`/transaction/${transaction.id}`)}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <H3 className="mb-1">{transaction.title}</H3>
                <View className="flex-row items-center space-x-2">
                  <Caption className="text-primary-600">
                    {transaction.category}
                  </Caption>
                  <Caption>•</Caption>
                  <Caption>{transaction.date}</Caption>
                </View>
              </View>
              <BodyText
                className={`text-lg font-semibold ${
                  transaction.amount > 0 ? 'text-success' : 'text-text-primary'
                }`}
              >
                {transaction.amount > 0 ? '+' : ''}₩
                {Math.abs(transaction.amount).toLocaleString()}
              </BodyText>
            </View>
          </Card>
        ))}
      </SectionContainer>

      {/* 저축 목표 */}
      <SectionContainer>
        <H2 className="mb-4">저축 목표</H2>
        <Card className="mb-4">
          <View className="mb-4">
            <View className="mb-2 flex-row items-center justify-between">
              <H3>여행 자금</H3>
              <Button
                title="목표 수정"
                variant="outline"
                size="sm"
                onPress={() => router.push('/goal/create')}
              />
            </View>
            <BodyText variant="secondary" className="mb-2">
              목표 금액: ₩2,000,000
            </BodyText>
          </View>
          <ProgressBar
            progress={65}
            color="success"
            className="mb-2"
            showGradient={true}
          />
          <View className="flex-row items-center justify-between">
            <BodyText variant="secondary" className="text-sm">
              ₩1,300,000 / ₩2,000,000
            </BodyText>
            <BodyText className="text-sm font-semibold text-success">
              65%
            </BodyText>
          </View>
        </Card>
      </SectionContainer>
    </Screen>
  );
}
