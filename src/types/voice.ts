// 음성 인식 관련 타입 정의

export interface VoiceState {
  isRecording: boolean;
  isProcessing: boolean;
  recognizedText: string;
  error: string | null;
  audioLevel: number;
  recordingTime: number;
  isAvailable: boolean;
  hasPermission: boolean;
}

export interface VoiceRecognitionResult {
  text: string;
  confidence: number;
  isFinal: boolean;
  timestamp: Date;
}

export interface VoiceSettings {
  locale: string;
  timeout: number;
  maxResults: number;
  continuous: boolean;
  interimResults: boolean;
  autoSend: boolean;
  enableWakeWord: boolean;
  wakeWord: string;
}

export interface VoiceError {
  code: string;
  message: string;
  timestamp: Date;
}

export interface VoicePermissionStatus {
  microphone: 'granted' | 'denied' | 'undetermined';
  speechRecognition: 'granted' | 'denied' | 'undetermined';
}

export interface VoiceCommand {
  phrase: string;
  action: string;
  parameters?: Record<string, any>;
  confidence: number;
}

// 한국어 금융 용어 매핑
export interface KoreanFinanceTerms {
  // 금액 표현
  amounts: {
    [key: string]: number;
  };

  // 카테고리 매핑
  categories: {
    [key: string]: string;
  };

  // 장소/위치 매핑
  locations: {
    [key: string]: string;
  };

  // 시간 표현
  timeExpressions: {
    [key: string]: string;
  };
}

// 음성 입력 의도 분류
export type VoiceIntent =
  | 'expense_record'    // 지출 기록
  | 'income_record'     // 수입 기록
  | 'balance_inquiry'   // 잔액 조회
  | 'category_analysis' // 카테고리별 분석
  | 'goal_setting'      // 목표 설정
  | 'general_question'  // 일반 질문
  | 'unknown';         // 알 수 없음

export interface VoiceIntentResult {
  intent: VoiceIntent;
  confidence: number;
  entities: {
    amount?: number;
    category?: string;
    location?: string;
    date?: string;
    description?: string;
  };
  originalText: string;
}

// 음성 피드백 설정
export interface VoiceFeedbackSettings {
  hapticEnabled: boolean;
  soundEnabled: boolean;
  visualEnabled: boolean;
  verboseMode: boolean;
}