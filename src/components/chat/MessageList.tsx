import React, { useRef, useEffect } from 'react';
import { FlatList, View, RefreshControl, ListRenderItem } from 'react-native';
import { MessageListProps, Message } from '../../types/chat';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';

export function MessageList({
  messages,
  isTyping = false,
  onRefresh,
  refreshing = false,
  onRetry,
  onCopy,
}: MessageListProps) {
  const flatListRef = useRef<FlatList>(null);

  // 새 메시지가 오면 자동으로 스크롤
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const renderMessage: ListRenderItem<Message> = ({ item }) => (
    <MessageBubble message={item} onRetry={onRetry} onCopy={onCopy} />
  );

  const renderFooter = () => {
    if (!isTyping) return null;
    return <TypingIndicator visible={isTyping} />;
  };

  const keyExtractor = (item: Message) => item.id;

  const getItemLayout = (data: any, index: number) => ({
    length: 80, // 예상 메시지 높이
    offset: 80 * index,
    index,
  });

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={keyExtractor}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 20,
        }}
        showsVerticalScrollIndicator={false}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 100,
        }}
        onContentSizeChange={() => {
          // 새 메시지가 추가되면 스크롤
          flatListRef.current?.scrollToEnd({ animated: true });
        }}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#7C3AED"
              colors={['#7C3AED']}
            />
          ) : undefined
        }
        getItemLayout={getItemLayout}
        initialNumToRender={20}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews={true}
        ListFooterComponent={renderFooter}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      />
    </View>
  );
}
