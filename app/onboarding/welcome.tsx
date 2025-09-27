import React from 'react';
import { View, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
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
import {
  HomeIcon,
  ChatIcon,
  AnalyticsIcon,
} from '../../src/components/ui/Icon';

export default function WelcomeScreen() {
  const router = useRouter();

  const features = [
    {
      icon: <ChatIcon size="lg" color="primary" />,
      title: 'AI 대화형 가계부',
      description: '말로 간편하게 지출을 기록하고 똑똑한 조언을 받아보세요',
    },
    {
      icon: <AnalyticsIcon size="lg" color="secondary" />,
      title: '지능형 분석',
      description: '소비 패턴을 분석하고 맞춤형 절약 방법을 제안합니다',
    },
    {
      icon: <HomeIcon size="lg" color="success" />,
      title: '목표 달성 도우미',
      description: '저축 목표를 설정하고 달성까지 체계적으로 관리하세요',
    },
  ];

  return (
    <Screen safeArea={true} padding="lg" scrollable={true} background="white">
      {/* 로고 및 환영 메시지 */}
      <SectionContainer>
        <View className="items-center py-8">
          {/* 로고 자리 (실제 구현시 이미지 사용) */}
          <View className="mb-6 h-24 w-24 items-center justify-center rounded-full bg-primary-100">
            <BodyText className="text-4xl">🏮</BodyText>
          </View>

          <H1 className="mb-4 text-center">천마비고에 오신 것을 환영합니다!</H1>
          <BodyText variant="secondary" className="text-center text-lg">
            AI와 함께하는 똑똑한 가계부 관리
          </BodyText>
        </View>
      </SectionContainer>

      {/* 주요 기능 소개 */}
      <SectionContainer>
        <H2 className="mb-6 text-center">주요 기능</H2>
        {features.map((feature, index) => (
          <Card key={index} className="mb-4">
            <View className="flex-row items-start space-x-4">
              <View className="mt-1">{feature.icon}</View>
              <View className="flex-1">
                <H3 className="mb-2">{feature.title}</H3>
                <BodyText variant="secondary">{feature.description}</BodyText>
              </View>
            </View>
          </Card>
        ))}
      </SectionContainer>

      {/* 혜택 설명 */}
      <SectionContainer>
        <Card className="bg-primary-50">
          <View className="py-6">
            <H2 className="mb-4 text-center text-primary-800">
              왜 천마비고를 선택해야 할까요?
            </H2>
            <View className="space-y-3">
              <View className="flex-row items-start space-x-3">
                <View className="mt-2 h-2 w-2 rounded-full bg-primary-600" />
                <BodyText className="flex-1 text-primary-700">
                  복잡한 카테고리 설정 없이 자연스러운 대화로 기록
                </BodyText>
              </View>
              <View className="flex-row items-start space-x-3">
                <View className="mt-2 h-2 w-2 rounded-full bg-primary-600" />
                <BodyText className="flex-1 text-primary-700">
                  개인 맞춤형 AI 분석으로 절약 포인트 발견
                </BodyText>
              </View>
              <View className="flex-row items-start space-x-3">
                <View className="mt-2 h-2 w-2 rounded-full bg-primary-600" />
                <BodyText className="flex-1 text-primary-700">
                  게임처럼 재미있는 목표 달성 시스템
                </BodyText>
              </View>
              <View className="flex-row items-start space-x-3">
                <View className="mt-2 h-2 w-2 rounded-full bg-primary-600" />
                <BodyText className="flex-1 text-primary-700">
                  한국어에 최적화된 AI로 정확한 이해와 조언
                </BodyText>
              </View>
            </View>
          </View>
        </Card>
      </SectionContainer>

      {/* 사용자 후기 */}
      <SectionContainer>
        <H2 className="mb-4 text-center">사용자 후기</H2>
        <Card className="mb-3">
          <View>
            <BodyText className="mb-2 italic">
              "복잡한 가계부 앱들과 달리 정말 쉬워요. 그냥 말하면 알아서
              기록되고 조언까지 해줘서 놀랐어요!"
            </BodyText>
            <Caption className="text-right text-primary-600">
              - 김○○님, 직장인
            </Caption>
          </View>
        </Card>

        <Card>
          <View>
            <BodyText className="mb-2 italic">
              "AI가 제 소비 패턴을 분석해서 절약 방법을 알려주니까 한 달에
              30만원을 아낄 수 있었어요."
            </BodyText>
            <Caption className="text-right text-primary-600">
              - 이○○님, 대학생
            </Caption>
          </View>
        </Card>
      </SectionContainer>

      {/* 시작 버튼 */}
      <SectionContainer>
        <View className="space-y-4">
          <Button
            title="계정 만들기"
            variant="primary"
            size="lg"
            onPress={() => router.push('/auth/register')}
          />
          <Button
            title="이미 계정이 있어요"
            variant="outline"
            size="lg"
            onPress={() => router.push('/auth/login')}
          />
        </View>
      </SectionContainer>

      {/* 개인정보 및 약관 */}
      <View className="pb-6 pt-4">
        <BodyText className="text-center text-xs text-gray-500">
          시작하기를 누르면 서비스 이용약관 및 개인정보처리방침에 동의하는
          것으로 간주됩니다.
        </BodyText>
      </View>
    </Screen>
  );
}
