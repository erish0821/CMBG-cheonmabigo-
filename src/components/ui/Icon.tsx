import React from 'react';
import { Text, TextProps } from 'react-native';

// 아이콘 이름 타입 정의
export type IconName =
  | 'home'
  | 'chat'
  | 'analytics'
  | 'settings'
  | 'add'
  | 'search'
  | 'microphone'
  | 'send'
  | 'edit'
  | 'delete'
  | 'heart'
  | 'star'
  | 'user'
  | 'bell'
  | 'menu'
  | 'close'
  | 'arrow-left'
  | 'arrow-right'
  | 'arrow-up'
  | 'arrow-down'
  | 'check'
  | 'warning'
  | 'error'
  | 'info'
  | 'eye'
  | 'eye-off'
  | 'calendar'
  | 'clock'
  | 'location'
  | 'phone'
  | 'mail'
  | 'share'
  | 'download'
  | 'upload'
  | 'refresh'
  | 'filter'
  | 'sort'
  | 'grid'
  | 'list'
  | 'camera'
  | 'image'
  | 'video'
  | 'music'
  | 'volume'
  | 'wifi'
  | 'battery'
  | 'lock'
  | 'unlock'
  | 'help'
  | 'question';

// 이모지 아이콘 매핑
const iconMap: Record<IconName, string> = {
  // 내비게이션
  home: '🏠',
  chat: '💬',
  analytics: '📊',
  settings: '⚙️',

  // 액션
  add: '➕',
  search: '🔍',
  microphone: '🎤',
  send: '📤',
  edit: '✏️',
  delete: '🗑️',

  // 상태
  heart: '❤️',
  star: '⭐',
  user: '👤',
  bell: '🔔',

  // 메뉴 및 내비게이션
  menu: '☰',
  close: '✕',
  'arrow-left': '←',
  'arrow-right': '→',
  'arrow-up': '↑',
  'arrow-down': '↓',

  // 상태 표시
  check: '✓',
  warning: '⚠️',
  error: '❌',
  info: 'ℹ️',

  // 시각성
  eye: '👁️',
  'eye-off': '🙈',

  // 시간 및 날짜
  calendar: '📅',
  clock: '⏰',

  // 위치 및 통신
  location: '📍',
  phone: '📞',
  mail: '✉️',
  share: '📤',

  // 파일 및 미디어
  download: '⬇️',
  upload: '⬆️',
  refresh: '🔄',
  filter: '🔽',
  sort: '🔃',
  grid: '◼️',
  list: '📋',
  camera: '📷',
  image: '🖼️',
  video: '🎥',
  music: '🎵',

  // 시스템
  volume: '🔊',
  wifi: '📶',
  battery: '🔋',
  lock: '🔒',
  unlock: '🔓',
  help: '❓',
  question: '❔',
};

interface IconProps extends Omit<TextProps, 'children'> {
  name: IconName;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  color?:
    | 'primary'
    | 'secondary'
    | 'gray'
    | 'white'
    | 'success'
    | 'warning'
    | 'error';
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 'md',
  color = 'gray',
  className = '',
  style,
  ...props
}) => {
  const getSizeClass = () => {
    switch (size) {
      case 'xs':
        return 'text-xs';
      case 'sm':
        return 'text-sm';
      case 'md':
        return 'text-base';
      case 'lg':
        return 'text-lg';
      case 'xl':
        return 'text-xl';
      case '2xl':
        return 'text-2xl';
      case '3xl':
        return 'text-3xl';
      default:
        return 'text-base';
    }
  };

  const getColorClass = () => {
    switch (color) {
      case 'primary':
        return 'text-primary-600';
      case 'secondary':
        return 'text-secondary-500';
      case 'gray':
        return 'text-gray-500';
      case 'white':
        return 'text-white';
      case 'success':
        return 'text-success';
      case 'warning':
        return 'text-warning';
      case 'error':
        return 'text-error';
      default:
        return 'text-gray-500';
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'xs':
        return { fontSize: 12 };
      case 'sm':
        return { fontSize: 16 };
      case 'md':
        return { fontSize: 20 };
      case 'lg':
        return { fontSize: 24 };
      case 'xl':
        return { fontSize: 32 };
      case '2xl':
        return { fontSize: 40 };
      case '3xl':
        return { fontSize: 48 };
      default:
        return { fontSize: 20 };
    }
  };

  return (
    <Text
      className={`${getSizeClass()} ${getColorClass()} ${className}`}
      style={[getSizeStyle(), style]}
      {...props}
    >
      {iconMap[name] || '❓'}
    </Text>
  );
};

// 미리 정의된 아이콘 컴포넌트들
export const HomeIcon = (props: Omit<IconProps, 'name'>) => (
  <Icon name="home" {...props} />
);

export const ChatIcon = (props: Omit<IconProps, 'name'>) => (
  <Icon name="chat" {...props} />
);

export const AnalyticsIcon = (props: Omit<IconProps, 'name'>) => (
  <Icon name="analytics" {...props} />
);

export const SettingsIcon = (props: Omit<IconProps, 'name'>) => (
  <Icon name="settings" {...props} />
);

export const SearchIcon = (props: Omit<IconProps, 'name'>) => (
  <Icon name="search" {...props} />
);

export const MicrophoneIcon = (props: Omit<IconProps, 'name'>) => (
  <Icon name="microphone" {...props} />
);

export const AddIcon = (props: Omit<IconProps, 'name'>) => (
  <Icon name="add" {...props} />
);
