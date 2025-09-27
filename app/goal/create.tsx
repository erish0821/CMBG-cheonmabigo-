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
import { AddIcon, ChatIcon, AnalyticsIcon } from '../../src/components/ui/Icon';

interface GoalTemplate {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  period: number; // months
  category: string;
}

export default function CreateGoalScreen() {
  const router = useRouter();
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const goalTemplates: GoalTemplate[] = [
    {
      id: 'vacation',
      title: '여행 자금',
      description: '국내외 여행을 위한 자금 마련',
      targetAmount: 2000000,
      period: 6,
      category: '여행',
    },
    {
      id: 'emergency',
      title: '비상 자금',
      description: '예상치 못한 상황을 위한 비상금',
      targetAmount: 5000000,
      period: 12,
      category: '안전',
    },
    {
      id: 'gadget',
      title: '전자기기 구매',
      description: '새로운 스마트폰, 노트북 등',
      targetAmount: 1500000,
      period: 4,
      category: '전자기기',
    },
    {
      id: 'education',
      title: '교육/강의',
      description: '온라인 강의, 자격증 취득 등',
      targetAmount: 500000,
      period: 3,
      category: '교육',
    },
  ];

  const handleTemplateSelect = (template: GoalTemplate) => {
    setSelectedTemplate(template.id);
    setGoalName(template.title);
    setTargetAmount(template.targetAmount.toString());
    setCurrentAmount('0');

    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + template.period);
    setTargetDate(futureDate.toISOString().split('T')[0]);
  };

  const handleCreateGoal = () => {
    if (!goalName || !targetAmount || !targetDate) {
      Alert.alert('입력 오류', '모든 필수 항목을 입력해주세요.');
      return;
    }

    const numTargetAmount = parseInt(targetAmount.replace(/,/g, ''));
    const numCurrentAmount = parseInt(currentAmount.replace(/,/g, '') || '0');

    if (numTargetAmount <= 0) {
      Alert.alert('입력 오류', '목표 금액은 0보다 커야 합니다.');
      return;
    }

    if (numCurrentAmount >= numTargetAmount) {
      Alert.alert('입력 오류', '현재 금액은 목표 금액보다 작아야 합니다.');
      return;
    }

    Alert.alert(
      '목표 생성 완료',
      `"${goalName}" 목표가 성공적으로 생성되었습니다!`,
      [
        {
          text: '확인',
          onPress: () => router.back(),
        },
      ]
    );
  };

  const formatCurrency = (value: string) => {
    const numValue = value.replace(/[^0-9]/g, '');
    return numValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleAmountChange = (
    value: string,
    setter: (value: string) => void
  ) => {
    const formatted = formatCurrency(value);
    setter(formatted);
  };

  const calculateProgress = () => {
    const target = parseInt(targetAmount.replace(/,/g, '') || '1');
    const current = parseInt(currentAmount.replace(/,/g, '') || '0');
    return Math.min((current / target) * 100, 100);
  };

  return (
    <Screen safeArea={false} padding="md" scrollable={true}>
      {/* 목표 템플릿 */}
      <SectionContainer>
        <H2 className="mb-4">목표 템플릿</H2>
        <BodyText variant="secondary" className="mb-4">
          자주 사용하는 목표 템플릿을 선택하거나 직접 입력하세요
        </BodyText>

        <View className="mb-4 flex-row flex-wrap">
          {goalTemplates.map(template => (
            <Card
              key={template.id}
              className={`mb-3 mr-3 w-[48%] ${
                selectedTemplate === template.id
                  ? 'border-2 border-primary-600 bg-primary-50'
                  : ''
              }`}
              onPress={() => handleTemplateSelect(template)}
            >
              <H3 className="mb-1">{template.title}</H3>
              <BodyText variant="secondary" className="mb-2 text-sm">
                {template.description}
              </BodyText>
              <BodyText className="font-semibold text-primary-600">
                ₩{template.targetAmount.toLocaleString()}
              </BodyText>
              <Caption className="text-gray-500">
                {template.period}개월 목표
              </Caption>
            </Card>
          ))}
        </View>
      </SectionContainer>

      {/* 목표 정보 입력 */}
      <SectionContainer>
        <H2 className="mb-4">목표 정보</H2>
        <Card className="mb-4">
          <View className="space-y-4">
            <Input
              label="목표 이름 *"
              placeholder="예: 여행 자금, 새 노트북 구매"
              value={goalName}
              onChangeText={setGoalName}
            />

            <Input
              label="목표 금액 (원) *"
              placeholder="0"
              value={targetAmount}
              onChangeText={value => handleAmountChange(value, setTargetAmount)}
              keyboardType="numeric"
              rightElement={<BodyText className="text-gray-500">원</BodyText>}
            />

            <Input
              label="현재 저축 금액 (원)"
              placeholder="0"
              value={currentAmount}
              onChangeText={value =>
                handleAmountChange(value, setCurrentAmount)
              }
              keyboardType="numeric"
              rightElement={<BodyText className="text-gray-500">원</BodyText>}
            />

            <Input
              label="목표 달성 날짜 *"
              placeholder="2024-12-31"
              value={targetDate}
              onChangeText={setTargetDate}
              keyboardType="default"
            />
          </View>
        </Card>
      </SectionContainer>

      {/* 진행률 미리보기 */}
      {targetAmount && currentAmount && (
        <SectionContainer>
          <H2 className="mb-4">진행률 미리보기</H2>
          <Card className="mb-4">
            <View className="space-y-3">
              <View className="flex-row items-center justify-between">
                <Label>현재 진행률</Label>
                <BodyText className="font-semibold text-primary-600">
                  {calculateProgress().toFixed(1)}%
                </BodyText>
              </View>
              <ProgressBar
                progress={calculateProgress()}
                color="success"
                showGradient={true}
              />
              <View className="flex-row items-center justify-between">
                <BodyText variant="secondary" className="text-sm">
                  ₩{currentAmount || '0'} / ₩{targetAmount || '0'}
                </BodyText>
                <BodyText variant="secondary" className="text-sm">
                  {targetAmount && currentAmount
                    ? `₩${(parseInt(targetAmount.replace(/,/g, '')) - parseInt(currentAmount.replace(/,/g, '') || '0')).toLocaleString()} 남음`
                    : ''}
                </BodyText>
              </View>
            </View>
          </Card>
        </SectionContainer>
      )}

      {/* AI 조언 */}
      <SectionContainer>
        <H2 className="mb-4">AI 조언</H2>
        <Card className="mb-4">
          <View className="space-y-3">
            <View className="flex-row items-start space-x-3">
              <View className="mt-1 h-2 w-2 rounded-full bg-success" />
              <View className="flex-1">
                <BodyText className="font-medium">달성 가능성</BodyText>
                <BodyText variant="secondary" className="text-sm">
                  현재 저축 패턴으로 목표 달성이 가능합니다.
                </BodyText>
              </View>
            </View>
            <View className="flex-row items-start space-x-3">
              <View className="bg-info mt-1 h-2 w-2 rounded-full" />
              <View className="flex-1">
                <BodyText className="font-medium">권장 저축액</BodyText>
                <BodyText variant="secondary" className="text-sm">
                  목표 달성을 위해 월 33만원씩 저축하시는 것을 추천합니다.
                </BodyText>
              </View>
            </View>
          </View>
          <Button
            title="AI와 상담하기"
            variant="outline"
            size="sm"
            className="mt-4"
            leftIcon={<ChatIcon size="sm" color="primary" />}
            onPress={() => router.push('/chat')}
          />
        </Card>
      </SectionContainer>

      {/* 액션 버튼 */}
      <SectionContainer>
        <View className="space-y-3">
          <Button
            title="목표 생성"
            variant="primary"
            leftIcon={<AddIcon size="sm" color="white" />}
            onPress={handleCreateGoal}
          />
          <Button
            title="취소"
            variant="outline"
            onPress={() => router.back()}
          />
        </View>
      </SectionContainer>
    </Screen>
  );
}
