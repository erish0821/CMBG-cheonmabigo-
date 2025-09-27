import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../global.css';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#ffffff' },
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="transaction/[id]"
          options={{
            presentation: 'modal',
            headerShown: true,
            headerTitle: '거래 내역',
            headerStyle: {
              backgroundColor: '#ffffff',
            },
            headerTintColor: '#1f2937',
          }}
        />
        <Stack.Screen
          name="goal/create"
          options={{
            presentation: 'modal',
            headerShown: true,
            headerTitle: '목표 설정',
            headerStyle: {
              backgroundColor: '#ffffff',
            },
            headerTintColor: '#1f2937',
          }}
        />
        <Stack.Screen
          name="onboarding/welcome"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="onboarding/setup"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
