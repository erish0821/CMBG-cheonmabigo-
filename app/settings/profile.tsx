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

export default function ProfileScreen() {
  const router = useRouter();
  const { user, updateProfile, isLoading } = useAuthStore();

  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    birth_date: '',
    gender: '',
    occupation: '',
    income: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // 사용자 정보 로드
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone_number: user.phone_number || '',
        birth_date: user.birth_date || '',
        gender: user.gender || '',
        occupation: user.preferences?.profile?.occupation || '',
        income: user.preferences?.budget?.monthlyIncome || '',
      });
    }
  }, [user]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요';
    }

    if (formData.phone_number && !/^010-?\d{4}-?\d{4}$/.test(formData.phone_number.replace(/[^0-9]/g, ''))) {
      newErrors.phone_number = '올바른 전화번호를 입력해주세요 (010-1234-5678)';
    }

    if (formData.birth_date && !/^\d{4}-\d{2}-\d{2}$/.test(formData.birth_date)) {
      newErrors.birth_date = '생년월일을 올바른 형식으로 입력해주세요 (YYYY-MM-DD)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/[^0-9]/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  const formatBirthDate = (value: string) => {
    const numbers = value.replace(/[^0-9]/g, '');
    if (numbers.length <= 4) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 4)}-${numbers.slice(4)}`;
    return `${numbers.slice(0, 4)}-${numbers.slice(4, 6)}-${numbers.slice(6, 8)}`;
  };

  const formatIncome = (value: string) => {
    const numbers = value.replace(/[^0-9]/g, '');
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const updateData = {
        name: formData.name.trim(),
        phone_number: formData.phone_number || undefined,
        birth_date: formData.birth_date || undefined,
        gender: formData.gender as 'male' | 'female' | 'other' || undefined,
        preferences: {
          ...user?.preferences,
          profile: {
            ...user?.preferences?.profile,
            occupation: formData.occupation || null,
          },
          budget: {
            ...user?.preferences?.budget,
            monthlyIncome: formData.income.replace(/,/g, '') || null,
          },
        },
      };

      await updateProfile(updateData);

      // 성공 메시지
      if (typeof window !== 'undefined') {
        alert('프로필이 성공적으로 업데이트되었습니다!');
      } else {
        Alert.alert('성공', '프로필이 성공적으로 업데이트되었습니다!');
      }

      router.back();
    } catch (error: any) {
      console.error('프로필 업데이트 오류:', error);

      if (typeof window !== 'undefined') {
        alert('프로필 업데이트에 실패했습니다. 다시 시도해주세요.');
      } else {
        Alert.alert('오류', '프로필 업데이트에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };

  return (
    <Screen
      title="프로필 관리"
      subtitle="개인정보를 수정하고 관리하세요"
      safeArea={true}
      scrollable={true}

    >
      {/* 기본 정보 */}
      <SectionContainer>
        <H2 className="mb-4">기본 정보</H2>

        <Card className="mb-4">
          <View className="space-y-4">
            <Input
              label="이름 *"
              placeholder="홍길동"
              value={formData.name}
              onChangeText={(value) => setFormData(prev => ({ ...prev, name: value }))}
              error={errors.name}
            />

            <Input
              label="전화번호"
              placeholder="010-1234-5678"
              value={formData.phone_number}
              onChangeText={(value) => {
                const formatted = formatPhoneNumber(value);
                setFormData(prev => ({ ...prev, phone_number: formatted }));
              }}
              keyboardType="phone-pad"
              error={errors.phone_number}
            />

            <Input
              label="생년월일"
              placeholder="1990-01-01"
              value={formData.birth_date}
              onChangeText={(value) => {
                const formatted = formatBirthDate(value);
                setFormData(prev => ({ ...prev, birth_date: formatted }));
              }}
              keyboardType="numeric"
              error={errors.birth_date}
            />

            <View>
              <Label className="mb-2">성별</Label>
              <View className="flex-row space-x-3">
                {[
                  { key: 'male', label: '남성' },
                  { key: 'female', label: '여성' },
                  { key: 'other', label: '기타' },
                ].map((option) => (
                  <Button
                    key={option.key}
                    title={option.label}
                    variant={formData.gender === option.key ? 'primary' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onPress={() => setFormData(prev => ({
                      ...prev,
                      gender: prev.gender === option.key ? '' : option.key
                    }))}
                  />
                ))}
              </View>
            </View>
          </View>
        </Card>
      </SectionContainer>

      {/* 추가 정보 */}
      <SectionContainer>
        <H2 className="mb-4">추가 정보</H2>

        <Card className="mb-4">
          <View className="space-y-4">
            <Input
              label="직업"
              placeholder="직장인, 학생, 자영업 등"
              value={formData.occupation}
              onChangeText={(value) => setFormData(prev => ({ ...prev, occupation: value }))}
            />

            <Input
              label="월 수입 (원)"
              placeholder="0"
              value={formData.income}
              onChangeText={(value) => {
                const formatted = formatIncome(value);
                setFormData(prev => ({ ...prev, income: formatted }));
              }}
              keyboardType="numeric"
            />
          </View>
        </Card>

        <Card className="bg-info-50">
          <View className="flex-row items-start space-x-3">
            <View className="bg-info mt-1 h-2 w-2 rounded-full" />
            <BodyText className="text-info-700 flex-1">
              입력하신 정보는 더 정확한 AI 분석과 맞춤형 조언을 위해 사용됩니다.
              개인정보는 안전하게 보호되며, 원하지 않으시면 입력하지 않으셔도 됩니다.
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