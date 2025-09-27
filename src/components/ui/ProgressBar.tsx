import React from 'react';
import { View, ViewProps } from 'react-native';

interface ProgressBarProps extends ViewProps {
  progress: number; // 0-100 사이의 값
  height?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  showGradient?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 'md',
  color = 'primary',
  showGradient = true,
  className = '',
  ...props
}) => {
  const getHeightClasses = () => {
    switch (height) {
      case 'sm':
        return 'h-1';
      case 'md':
        return 'h-2';
      case 'lg':
        return 'h-3';
      default:
        return 'h-2';
    }
  };

  const getColorClasses = () => {
    if (showGradient && color === 'primary') {
      return 'progress-fill'; // 그라데이션 클래스
    }

    switch (color) {
      case 'primary':
        return 'bg-primary-600';
      case 'secondary':
        return 'bg-secondary-500';
      case 'success':
        return 'bg-success';
      case 'warning':
        return 'bg-warning';
      case 'error':
        return 'bg-error';
      default:
        return 'bg-primary-600';
    }
  };

  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <View
      className={`progress-bar ${getHeightClasses()} ${className}`}
      {...props}
    >
      <View
        className={`${getColorClasses()} h-full rounded-full transition-all duration-300`}
        style={{ width: `${clampedProgress}%` }}
      />
    </View>
  );
};
