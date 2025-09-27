import React, { useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useChatStore } from '../../stores/chatStore';
import { MessageList } from '../../components/chat/MessageList';
import { MessageInput } from '../../components/chat/MessageInput';

export function ChatScreen() {
  const {
    messages,
    inputText,
    isTyping,
    isLoading,
    error,
    setInputText,
    sendMessage,
    retryMessage,
    clearMessages,
  } = useChatStore();

  const handleSend = useCallback(async () => {
    if (inputText.trim()) {
      const message = inputText.trim();
      setInputText('');
      await sendMessage(message);
    }
  }, [inputText, sendMessage, setInputText]);

  const handleRetry = useCallback(
    async (messageId: string) => {
      await retryMessage(messageId);
    },
    [retryMessage]
  );

  const handleCopy = useCallback(async (content: string) => {
    await Clipboard.setStringAsync(content);
    Alert.alert('복사 완료', '메시지가 클립보드에 복사되었습니다.');
  }, []);

  const handleRefresh = useCallback(() => {
    // 채팅 히스토리 새로고침 로직
    console.log('Refreshing chat history...');
  }, []);

  const handleVoicePress = useCallback(async () => {
    const { voiceState, startVoiceInput } = useChatStore.getState();

    if (voiceState.isRecording) {
      await useChatStore.getState().stopVoiceInput();
    } else {
      await startVoiceInput();
    }
  }, []);

  const handleVoiceResult = useCallback((text: string) => {
    // 음성 인식 결과를 자동으로 전송
    setInputText(text);
    sendMessage(text);
  }, [sendMessage, setInputText]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
        backgroundColor="#7C3AED"
      />

      {/* 헤더 */}
      <View className="bg-primary-600 px-4 py-3 shadow-md">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="mr-3 h-8 w-8 rounded-full bg-white/20" />
            <View>
              <Text className="text-lg font-bold text-white">천마비고</Text>
              <Text className="text-sm text-white/80">
                {isTyping ? '입력 중...' : '개인 재정 AI 코치'}
              </Text>
            </View>
          </View>

          {/* 상태 표시 */}
          <View className="flex-row items-center">
            <View
              className={`mr-2 h-2 w-2 rounded-full ${
                isLoading ? 'bg-yellow-400' : 'bg-green-400'
              }`}
            />
            <Text className="text-xs text-white/80">
              {isLoading ? '처리중' : '온라인'}
            </Text>
          </View>
        </View>
      </View>

      {/* 에러 표시 */}
      {error && (
        <View className="border-l-4 border-red-400 bg-red-50 px-4 py-3">
          <Text className="text-sm text-red-700">{error}</Text>
        </View>
      )}

      {/* 메시지 리스트 */}
      <MessageList
        messages={messages}
        isTyping={isTyping}
        onRefresh={handleRefresh}
        refreshing={false}
        onRetry={handleRetry}
        onCopy={handleCopy}
      />

      {/* 메시지 입력 */}
      <MessageInput
        value={inputText}
        onChangeText={setInputText}
        onSend={handleSend}
        onVoicePress={handleVoicePress}
        isLoading={isLoading}
        placeholder="지출 내역을 말씀해주세요..."
      />
    </SafeAreaView>
  );
}
