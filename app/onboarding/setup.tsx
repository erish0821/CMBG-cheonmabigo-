import React, { useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
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
import { Input } from '../../src/components/ui/Input';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { AddIcon, AnalyticsIcon, HomeIcon } from '../../src/components/ui/Icon';

export default function SetupScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Form state
  const [profile, setProfile] = useState({
    name: '',
    age: '',
    occupation: '',
  });

  const [budget, setBudget] = useState({
    monthlyIncome: '',
    monthlyBudget: '',
    categories: {
      food: '',
      transport: '',
      shopping: '',
      entertainment: '',
    },
  });

  const [goals, setGoals] = useState({
    primaryGoal: '',
    targetAmount: '',
    timeframe: '',
  });

  const [preferences, setPreferences] = useState({
    notifications: true,
    analysisFrequency: 'weekly',
    privacyLevel: 'normal',
  });

  const formatCurrency = (value: string) => {
    const numValue = value.replace(/[^0-9]/g, '');
    return numValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleCurrencyChange = (
    value: string,
    field: string,
    category?: string
  ) => {
    const formatted = formatCurrency(value);
    if (category) {
      setBudget(prev => ({
        ...prev,
        categories: {
          ...prev.categories,
          [category]: formatted,
        },
      }));
    } else {
      setBudget(prev => ({
        ...prev,
        [field]: formatted,
      }));
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    Alert.alert(
      '설정 완료',
      '천마비고 설정이 완료되었습니다! 이제 AI와 함께 똑똑한 가계부 관리를 시작해보세요.',
      [
        {
          text: '시작하기',
          onPress: () => router.replace('/(tabs)'),
        },
      ]
    );
  };

  const renderStep1 = () => (
    <SectionContainer>
      <H2 className="mb-4">기본 정보</H2>
      <BodyText variant="secondary" className="mb-6">
        AI가 더 정확한 조언을 드릴 수 있도록 기본 정보를 알려주세요
      </BodyText>

      <Card className="mb-4">
        <View className="space-y-4">
          <Input
            label="이름 *"
            placeholder="홍길동"
            value={profile.name}
            onChangeText={value =>
              setProfile(prev => ({ ...prev, name: value }))
            }
          />
          <Input
            label="나이"
            placeholder="30"
            value={profile.age}
            onChangeText={value =>
              setProfile(prev => ({ ...prev, age: value }))
            }
            keyboardType="numeric"
          />
          <Input
            label="직업"
            placeholder="직장인, 학생, 자영업 등"
            value={profile.occupation}
            onChangeText={value =>
              setProfile(prev => ({ ...prev, occupation: value }))
            }
          />
        </View>
      </Card>

      <Card className="bg-info-50">
        <View className="flex-row items-start space-x-3">
          <View className="bg-info mt-1 h-2 w-2 rounded-full" />
          <BodyText className="text-info-700 flex-1">
            입력하신 정보는 AI 분석에만 사용되며, 개인정보보호정책에 따라
            안전하게 보호됩니다.
          </BodyText>
        </View>
      </Card>
    </SectionContainer>
  );

  const renderStep2 = () => (
    <SectionContainer>
      <H2 className="mb-4">예산 설정</H2>
      <BodyText variant="secondary" className="mb-6">
        월간 예산을 설정하여 지출을 체계적으로 관리해보세요
      </BodyText>

      <Card className="mb-4">
        <H3 className="mb-4">기본 예산</H3>
        <View className="space-y-4">
          <Input
            label="월 수입 (원)"
            placeholder="0"
            value={budget.monthlyIncome}
            onChangeText={value => handleCurrencyChange(value, 'monthlyIncome')}
            keyboardType="numeric"
          />
          <Input
            label="월 예산 (원) *"
            placeholder="0"
            value={budget.monthlyBudget}
            onChangeText={value => handleCurrencyChange(value, 'monthlyBudget')}
            keyboardType="numeric"
          />
        </View>
      </Card>

      <Card className="mb-4">
        <H3 className="mb-4">카테고리별 예산 (선택)</H3>
        <View className="space-y-4">
          <Input
            label="식비"
            placeholder="0"
            value={budget.categories.food}
            onChangeText={value => handleCurrencyChange(value, '', 'food')}
            keyboardType="numeric"
          />
          <Input
            label="교통비"
            placeholder="0"
            value={budget.categories.transport}
            onChangeText={value => handleCurrencyChange(value, '', 'transport')}
            keyboardType="numeric"
          />
          <Input
            label="쇼핑"
            placeholder="0"
            value={budget.categories.shopping}
            onChangeText={value => handleCurrencyChange(value, '', 'shopping')}
            keyboardType="numeric"
          />
          <Input
            label="여가/문화"
            placeholder="0"
            value={budget.categories.entertainment}
            onChangeText={value =>
              handleCurrencyChange(value, '', 'entertainment')
            }
            keyboardType="numeric"
          />
        </View>
      </Card>
    </SectionContainer>
  );

  const renderStep3 = () => (
    <SectionContainer>
      <H2 className="mb-4">목표 설정</H2>
      <BodyText variant="secondary" className="mb-6">
        첫 번째 저축 목표를 설정해보세요
      </BodyText>

      <Card className="mb-4">
        <View className="space-y-4">
          <Input
            label="목표 이름"
            placeholder="여행 자금, 비상금 등"
            value={goals.primaryGoal}
            onChangeText={value =>
              setGoals(prev => ({ ...prev, primaryGoal: value }))
            }
          />
          <Input
            label="목표 금액 (원)"
            placeholder="0"
            value={goals.targetAmount}
            onChangeText={value =>
              setGoals(prev => ({
                ...prev,
                targetAmount: formatCurrency(value),
              }))
            }
            keyboardType="numeric"
          />
          <Input
            label="목표 기간"
            placeholder="6개월, 1년 등"
            value={goals.timeframe}
            onChangeText={value =>
              setGoals(prev => ({ ...prev, timeframe: value }))
            }
          />
        </View>
      </Card>

      <Card className="bg-success-50">
        <View className="flex-row items-start space-x-3">
          <View className="mt-1 h-2 w-2 rounded-full bg-success" />
          <BodyText className="text-success-700 flex-1">
            목표를 설정하면 AI가 달성을 위한 맞춤 조언을 제공합니다. 언제든
            수정할 수 있어요.
          </BodyText>
        </View>
      </Card>
    </SectionContainer>
  );

  const renderStep4 = () => (
    <SectionContainer>
      <H2 className="mb-4">환경 설정</H2>
      <BodyText variant="secondary" className="mb-6">
        앱 사용 환경을 설정해주세요
      </BodyText>

      <Card className="mb-4">
        <H3 className="mb-4">알림 설정</H3>
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Label>푸시 알림</Label>
            <BodyText variant="secondary" className="text-sm">
              지출 기록 리마인더 및 목표 달성 알림
            </BodyText>
          </View>
          {/* Switch 컴포넌트는 실제 구현에서 추가 */}
          <Button
            title={preferences.notifications ? '켜짐' : '꺼짐'}
            variant="outline"
            size="sm"
            onPress={() =>
              setPreferences(prev => ({
                ...prev,
                notifications: !prev.notifications,
              }))
            }
          />
        </View>
      </Card>

      <Card className="mb-4">
        <H3 className="mb-4">분석 빈도</H3>
        <View className="space-y-2">
          {[
            { key: 'daily', label: '매일' },
            { key: 'weekly', label: '매주' },
            { key: 'monthly', label: '매월' },
          ].map(option => (
            <Button
              key={option.key}
              title={option.label}
              variant={
                preferences.analysisFrequency === option.key
                  ? 'primary'
                  : 'outline'
              }
              size="sm"
              onPress={() =>
                setPreferences(prev => ({
                  ...prev,
                  analysisFrequency: option.key,
                }))
              }
            />
          ))}
        </View>
      </Card>

      <Card className="bg-primary-50">
        <View className="py-4">
          <H3 className="mb-2 text-center text-primary-800">준비 완료!</H3>
          <BodyText className="text-center text-primary-700">
            이제 천마비고와 함께 똑똑한 가계부 관리를 시작할 준비가 되었습니다.
          </BodyText>
        </View>
      </Card>
    </SectionContainer>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return renderStep1();
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return profile.name.trim() !== '';
      case 2:
        return budget.monthlyBudget.trim() !== '';
      case 3:
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <Screen
      title="초기 설정"
      subtitle={`${currentStep}/${totalSteps} 단계`}
      safeArea={false}
      padding="md"
      scrollable={true}
    >
      {/* 진행률 표시 */}
      <SectionContainer>
        <ProgressBar
          progress={(currentStep / totalSteps) * 100}
          className="mb-2"
          showGradient={true}
        />
        <BodyText className="text-center text-sm text-gray-600">
          {currentStep}/{totalSteps} 단계 (
          {Math.round((currentStep / totalSteps) * 100)}%)
        </BodyText>
      </SectionContainer>

      {/* 현재 단계 내용 */}
      {renderCurrentStep()}

      {/* 네비게이션 버튼 */}
      <SectionContainer>
        <View className="flex-row space-x-3">
          {currentStep > 1 && (
            <Button
              title="이전"
              variant="outline"
              className="flex-1"
              onPress={prevStep}
            />
          )}
          <Button
            title={currentStep === totalSteps ? '완료' : '다음'}
            variant="primary"
            className="flex-1"
            onPress={nextStep}
            disabled={!canProceed()}
            leftIcon={
              currentStep === totalSteps ? (
                <AddIcon size="sm" color="white" />
              ) : undefined
            }
          />
        </View>
      </SectionContainer>

      {/* 건너뛰기 옵션 */}
      {currentStep > 2 && (
        <View className="pb-6 pt-2">
          <Button
            title="나중에 설정하고 바로 시작하기"
            variant="outline"
            size="sm"
            onPress={() => router.replace('/(tabs)')}
          />
        </View>
      )}
    </Screen>
  );
}
