import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Alert,
  Switch,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
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
import { useAuthStore } from '../../src/stores/authStore';

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
  const { user, logout, isLoading } = useAuthStore();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [biometricAuth, setBiometricAuth] = useState(false);
  const [dataSync, setDataSync] = useState(true);

  // 로그아웃 핸들러
  const handleLogout = async () => {
    // 웹 환경에서는 confirm 사용
    if (typeof window !== 'undefined') {
      const result = confirm('정말 로그아웃하시겠습니까?');
      if (!result) return;
    } else {
      // 모바일에서는 Alert 사용
      Alert.alert(
        '로그아웃',
        '정말 로그아웃하시겠습니까?',
        [
          { text: '취소', style: 'cancel' },
          {
            text: '로그아웃',
            style: 'destructive',
            onPress: async () => {
              await performLogout();
            },
          },
        ]
      );
      return;
    }

    await performLogout();
  };

  const performLogout = async () => {
    try {
      await logout();
      // 루트로 리다이렉트 (app/index.tsx에서 웰컴 화면으로 보냄)
      router.replace('/');
    } catch (error) {
      console.error('로그아웃 오류:', error);
      if (typeof window !== 'undefined') {
        alert('로그아웃 중 문제가 발생했습니다.');
      } else {
        Alert.alert('오류', '로그아웃 중 문제가 발생했습니다.');
      }
    }
  };

  // 사용자 이름과 이메일 가져오기
  const getUserDisplayName = () => {
    if (!user) return '사용자';
    return user.name || user.email?.split('@')[0] || '사용자';
  };

  const getUserEmail = () => {
    return user?.email || 'email@example.com';
  };

  const getUserInitial = () => {
    const name = getUserDisplayName();
    return name.charAt(0).toUpperCase();
  };

  const accountSettings: SettingItem[] = [
    {
      title: '프로필 관리',
      description: '개인정보 및 프로필 설정',
      type: 'navigation',
      onPress: () => {
        router.push('/settings/profile');
      },
    },
    {
      title: '예산 설정',
      description: '월간 예산 및 카테고리별 한도 설정',
      type: 'navigation',
      onPress: () => {
        router.push('/settings/budget');
      },
    },
    {
      title: '카테고리 관리',
      description: '지출 카테고리 추가 및 수정',
      type: 'navigation',
      onPress: () => {
        router.push('/settings/categories');
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
        router.push('/settings/help');
      },
    },
    {
      title: '문의하기',
      description: '개발팀에 문의 및 피드백',
      type: 'navigation',
      onPress: () => {
        router.push('/settings/contact');
      },
    },
    {
      title: '앱 정보',
      description: '버전 정보 및 라이선스',
      type: 'navigation',
      onPress: () => {
        router.push('/settings/about');
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
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
        backgroundColor="#FFFFFF"
      />

      <ScrollView
        className="flex-1 pb-20 px-4"
        showsVerticalScrollIndicator={false}
      >
        {/* 헤더 */}
        <View className="pt-8 pb-6">
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            설정
          </Text>
          <Text className="text-gray-600">
            앱 설정 및 개인화 옵션을 관리하세요
          </Text>
        </View>
      {/* 사용자 정보 */}
      <SectionContainer>
        <Card className="mb-4">
          <View className="items-center py-4">
            <View className="mb-3 h-20 w-20 items-center justify-center rounded-full bg-primary-100">
              <BodyText className="text-2xl font-bold text-primary-600">
                {getUserInitial()}
              </BodyText>
            </View>
            <H2 className="mb-1">{getUserDisplayName()}님</H2>
            <Caption className="text-gray-600">{getUserEmail()}</Caption>
            <Button
              title="프로필 수정"
              variant="outline"
              size="sm"
              className="mt-3"
              onPress={() => {
                router.push('/settings/profile');
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
            title="데이터 관리"
            variant="outline"
            onPress={() => {
              router.push('/settings/data');
            }}
          />
        </Card>
      </SectionContainer>

      {/* 로그아웃 */}
      <SectionContainer>
        <Card>
          <Button
            title={isLoading ? "로그아웃 중..." : "로그아웃"}
            variant="outline"
            disabled={isLoading}
            onPress={handleLogout}
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
      </ScrollView>
    </SafeAreaView>
  );
}
