import React from 'react';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';

function TabBarIcon({
  name,
  color,
  focused,
}: {
  name: 'home' | 'chat' | 'analytics' | 'settings';
  color: string;
  focused: boolean;
}) {
  const icons = {
    home: '🏠',
    chat: '💬',
    analytics: '📊',
    settings: '⚙️',
  };

  return (
    <Text style={{ color: focused ? '#7c3aed' : '#6b7280', fontSize: 20 }}>
      {icons[name]}
    </Text>
  );
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
          tabBarIconStyle: { display: 'none' },
          tabBarLabel: ({ focused }) => (
            <Text style={{
              color: focused ? '#7c3aed' : '#6b7280',
              fontSize: 12,
              marginTop: -15
            }}>
              🏠 홈
            </Text>
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
          tabBarIconStyle: { display: 'none' },
          tabBarLabel: ({ focused }) => (
            <Text style={{
              color: focused ? '#7c3aed' : '#6b7280',
              fontSize: 12,
              marginTop: -15
            }}>
              💬 AI 상담
            </Text>
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
          tabBarIconStyle: { display: 'none' },
          tabBarLabel: ({ focused }) => (
            <Text style={{
              color: focused ? '#7c3aed' : '#6b7280',
              fontSize: 12,
              marginTop: -15
            }}>
              📊 분석
            </Text>
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
          tabBarIconStyle: { display: 'none' },
          tabBarLabel: ({ focused }) => (
            <Text style={{
              color: focused ? '#7c3aed' : '#6b7280',
              fontSize: 12,
              marginTop: -15
            }}>
              ⚙️ 설정
            </Text>
          ),
        }}
      />
    </Tabs>
  );
}
