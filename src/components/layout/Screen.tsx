import React from 'react';
import { ScrollView, ScrollViewProps, View, Text } from 'react-native';
import { SafeAreaWrapper } from './SafeAreaWrapper';
import { H1, BodyText } from '../ui/Typography';

interface ScreenProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  scrollable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  background?: 'primary' | 'secondary' | 'white' | 'gray';
  safeArea?: boolean;
  headerAction?: React.ReactNode;
  className?: string;
  contentContainerStyle?: ScrollViewProps['contentContainerStyle'];
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  title,
  subtitle,
  scrollable = true,
  padding = 'md',
  background = 'white',
  safeArea = true,
  headerAction,
  className = '',
  contentContainerStyle,
  ...props
}) => {
  const getPaddingClass = () => {
    switch (padding) {
      case 'none':
        return '';
      case 'sm':
        return 'px-3 py-2';
      case 'md':
        return 'px-4 py-3';
      case 'lg':
        return 'px-6 py-4';
      default:
        return 'px-4 py-3';
    }
  };

  const ContentWrapper = scrollable ? ScrollView : View;
  const Container = safeArea ? SafeAreaWrapper : View;

  const content = (
    <ContentWrapper
      className={`flex-1 ${className}`}
      contentContainerStyle={
        scrollable
          ? [{ flexGrow: 1 }, contentContainerStyle]
          : contentContainerStyle
      }
      showsVerticalScrollIndicator={false}
      {...(props as any)}
    >
      <View className={`flex-1 ${getPaddingClass()}`}>
        {/* Header */}
        {(title || subtitle || headerAction) && (
          <View className="mb-6">
            {/* Title and Action Row */}
            {(title || headerAction) && (
              <View className="mb-2 flex-row items-center justify-between">
                {title && <H1 className="flex-1">{title}</H1>}
                {headerAction && (
                  <View>
                    {typeof headerAction === 'string' ? (
                      <Text>{headerAction}</Text>
                    ) : (
                      headerAction
                    )}
                  </View>
                )}
              </View>
            )}

            {/* Subtitle */}
            {subtitle && (
              <BodyText variant="secondary" className="mt-1">
                {subtitle}
              </BodyText>
            )}
          </View>
        )}

        {/* Content */}
        {children}
      </View>
    </ContentWrapper>
  );

  return safeArea ? (
    <Container background={background}>{content}</Container>
  ) : (
    content
  );
};
