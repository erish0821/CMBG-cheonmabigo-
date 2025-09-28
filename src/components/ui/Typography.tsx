import React from 'react';
import { Text, TextProps } from 'react-native';

// 제목 컴포넌트들
interface HeadingProps extends TextProps {
  children: React.ReactNode;
  color?: 'primary' | 'secondary' | 'white' | 'gray';
}

export const H1: React.FC<HeadingProps> = ({
  children,
  color = 'primary',
  className = '',
  ...props
}) => {
  const getColorClass = () => {
    switch (color) {
      case 'primary':
        return 'text-text-primary';
      case 'secondary':
        return 'text-text-secondary';
      case 'white':
        return 'text-white';
      case 'gray':
        return 'text-gray-600';
      default:
        return 'text-text-primary';
    }
  };

  return (
    <Text
      className={`text-4xl font-bold leading-tight ${getColorClass()} ${className}`}
      style={{ fontFamily: 'Pretendard', ...(props.style || {}) }}
      {...props}
    >
      {children}
    </Text>
  );
};

export const H2: React.FC<HeadingProps> = ({
  children,
  color = 'primary',
  className = '',
  ...props
}) => {
  const getColorClass = () => {
    switch (color) {
      case 'primary':
        return 'text-text-primary';
      case 'secondary':
        return 'text-text-secondary';
      case 'white':
        return 'text-white';
      case 'gray':
        return 'text-gray-600';
      default:
        return 'text-text-primary';
    }
  };

  return (
    <Text
      className={`text-2xl font-semibold leading-snug ${getColorClass()} ${className}`}
      style={{ fontFamily: 'Pretendard', ...(props.style || {}) }}
      {...props}
    >
      {children}
    </Text>
  );
};

export const H3: React.FC<HeadingProps> = ({
  children,
  color = 'primary',
  className = '',
  ...props
}) => {
  const getColorClass = () => {
    switch (color) {
      case 'primary':
        return 'text-text-primary';
      case 'secondary':
        return 'text-text-secondary';
      case 'white':
        return 'text-white';
      case 'gray':
        return 'text-gray-600';
      default:
        return 'text-text-primary';
    }
  };

  return (
    <Text
      className={`text-xl font-semibold leading-snug ${getColorClass()} ${className}`}
      style={{ fontFamily: 'Pretendard', ...(props.style || {}) }}
      {...props}
    >
      {children}
    </Text>
  );
};

// 본문 텍스트 컴포넌트들
interface BodyTextProps extends TextProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'light';
  size?: 'sm' | 'base' | 'lg';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
}

export const BodyText: React.FC<BodyTextProps> = ({
  children,
  variant = 'default',
  size = 'base',
  weight = 'normal',
  className = '',
  ...props
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'default':
        return 'text-text-primary';
      case 'secondary':
        return 'text-text-secondary';
      case 'light':
        return 'text-text-light';
      default:
        return 'text-text-primary';
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'text-sm';
      case 'base':
        return 'text-base';
      case 'lg':
        return 'text-lg';
      default:
        return 'text-base';
    }
  };

  const getWeightClass = () => {
    switch (weight) {
      case 'normal':
        return 'font-normal';
      case 'medium':
        return 'font-medium';
      case 'semibold':
        return 'font-semibold';
      case 'bold':
        return 'font-bold';
      default:
        return 'font-normal';
    }
  };

  return (
    <Text
      className={`leading-relaxed ${getSizeClass()} ${getWeightClass()} ${getVariantClass()} ${className}`}
      style={{ fontFamily: 'Pretendard', ...(props.style || {}) }}
      {...props}
    >
      {children}
    </Text>
  );
};

// 캡션 및 라벨
interface CaptionProps extends TextProps {
  children: React.ReactNode;
  variant?: 'default' | 'muted' | 'error' | 'success' | 'warning';
}

export const Caption: React.FC<CaptionProps> = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'default':
        return 'text-text-secondary';
      case 'muted':
        return 'text-text-tertiary';
      case 'error':
        return 'text-error';
      case 'success':
        return 'text-success';
      case 'warning':
        return 'text-warning';
      default:
        return 'text-text-secondary';
    }
  };

  return (
    <Text
      className={`text-sm font-normal leading-normal ${getVariantClass()} ${className}`}
      style={{ fontFamily: 'Pretendard', ...(props.style || {}) }}
      {...props}
    >
      {children}
    </Text>
  );
};

export const Label: React.FC<CaptionProps> = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'default':
        return 'text-text-primary';
      case 'muted':
        return 'text-text-secondary';
      case 'error':
        return 'text-error';
      case 'success':
        return 'text-success';
      case 'warning':
        return 'text-warning';
      default:
        return 'text-text-primary';
    }
  };

  return (
    <Text
      className={`text-sm font-medium leading-normal ${getVariantClass()} ${className}`}
      style={{ fontFamily: 'Pretendard', ...(props.style || {}) }}
      {...props}
    >
      {children}
    </Text>
  );
};
