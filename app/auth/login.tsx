import React, { useState } from 'react';
import { View, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Screen,
  SectionContainer,
} from '../../src/components/layout';
import {
  H1,
  BodyText,
} from '../../src/components/ui/Typography';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { useAuthStore } from '../../src/stores/authStore';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    // 이메일 검증
    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식을 입력해주세요';
    }

    // 비밀번호 검증
    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await login({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      // 로그인 성공시 메인 화면으로 이동
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('로그인 오류:', error);

      const errorMessage = error.message || '로그인 중 문제가 발생했습니다.';

      if (typeof window !== 'undefined') {
        alert(errorMessage);
      } else {
        Alert.alert('로그인 실패', errorMessage);
      }
    }
  };

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // 에러 메시지 초기화
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const isFormValid = formData.email.trim() &&
                     formData.password &&
                     Object.keys(errors).length === 0;

  return (
    <Screen
      title="로그인"
      subtitle="다시 오신 것을 환영합니다"
      safeArea={true}
      scrollable={true}
      padding="md"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* 환영 메시지 */}
        <SectionContainer>
          <View className="items-center py-8">
            <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-primary-100">
              <BodyText className="text-3xl">🏮</BodyText>
            </View>
            <H1 className="mb-2 text-center">로그인</H1>
            <BodyText variant="secondary" className="text-center">
              천마비고에 다시 오신 것을 환영합니다
            </BodyText>
          </View>
        </SectionContainer>

        {/* 로그인 폼 */}
        <SectionContainer>
          <Card className="mb-6">
            <View className="space-y-4">
              <Input
                label="이메일"
                placeholder="example@email.com"
                value={formData.email}
                onChangeText={(value) => updateField('email', value)}
                error={errors.email}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
              />

              <Input
                label="비밀번호"
                placeholder="비밀번호를 입력해주세요"
                value={formData.password}
                onChangeText={(value) => updateField('password', value)}
                error={errors.password}
                secureTextEntry={true}
                autoComplete="current-password"
              />
            </View>
          </Card>
        </SectionContainer>

        {/* 버튼 영역 */}
        <SectionContainer>
          <View className="space-y-3">
            <Button
              title={isLoading ? "로그인 중..." : "로그인"}
              variant="primary"
              size="lg"
              onPress={handleLogin}
              disabled={!isFormValid || isLoading}
            />

            <Button
              title="계정 만들기"
              variant="outline"
              size="lg"
              onPress={() => router.replace('/auth/register')}
              disabled={isLoading}
            />
          </View>
        </SectionContainer>

        {/* 도움말 */}
        <SectionContainer>
          <Card className="bg-gray-50">
            <View className="py-4">
              <BodyText className="text-center text-gray-600 mb-2">
                계정이 기억나지 않으시나요?
              </BodyText>
              <Button
                title="비밀번호 찾기"
                variant="outline"
                size="sm"
                onPress={() => {
                  if (typeof window !== 'undefined') {
                    alert('비밀번호 찾기 기능은 향후 추가될 예정입니다.');
                  } else {
                    Alert.alert('비밀번호 찾기', '향후 추가될 예정입니다.');
                  }
                }}
              />
            </View>
          </Card>
        </SectionContainer>

        {/* 개인정보 보호 안내 */}
        <View className="pb-6 pt-4">
          <BodyText className="text-center text-xs text-gray-500">
            로그인 정보는 암호화되어 안전하게 전송됩니다.
          </BodyText>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}