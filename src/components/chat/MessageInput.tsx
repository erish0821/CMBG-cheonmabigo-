import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Platform,
  Keyboard,
  KeyboardAvoidingView,
  Animated,
} from 'react-native';
import { MessageInputProps } from '../../types/chat';
import { VoiceInput } from '../voice/VoiceInput';

// 간단한 아이콘 컴포넌트들 (웹 호환성 개선)
const SendIcon = ({ color = '#7C3AED', size = 24 }) => (
  <View
    style={{
      width: size,
      height: size,
      backgroundColor: color,
      borderRadius: size / 2,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <Text style={{ color: 'white', fontSize: size * 0.4, fontWeight: 'bold' }}>
      →
    </Text>
  </View>
);

const VoiceIcon = ({ color = '#6B7280', size = 24 }) => (
  <View
    style={{
      width: size,
      height: size,
      backgroundColor: color,
      borderRadius: 4,
      opacity: 0.7,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <Text style={{ color: 'white', fontSize: size * 0.4 }}>🎤</Text>
  </View>
);

export function MessageInput({
  value,
  onChangeText,
  onSend,
  onVoicePress,
  isLoading = false,
  placeholder = '메시지를 입력하세요...',
}: MessageInputProps) {
  const [inputHeight, setInputHeight] = useState(44);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleSend = () => {
    if (value.trim() && !isLoading) {
      onSend();
      Keyboard.dismiss();
    }
  };

  const handleVoicePress = () => {
    if (onVoicePress) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      onVoicePress();
    }
  };

  const canSend = value.trim().length > 0 && !isLoading;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View className="border-t border-gray-100 bg-white px-4 py-3">
        <View className="flex-row items-end" style={{ gap: 12 }}>
          {/* 음성 입력 컴포넌트 */}
          {onVoicePress && (
            <VoiceInput
              onSpeechResult={text => {
                onChangeText(text);
                if (text.trim()) {
                  setTimeout(() => handleSend(), 100);
                }
              }}
              onError={error => {
                console.error('Voice input error:', error);
              }}
              size="small"
              disabled={isLoading}
              placeholder="음성으로 지출 내역을 말씀해주세요"
            />
          )}

          {/* 텍스트 입력 영역 */}
          <View className="relative flex-1">
            <TextInput
              ref={inputRef}
              value={value}
              onChangeText={onChangeText}
              placeholder={placeholder}
              placeholderTextColor="#9CA3AF"
              multiline
              maxLength={500}
              style={{
                height: Math.max(44, inputHeight),
                maxHeight: 120,
              }}
              onContentSizeChange={event => {
                setInputHeight(event.nativeEvent.contentSize.height);
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className={`
                rounded-2xl bg-gray-50 px-4 py-3 text-base text-gray-800
                ${isFocused ? 'border-2 border-primary-500' : 'border border-gray-200'}
              `}
              textAlignVertical="top"
              scrollEnabled={false}
              returnKeyType="send"
              onSubmitEditing={handleSend}
              blurOnSubmit={false}
              editable={!isLoading}
            />

            {/* 문자 수 표시 */}
            {value.length > 400 && (
              <View className="absolute -top-6 right-2">
                <View className="rounded bg-gray-800 px-2 py-1">
                  <Text className="text-xs text-white">{value.length}/500</Text>
                </View>
              </View>
            )}
          </View>

          {/* 전송 버튼 */}
          <Pressable
            onPress={handleSend}
            disabled={!canSend}
            accessibilityRole="button"
            accessibilityLabel="메시지 전송"
            style={[
              {
                height: 44,
                width: 44,
                borderRadius: 22,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              } as any,
              Platform.OS === 'web' && {
                cursor: canSend ? 'pointer' : 'not-allowed',
              },
              canSend
                ? {
                    backgroundColor: '#7C3AED',
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                  }
                : { backgroundColor: '#E5E7EB' },
            ]}
          >
            <SendIcon color={canSend ? '#FFFFFF' : '#9CA3AF'} size={20} />
          </Pressable>
        </View>

        {/* 로딩 상태 표시 */}
        {isLoading && (
          <View className="mt-2 flex-row items-center px-2">
            <View className="mr-2 h-2 w-2 animate-pulse rounded-full bg-primary-500" />
            <Text className="text-sm text-primary-500">
              AI가 응답을 생성 중입니다...
            </Text>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
