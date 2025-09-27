import React from 'react';
import { View, ViewProps, Pressable, PressableProps } from 'react-native';

interface CardProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'sm' | 'md' | 'lg';
  onPress?: PressableProps['onPress'];
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  onPress,
  className = '',
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'default':
        return 'bg-white shadow-card';
      case 'elevated':
        return 'bg-white shadow-lg';
      case 'outlined':
        return 'bg-white border border-gray-200';
      default:
        return 'bg-white shadow-card';
    }
  };

  const getPaddingClasses = () => {
    switch (padding) {
      case 'sm':
        return 'p-3';
      case 'md':
        return 'p-4';
      case 'lg':
        return 'p-6';
      default:
        return 'p-4';
    }
  };

  const cardClassName = `rounded-xl ${getVariantClasses()} ${getPaddingClasses()} ${className}`;

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        className={cardClassName}
        {...(props as any)}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View className={cardClassName} {...props}>
      {children}
    </View>
  );
};
