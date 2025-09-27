import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  Animated,
  Platform,
  Vibration,
  Alert,
} from 'react-native';
import {
  voiceService,
  VoiceServiceCallbacks,
} from '../../services/voice/VoiceService';

export interface VoiceInputProps {
  onSpeechResult: (text: string) => void;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  onError?: (error: string) => void;
  placeholder?: string;
  autoSend?: boolean;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
}

export function VoiceInput({
  onSpeechResult,
  onSpeechStart,
  onSpeechEnd,
  onError,
  placeholder = '음성으로 말씀해주세요',
  autoSend = false,
  size = 'medium',
  disabled = false,
}: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);

  // 애니메이션 값들
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 크기별 스타일
  const sizeConfig = {
    small: { size: 40, iconSize: 16 },
    medium: { size: 56, iconSize: 24 },
    large: { size: 72, iconSize: 32 },
  };

  const { size: buttonSize, iconSize } = sizeConfig[size];

  useEffect(() => {
    const callbacks: VoiceServiceCallbacks = {
      onSpeechStart: handleSpeechStart,
      onSpeechEnd: handleSpeechEnd,
      onSpeechResults: handleSpeechResults,
      onSpeechPartialResults: handleSpeechPartialResults,
      onSpeechError: handleSpeechError,
      onSpeechVolumeChanged: handleVolumeChanged,
    };

    voiceService.setCallbacks(callbacks);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      voiceService.stopListening();
    };
  }, []);

  const handleSpeechStart = () => {
    setIsRecording(true);
    setIsProcessing(false);
    setRecognizedText('');
    setRecordingTime(0);

    // 녹음 시작 피드백
    if (Platform.OS === 'ios') {
      Vibration.vibrate(50);
    } else {
      Vibration.vibrate(100);
    }

    // 펄스 애니메이션 시작
    startPulseAnimation();

    // 타이머 시작
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);

    onSpeechStart?.();
  };

  const handleSpeechEnd = () => {
    setIsRecording(false);
    setIsProcessing(false);
    setAudioLevel(0);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    stopPulseAnimation();
    onSpeechEnd?.();
  };

  const handleSpeechResults = (results: string[]) => {
    if (results && results.length > 0) {
      const finalText = results[0];
      setRecognizedText(finalText);
      setIsProcessing(false);

      // 결과 전달
      onSpeechResult(finalText);

      // 성공 피드백
      if (Platform.OS === 'ios') {
        Vibration.vibrate([50, 50, 50]);
      } else {
        Vibration.vibrate([100, 100, 100]);
      }
    }
  };

  const handleSpeechPartialResults = (results: string[]) => {
    if (results && results.length > 0) {
      setRecognizedText(results[0]);
      setIsProcessing(true);
    }
  };

  const handleSpeechError = (error: string) => {
    setIsRecording(false);
    setIsProcessing(false);
    setAudioLevel(0);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    stopPulseAnimation();

    // 에러 피드백
    if (Platform.OS === 'ios') {
      Vibration.vibrate([100, 100, 100, 100]);
    } else {
      Vibration.vibrate(500);
    }

    onError?.(error);
    Alert.alert('음성 인식 오류', error);
  };

  const handleVolumeChanged = (volume: number) => {
    // 볼륨을 0-1 범위로 정규화
    const normalizedVolume = Math.max(0, Math.min(1, volume / 10));
    setAudioLevel(normalizedVolume);

    // 볼륨에 따른 파형 애니메이션
    Animated.timing(waveAnim, {
      toValue: normalizedVolume,
      duration: 100,
      useNativeDriver: false,
    }).start();
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    Animated.timing(pulseAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = async () => {
    if (disabled) return;

    if (isRecording) {
      await voiceService.stopListening();
    } else {
      const success = await voiceService.startListening();
      if (!success) {
        Alert.alert(
          '음성 인식 실패',
          '음성 인식을 시작할 수 없습니다. 마이크 권한을 확인해주세요.'
        );
      }
    }
  };

  const handleLongPress = async () => {
    if (disabled) return;

    // 길게 누르면 연속 모드로 시작
    const success = await voiceService.startListening();
    if (!success) {
      Alert.alert(
        '음성 인식 실패',
        '음성 인식을 시작할 수 없습니다. 마이크 권한을 확인해주세요.'
      );
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getButtonColor = () => {
    if (disabled) return '#E5E7EB';
    if (isRecording) return '#EF4444';
    if (isProcessing) return '#F59E0B';
    return '#7C3AED';
  };

  const getButtonText = () => {
    if (isRecording) return '🎤';
    if (isProcessing) return '⏳';
    return '🎙️';
  };

  return (
    <View className="items-center">
      {/* 인식된 텍스트 표시 */}
      {recognizedText && (
        <View className="mb-3 max-w-xs rounded-lg bg-gray-100 px-3 py-2">
          <Text className="text-center text-sm text-gray-700">
            {recognizedText}
          </Text>
        </View>
      )}

      {/* 녹음 시간 표시 */}
      {isRecording && (
        <View className="mb-2">
          <Text className="text-center font-mono text-sm text-red-500">
            {formatTime(recordingTime)}
          </Text>
        </View>
      )}

      {/* 음성 입력 버튼 */}
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
        }}
      >
        <Animated.View
          style={{
            transform: [{ scale: pulseAnim }],
          }}
        >
          <Pressable
            onPress={handlePress}
            onLongPress={handleLongPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled}
            style={{
              width: buttonSize,
              height: buttonSize,
              borderRadius: buttonSize / 2,
              backgroundColor: getButtonColor(),
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}
            accessibilityRole="button"
            accessibilityLabel={isRecording ? '녹음 중지' : '음성 입력 시작'}
            accessibilityHint={placeholder}
          >
            <Text style={{ fontSize: iconSize }}>{getButtonText()}</Text>

            {/* 음성 레벨 시각화 */}
            {isRecording && (
              <Animated.View
                style={{
                  position: 'absolute',
                  width: buttonSize + 20,
                  height: buttonSize + 20,
                  borderRadius: (buttonSize + 20) / 2,
                  borderWidth: 2,
                  borderColor: '#EF4444',
                  opacity: waveAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 0.8],
                  }),
                }}
              />
            )}
          </Pressable>
        </Animated.View>
      </Animated.View>

      {/* 상태 텍스트 */}
      <Text className="mt-2 text-xs text-gray-500">
        {isRecording
          ? '말씀하세요...'
          : isProcessing
            ? '처리 중...'
            : disabled
              ? '사용할 수 없음'
              : '탭하여 음성 입력'}
      </Text>

      {/* 도움말 텍스트 */}
      {!isRecording && !isProcessing && !disabled && (
        <Text className="mt-1 text-xs text-gray-400">
          길게 누르면 연속 입력
        </Text>
      )}
    </View>
  );
}
