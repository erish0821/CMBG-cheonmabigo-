import React from 'react';
import { View, ScrollView, Linking } from 'react-native';
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
  Label,
} from '../../src/components/ui/Typography';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';

export default function AboutScreen() {
  const router = useRouter();

  const appVersion = '1.0.0';
  const buildNumber = '2024030401';
  const releaseDate = '2024년 3월 4일';

  const openPrivacyPolicy = () => {
    Linking.openURL('https://cheonmabigo.com/privacy-policy');
  };

  const openTermsOfService = () => {
    Linking.openURL('https://cheonmabigo.com/terms-of-service');
  };

  const openWebsite = () => {
    Linking.openURL('https://cheonmabigo.com');
  };

  const openGithub = () => {
    Linking.openURL('https://github.com/cheonmabigo/app');
  };

  const teamMembers = [
    { name: '김개발', role: 'Lead Developer', emoji: '👨‍💻' },
    { name: '이디자인', role: 'UI/UX Designer', emoji: '🎨' },
    { name: '박AI', role: 'AI Engineer', emoji: '🤖' },
    { name: '최기획', role: 'Product Manager', emoji: '📊' },
  ];

  const technologies = [
    { name: 'React Native', description: '크로스 플랫폼 모바일 개발' },
    { name: 'LGAI EXAONE 3.5', description: '한국어 특화 AI 모델' },
    { name: 'Node.js', description: '백엔드 서버' },
    { name: 'PostgreSQL', description: '데이터베이스' },
    { name: 'TypeScript', description: '타입 안전성' },
  ];

  const updates = [
    {
      version: '1.0.0',
      date: '2024.03.04',
      features: [
        '🎉 천마비고 첫 출시!',
        '🤖 AI 음성 인식으로 자동 가계부 기록',
        '💰 개인 맞춤형 예산 관리',
        '📊 지출 패턴 분석 및 조언',
        '🎯 저축 목표 설정 및 추적',
      ]
    }
  ];

  const openSourceLicenses = [
    { name: 'React Native', license: 'MIT License', url: 'https://github.com/facebook/react-native' },
    { name: 'Expo', license: 'MIT License', url: 'https://github.com/expo/expo' },
    { name: 'Zustand', license: 'MIT License', url: 'https://github.com/pmndrs/zustand' },
    { name: 'NativeWind', license: 'MIT License', url: 'https://github.com/marklawlor/nativewind' },
  ];

  return (
    <Screen
      title="앱 정보"
      subtitle="천마비고 버전 정보와 개발진을 만나보세요"
      safeArea={true}
      scrollable={true}
    >
      {/* 앱 기본 정보 */}
      <SectionContainer>
        <Card className="mb-4">
          <View className="items-center py-6">
            <View className="w-20 h-20 bg-primary-100 rounded-2xl items-center justify-center mb-4">
              <BodyText className="text-3xl">📱</BodyText>
            </View>
            <H1 className="mb-2 text-primary-600">천마비고</H1>
            <BodyText className="text-gray-600 text-center mb-4">
              AI와 대화하는 똑똑한 가계부
            </BodyText>
            <View className="flex-row items-center space-x-4">
              <View className="items-center">
                <BodyText className="font-bold text-lg">{appVersion}</BodyText>
                <Caption className="text-gray-500">버전</Caption>
              </View>
              <View className="w-px h-8 bg-gray-300" />
              <View className="items-center">
                <BodyText className="font-bold text-lg">{buildNumber}</BodyText>
                <Caption className="text-gray-500">빌드</Caption>
              </View>
            </View>
          </View>
        </Card>

        <Card className="bg-primary-50">
          <H3 className="text-primary-800 mb-2">천마비고란?</H3>
          <BodyText className="text-primary-700 text-sm leading-6">
            천마비고(天魔祕告)는 "하늘의 마법사가 알려주는 비밀"이라는 뜻으로,
            AI가 마치 마법처럼 당신의 소비 패턴을 분석하고 더 나은 재정 관리를
            위한 조언을 제공한다는 의미를 담고 있습니다.
          </BodyText>
        </Card>
      </SectionContainer>

      {/* 개발팀 소개 */}
      <SectionContainer>
        <H2 className="mb-4">개발팀</H2>

        <View className="grid grid-cols-2 gap-3 mb-4">
          {teamMembers.map((member, index) => (
            <Card key={index}>
              <View className="items-center py-4">
                <BodyText className="text-2xl mb-2">{member.emoji}</BodyText>
                <H3 className="text-center mb-1">{member.name}</H3>
                <BodyText className="text-sm text-gray-600 text-center">
                  {member.role}
                </BodyText>
              </View>
            </Card>
          ))}
        </View>

        <Card className="bg-success-50">
          <BodyText className="text-success-700 text-sm text-center">
            💚 사용자의 소중한 피드백으로 함께 성장하는 팀입니다
          </BodyText>
        </Card>
      </SectionContainer>

      {/* 기술 스택 */}
      <SectionContainer>
        <H2 className="mb-4">기술 스택</H2>

        <Card className="mb-4">
          {technologies.map((tech, index) => (
            <View
              key={index}
              className={`flex-row justify-between items-center py-3 ${
                index < technologies.length - 1 ? 'border-b border-gray-200' : ''
              }`}
            >
              <View className="flex-1">
                <H3 className="mb-1">{tech.name}</H3>
                <BodyText className="text-sm text-gray-600">
                  {tech.description}
                </BodyText>
              </View>
              <BodyText className="text-primary-600">✓</BodyText>
            </View>
          ))}
        </Card>
      </SectionContainer>

      {/* 업데이트 히스토리 */}
      <SectionContainer>
        <H2 className="mb-4">업데이트 히스토리</H2>

        {updates.map((update, index) => (
          <Card key={index} className="mb-4">
            <View className="flex-row items-center justify-between mb-3">
              <H3>버전 {update.version}</H3>
              <BodyText className="text-sm text-gray-600">{update.date}</BodyText>
            </View>
            <View className="space-y-2">
              {update.features.map((feature, featureIndex) => (
                <BodyText key={featureIndex} className="text-sm">
                  {feature}
                </BodyText>
              ))}
            </View>
          </Card>
        ))}
      </SectionContainer>

      {/* 법적 정보 */}
      <SectionContainer>
        <H2 className="mb-4">법적 정보</H2>

        <View className="space-y-3 mb-4">
          <Card onPress={openPrivacyPolicy}>
            <View className="flex-row items-center justify-between py-2">
              <BodyText>개인정보처리방침</BodyText>
              <BodyText className="text-gray-400">›</BodyText>
            </View>
          </Card>

          <Card onPress={openTermsOfService}>
            <View className="flex-row items-center justify-between py-2">
              <BodyText>서비스 이용약관</BodyText>
              <BodyText className="text-gray-400">›</BodyText>
            </View>
          </Card>
        </View>

        <Card className="bg-gray-50">
          <H3 className="mb-2 text-gray-800">오픈소스 라이선스</H3>
          <BodyText className="text-gray-600 text-sm mb-3">
            천마비고는 다음 오픈소스 라이브러리를 사용합니다:
          </BodyText>
          {openSourceLicenses.map((oss, index) => (
            <View key={index} className="flex-row justify-between py-1">
              <BodyText className="text-sm">{oss.name}</BodyText>
              <BodyText className="text-sm text-gray-500">{oss.license}</BodyText>
            </View>
          ))}
        </Card>
      </SectionContainer>

      {/* 연락처 및 링크 */}
      <SectionContainer>
        <H2 className="mb-4">연락처 및 링크</H2>

        <View className="space-y-3">
          <Card onPress={openWebsite}>
            <View className="flex-row items-center justify-between py-2">
              <View className="flex-row items-center">
                <BodyText className="mr-3">🌐</BodyText>
                <BodyText>공식 웹사이트</BodyText>
              </View>
              <BodyText className="text-gray-400">›</BodyText>
            </View>
          </Card>

          <Card onPress={openGithub}>
            <View className="flex-row items-center justify-between py-2">
              <View className="flex-row items-center">
                <BodyText className="mr-3">💻</BodyText>
                <BodyText>GitHub 저장소</BodyText>
              </View>
              <BodyText className="text-gray-400">›</BodyText>
            </View>
          </Card>

          <Card onPress={() => router.push('/settings/contact')}>
            <View className="flex-row items-center justify-between py-2">
              <View className="flex-row items-center">
                <BodyText className="mr-3">📧</BodyText>
                <BodyText>개발팀 문의</BodyText>
              </View>
              <BodyText className="text-gray-400">›</BodyText>
            </View>
          </Card>
        </View>
      </SectionContainer>

      {/* 저작권 */}
      <SectionContainer>
        <Card className="bg-primary-50">
          <View className="items-center py-4">
            <BodyText className="text-primary-600 text-2xl mb-2">💜</BodyText>
            <BodyText className="text-primary-800 text-center font-medium mb-2">
              © 2024 천마비고 팀
            </BodyText>
            <BodyText className="text-primary-700 text-center text-sm">
              Made with ❤️ in Korea
            </BodyText>
            <BodyText className="text-primary-600 text-center text-sm mt-2">
              더 나은 가계부 경험을 위해 끊임없이 노력하겠습니다
            </BodyText>
          </View>
        </Card>
      </SectionContainer>

      {/* 출시일 */}
      <View className="pb-6 pt-4">
        <BodyText className="text-center text-gray-500 text-sm">
          출시일: {releaseDate}
        </BodyText>
        <BodyText className="text-center text-gray-400 text-sm">
          "AI와 함께하는 똑똑한 가계부 관리"
        </BodyText>
      </View>
    </Screen>
  );
}