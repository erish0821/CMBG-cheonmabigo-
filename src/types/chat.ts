// 채팅 관련 타입 정의

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type: 'text' | 'transaction' | 'chart' | 'advice';
  status: 'sending' | 'sent' | 'error';
  metadata?: {
    transaction?: {
      amount: number;
      category: string;
      location?: string;
    };
    chart?: {
      type: 'bar' | 'line' | 'pie';
      data: any[];
    };
    advice?: {
      suggestions: string[];
      analysis: string;
    };
  };
}

export interface ChatState {
  messages: Message[];
  isTyping: boolean;
  inputText: string;
  isLoading: boolean;
  error?: string;
}

export interface MessageInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onVoicePress?: () => void;
  isLoading?: boolean;
  placeholder?: string;
}

export interface MessageBubbleProps {
  message: Message;
  onRetry?: (messageId: string) => void;
  onCopy?: (content: string) => void;
}

export interface MessageListProps {
  messages: Message[];
  isTyping?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
  onRetry?: (messageId: string) => void;
  onCopy?: (content: string) => void;
}

export interface TypingIndicatorProps {
  visible: boolean;
  text?: string;
}
