import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';

export interface TabIconProps {
  name: 'home' | 'chat' | 'analytics' | 'settings';
  focused: boolean;
  color: string;
}

export function TabIcon({ name, focused, color }: TabIconProps) {
  const scaleValue = useRef(new Animated.Value(focused ? 1.1 : 1.0)).current;
  const opacityValue = useRef(new Animated.Value(focused ? 1.0 : 0.0)).current;

  // 깔끔하고 일관성 있는 아이콘들
  const icons = {
    home: '⌂',      // 홈 아이콘
    chat: '💬',      // AI 상담 아이콘
    analytics: '📊', // 분석 아이콘
    settings: '⚙',  // 설정 아이콘
  };

  useEffect(() => {
    // 부드러운 애니메이션 효과
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: focused ? 1.1 : 1.0,
        useNativeDriver: true,
        tension: 200,
        friction: 7,
      }),
      Animated.timing(opacityValue, {
        toValue: focused ? 1.0 : 0.0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused, scaleValue, opacityValue]);

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          width: 44,
          height: 44,
          borderRadius: 22,
          transform: [{ scale: scaleValue }],
        }}
      >
        {/* 배경 원형 */}
        <Animated.View
          style={{
            position: 'absolute',
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: 'rgba(124, 58, 237, 0.1)',
            opacity: opacityValue,
          }}
        />
        
        {/* 아이콘 */}
        <Text
          style={{
            fontSize: 22,
            color: focused ? '#7C3AED' : '#9CA3AF',
            fontWeight: focused ? '600' : '400',
          }}
        >
          {icons[name]}
        </Text>
      </Animated.View>
    </View>
  );
}