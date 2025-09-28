import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
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

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'basic' | 'ai' | 'budget' | 'data' | 'account';
}

export default function HelpScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('basic');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const categories = [
    { id: 'basic', name: '기본 사용법', icon: '📱' },
    { id: 'ai', name: 'AI 코치', icon: '🤖' },
    { id: 'budget', name: '예산 관리', icon: '💰' },
    { id: 'data', name: '데이터 관리', icon: '📊' },
    { id: 'account', name: '계정 관리', icon: '👤' },
  ];

  const faqs: FAQItem[] = [
    // 기본 사용법
    {
      id: '1',
      category: 'basic',
      question: '천마비고란 무엇인가요?',
      answer: '천마비고는 AI와 대화하듯 가계부를 관리할 수 있는 똑똑한 개인 재정 관리 앱입니다. 복잡한 입력 없이 "김치찌개 8천원 먹었어"라고 말하면 자동으로 기록됩니다.',
    },
    {
      id: '2',
      category: 'basic',
      question: '지출을 어떻게 기록하나요?',
      answer: '채팅 화면에서 음성이나 텍스트로 자연스럽게 말씀해주세요. "점심으로 파스타 15000원", "스타벅스에서 아메리카노 4500원" 같이 말하면 AI가 자동으로 분류해서 기록합니다.',
    },
    {
      id: '3',
      category: 'basic',
      question: '음성 입력이 잘 안돼요.',
      answer: '설정에서 마이크 권한을 확인해주세요. 조용한 곳에서 명확하게 발음하시면 더 정확하게 인식됩니다. 한국어로만 지원됩니다.',
    },

    // AI 코치
    {
      id: '4',
      category: 'ai',
      question: 'AI 코치가 어떤 조언을 해주나요?',
      answer: 'AI 코치는 지출 패턴을 분석해서 절약 방법, 예산 조정, 저축 목표 달성 방법 등을 개인 맞춤형으로 조언해드립니다. 예를 들어 "이번 주 카페비가 평소보다 40% 높아요"같은 분석을 제공합니다.',
    },
    {
      id: '5',
      category: 'ai',
      question: 'AI가 잘못 분류했을 때는?',
      answer: '채팅에서 "방금 기록한 건 교통비가 아니라 식비야"라고 말씀해주시면 수정됩니다. AI가 학습해서 다음번엔 더 정확하게 분류합니다.',
    },

    // 예산 관리
    {
      id: '6',
      category: 'budget',
      question: '예산은 어떻게 설정하나요?',
      answer: '설정 > 예산 설정에서 월 수입과 월 예산을 입력하세요. 카테고리별 세부 예산도 설정할 수 있습니다. AI가 예산 대비 지출을 실시간으로 모니터링해드립니다.',
    },
    {
      id: '7',
      category: 'budget',
      question: '저축 목표는 어떻게 관리하나요?',
      answer: '온보딩에서 설정한 목표를 기준으로 AI가 달성률을 추적합니다. 목표 수정은 프로필 관리에서 가능하고, AI가 달성을 위한 맞춤 조언을 제공합니다.',
    },

    // 데이터 관리
    {
      id: '8',
      category: 'data',
      question: '내 데이터는 안전한가요?',
      answer: '모든 데이터는 암호화되어 저장되며, 개인정보보호정책에 따라 엄격하게 관리됩니다. 데이터는 AI 분석에만 사용되고 외부에 공유되지 않습니다.',
    },
    {
      id: '9',
      category: 'data',
      question: '데이터를 내보낼 수 있나요?',
      answer: '설정 > 데이터 관리에서 거래 내역을 CSV 파일로 내보낼 수 있습니다. 다른 가계부 앱으로 이전하거나 개인 분석용으로 활용 가능합니다.',
    },

    // 계정 관리
    {
      id: '10',
      category: 'account',
      question: '비밀번호를 변경하고 싶어요.',
      answer: '현재는 이메일을 통한 비밀번호 재설정만 지원됩니다. 로그인 화면에서 "비밀번호 찾기"를 눌러주세요. 앱 내 비밀번호 변경 기능은 곧 업데이트 예정입니다.',
    },
    {
      id: '11',
      category: 'account',
      question: '계정을 삭제하고 싶어요.',
      answer: '계정 삭제는 문의하기를 통해 요청해주세요. 삭제 시 모든 데이터가 영구 삭제되며 복구가 불가능합니다.',
    },
  ];

  const filteredFAQs = faqs.filter(faq => faq.category === selectedCategory);

  const toggleFAQ = (faqId: string) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  return (
    <Screen
      title="도움말"
      subtitle="천마비고 사용법과 FAQ를 확인하세요"
      safeArea={true}
      scrollable={true}

    >
      {/* 빠른 시작 가이드 */}
      <SectionContainer>
        <H2 className="mb-4">빠른 시작 가이드</H2>

        <Card className="mb-4">
          <H3 className="mb-3 text-primary-600">🚀 3분 만에 시작하기</H3>
          <View className="space-y-3">
            <View className="flex-row">
              <BodyText className="text-primary-600 font-bold mr-3">1.</BodyText>
              <BodyText className="flex-1">
                <BodyText className="font-medium">프로필 설정</BodyText>: 설정에서 기본 정보와 예산을 입력하세요
              </BodyText>
            </View>
            <View className="flex-row">
              <BodyText className="text-primary-600 font-bold mr-3">2.</BodyText>
              <BodyText className="flex-1">
                <BodyText className="font-medium">첫 지출 기록</BodyText>: "점심 김치찌개 8천원"이라고 말해보세요
              </BodyText>
            </View>
            <View className="flex-row">
              <BodyText className="text-primary-600 font-bold mr-3">3.</BodyText>
              <BodyText className="flex-1">
                <BodyText className="font-medium">AI 조언 받기</BodyText>: "지출 분석해줘"라고 물어보세요
              </BodyText>
            </View>
          </View>
        </Card>

        <Card className="bg-success-50">
          <View className="flex-row items-center mb-2">
            <BodyText className="text-success-600 text-lg mr-2">💡</BodyText>
            <H3 className="text-success-800">음성 입력 팁</H3>
          </View>
          <BodyText className="text-success-700 text-sm">
            "아메리카노 4500원", "지하철 1500원", "마트에서 장보기 35000원" 처럼 자연스럽게 말하면
            AI가 알아서 분류해서 기록합니다.
          </BodyText>
        </Card>
      </SectionContainer>

      {/* FAQ 카테고리 */}
      <SectionContainer>
        <H2 className="mb-4">자주 묻는 질문</H2>

        <View className="flex-row flex-wrap mb-4">
          {categories.map((category) => (
            <Button
              key={category.id}
              title={`${category.icon} ${category.name}`}
              variant={selectedCategory === category.id ? 'primary' : 'outline'}
              size="sm"
              className="mr-2 mb-2"
              onPress={() => setSelectedCategory(category.id)}
            />
          ))}
        </View>

        {/* FAQ 목록 */}
        {filteredFAQs.map((faq) => (
          <Card key={faq.id} className="mb-3">
            <Button
              title={faq.question}
              variant="outline"
              className="w-full text-left"
              onPress={() => toggleFAQ(faq.id)}
            />
            {expandedFAQ === faq.id && (
              <View className="mt-3 pt-3 border-t border-gray-200">
                <BodyText className="text-gray-700 leading-6">
                  {faq.answer}
                </BodyText>
              </View>
            )}
          </Card>
        ))}
      </SectionContainer>

      {/* 연락처 */}
      <SectionContainer>
        <H2 className="mb-4">문제가 해결되지 않았나요?</H2>

        <Card className="bg-primary-50">
          <View className="items-center py-4">
            <BodyText className="text-primary-600 text-3xl mb-2">💬</BodyText>
            <H3 className="text-primary-800 mb-2">추가 도움이 필요하세요?</H3>
            <BodyText className="text-primary-700 text-center mb-4">
              개발팀에 직접 문의하시면 빠르게 도움드리겠습니다
            </BodyText>
            <Button
              title="문의하기"
              variant="primary"
              onPress={() => router.push('/settings/contact')}
            />
          </View>
        </Card>
      </SectionContainer>

      {/* 업데이트 정보 */}
      <SectionContainer>
        <Card className="bg-gray-50">
          <H3 className="mb-2 text-gray-800">📱 최신 업데이트</H3>
          <BodyText className="text-gray-600 text-sm mb-2">
            버전 1.0.0 - 2024년 3월
          </BodyText>
          <BodyText className="text-gray-600 text-sm">
            • AI 음성 인식 정확도 개선
            • 새로운 카테고리 자동 분류 기능
            • 예산 알림 기능 추가
          </BodyText>
        </Card>
      </SectionContainer>
    </Screen>
  );
}