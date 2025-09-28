import React from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
} from 'react-native';
import { MessageInputProps } from '../../types/chat';

export function MessageInput({
  value,
  onChangeText,
  onSend,
  onVoicePress,
  isLoading = false,
  placeholder = '메시지를 입력하세요...',
}: MessageInputProps) {
  const canSend = value.trim().length > 0 && !isLoading;

  const handleSend = () => {
    if (canSend) {
      onSend();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <Pressable onPress={onVoicePress} style={styles.voiceButton}>
          <Text style={styles.buttonText}>🎤</Text>
        </Pressable>

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          style={styles.textInput}
          placeholderTextColor="#9CA3AF"
        />

        <Pressable
          onPress={handleSend}
          disabled={!canSend}
          style={[styles.sendButton, { backgroundColor: canSend ? '#7C3AED' : '#E5E7EB' }]}
        >
          <Text style={styles.buttonText}>→</Text>
        </Pressable>
      </View>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <View style={styles.loadingDot} />
          <Text style={styles.loadingText}>AI가 응답을 생성 중입니다...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingBottom: 100, // 하단 탭바(88px + 여백)를 위한 충분한 여백
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  voiceButton: {
    width: 44,
    height: 44,
    backgroundColor: '#7C3AED',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  textInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 22,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    fontSize: 16,
    color: '#1F2937',
  },
  loadingContainer: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  loadingDot: {
    marginRight: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#7C3AED',
  },
  loadingText: {
    fontSize: 14,
    color: '#7C3AED',
  },
});