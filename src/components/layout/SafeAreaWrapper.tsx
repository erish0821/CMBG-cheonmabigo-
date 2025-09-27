import React from 'react';
import {
  SafeAreaView,
  SafeAreaViewProps,
} from 'react-native-safe-area-context';

interface SafeAreaWrapperProps extends SafeAreaViewProps {
  children: React.ReactNode;
  background?: 'primary' | 'secondary' | 'white' | 'gray';
}

export const SafeAreaWrapper: React.FC<SafeAreaWrapperProps> = ({
  children,
  background = 'white',
  className = '',
  ...props
}) => {
  const getBackgroundClass = () => {
    switch (background) {
      case 'primary':
        return 'bg-primary-600';
      case 'secondary':
        return 'bg-secondary-500';
      case 'white':
        return 'bg-white';
      case 'gray':
        return 'bg-gray-50';
      default:
        return 'bg-white';
    }
  };

  return (
    <SafeAreaView
      className={`flex-1 ${getBackgroundClass()} ${className}`}
      {...props}
    >
      {children}
    </SafeAreaView>
  );
};
