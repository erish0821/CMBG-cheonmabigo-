import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, Switch } from 'react-native';
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
import { CATEGORIES, CATEGORY_LIST, EXPENSE_CATEGORIES } from '../../src/constants/categories';
import { CategoryType } from '../../src/types/transaction';

interface UserCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  enabled: boolean;
  isCustom: boolean;
}

export default function CategoriesScreen() {
  const router = useRouter();
  const { user, updateProfile, isLoading } = useAuthStore();

  const [categories, setCategories] = useState<UserCategory[]>([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    icon: '📦',
    color: '#6B7280',
  });

  // 카테고리 설정 로드
  useEffect(() => {
    if (user) {
      const userCategories = user.preferences?.categories?.enabled || [];
      const customCategories = user.preferences?.categories?.custom || [];

      // 기본 카테고리들 (수입 제외)
      const defaultCategories: UserCategory[] = EXPENSE_CATEGORIES.map(categoryType => {
        const category = CATEGORIES[categoryType];
        return {
          id: categoryType,
          name: category.name,
          icon: category.icon,
          color: category.color,
          enabled: userCategories.length === 0 ? true : userCategories.includes(categoryType),
          isCustom: false,
        };
      });

      // 사용자 정의 카테고리들
      const userDefinedCategories: UserCategory[] = customCategories.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        enabled: true,
        isCustom: true,
      }));

      setCategories([...defaultCategories, ...userDefinedCategories]);
    }
  }, [user]);

  const toggleCategory = (categoryId: string) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? { ...cat, enabled: !cat.enabled }
          : cat
      )
    );
  };

  const addCustomCategory = () => {
    if (!newCategory.name.trim()) {
      if (typeof window !== 'undefined') {
        alert('카테고리 이름을 입력해주세요.');
      } else {
        Alert.alert('오류', '카테고리 이름을 입력해주세요.');
      }
      return;
    }

    const customId = `custom_${Date.now()}`;
    const newCategoryData: UserCategory = {
      id: customId,
      name: newCategory.name.trim(),
      icon: newCategory.icon,
      color: newCategory.color,
      enabled: true,
      isCustom: true,
    };

    setCategories(prev => [...prev, newCategoryData]);
    setNewCategory({ name: '', icon: '📦', color: '#6B7280' });
    setShowAddCategory(false);
  };

  const deleteCustomCategory = (categoryId: string) => {
    const confirmMessage = '이 카테고리를 삭제하시겠습니까? 관련된 거래 내역은 "기타" 카테고리로 이동됩니다.';

    const handleDelete = () => {
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
    };

    if (typeof window !== 'undefined') {
      if (confirm(confirmMessage)) {
        handleDelete();
      }
    } else {
      Alert.alert(
        '카테고리 삭제',
        confirmMessage,
        [
          { text: '취소', style: 'cancel' },
          { text: '삭제', style: 'destructive', onPress: handleDelete },
        ]
      );
    }
  };

  const handleSave = async () => {
    try {
      const enabledCategories = categories
        .filter(cat => cat.enabled && !cat.isCustom)
        .map(cat => cat.id);

      const customCategories = categories
        .filter(cat => cat.isCustom)
        .map(cat => ({
          id: cat.id,
          name: cat.name,
          icon: cat.icon,
          color: cat.color,
        }));

      const updateData = {
        preferences: {
          ...user?.preferences,
          categories: {
            enabled: enabledCategories,
            custom: customCategories,
          },
        },
      };

      await updateProfile(updateData);

      // 성공 메시지
      if (typeof window !== 'undefined') {
        alert('카테고리 설정이 성공적으로 저장되었습니다!');
      } else {
        Alert.alert('성공', '카테고리 설정이 성공적으로 저장되었습니다!');
      }

      router.back();
    } catch (error: any) {
      console.error('카테고리 설정 저장 오류:', error);

      if (typeof window !== 'undefined') {
        alert('카테고리 설정 저장에 실패했습니다. 다시 시도해주세요.');
      } else {
        Alert.alert('오류', '카테고리 설정 저장에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };

  const commonIcons = ['🍽️', '🚇', '🛍️', '🎬', '💡', '🏥', '📚', '🏠', '💰', '📦', '☕', '🎮', '🎵', '💼', '📱', '⚽', '🎯', '🚗', '✈️', '💊'];
  const commonColors = ['#EF4444', '#3B82F6', '#F59E0B', '#8B5CF6', '#84CC16', '#10B981', '#6366F1', '#DC2626', '#059669', '#6B7280', '#EC4899', '#14B8A6', '#F97316', '#8B5CF6'];

  const enabledCount = categories.filter(cat => cat.enabled).length;
  const customCount = categories.filter(cat => cat.isCustom).length;

  return (
    <Screen
      title="카테고리 관리"
      subtitle="지출 카테고리를 추가하고 관리하세요"
      safeArea={true}
      scrollable={true}
      showBackButton={true}
    >
      {/* 카테고리 현황 */}
      <SectionContainer>
        <Card className="mb-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <H3 className="mb-1">활성화된 카테고리</H3>
              <BodyText className="text-sm text-gray-600">
                사용 중인 카테고리: {enabledCount}개
              </BodyText>
            </View>
            <View className="items-end">
              <BodyText className="text-2xl font-bold text-primary-600">
                {enabledCount}
              </BodyText>
              <Caption className="text-gray-500">
                사용자 정의: {customCount}개
              </Caption>
            </View>
          </View>
        </Card>
      </SectionContainer>

      {/* 기본 카테고리 */}
      <SectionContainer>
        <H2 className="mb-4">기본 카테고리</H2>

        {categories.filter(cat => !cat.isCustom).map((category) => (
          <Card key={category.id} className="mb-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: category.color + '20' }}
                >
                  <BodyText className="text-lg">{category.icon}</BodyText>
                </View>
                <View className="flex-1">
                  <H3 className="mb-1">{category.name}</H3>
                  <BodyText className="text-sm text-gray-600">
                    {CATEGORIES[category.id as CategoryType]?.subcategories?.slice(0, 3)?.join(', ')}
                    {CATEGORIES[category.id as CategoryType]?.subcategories?.length > 3 && '...'}
                  </BodyText>
                </View>
              </View>
              <Switch
                value={category.enabled}
                onValueChange={() => toggleCategory(category.id)}
                trackColor={{ false: '#e5e7eb', true: category.color }}
                thumbColor={category.enabled ? '#ffffff' : '#f3f4f6'}
              />
            </View>
          </Card>
        ))}
      </SectionContainer>

      {/* 사용자 정의 카테고리 */}
      <SectionContainer>
        <View className="flex-row items-center justify-between mb-4">
          <H2>사용자 정의 카테고리</H2>
          <Button
            title="추가"
            variant="outline"
            size="sm"
            onPress={() => setShowAddCategory(true)}
          />
        </View>

        {categories.filter(cat => cat.isCustom).length === 0 ? (
          <Card className="bg-gray-50">
            <View className="items-center py-6">
              <BodyText className="text-gray-500 text-center mb-2">
                사용자 정의 카테고리가 없습니다
              </BodyText>
              <BodyText className="text-sm text-gray-400 text-center">
                "추가" 버튼을 눌러 새 카테고리를 만들어보세요
              </BodyText>
            </View>
          </Card>
        ) : (
          categories.filter(cat => cat.isCustom).map((category) => (
            <Card key={category.id} className="mb-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: category.color + '20' }}
                  >
                    <BodyText className="text-lg">{category.icon}</BodyText>
                  </View>
                  <View className="flex-1">
                    <H3 className="mb-1">{category.name}</H3>
                    <BodyText className="text-sm text-gray-600">사용자 정의</BodyText>
                  </View>
                </View>
                <View className="flex-row items-center space-x-2">
                  <Switch
                    value={category.enabled}
                    onValueChange={() => toggleCategory(category.id)}
                    trackColor={{ false: '#e5e7eb', true: category.color }}
                    thumbColor={category.enabled ? '#ffffff' : '#f3f4f6'}
                  />
                  <Button
                    title="삭제"
                    variant="outline"
                    size="sm"
                    onPress={() => deleteCustomCategory(category.id)}
                  />
                </View>
              </View>
            </Card>
          ))
        )}
      </SectionContainer>

      {/* 카테고리 추가 폼 */}
      {showAddCategory && (
        <SectionContainer>
          <Card className="bg-primary-50">
            <H3 className="mb-4 text-primary-800">새 카테고리 추가</H3>

            <View className="space-y-4">
              <Input
                label="카테고리 이름"
                placeholder="예: 반려동물, 취미활동 등"
                value={newCategory.name}
                onChangeText={(value) => setNewCategory(prev => ({ ...prev, name: value }))}
              />

              <View>
                <Label className="mb-2">아이콘 선택</Label>
                <View className="flex-row flex-wrap">
                  {commonIcons.map((icon) => (
                    <Button
                      key={icon}
                      title={icon}
                      variant={newCategory.icon === icon ? 'primary' : 'outline'}
                      size="sm"
                      className="mr-2 mb-2 w-12 h-12"
                      onPress={() => setNewCategory(prev => ({ ...prev, icon }))}
                    />
                  ))}
                </View>
              </View>

              <View>
                <Label className="mb-2">색상 선택</Label>
                <View className="flex-row flex-wrap">
                  {commonColors.map((color) => (
                    <Button
                      key={color}
                      title=""
                      variant={newCategory.color === color ? 'primary' : 'outline'}
                      size="sm"
                      className="mr-2 mb-2 w-8 h-8"
                      style={{ backgroundColor: color }}
                      onPress={() => setNewCategory(prev => ({ ...prev, color }))}
                    />
                  ))}
                </View>
              </View>

              <View className="flex-row space-x-3">
                <Button
                  title="취소"
                  variant="outline"
                  className="flex-1"
                  onPress={() => {
                    setShowAddCategory(false);
                    setNewCategory({ name: '', icon: '📦', color: '#6B7280' });
                  }}
                />
                <Button
                  title="추가"
                  variant="primary"
                  className="flex-1"
                  onPress={addCustomCategory}
                />
              </View>
            </View>
          </Card>
        </SectionContainer>
      )}

      {/* 안내 */}
      <SectionContainer>
        <Card className="bg-info-50">
          <H3 className="mb-2 text-info-800">💡 카테고리 관리 팁</H3>
          <View className="space-y-2">
            <BodyText className="text-info-700 text-sm">
              • 자주 사용하지 않는 카테고리는 비활성화하여 입력을 간소화하세요
            </BodyText>
            <BodyText className="text-info-700 text-sm">
              • 사용자 정의 카테고리로 개인 맞춤 분류를 만들어보세요
            </BodyText>
            <BodyText className="text-info-700 text-sm">
              • AI가 자동으로 카테고리를 분류해주므로 너무 세분화하지 마세요
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