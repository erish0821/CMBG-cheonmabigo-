import React from 'react';
import { View, ViewProps } from 'react-native';

interface ContainerProps extends ViewProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  margin?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  center?: boolean;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  size = 'full',
  padding = 'md',
  margin = 'none',
  center = false,
  className = '',
  ...props
}) => {
  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'max-w-sm';
      case 'md':
        return 'max-w-md';
      case 'lg':
        return 'max-w-lg';
      case 'xl':
        return 'max-w-xl';
      case 'full':
        return 'w-full';
      default:
        return 'w-full';
    }
  };

  const getPaddingClass = () => {
    switch (padding) {
      case 'none':
        return '';
      case 'xs':
        return 'p-1';
      case 'sm':
        return 'p-2';
      case 'md':
        return 'p-4';
      case 'lg':
        return 'p-6';
      case 'xl':
        return 'p-8';
      default:
        return 'p-4';
    }
  };

  const getMarginClass = () => {
    switch (margin) {
      case 'none':
        return '';
      case 'xs':
        return 'm-1';
      case 'sm':
        return 'm-2';
      case 'md':
        return 'm-4';
      case 'lg':
        return 'm-6';
      case 'xl':
        return 'm-8';
      default:
        return '';
    }
  };

  const getCenterClass = () => {
    return center ? 'mx-auto' : '';
  };

  return (
    <View
      className={`${getSizeClass()} ${getPaddingClass()} ${getMarginClass()} ${getCenterClass()} ${className}`}
      {...props}
    >
      {children}
    </View>
  );
};

// 특화된 컨테이너 컴포넌트들
export const CardContainer: React.FC<Omit<ContainerProps, 'padding'>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <Container
      padding="md"
      className={`shadow-card rounded-xl bg-white ${className}`}
      {...props}
    >
      {children}
    </Container>
  );
};

export const SectionContainer: React.FC<ContainerProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <Container className={`mb-6 ${className}`} {...props}>
      {children}
    </Container>
  );
};
