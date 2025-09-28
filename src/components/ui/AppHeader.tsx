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
          paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
        }}
        className="px-6 py-4 border-b border-gray-100"
      >
        <View className="flex-row items-center justify-center">
          {showAvatar && (
            <SogyoAvatar 
              size={36} 
              style={{ marginRight: 12 }}
            />
          )}
          <View className="items-center">
            <Text 
              style={{ color: textColor }}
              className="text-xl font-bold"
            >
              {title}
            </Text>
            {subtitle && (
              <Text 
                style={{ color: textColor }}
                className="text-sm opacity-70 mt-1"
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