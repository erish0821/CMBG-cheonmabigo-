import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { TypingIndicatorProps } from '../../types/chat';

export function TypingIndicator({
  visible,
  text = '천마비고가 입력 중',
}: TypingIndicatorProps) {
  const dot1Opacity = useRef(new Animated.Value(0.4)).current;
  const dot2Opacity = useRef(new Animated.Value(0.4)).current;
  const dot3Opacity = useRef(new Animated.Value(0.4)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // 슬라이드 인 애니메이션
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // 점 애니메이션 시퀀스
      const createDotAnimation = (
        dotOpacity: Animated.Value,
        delay: number
      ) => {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(dotOpacity, {
              toValue: 1,
              duration: 600,
              delay,
              useNativeDriver: true,
            }),
            Animated.timing(dotOpacity, {
              toValue: 0.4,
              duration: 600,
              useNativeDriver: true,
            }),
          ])
        );
      };

      const animation = Animated.parallel([
        createDotAnimation(dot1Opacity, 0),
        createDotAnimation(dot2Opacity, 200),
        createDotAnimation(dot3Opacity, 400),
      ]);

      animation.start();

      return () => {
        animation.stop();
      };
    } else {
      // 슬라이드 아웃 애니메이션
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, dot1Opacity, dot2Opacity, dot3Opacity, slideAnim]);

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      style={{
        opacity: slideAnim,
        transform: [
          {
            translateY: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            }),
          },
        ],
      }}
      className="mb-4 items-start"
    >
      <View className="max-w-[80%] rounded-2xl rounded-bl-md border border-gray-100 bg-white px-4 py-3 shadow-md">
        <View className="flex-row items-center">
          <Text className="mr-2 text-sm text-gray-600">{text}</Text>

          <View className="flex-row items-center space-x-1">
            <Animated.View
              style={{ opacity: dot1Opacity }}
              className="h-2 w-2 rounded-full bg-primary-500"
            />
            <Animated.View
              style={{ opacity: dot2Opacity }}
              className="h-2 w-2 rounded-full bg-primary-500"
            />
            <Animated.View
              style={{ opacity: dot3Opacity }}
              className="h-2 w-2 rounded-full bg-primary-500"
            />
          </View>
        </View>
      </View>
    </Animated.View>
  );
}
