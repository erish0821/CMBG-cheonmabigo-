import React, { useState } from 'react';
import { TextInput, TextInputProps, View, Text, Pressable } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helper?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'outlined';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  isPassword?: boolean;
  containerClassName?: string;
  maxHeight?: number;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helper,
  size = 'md',
  variant = 'default',
  leftIcon,
  rightIcon,
  rightElement,
  isPassword = false,
  containerClassName = '',
  maxHeight,
  className = '',
  ...props
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-9 px-3 py-2 text-sm';
      case 'md':
        return 'h-11 px-4 py-3 text-base';
      case 'lg':
        return 'h-13 px-5 py-4 text-lg';
      default:
        return 'h-11 px-4 py-3 text-base';
    }
  };

  const getVariantClasses = () => {
    const baseClasses = 'rounded-xl';
    const focusClasses = isFocused
      ? 'border-primary-600 bg-white'
      : 'border-gray-300 bg-white';
    const errorClasses = error ? 'border-error bg-red-50' : focusClasses;

    switch (variant) {
      case 'default':
        return `${baseClasses} border ${errorClasses}`;
      case 'filled':
        return `${baseClasses} bg-gray-100 border border-transparent ${
          isFocused ? 'bg-white border-primary-600' : ''
        } ${error ? 'bg-red-50 border-error' : ''}`;
      case 'outlined':
        return `${baseClasses} border-2 ${errorClasses}`;
      default:
        return `${baseClasses} border ${errorClasses}`;
    }
  };

  const getLabelClasses = () => {
    if (error) return 'text-error';
    if (isFocused) return 'text-primary-600';
    return 'text-text-primary';
  };

  const getHelperClasses = () => {
    if (error) return 'text-error';
    return 'text-text-secondary';
  };

  const inputClasses = `
    ${getSizeClasses()}
    ${getVariantClasses()}
    text-text-primary
    placeholder:text-text-tertiary
    ${leftIcon ? 'pl-12' : ''}
    ${rightIcon || rightElement || isPassword ? 'pr-12' : ''}
    ${className}
  `.trim();

  return (
    <View className={`w-full ${containerClassName}`}>
      {/* Label */}
      {label && (
        <Text className={`mb-2 text-sm font-medium ${getLabelClasses()}`}>
          {label}
        </Text>
      )}

      {/* Input Container */}
      <View className="relative">
        {/* Left Icon */}
        {leftIcon && (
          <View className="absolute left-3 top-1/2 z-10 -translate-y-1/2">
            {leftIcon}
          </View>
        )}

        {/* Text Input */}
        <TextInput
          className={inputClasses}
          secureTextEntry={isPassword && !isPasswordVisible}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={maxHeight ? { maxHeight } : undefined}
          {...props}
        />

        {/* Right Icon, Right Element, or Password Toggle */}
        {(rightIcon || rightElement || isPassword) && (
          <View className="absolute right-3 top-1/2 z-10 -translate-y-1/2">
            {isPassword ? (
              <Pressable
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                className="p-1"
              >
                <Text className="text-text-secondary">
                  {isPasswordVisible ? '🙈' : '👁️'}
                </Text>
              </Pressable>
            ) : rightElement ? (
              rightElement
            ) : (
              rightIcon
            )}
          </View>
        )}
      </View>

      {/* Helper Text or Error */}
      {(helper || error) && (
        <Text className={`mt-1 text-xs ${getHelperClasses()}`}>
          {error || helper}
        </Text>
      )}
    </View>
  );
};

// 검색 인풋 특화 컴포넌트
interface SearchInputProps extends Omit<InputProps, 'leftIcon' | 'rightIcon'> {
  onClear?: () => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  onClear,
  placeholder = '검색...',
  ...props
}) => {
  return (
    <Input
      placeholder={placeholder}
      leftIcon={<Text className="text-text-secondary">🔍</Text>}
      rightIcon={
        props.value ? (
          <Pressable onPress={onClear} className="p-1">
            <Text className="text-text-secondary">✕</Text>
          </Pressable>
        ) : undefined
      }
      {...props}
    />
  );
};

// 텍스트 영역 컴포넌트
interface TextAreaProps extends Omit<InputProps, 'size'> {
  rows?: number;
}

export const TextArea: React.FC<TextAreaProps> = ({
  rows = 4,
  className = '',
  ...props
}) => {
  return (
    <Input
      multiline
      numberOfLines={rows}
      textAlignVertical="top"
      className={`h-auto py-3 ${className}`}
      style={{ minHeight: rows * 20 + 24 }}
      {...props}
    />
  );
};
