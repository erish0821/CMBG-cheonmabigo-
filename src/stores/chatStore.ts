import { create } from 'zustand';
import { Message, ChatState } from '../types/chat';
import { VoiceState } from '../types/voice';
import { exaoneService } from '../services/ai';
import { voiceService } from '../services/voice/VoiceService';

interface ChatStore extends ChatState {
  // Voice state
  voiceState: VoiceState;

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

  // Voice actions
  setVoiceRecording: (isRecording: boolean) => void;
  setVoiceProcessing: (isProcessing: boolean) => void;
  setVoiceText: (text: string) => void;
  setVoiceError: (error: string | null) => void;
  setAudioLevel: (level: number) => void;
  handleVoiceInput: (text: string) => Promise<void>;
  startVoiceInput: () => Promise<void>;
  stopVoiceInput: () => Promise<void>;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  // Initial state
  messages: [
    {
      id: 'welcome-1',
      content:
        '안녕하세요! 천마비고입니다 💰\n오늘 어떤 지출이 있으셨나요? 음성이나 텍스트로 자연스럽게 말씀해주세요!',
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

  // Voice state
  voiceState: {
    isRecording: false,
    isProcessing: false,
    recognizedText: '',
    error: null,
    audioLevel: 0,
    recordingTime: 0,
    isAvailable: true,
    hasPermission: false,
  },

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

  // Voice actions
  setVoiceRecording: isRecording => {
    set(state => ({
      voiceState: {
        ...state.voiceState,
        isRecording,
        error: isRecording ? null : state.voiceState.error,
      },
    }));
  },

  setVoiceProcessing: isProcessing => {
    set(state => ({
      voiceState: {
        ...state.voiceState,
        isProcessing,
      },
    }));
  },

  setVoiceText: text => {
    set(state => ({
      voiceState: {
        ...state.voiceState,
        recognizedText: text,
      },
    }));
  },

  setVoiceError: error => {
    set(state => ({
      voiceState: {
        ...state.voiceState,
        error,
        isRecording: false,
        isProcessing: false,
      },
    }));
  },

  setAudioLevel: level => {
    set(state => ({
      voiceState: {
        ...state.voiceState,
        audioLevel: level,
      },
    }));
  },

  handleVoiceInput: async text => {
    const { setInputText, sendMessage, setVoiceText } = get();

    try {
      // 인식된 텍스트를 입력 필드에 설정
      setInputText(text);
      setVoiceText(text);

      // 자동으로 메시지 전송
      await sendMessage(text);

      // 전송 후 음성 텍스트 초기화
      setVoiceText('');
    } catch (error) {
      console.error('Voice input handling error:', error);
      get().setVoiceError('음성 입력 처리 중 오류가 발생했습니다.');
    }
  },

  startVoiceInput: async () => {
    const { setVoiceRecording, setVoiceError } = get();

    try {
      // 음성 서비스 콜백 설정
      voiceService.setCallbacks({
        onSpeechStart: () => {
          setVoiceRecording(true);
        },
        onSpeechEnd: () => {
          setVoiceRecording(false);
        },
        onSpeechResults: (results) => {
          if (results && results.length > 0) {
            get().handleVoiceInput(results[0]);
          }
        },
        onSpeechPartialResults: (results) => {
          if (results && results.length > 0) {
            get().setVoiceText(results[0]);
          }
        },
        onSpeechError: (error) => {
          setVoiceError(error);
        },
        onSpeechVolumeChanged: (volume) => {
          get().setAudioLevel(volume);
        },
      });

      // 한국어 금융 용어에 최적화
      voiceService.optimizeForKoreanFinance();

      const success = await voiceService.startListening();
      if (!success) {
        setVoiceError('음성 인식을 시작할 수 없습니다.');
      }
    } catch (error) {
      console.error('Voice input start error:', error);
      setVoiceError('음성 인식 시작 중 오류가 발생했습니다.');
    }
  },

  stopVoiceInput: async () => {
    const { setVoiceRecording } = get();

    try {
      await voiceService.stopListening();
      setVoiceRecording(false);
    } catch (error) {
      console.error('Voice input stop error:', error);
    }
  },
}));
