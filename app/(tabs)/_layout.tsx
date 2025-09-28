import React from 'react';
import { Tabs } from 'expo-router';
import { Text, View, Platform } from 'react-native';
import { TabIcon } from '../../src/components/ui/TabIcon';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          elevation: Platform.OS === 'android' ? 20 : 0,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -8 },
          shadowOpacity: 0.08,
          shadowRadius: 20,
          height: 88,
          paddingBottom: Platform.OS === 'ios' ? 20 : 16,
          paddingTop: 12,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          position: 'absolute',
          borderTopColor: 'rgba(124, 58, 237, 0.05)',
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: '#7C3AED',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
          marginBottom: 2,
          fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
          letterSpacing: 0.2,
        },
        tabBarItemStyle: {
          paddingVertical: 6,
          paddingHorizontal: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="home" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'AI 상담',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="chat" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: '분석',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="analytics" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '설정',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="settings" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
