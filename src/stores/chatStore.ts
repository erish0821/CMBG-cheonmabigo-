import { create } from 'zustand';
import { Message, ChatState } from '../types/chat';
import { exaoneService } from '../services/ai';

interface ChatStore extends ChatState {
  // Actions
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  removeMessage: (id: string) => void;
  setInputText: (text: string) => void;
  setIsTyping: (isTyping: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | undefined) => void;
  clearMessages: () => void;
  sendMessage: (content: string) => Promise<void>;
  retryMessage: (messageId: string) => Promise<void>;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  // Initial state
  messages: [
    {
      id: 'welcome-1',
      content:
        '안녕하세요! 천마비고입니다 💰\n오늘 어떤 지출이 있으셨나요? 자연스럽게 말씀해주세요!',
      sender: 'ai',
      timestamp: new Date(),
      type: 'text',
      status: 'sent',
    },
  ],
  inputText: '',
  isTyping: false,
  isLoading: false,
  error: undefined,

  // Actions
  addMessage: messageData => {
    const message: Message = {
      ...messageData,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };

    set(state => ({
      messages: [...state.messages, message],
    }));
  },

  updateMessage: (id, updates) => {
    set(state => ({
      messages: state.messages.map(msg =>
        msg.id === id ? { ...msg, ...updates } : msg
      ),
    }));
  },

  removeMessage: id => {
    set(state => ({
      messages: state.messages.filter(msg => msg.id !== id),
    }));
  },

  setInputText: text => {
    set({ inputText: text });
  },

  setIsTyping: isTyping => {
    set({ isTyping });
  },

  setIsLoading: isLoading => {
    set({ isLoading });
  },

  setError: error => {
    set({ error });
  },

  clearMessages: () => {
    set({ messages: [] });
  },

  sendMessage: async content => {
    const { addMessage, setIsLoading, setIsTyping, setError } = get();

    try {
      // 사용자 메시지 추가
      addMessage({
        content,
        sender: 'user',
        type: 'text',
        status: 'sent',
      });

      // 로딩 상태 시작
      setIsLoading(true);
      setIsTyping(true);
      setError(undefined);

      // AI 응답 생성
      const response = await exaoneService.processMessage(content);

      // 타이핑 중지
      setIsTyping(false);

      // AI 응답 추가
      addMessage({
        content: response.content,
        sender: 'ai',
        type:
          response.intent === 'transaction_record'
            ? 'transaction'
            : response.intent === 'financial_advice'
              ? 'advice'
              : 'text',
        status: 'sent',
        metadata:
          response.intent === 'transaction_record' &&
          response.extractedData?.transaction
            ? {
                transaction: {
                  amount: response.extractedData.transaction.amount,
                  category:
                    response.extractedData.transaction.category || '기타',
                  location: response.extractedData.transaction.location,
                },
              }
            : response.intent === 'financial_advice' && response.suggestions
              ? {
                  advice: {
                    suggestions: response.suggestions,
                    analysis: '분석 결과',
                  },
                }
              : undefined,
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('메시지 전송에 실패했습니다. 다시 시도해주세요.');

      // 사용자 메시지를 에러 상태로 업데이트
      const userMessage = get().messages.findLast(msg => msg.sender === 'user');
      if (userMessage) {
        get().updateMessage(userMessage.id, { status: 'error' });
      }
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  },

  retryMessage: async messageId => {
    const { messages, sendMessage, updateMessage } = get();
    const message = messages.find(msg => msg.id === messageId);

    if (message && message.sender === 'user' && message.status === 'error') {
      // 메시지를 전송중 상태로 변경
      updateMessage(messageId, { status: 'sending' });

      try {
        await sendMessage(message.content);
        // 성공하면 원래 메시지 제거 (sendMessage에서 새로 추가됨)
        get().removeMessage(messageId);
      } catch (error) {
        // 실패하면 다시 에러 상태로 변경
        updateMessage(messageId, { status: 'error' });
      }
    }
  },
}));
