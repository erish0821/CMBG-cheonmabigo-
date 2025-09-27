import React from 'react';
import {
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  className = '',
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-primary-600 active:bg-primary-700';
      case 'secondary':
        return 'bg-secondary-500 active:bg-secondary-600';
      case 'outline':
        return 'border-2 border-primary-600 bg-transparent active:bg-primary-50';
      default:
        return 'bg-primary-600 active:bg-primary-700';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-4 py-2';
      case 'md':
        return 'px-6 py-3';
      case 'lg':
        return 'px-8 py-4';
      default:
        return 'px-6 py-3';
    }
  };

  const getTextClasses = () => {
    const baseClasses = 'font-semibold text-center';
    const colorClasses =
      variant === 'outline' ? 'text-primary-600' : 'text-white';
    const sizeClasses =
      size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base';

    return `${baseClasses} ${colorClasses} ${sizeClasses}`;
  };

  return (
    <TouchableOpacity
      className={`shadow-button items-center justify-center rounded-xl ${getVariantClasses()} ${getSizeClasses()} ${className}`}
      {...props}
    >
      <View className="flex-row items-center justify-center" style={{ gap: 8 }}>
        {leftIcon && (
          <View>
            {typeof leftIcon === 'string' ? (
              <Text className={getTextClasses()}>{leftIcon}</Text>
            ) : (
              leftIcon
            )}
          </View>
        )}
        <Text className={getTextClasses()}>{title}</Text>
        {rightIcon && (
          <View>
            {typeof rightIcon === 'string' ? (
              <Text className={getTextClasses()}>{rightIcon}</Text>
            ) : (
              rightIcon
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};
