import { create } from 'zustand';
import { Message, ChatState } from '../types/chat';
import { VoiceState } from '../types/voice';
import { Transaction, ParsedTransaction, PaymentMethod, CategoryType } from '../types/transaction';
import { pythonLLMService } from '../services/ai/PythonLLMService';
import { voiceService } from '../services/voice/VoiceService';
import { transactionStorage } from '../services/storage/TransactionStorage';
import { NLPParser } from '../services/transaction/NLPParser';
import { ClassifierService } from '../services/transaction/ClassifierService';
import { BudgetLLMService } from '../services/ai/BudgetLLMService';
import { CATEGORIES } from '../constants/categories';

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

  // Transaction processing
  processTransaction: (originalText: string) => Promise<Transaction | null>;
  confirmTransaction: (parsedData: ParsedTransaction) => Promise<Transaction>;

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
    console.log('🚀 sendMessage 호출됨:', content);
    const { addMessage, setIsLoading, setIsTyping, setError, processTransaction } = get();

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

      // 메시지 타입 감지 - 금액이 포함되어 있는지 확인
      const parsedTransaction = NLPParser.parseTransactionText(content);
      const isTransactionMessage = parsedTransaction.amount && parsedTransaction.amount > 0;
      const budgetIntent = BudgetLLMService.detectBudgetIntent(content);

      let aiResponse: string;
      let messageType: 'text' | 'transaction' | 'advice' | 'budget' | 'chart' = 'text';
      let messageMetadata: any = undefined;

      if (budgetIntent.isBudgetRequest && budgetIntent.confidence > 0.6) {
        // 예산 관련 요청 처리
        try {
          if (budgetIntent.intentType === 'create') {
            const budgetParseResult = await BudgetLLMService.parseBudgetFromText(content);

            if (budgetParseResult.success && budgetParseResult.budgetData) {
              aiResponse = `✅ 예산을 설정하겠습니다!\n\n` +
                `📋 ${budgetParseResult.budgetData.name}\n` +
                `💰 ${budgetParseResult.budgetData.amount?.toLocaleString()}원\n` +
                `📅 ${budgetParseResult.budgetData.period === 'monthly' ? '월간' : budgetParseResult.budgetData.period}\n\n` +
                `이 예산으로 설정할까요?`;

              messageType = 'budget';
              messageMetadata = {
                budget: budgetParseResult.budgetData,
                action: 'create_pending',
              };
            } else {
              aiResponse = `💭 예산 정보를 정확히 파악하지 못했습니다.\n\n` +
                `다음 정보를 포함해서 다시 말씀해주세요:\n` +
                `• 카테고리 (식비, 교통비, 쇼핑 등)\n` +
                `• 금액 (예: 30만원)\n` +
                `• 기간 (매월, 매주 등)\n\n` +
                `예시: "매월 식비 30만원으로 예산 설정해줘"`;
            }
          } else {
            // 예산 조언, 조회 등
            aiResponse = await BudgetLLMService.getBudgetAdvice(content);
            messageType = 'advice';
          }
        } catch (budgetError) {
          console.warn('예산 처리 실패:', budgetError);
          aiResponse = await pythonLLMService.getFinancialAdvice(content);
        }
      } else if (isTransactionMessage) {
        try {
          console.log('거래 메시지로 감지됨:', content);
          // 새로운 거래 처리 시스템 사용
          const transaction = await processTransaction(content);
          console.log('processTransaction 결과:', transaction);

          if (transaction) {
            // 성공적으로 거래가 기록됨
            // 백엔드 카테고리명을 CategoryType으로 매핑
            const categoryMap: Record<string, CategoryType> = {
              'FOOD_DINING': CategoryType.FOOD,
              'TRANSPORTATION': CategoryType.TRANSPORT,
              'ENTERTAINMENT': CategoryType.ENTERTAINMENT,
              'SHOPPING': CategoryType.SHOPPING,
              'HEALTHCARE': CategoryType.HEALTHCARE,
              'EDUCATION': CategoryType.EDUCATION,
              'UTILITIES': CategoryType.UTILITIES,
              'HOUSING': CategoryType.HOUSING,
              'INCOME': CategoryType.INCOME,
            };

            const mappedCategory = categoryMap[transaction.category] || CategoryType.OTHER;
            const categoryInfo = CATEGORIES[mappedCategory] || CATEGORIES[CategoryType.OTHER];
            aiResponse = `✅ 거래를 기록했습니다!\n\n` +
              `💰 ${transaction.isIncome ? '+' : '-'}${Math.abs(transaction.amount).toLocaleString()}원\n` +
              `${categoryInfo.icon} ${categoryInfo.name}${transaction.subcategory ? ` > ${transaction.subcategory}` : ''}\n` +
              `📝 ${transaction.description}` +
              `${transaction.location ? `\n📍 ${transaction.location}` : ''}`;

            messageType = 'transaction';
            messageMetadata = {
              transaction: {
                id: transaction.id,
                amount: transaction.amount,
                category: transaction.category,
                subcategory: transaction.subcategory,
                description: transaction.description,
                location: transaction.location,
                isIncome: transaction.isIncome,
                confidence: transaction.confidence,
                date: transaction.date,
              },
            };
          } else {
            // 거래 파싱 실패했지만 거래로 추정되는 경우
            aiResponse = '💭 거래 내용을 정확히 파악하지 못했습니다.\n더 구체적으로 말씀해주세요.\n\n예시: "스타벅스에서 아메리카노 4500원 카드로 결제"';
          }
        } catch (transactionError) {
          console.warn('거래 처리 실패:', transactionError);
          // 거래 파싱 실패 시 일반 채팅으로 처리
          aiResponse = await pythonLLMService.getFinancialAdvice(content);
        }
      } else {
        // 일반 재정 상담
        aiResponse = await pythonLLMService.getFinancialAdvice(content);

        // 조언 관련 키워드가 있으면 advice 타입으로 설정
        if (content.includes('조언') || content.includes('팁') || content.includes('어떻게') || content.includes('방법')) {
          messageType = 'advice';
          messageMetadata = {
            advice: {
              suggestions: ['더 자세한 상황을 알려주세요', '구체적인 목표를 설정해보세요', '단계적 계획을 세워보세요'],
              analysis: 'AI 재정 코치 분석',
            },
          };
        }
      }

      // 타이핑 중지
      setIsTyping(false);

      // AI 응답 추가
      addMessage({
        content: aiResponse,
        sender: 'ai',
        type: messageType,
        status: 'sent',
        metadata: messageMetadata,
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

  // Transaction processing methods
  processTransaction: async (originalText: string): Promise<Transaction | null> => {
    try {
      // 1단계: 자연어 파싱
      const parsedData = NLPParser.parseTransactionText(originalText);

      if (!parsedData.amount || parsedData.amount <= 0) {
        console.warn('거래 금액을 파악할 수 없음:', originalText);
        return null;
      }

      // 2단계: AI 거래 파싱 (구조화된 응답 사용)
      let aiResult: { category: string; confidence: number; description?: string; amount?: number; paymentMethod?: string } | undefined;

      try {
        console.log('AI 거래 파싱 시작 - /transaction/parse 엔드포인트 사용');
        const aiResponse = await pythonLLMService.parseTransaction(originalText);
        if (aiResponse && aiResponse.category) {
          // 카테고리 매핑 (백엔드 한국어 -> 프론트엔드 영어)
          const categoryMapping: Record<string, string> = {
            '식비': 'FOOD_DINING',
            '교통비': 'TRANSPORTATION',
            '쇼핑': 'SHOPPING',
            '문화생활': 'ENTERTAINMENT',
            '의료비': 'HEALTHCARE',
            '교육비': 'EDUCATION',
            '기타': 'OTHER',
            '주거비': 'HOUSING',
            '공과금': 'UTILITIES',
            '수입': 'INCOME'
          };

          const mappedCategory = categoryMapping[aiResponse.category] || 'OTHER';

          aiResult = {
            category: mappedCategory,
            confidence: 0.8, // AI 파싱의 신뢰도
            description: aiResponse.description,
            amount: aiResponse.amount,
            paymentMethod: aiResponse.paymentMethod,
          };

          console.log('AI 거래 파싱 성공:', aiResult);
        }
      } catch (aiError) {
        console.warn('AI 거래 파싱 실패, 룰 베이스 분류로 진행:', aiError);
      }

      // 3단계: 종합 분류
      const classificationResult = ClassifierService.classifyTransaction(
        originalText,
        parsedData,
        aiResult
      );

      // 4단계: 최종 거래 데이터 생성 (AI 파싱 결과 우선 사용)
      // 소득 여부 판단: AI 결과가 '수입' 카테고리이거나 NLP 파서가 소득으로 판단한 경우
      const isIncomeFromAI = aiResult?.category === 'INCOME';
      const isIncomeFromNLP = parsedData.isIncome || false;
      const finalIsIncome = isIncomeFromAI || isIncomeFromNLP;

      const finalParsedData: ParsedTransaction = {
        amount: aiResult?.amount || parsedData.amount || 0,
        description: aiResult?.description || parsedData.description || '거래',
        paymentMethod: parsedData.paymentMethod || PaymentMethod.CARD,
        isIncome: finalIsIncome,
        category: finalIsIncome ? CategoryType.INCOME : classificationResult.category,
        subcategory: classificationResult.subcategory,
        confidence: aiResult ? Math.max(aiResult.confidence, classificationResult.confidence) : classificationResult.confidence,
        originalText,
        date: parsedData.date,
        location: parsedData.location,
        tags: parsedData.tags || [],
      };

      console.log('최종 거래 데이터:', finalParsedData);

      // 5단계: 거래 저장
      const transaction = await get().confirmTransaction(finalParsedData);

      return transaction;
    } catch (error) {
      console.error('거래 처리 중 오류:', error);
      return null;
    }
  },

  confirmTransaction: async (parsedData: ParsedTransaction): Promise<Transaction> => {
    try {
      // 거래 데이터를 AsyncStorage에 저장
      const transaction = await transactionStorage.addTransaction({
        amount: parsedData.amount,
        description: parsedData.description,
        category: parsedData.category,
        subcategory: parsedData.subcategory,
        date: parsedData.date || new Date(),
        paymentMethod: parsedData.paymentMethod,
        location: parsedData.location,
        isIncome: parsedData.isIncome,
        tags: parsedData.tags || [],
        confidence: parsedData.confidence,
        originalText: parsedData.originalText,
        aiParsed: true,
        userModified: false,
      });

      // 거래 저장 후 예산 정보 업데이트
      try {
        console.log('거래 저장 완료, 예산 정보 업데이트 시작...');
        const { useAuthStore } = await import('./authStore');
        const { useBudgetStore } = await import('./budgetStore');
        const { user } = useAuthStore.getState();

        if (user?.id) {
          console.log('사용자 ID 확인됨:', user.id);
          const { updateBudgetSpending, loadBudgetSummary } = useBudgetStore.getState();

          console.log('예산 지출 내역 업데이트 중...');
          await updateBudgetSpending(user.id);

          console.log('예산 요약 정보 로드 중...');
          await loadBudgetSummary(user.id);

          console.log('거래 저장 후 예산 정보 업데이트 완료');
        } else {
          console.warn('사용자 정보가 없음, 예산 업데이트 건너뜀');
        }
      } catch (budgetError) {
        console.error('예산 정보 업데이트 실패:', budgetError);
      }

      // 학습을 위해 분류 피드백 저장 (향후 구현)
      await ClassifierService.learnFromFeedback(
        parsedData.originalText,
        parsedData.category,
        parsedData.subcategory
      );

      return transaction;
    } catch (error) {
      console.error('거래 저장 실패:', error);
      throw error;
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
        onSpeechResults: results => {
          if (results && results.length > 0) {
            get().handleVoiceInput(results[0]);
          }
        },
        onSpeechPartialResults: results => {
          if (results && results.length > 0) {
            get().setVoiceText(results[0]);
          }
        },
        onSpeechError: error => {
          setVoiceError(error);
        },
        onSpeechVolumeChanged: volume => {
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
