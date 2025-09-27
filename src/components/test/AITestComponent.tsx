import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { pythonLLMService } from '../../services/ai/PythonLLMService';

export function AITestComponent() {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string>('');
  const [healthStatus, setHealthStatus] = useState<any>(null);

  const testAIConnection = async () => {
    setIsLoading(true);
    try {
      // 실제 Python LLM 서버 연결 테스트
      const health = await pythonLLMService.checkHealth();
      setHealthStatus(health);

      if (health.status === 'healthy' && health.model_info.model_loaded) {
        const chatResponse = await pythonLLMService.getFinancialAdvice(
          "안녕하세요! 천마비고 AI 코치님, 잘 작동하는지 확인해주세요!"
        );
        setResponse(`✅ 연결 성공!\n\n${chatResponse}`);
      } else {
        setResponse('⚠️ 서버는 연결되었지만 모델이 로드되지 않았습니다.');
      }
    } catch (error: any) {
      console.error('AI 연결 테스트 실패:', error);
      setResponse(`❌ 연결 실패: ${error.message}`);
      Alert.alert('연결 실패', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const testTransactionParsing = async () => {
    setIsLoading(true);
    try {
      const result = await pythonLLMService.parseTransaction(
        "스타벅스에서 아메리카노 4500원 카드로 결제했어"
      );

      setResponse(`💰 거래 파싱 성공!\n\n금액: ${result.amount}원\n내용: ${result.description}\n카테고리: ${result.category}\n결제수단: ${result.paymentMethod}`);
    } catch (error: any) {
      setResponse(`❌ 거래 파싱 실패: ${error.message}`);
      Alert.alert('파싱 실패', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 p-4">
      <Card className="mb-4">
        <Text className="mb-2 text-lg font-bold">🤖 EXAONE AI 연결 테스트</Text>
        <Text className="mb-4 text-gray-600">
          Python LLM 서버 (포트 8001)와 LGAI-EXAONE 3.5 7.8B 모델 연결을 테스트합니다.
        </Text>

        <View className="mb-4 flex-row" style={{ gap: 8 }}>
          <Button
            title={isLoading ? '테스트 중...' : '💬 채팅 테스트'}
            onPress={testAIConnection}
            disabled={isLoading}
            className="flex-1"
            size="sm"
          />
          <Button
            title={isLoading ? '파싱 중...' : '💰 거래 파싱'}
            onPress={testTransactionParsing}
            disabled={isLoading}
            variant="secondary"
            className="flex-1"
            size="sm"
          />
        </View>

        {healthStatus && (
          <View className="mb-4 rounded-lg bg-blue-50 p-3">
            <Text className="mb-1 text-sm font-semibold text-blue-800">서버 상태</Text>
            <Text className="text-xs text-blue-600">
              상태: {healthStatus.status} |
              모델: {healthStatus.model_info.model_loaded ? '✅ 로드됨' : '❌ 미로드'} |
              GPU: {healthStatus.model_info.cuda_devices}개
            </Text>
          </View>
        )}

        {response && (
          <View className="rounded-lg bg-gray-100 p-3">
            <Text className="mb-1 text-sm font-semibold text-gray-800">AI 응답</Text>
            <Text className="text-sm text-gray-700">{response}</Text>
          </View>
        )}
      </Card>
    </ScrollView>
  );
}
