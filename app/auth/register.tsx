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

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    // 이름 검증
    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = '이름은 2글자 이상 입력해주세요';
    }

    // 이메일 검증
    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식을 입력해주세요';
    }

    // 비밀번호 검증
    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요';
    } else if (formData.password.length < 6) {
      newErrors.password = '비밀번호는 6글자 이상 입력해주세요';
    }

    // 비밀번호 확인 검증
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호 확인을 입력해주세요';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      // 회원가입 성공시 온보딩으로 이동
      if (typeof window !== 'undefined') {
        alert('회원가입이 완료되었습니다! 초기 설정을 시작해보세요.');
      } else {
        Alert.alert('회원가입 완료', '초기 설정을 시작해보세요!');
      }

      router.replace('/onboarding/setup');
    } catch (error: any) {
      console.error('회원가입 오류:', error);

      const errorMessage = error.message || '회원가입 중 문제가 발생했습니다.';

      if (typeof window !== 'undefined') {
        alert(errorMessage);
      } else {
        Alert.alert('회원가입 실패', errorMessage);
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

  const isFormValid = formData.name.trim() &&
                     formData.email.trim() &&
                     formData.password &&
                     formData.confirmPassword &&
                     Object.keys(errors).length === 0;

  return (
    <Screen
      title="회원가입"
      subtitle="천마비고에 오신 것을 환영합니다"
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
          <View className="items-center py-6">
            <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-primary-100">
              <BodyText className="text-3xl">🏮</BodyText>
            </View>
            <H1 className="mb-2 text-center">계정 만들기</H1>
            <BodyText variant="secondary" className="text-center">
              AI와 함께하는 똑똑한 가계부 관리를 시작해보세요
            </BodyText>
          </View>
        </SectionContainer>

        {/* 회원가입 폼 */}
        <SectionContainer>
          <Card className="mb-6">
            <View className="space-y-4">
              <Input
                label="이름 *"
                placeholder="홍길동"
                value={formData.name}
                onChangeText={(value) => updateField('name', value)}
                error={errors.name}
                autoCapitalize="words"
                autoComplete="name"
              />

              <Input
                label="이메일 *"
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
                label="비밀번호 *"
                placeholder="6글자 이상 입력해주세요"
                value={formData.password}
                onChangeText={(value) => updateField('password', value)}
                error={errors.password}
                secureTextEntry={true}
                autoComplete="new-password"
              />

              <Input
                label="비밀번호 확인 *"
                placeholder="비밀번호를 다시 입력해주세요"
                value={formData.confirmPassword}
                onChangeText={(value) => updateField('confirmPassword', value)}
                error={errors.confirmPassword}
                secureTextEntry={true}
                autoComplete="new-password"
              />
            </View>
          </Card>

          {/* 이용약관 안내 */}
          <Card className="bg-info-50 mb-6">
            <View className="flex-row items-start space-x-3">
              <View className="bg-info mt-1 h-2 w-2 rounded-full" />
              <BodyText className="text-info-700 flex-1 text-sm">
                회원가입을 진행하면 서비스 이용약관 및 개인정보처리방침에 동의하는 것으로 간주됩니다.
              </BodyText>
            </View>
          </Card>
        </SectionContainer>

        {/* 버튼 영역 */}
        <SectionContainer>
          <View className="space-y-3">
            <Button
              title={isLoading ? "회원가입 중..." : "회원가입"}
              variant="primary"
              size="lg"
              onPress={handleRegister}
              disabled={!isFormValid || isLoading}
            />

            <Button
              title="이미 계정이 있어요"
              variant="outline"
              size="lg"
              onPress={() => router.replace('/auth/login')}
              disabled={isLoading}
            />
          </View>
        </SectionContainer>

        {/* 개인정보 보호 안내 */}
        <View className="pb-6 pt-4">
          <BodyText className="text-center text-xs text-gray-500">
            입력하신 정보는 암호화되어 안전하게 보호됩니다.
          </BodyText>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}