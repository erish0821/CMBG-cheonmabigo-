import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
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

interface BudgetData {
  monthlyIncome: string;
  monthlyBudget: string;
  categories: {
    food: string;
    transport: string;
    shopping: string;
    entertainment: string;
    utilities: string;
    healthcare: string;
  };
}

export default function BudgetScreen() {
  const router = useRouter();
  const { user, updateProfile, isLoading } = useAuthStore();

  const [budgetData, setBudgetData] = useState<BudgetData>({
    monthlyIncome: '',
    monthlyBudget: '',
    categories: {
      food: '',
      transport: '',
      shopping: '',
      entertainment: '',
      utilities: '',
      healthcare: '',
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // 사용자 예산 정보 로드
  useEffect(() => {
    if (user?.preferences?.budget) {
      const budget = user.preferences.budget;
      setBudgetData({
        monthlyIncome: budget.monthlyIncome || '',
        monthlyBudget: budget.monthlyBudget || '',
        categories: {
          food: budget.categories?.food || '',
          transport: budget.categories?.transport || '',
          shopping: budget.categories?.shopping || '',
          entertainment: budget.categories?.entertainment || '',
          utilities: budget.categories?.utilities || '',
          healthcare: budget.categories?.healthcare || '',
        },
      });
    }
  }, [user]);

  const formatCurrency = (value: string) => {
    const numValue = value.replace(/[^0-9]/g, '');
    return numValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleCurrencyChange = (value: string, field: string, category?: string) => {
    const formatted = formatCurrency(value);
    if (category) {
      setBudgetData(prev => ({
        ...prev,
        categories: {
          ...prev.categories,
          [category]: formatted,
        },
      }));
    } else {
      setBudgetData(prev => ({
        ...prev,
        [field]: formatted,
      }));
    }
  };

  const validateBudget = () => {
    const newErrors: Record<string, string> = {};

    const monthlyIncome = parseInt(budgetData.monthlyIncome.replace(/,/g, '')) || 0;
    const monthlyBudget = parseInt(budgetData.monthlyBudget.replace(/,/g, '')) || 0;

    if (monthlyBudget > monthlyIncome && monthlyIncome > 0) {
      newErrors.monthlyBudget = '월 예산이 월 수입보다 클 수 없습니다';
    }

    // 카테고리별 예산 총합 검증
    const categoryTotal = Object.values(budgetData.categories)
      .reduce((sum, value) => sum + (parseInt(value.replace(/,/g, '')) || 0), 0);

    if (categoryTotal > monthlyBudget && monthlyBudget > 0) {
      newErrors.categories = '카테고리별 예산 총합이 월 예산을 초과할 수 없습니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateCategoryPercentage = (category: string) => {
    const categoryAmount = parseInt(budgetData.categories[category as keyof typeof budgetData.categories].replace(/,/g, '')) || 0;
    const monthlyBudget = parseInt(budgetData.monthlyBudget.replace(/,/g, '')) || 0;

    if (monthlyBudget === 0) return 0;
    return Math.round((categoryAmount / monthlyBudget) * 100);
  };

  const getTotalCategoryPercentage = () => {
    const categoryTotal = Object.values(budgetData.categories)
      .reduce((sum, value) => sum + (parseInt(value.replace(/,/g, '')) || 0), 0);
    const monthlyBudget = parseInt(budgetData.monthlyBudget.replace(/,/g, '')) || 0;

    if (monthlyBudget === 0) return 0;
    return Math.round((categoryTotal / monthlyBudget) * 100);
  };

  const handleSave = async () => {
    if (!validateBudget()) {
      return;
    }

    try {
      const updateData = {
        preferences: {
          ...user?.preferences,
          budget: {
            monthlyIncome: budgetData.monthlyIncome.replace(/,/g, '') || null,
            monthlyBudget: budgetData.monthlyBudget.replace(/,/g, '') || null,
            categories: {
              food: budgetData.categories.food.replace(/,/g, '') || null,
              transport: budgetData.categories.transport.replace(/,/g, '') || null,
              shopping: budgetData.categories.shopping.replace(/,/g, '') || null,
              entertainment: budgetData.categories.entertainment.replace(/,/g, '') || null,
              utilities: budgetData.categories.utilities.replace(/,/g, '') || null,
              healthcare: budgetData.categories.healthcare.replace(/,/g, '') || null,
            },
          },
        },
      };

      await updateProfile(updateData);

      // 성공 메시지
      if (typeof window !== 'undefined') {
        alert('예산 설정이 성공적으로 저장되었습니다!');
      } else {
        Alert.alert('성공', '예산 설정이 성공적으로 저장되었습니다!');
      }

      router.back();
    } catch (error: any) {
      console.error('예산 설정 저장 오류:', error);

      if (typeof window !== 'undefined') {
        alert('예산 설정 저장에 실패했습니다. 다시 시도해주세요.');
      } else {
        Alert.alert('오류', '예산 설정 저장에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };

  const categoryLabels = {
    food: '식비',
    transport: '교통비',
    shopping: '쇼핑',
    entertainment: '여가/문화',
    utilities: '공과금',
    healthcare: '의료비',
  };

  return (
    <Screen
      title="예산 설정"
      subtitle="월간 예산과 카테고리별 한도를 설정하세요"
      safeArea={true}
      scrollable={true}
      showBackButton={true}
    >
      {/* 기본 예산 */}
      <SectionContainer>
        <H2 className="mb-4">기본 예산</H2>

        <Card className="mb-4">
          <View className="space-y-4">
            <Input
              label="월 수입 (원)"
              placeholder="0"
              value={budgetData.monthlyIncome}
              onChangeText={(value) => handleCurrencyChange(value, 'monthlyIncome')}
              keyboardType="numeric"
            />

            <Input
              label="월 예산 (원)"
              placeholder="0"
              value={budgetData.monthlyBudget}
              onChangeText={(value) => handleCurrencyChange(value, 'monthlyBudget')}
              keyboardType="numeric"
              error={errors.monthlyBudget}
            />

            {budgetData.monthlyIncome && budgetData.monthlyBudget && (
              <View>
                <View className="flex-row items-center justify-between mb-2">
                  <BodyText className="text-sm text-gray-600">예산 비율</BodyText>
                  <BodyText className="text-sm font-medium">
                    {Math.round((parseInt(budgetData.monthlyBudget.replace(/,/g, '')) / parseInt(budgetData.monthlyIncome.replace(/,/g, ''))) * 100)}%
                  </BodyText>
                </View>
                <ProgressBar
                  progress={(parseInt(budgetData.monthlyBudget.replace(/,/g, '')) / parseInt(budgetData.monthlyIncome.replace(/,/g, ''))) * 100}
                  className="h-2"
                  showGradient={true}
                />
              </View>
            )}
          </View>
        </Card>
      </SectionContainer>

      {/* 카테고리별 예산 */}
      <SectionContainer>
        <H2 className="mb-4">카테고리별 예산</H2>

        <Card className="mb-4">
          <View className="space-y-4">
            {Object.entries(categoryLabels).map(([key, label]) => (
              <View key={key}>
                <Input
                  label={label}
                  placeholder="0"
                  value={budgetData.categories[key as keyof typeof budgetData.categories]}
                  onChangeText={(value) => handleCurrencyChange(value, '', key)}
                  keyboardType="numeric"
                />
                {budgetData.monthlyBudget && budgetData.categories[key as keyof typeof budgetData.categories] && (
                  <View className="mt-2">
                    <View className="flex-row items-center justify-between mb-1">
                      <BodyText className="text-xs text-gray-500">예산 대비</BodyText>
                      <BodyText className="text-xs font-medium">
                        {calculateCategoryPercentage(key)}%
                      </BodyText>
                    </View>
                    <ProgressBar
                      progress={calculateCategoryPercentage(key)}
                      className="h-1"
                      color={calculateCategoryPercentage(key) > 50 ? '#f59e0b' : '#10b981'}
                    />
                  </View>
                )}
              </View>
            ))}
          </View>
        </Card>

        {errors.categories && (
          <Card className="bg-error-50 mb-4">
            <BodyText className="text-error-700 text-sm">{errors.categories}</BodyText>
          </Card>
        )}

        {budgetData.monthlyBudget && (
          <Card className="bg-primary-50">
            <View className="space-y-2">
              <View className="flex-row items-center justify-between">
                <BodyText className="text-primary-700 font-medium">총 배정 예산</BodyText>
                <BodyText className="text-primary-700 font-bold">
                  {Object.values(budgetData.categories)
                    .reduce((sum, value) => sum + (parseInt(value.replace(/,/g, '')) || 0), 0)
                    .toLocaleString()}원
                </BodyText>
              </View>
              <View className="flex-row items-center justify-between">
                <BodyText className="text-primary-600">배정률</BodyText>
                <BodyText className="text-primary-600 font-medium">
                  {getTotalCategoryPercentage()}%
                </BodyText>
              </View>
              <ProgressBar
                progress={getTotalCategoryPercentage()}
                className="h-2"
                color={getTotalCategoryPercentage() > 100 ? '#ef4444' : '#7c3aed'}
                showGradient={true}
              />
            </View>
          </Card>
        )}
      </SectionContainer>

      {/* 예산 가이드 */}
      <SectionContainer>
        <Card className="bg-success-50">
          <H3 className="mb-2 text-success-800">💡 예산 설정 가이드</H3>
          <View className="space-y-2">
            <BodyText className="text-success-700 text-sm">
              • 50/30/20 법칙: 필수지출 50%, 여가 30%, 저축 20%
            </BodyText>
            <BodyText className="text-success-700 text-sm">
              • 식비: 월 수입의 15-20% 권장
            </BodyText>
            <BodyText className="text-success-700 text-sm">
              • 교통비: 월 수입의 5-10% 권장
            </BodyText>
            <BodyText className="text-success-700 text-sm">
              • 여가/문화: 월 수입의 10-15% 권장
            </BodyText>
          </View>
        </Card>
      </SectionContainer>

      {/* 저장 버튼 */}
      <SectionContainer>
        <View className="flex-row space-x-3">
          <Button
            title="취소"
            variant="outline"
            className="flex-1"
            onPress={() => router.back()}
            disabled={isLoading}
          />
          <Button
            title={isLoading ? "저장 중..." : "저장"}
            variant="primary"
            className="flex-1"
            onPress={handleSave}
            disabled={isLoading}
          />
        </View>
      </SectionContainer>
    </Screen>
  );
}