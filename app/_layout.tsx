import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text } from 'react-native';
import * as Font from 'expo-font';
import '../global.css';

export default function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          'Pretendard': require('../assets/fonts/Pretendard-Regular.otf'),
          'Pretendard-Bold': require('../assets/fonts/Pretendard-Bold.otf'),
        });
        setFontsLoaded(true);
      } catch (error) {
        console.error('폰트 로딩 실패:', error);
        setFontsLoaded(true); // 실패해도 앱은 계속 진행
      }
    }
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
          <Text style={{ fontSize: 24, color: '#7c3aed' }}>천마비고</Text>
          <Text style={{ fontSize: 14, color: '#6b7280', marginTop: 8 }}>폰트를 로딩하고 있습니다...</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#ffffff' },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
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
