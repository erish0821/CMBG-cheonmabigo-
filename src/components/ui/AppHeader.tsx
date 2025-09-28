import React from 'react';
import { View, Text, Platform, StatusBar } from 'react-native';
import { SogyoAvatar } from './SogyoAvatar';

export interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  showAvatar?: boolean;
  backgroundColor?: string;
  textColor?: string;
}

export function AppHeader({
  title = "천마비고",
  subtitle = "AI와 함께하는 똑똑한 가계부",
  showAvatar = true,
  backgroundColor = "#FFFFFF",
  textColor = "#1F2937"
}: AppHeaderProps) {
  return (
    <>
      <StatusBar
        barStyle={backgroundColor === "#FFFFFF" ? "dark-content" : "light-content"}
        backgroundColor={backgroundColor}
      />
      <View
        style={{
          backgroundColor,
          paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 16,
          paddingBottom: 20,
        }}
        className="px-6 border-b border-gray-100"
      >
        <View className="flex-row items-center justify-center">
          {showAvatar && (
            <SogyoAvatar
              size={48}
              style={{ marginRight: 16 }}
            />
          )}
          <View className="items-start">
            <View className="flex-row items-center">
              <Text
                style={{ color: textColor, fontSize: 24, fontWeight: 'bold' }}
              >
                {title}
              </Text>
              <Text
                style={{ color: textColor, fontSize: 16, marginLeft: 8, opacity: 0.8 }}
              >
                대화하는 AI 가계부
              </Text>
            </View>
            {subtitle && (
              <Text
                style={{ color: textColor, fontSize: 14, opacity: 0.7, marginTop: 4 }}
              >
                {subtitle}
              </Text>
            )}
          </View>
        </View>
      </View>
    </>
  );
}