import React, { useState } from 'react';
import { View, ScrollView, Alert, Switch } from 'react-native';
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
  SettingsIcon,
  HomeIcon,
  ChatIcon,
  AnalyticsIcon,
} from '../../src/components/ui/Icon';
import { useRouter } from 'expo-router';

interface SettingItem {
  title: string;
  description?: string;
  type: 'button' | 'toggle' | 'navigation';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
}

export default function SettingsScreen() {
  const router = useRouter();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [biometricAuth, setBiometricAuth] = useState(false);
  const [dataSync, setDataSync] = useState(true);

  const accountSettings: SettingItem[] = [
    {
      title: '프로필 관리',
      description: '개인정보 및 프로필 설정',
      type: 'navigation',
      onPress: () => {
        Alert.alert('프로필 관리', '프로필 설정 화면으로 이동합니다.');
      },
    },
    {
      title: '예산 설정',
      description: '월간 예산 및 카테고리별 한도 설정',
      type: 'navigation',
      onPress: () => {
        Alert.alert('예산 설정', '예산 설정 화면으로 이동합니다.');
      },
    },
    {
      title: '카테고리 관리',
      description: '지출 카테고리 추가 및 수정',
      type: 'navigation',
      onPress: () => {
        Alert.alert('카테고리 관리', '카테고리 관리 화면으로 이동합니다.');
      },
    },
  ];

  const appSettings: SettingItem[] = [
    {
      title: '푸시 알림',
      description: '지출 알림 및 목표 달성 알림',
      type: 'toggle',
      value: pushNotifications,
      onToggle: setPushNotifications,
    },
    {
      title: '생체 인증',
      description: '지문 또는 Face ID로 앱 잠금',
      type: 'toggle',
      value: biometricAuth,
      onToggle: setBiometricAuth,
    },
    {
      title: '데이터 동기화',
      description: '클라우드 백업 및 동기화',
      type: 'toggle',
      value: dataSync,
      onToggle: setDataSync,
    },
  ];

  const supportSettings: SettingItem[] = [
    {
      title: '도움말',
      description: '앱 사용법 및 FAQ',
      type: 'navigation',
      onPress: () => {
        Alert.alert('도움말', '도움말 화면으로 이동합니다.');
      },
    },
    {
      title: '문의하기',
      description: '개발팀에 문의 및 피드백',
      type: 'navigation',
      onPress: () => {
        Alert.alert('문의하기', '문의 화면으로 이동합니다.');
      },
    },
    {
      title: '앱 정보',
      description: '버전 정보 및 라이선스',
      type: 'navigation',
      onPress: () => {
        Alert.alert('앱 정보', '천마비고 v1.0.0\\n\\n© 2024 천마비고 팀');
      },
    },
  ];

  const renderSettingItem = (item: SettingItem, index: number) => (
    <Card
      key={index}
      className="mb-3"
      onPress={item.type === 'navigation' ? item.onPress : undefined}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <H3 className="mb-1">{item.title}</H3>
          {item.description && (
            <BodyText variant="secondary" className="text-sm">
              {item.description}
            </BodyText>
          )}
        </View>
        {item.type === 'toggle' && (
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{ false: '#e5e7eb', true: '#7c3aed' }}
            thumbColor={item.value ? '#ffffff' : '#f3f4f6'}
          />
        )}
        {item.type === 'navigation' && (
          <BodyText className="text-gray-400">›</BodyText>
        )}
      </View>
    </Card>
  );

  return (
    <Screen
      title="설정"
      subtitle="앱 설정 및 개인화 옵션을 관리하세요"
      safeArea={true}
      scrollable={true}
    >
      {/* 사용자 정보 */}
      <SectionContainer>
        <Card className="mb-4">
          <View className="items-center py-4">
            <View className="mb-3 h-20 w-20 items-center justify-center rounded-full bg-primary-100">
              <BodyText className="text-2xl font-bold text-primary-600">
                김
              </BodyText>
            </View>
            <H2 className="mb-1">김천마님</H2>
            <Caption className="text-gray-600">kim.cheonma@example.com</Caption>
            <Button
              title="프로필 수정"
              variant="outline"
              size="sm"
              className="mt-3"
              onPress={() => {
                Alert.alert('프로필 수정', '프로필 수정 화면으로 이동합니다.');
              }}
            />
          </View>
        </Card>
      </SectionContainer>

      {/* 계정 설정 */}
      <SectionContainer>
        <H2 className="mb-4">계정 설정</H2>
        {accountSettings.map(renderSettingItem)}
      </SectionContainer>

      {/* 앱 설정 */}
      <SectionContainer>
        <H2 className="mb-4">앱 설정</H2>
        {appSettings.map(renderSettingItem)}
      </SectionContainer>

      {/* 지원 및 정보 */}
      <SectionContainer>
        <H2 className="mb-4">지원 및 정보</H2>
        {supportSettings.map(renderSettingItem)}
      </SectionContainer>

      {/* 데이터 관리 */}
      <SectionContainer>
        <H2 className="mb-4">데이터 관리</H2>
        <Card className="mb-3">
          <Button
            title="데이터 내보내기"
            variant="outline"
            onPress={() => {
              Alert.alert(
                '데이터 내보내기',
                '거래 내역을 CSV 파일로 내보냅니다.'
              );
            }}
          />
        </Card>
        <Card className="mb-3">
          <Button
            title="데이터 초기화"
            variant="outline"
            onPress={() => {
              Alert.alert(
                '데이터 초기화',
                '모든 거래 내역이 삭제됩니다. 정말 초기화하시겠습니까?',
                [
                  { text: '취소', style: 'cancel' },
                  { text: '초기화', style: 'destructive' },
                ]
              );
            }}
          />
        </Card>
      </SectionContainer>

      {/* 로그아웃 */}
      <SectionContainer>
        <Card>
          <Button
            title="로그아웃"
            variant="outline"
            onPress={() => {
              Alert.alert('로그아웃', '정말 로그아웃하시겠습니까?', [
                { text: '취소', style: 'cancel' },
                { text: '로그아웃', style: 'destructive' },
              ]);
            }}
          />
        </Card>
      </SectionContainer>

      {/* 버전 정보 */}
      <View className="pb-6 pt-4">
        <BodyText className="text-center text-gray-500">
          천마비고 v1.0.0
        </BodyText>
        <BodyText className="text-center text-gray-400">
          © 2024 천마비고 팀
        </BodyText>
      </View>
    </Screen>
  );
}
