import React from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { MessageBubbleProps } from '../../types/chat';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { SogyoAvatar } from '../ui/SogyoAvatar';

export function MessageBubble({
  message,
  onRetry,
  onCopy,
}: MessageBubbleProps) {
  const isUser = message.sender === 'user';

  const handleLongPress = () => {
    Alert.alert('메시지 옵션', '어떤 작업을 하시겠습니까?', [
      {
        text: '복사',
        onPress: () => onCopy?.(message.content),
      },
      ...(message.status === 'error' && onRetry
        ? [
            {
              text: '다시 전송',
              onPress: () => onRetry(message.id),
            },
          ]
        : []),
      {
        text: '취소',
        style: 'cancel',
      },
    ]);
  };

  const renderMessageContent = () => {
    switch (message.type) {
      case 'transaction':
        return (
          <View>
            <Text
              className={`${isUser ? 'text-white' : 'text-gray-800'} text-base`}
            >
              {message.content}
            </Text>
            {message.metadata?.transaction && (
              <View
                className={`mt-2 rounded-lg p-3 ${isUser ? 'bg-white/20' : 'bg-gray-50'}`}
              >
                <Text
                  className={`${isUser ? 'text-white/90' : 'text-gray-600'} text-sm font-medium`}
                >
                  거래 정보
                </Text>
                <Text
                  className={`${isUser ? 'text-white' : 'text-gray-800'} text-base font-bold`}
                >
                  {message.metadata.transaction.amount.toLocaleString()}원
                </Text>
                <Text
                  className={`${isUser ? 'text-white/80' : 'text-gray-600'} text-sm`}
                >
                  {message.metadata.transaction.category}
                  {message.metadata.transaction.location &&
                    ` • ${message.metadata.transaction.location}`}
                </Text>
              </View>
            )}
          </View>
        );

      case 'advice':
        return (
          <View>
            <Text
              className={`${isUser ? 'text-white' : 'text-gray-800'} mb-3 text-base`}
            >
              {message.content}
            </Text>
            {message.metadata?.advice?.suggestions && (
              <View
                className={`mt-2 rounded-lg p-3 ${isUser ? 'bg-white/20' : 'bg-gray-50'}`}
              >
                <Text
                  className={`${isUser ? 'text-white/90' : 'text-gray-600'} mb-2 text-sm font-medium`}
                >
                  추천 사항
                </Text>
                {message.metadata.advice.suggestions.map(
                  (suggestion, index) => (
                    <Text
                      key={index}
                      className={`${isUser ? 'text-white/80' : 'text-gray-700'} mb-1 text-sm`}
                    >
                      • {suggestion}
                    </Text>
                  )
                )}
              </View>
            )}
          </View>
        );

      default:
        return (
          <Text
            className={`${isUser ? 'text-white' : 'text-gray-800'} text-base leading-6`}
          >
            {message.content}
          </Text>
        );
    }
  };

  const getStatusIndicator = () => {
    switch (message.status) {
      case 'sending':
        return (
          <View className="mt-1 flex-row items-center">
            <View className="mr-1 h-2 w-2 animate-pulse rounded-full bg-white/60" />
            <Text className="text-xs text-white/60">전송 중...</Text>
          </View>
        );
      case 'error':
        return (
          <View className="mt-1 flex-row items-center">
            <View className="mr-1 h-2 w-2 rounded-full bg-red-400" />
            <Text className="text-xs text-red-400">전송 실패</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View className={`mb-4 ${isUser ? 'items-end' : 'items-start'}`}>
      <View className={`flex-row items-end ${isUser ? 'flex-row-reverse' : ''}`}>
        {/* AI 메시지에만 소교 아바타 표시 */}
        {!isUser && (
          <SogyoAvatar 
            size={32} 
            style={{ marginRight: 8, marginBottom: 4 }}
          />
        )}
        
        <View className="flex-1 max-w-[75%]">
          <Pressable
            onLongPress={handleLongPress}
            className={`
              rounded-2xl px-4 py-3
              ${
                isUser
                  ? 'rounded-br-md'
                  : 'rounded-bl-md border border-gray-100 bg-white'
              }
            `}
            style={{
              backgroundColor: isUser ? '#7C3AED' : '#FFFFFF',
            }}
          >
            {renderMessageContent()}

            {isUser && getStatusIndicator()}
          </Pressable>

          <Text
            className={`mt-1 text-xs text-gray-400 ${isUser ? 'text-right' : 'text-left'}`}
            style={{ marginLeft: isUser ? 0 : 8 }}
          >
            {formatDistanceToNow(message.timestamp, {
              addSuffix: true,
              locale: ko,
            })}
          </Text>
        </View>
      </View>
    </View>
  );
}
