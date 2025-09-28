import React, { useState } from 'react';
import { View, ScrollView, Alert, Linking } from 'react-native';
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

interface ContactFormData {
  category: string;
  subject: string;
  message: string;
  email: string;
}

export default function ContactScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<ContactFormData>({
    category: '',
    subject: '',
    message: '',
    email: user?.email || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = [
    { id: 'bug', name: '버그 신고', icon: '🐛', description: '앱 오류나 문제점 신고' },
    { id: 'feature', name: '기능 제안', icon: '💡', description: '새로운 기능 아이디어 제안' },
    { id: 'account', name: '계정 문제', icon: '👤', description: '로그인, 회원가입 관련 문의' },
    { id: 'ai', name: 'AI 관련', icon: '🤖', description: 'AI 분석이나 추천 관련 문의' },
    { id: 'data', name: '데이터 문제', icon: '📊', description: '데이터 동기화, 백업 관련' },
    { id: 'other', name: '기타', icon: '📋', description: '그 외 문의사항' },
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.category) {
      newErrors.category = '문의 유형을 선택해주세요';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = '제목을 입력해주세요';
    }

    if (!formData.message.trim()) {
      newErrors.message = '문의 내용을 입력해주세요';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = '문의 내용을 최소 10자 이상 입력해주세요';
    }

    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: 실제 API 구현 시 여기에 문의 접수 API 호출
      // await contactService.submitInquiry(formData);

      // 임시로 이메일 클라이언트 열기
      const selectedCategory = categories.find(cat => cat.id === formData.category);
      const emailSubject = `[천마비고] ${selectedCategory?.name} - ${formData.subject}`;
      const emailBody = `문의 유형: ${selectedCategory?.name}\n\n${formData.message}\n\n보낸 사람: ${formData.email}`;

      const emailUrl = `mailto:support@cheonmabigo.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

      const canOpen = await Linking.canOpenURL(emailUrl);
      if (canOpen) {
        await Linking.openURL(emailUrl);
      } else {
        throw new Error('이메일 앱을 열 수 없습니다');
      }

      // 성공 메시지
      if (typeof window !== 'undefined') {
        alert('문의가 접수되었습니다. 빠른 시일 내에 답변드리겠습니다.');
      } else {
        Alert.alert(
          '문의 접수 완료',
          '문의가 접수되었습니다. 빠른 시일 내에 답변드리겠습니다.',
          [{ text: '확인', onPress: () => router.back() }]
        );
      }

      // 폼 초기화
      setFormData({
        category: '',
        subject: '',
        message: '',
        email: user?.email || '',
      });

    } catch (error: any) {
      console.error('문의 접수 오류:', error);

      if (typeof window !== 'undefined') {
        alert('문의 접수에 실패했습니다. 다시 시도해주세요.');
      } else {
        Alert.alert('오류', '문의 접수에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEmail = () => {
    Linking.openURL('mailto:support@cheonmabigo.com');
  };

  const openKakaoTalk = () => {
    // 카카오톡 오픈채팅 링크 (실제 구현 시 실제 링크로 교체)
    Linking.openURL('https://open.kakao.com/o/cheonmabigo');
  };

  return (
    <Screen
      title="문의하기"
      subtitle="개발팀에 문의하고 피드백을 보내주세요"
      safeArea={true}
      scrollable={true}

    >
      {/* 빠른 연락 방법 */}
      <SectionContainer>
        <H2 className="mb-4">빠른 연락 방법</H2>

        <View className="flex-row space-x-3 mb-4">
          <Card className="flex-1" onPress={openEmail}>
            <View className="items-center py-4">
              <BodyText className="text-2xl mb-2">📧</BodyText>
              <H3 className="text-center mb-1">이메일</H3>
              <BodyText className="text-sm text-gray-600 text-center">
                support@cheonmabigo.com
              </BodyText>
            </View>
          </Card>

          <Card className="flex-1" onPress={openKakaoTalk}>
            <View className="items-center py-4">
              <BodyText className="text-2xl mb-2">💬</BodyText>
              <H3 className="text-center mb-1">카카오톡</H3>
              <BodyText className="text-sm text-gray-600 text-center">
                오픈채팅
              </BodyText>
            </View>
          </Card>
        </View>

        <Card className="bg-info-50">
          <BodyText className="text-info-700 text-sm">
            급한 문의는 이메일이나 카카오톡으로 직접 연락주세요.
            평일 기준 24시간 내 답변드립니다.
          </BodyText>
        </Card>
      </SectionContainer>

      {/* 문의 폼 */}
      <SectionContainer>
        <H2 className="mb-4">상세 문의하기</H2>

        <Card className="mb-4">
          <View className="space-y-4">
            {/* 문의 유형 */}
            <View>
              <Label className="mb-2">문의 유형 *</Label>
              <View className="grid grid-cols-2 gap-2">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    title={`${category.icon} ${category.name}`}
                    variant={formData.category === category.id ? 'primary' : 'outline'}
                    size="sm"
                    className="mb-2"
                    onPress={() => setFormData(prev => ({ ...prev, category: category.id }))}
                  />
                ))}
              </View>
              {errors.category && (
                <BodyText className="text-error text-sm mt-1">{errors.category}</BodyText>
              )}
            </View>

            {/* 제목 */}
            <Input
              label="제목 *"
              placeholder="문의 제목을 간단히 입력해주세요"
              value={formData.subject}
              onChangeText={(value) => setFormData(prev => ({ ...prev, subject: value }))}
              error={errors.subject}
            />

            {/* 이메일 */}
            <Input
              label="답변 받을 이메일 *"
              placeholder="이메일 주소"
              value={formData.email}
              onChangeText={(value) => setFormData(prev => ({ ...prev, email: value }))}
              keyboardType="email-address"
              error={errors.email}
            />

            {/* 문의 내용 */}
            <View>
              <Label className="mb-2">문의 내용 *</Label>
              <View className="border border-gray-300 rounded-lg p-3 min-h-32">
                <Input
                  placeholder="문의 내용을 자세히 입력해주세요&#10;&#10;• 문제가 발생한 상황&#10;• 에러 메시지 (있다면)&#10;• 사용 중인 기기 정보&#10;• 기타 참고사항"
                  value={formData.message}
                  onChangeText={(value) => setFormData(prev => ({ ...prev, message: value }))}
                  multiline={true}
                  style={{ minHeight: 100 }}
                />
              </View>
              {errors.message && (
                <BodyText className="text-error text-sm mt-1">{errors.message}</BodyText>
              )}
              <BodyText className="text-gray-500 text-sm mt-1">
                {formData.message.length}/1000자
              </BodyText>
            </View>
          </View>
        </Card>

        {/* 선택된 카테고리 정보 */}
        {formData.category && (
          <Card className="bg-primary-50 mb-4">
            {(() => {
              const selectedCategory = categories.find(cat => cat.id === formData.category);
              return selectedCategory && (
                <View>
                  <H3 className="text-primary-800 mb-1">
                    {selectedCategory.icon} {selectedCategory.name}
                  </H3>
                  <BodyText className="text-primary-700 text-sm">
                    {selectedCategory.description}
                  </BodyText>
                </View>
              );
            })()}
          </Card>
        )}
      </SectionContainer>

      {/* 개인정보 처리 동의 */}
      <SectionContainer>
        <Card className="bg-gray-50">
          <H3 className="mb-2 text-gray-800">개인정보 처리 안내</H3>
          <BodyText className="text-gray-600 text-sm mb-2">
            문의 처리를 위해 다음 정보가 수집됩니다:
          </BodyText>
          <BodyText className="text-gray-600 text-sm">
            • 이메일 주소, 문의 내용, 처리 과정에서 생성되는 정보
            • 수집된 정보는 문의 답변 목적으로만 사용됩니다
            • 문의 처리 완료 후 1년간 보관 후 자동 삭제됩니다
          </BodyText>
        </Card>
      </SectionContainer>

      {/* 전송 버튼 */}
      <SectionContainer>
        <View className="flex-row space-x-3">
          <Button
            title="취소"
            variant="outline"
            className="flex-1"
            onPress={() => router.back()}
            disabled={isSubmitting}
          />
          <Button
            title={isSubmitting ? "전송 중..." : "문의 전송"}
            variant="primary"
            className="flex-1"
            onPress={handleSubmit}
            disabled={isSubmitting}
          />
        </View>
      </SectionContainer>

      {/* 응답 시간 안내 */}
      <SectionContainer>
        <Card className="bg-success-50">
          <View className="items-center py-4">
            <BodyText className="text-success-600 text-2xl mb-2">⏰</BodyText>
            <H3 className="text-success-800 mb-2">응답 시간 안내</H3>
            <BodyText className="text-success-700 text-center text-sm">
              평일 오전 9시 ~ 오후 6시 기준 24시간 내 답변드립니다.
              주말 및 공휴일 문의는 다음 영업일에 순차적으로 처리됩니다.
            </BodyText>
          </View>
        </Card>
      </SectionContainer>
    </Screen>
  );
}