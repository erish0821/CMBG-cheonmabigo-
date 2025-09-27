import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';
import {
  HomeIcon,
  ChatIcon,
  AnalyticsIcon,
  SettingsIcon,
} from '../../src/components/ui/Icon';

function TabBarIcon({
  name,
  color,
  focused,
}: {
  name: 'home' | 'chat' | 'analytics' | 'settings';
  color: string;
  focused: boolean;
}) {
  const iconColor = focused ? 'primary' : 'gray';
  const size = 'md';

  switch (name) {
    case 'home':
      return <HomeIcon size={size} color={iconColor} />;
    case 'chat':
      return <ChatIcon size={size} color={iconColor} />;
    case 'analytics':
      return <AnalyticsIcon size={size} color={iconColor} />;
    case 'settings':
      return <SettingsIcon size={size} color={iconColor} />;
    default:
      return <HomeIcon size={size} color={iconColor} />;
  }
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          height: 88,
          paddingBottom: 20,
          paddingTop: 12,
        },
        tabBarActiveTintColor: '#7c3aed',
        tabBarInactiveTintColor: '#6b7280',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="home" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'AI 상담',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="chat" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: '분석',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="analytics" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '설정',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="settings" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
