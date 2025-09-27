import Voice, {
  SpeechRecognizedEvent,
  SpeechResultsEvent,
  SpeechErrorEvent,
  SpeechStartEvent,
  SpeechEndEvent,
  SpeechVolumeChangeEvent,
} from '@react-native-voice/voice';
import { Platform, PermissionsAndroid, Alert } from 'react-native';

export interface VoiceServiceConfig {
  locale?: string;
  timeout?: number;
  maxResults?: number;
  continuous?: boolean;
  interimResults?: boolean;
}

export interface VoiceServiceCallbacks {
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  onSpeechResults?: (results: string[]) => void;
  onSpeechPartialResults?: (results: string[]) => void;
  onSpeechError?: (error: string) => void;
  onSpeechVolumeChanged?: (volume: number) => void;
}

class VoiceService {
  private isListening = false;
  private config: VoiceServiceConfig;
  private callbacks: VoiceServiceCallbacks;

  constructor(config: VoiceServiceConfig = {}) {
    this.config = {
      locale: 'ko-KR',
      timeout: 30000, // 30초
      maxResults: 5,
      continuous: false,
      interimResults: true,
      ...config,
    };
    this.callbacks = {};
    this.setupVoiceEvents();
  }

  private setupVoiceEvents() {
    Voice.onSpeechStart = this.onSpeechStart.bind(this);
    Voice.onSpeechEnd = this.onSpeechEnd.bind(this);
    Voice.onSpeechResults = this.onSpeechResults.bind(this);
    Voice.onSpeechPartialResults = this.onSpeechPartialResults.bind(this);
    Voice.onSpeechError = this.onSpeechError.bind(this);
    Voice.onSpeechVolumeChanged = this.onSpeechVolumeChanged.bind(this);
  }

  setCallbacks(callbacks: VoiceServiceCallbacks) {
    this.callbacks = callbacks;
  }

  async checkPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        const hasPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
        );
        return hasPermission;
      }
      // iOS는 사용 시점에 자동으로 권한 요청
      return true;
    } catch (error) {
      console.error('Error checking permissions:', error);
      return false;
    }
  }

  async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: '마이크 접근 권한',
            message: '천마비고에서 음성으로 지출 내역을 입력하기 위해 마이크 접근 권한이 필요합니다.',
            buttonNeutral: '나중에 묻기',
            buttonNegative: '취소',
            buttonPositive: '허용',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }

  async startListening(): Promise<boolean> {
    try {
      if (this.isListening) {
        await this.stopListening();
      }

      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        const granted = await this.requestPermissions();
        if (!granted) {
          this.callbacks.onSpeechError?.('마이크 접근 권한이 필요합니다.');
          return false;
        }
      }

      await Voice.start(this.config.locale || 'ko-KR', {
        EXTRA_LANGUAGE_MODEL: 'LANGUAGE_MODEL_FREE_FORM',
        EXTRA_CALLING_PACKAGE: 'com.cheonmabigo.app',
        EXTRA_PARTIAL_RESULTS: this.config.interimResults,
        REQUEST_PERMISSIONS_AUTO: true,
        EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS: this.config.timeout,
        EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS: 3000,
      });

      this.isListening = true;
      return true;
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      this.callbacks.onSpeechError?.('음성 인식을 시작할 수 없습니다.');
      return false;
    }
  }

  async stopListening(): Promise<void> {
    try {
      if (this.isListening) {
        await Voice.stop();
        this.isListening = false;
      }
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
    }
  }

  async cancelListening(): Promise<void> {
    try {
      if (this.isListening) {
        await Voice.cancel();
        this.isListening = false;
      }
    } catch (error) {
      console.error('Error canceling voice recognition:', error);
    }
  }

  async destroy(): Promise<void> {
    try {
      await Voice.destroy();
      this.isListening = false;
    } catch (error) {
      console.error('Error destroying voice recognition:', error);
    }
  }

  async getAvailableLanguages(): Promise<string[]> {
    try {
      // React Native Voice에서 지원하는 기본 언어들
      return ['ko-KR', 'en-US', 'ja-JP', 'zh-CN'];
    } catch (error) {
      console.error('Error getting available languages:', error);
      return ['ko-KR', 'en-US'];
    }
  }

  getIsListening(): boolean {
    return this.isListening;
  }

  // Voice 이벤트 핸들러들
  private onSpeechStart(event: SpeechStartEvent) {
    console.log('Speech recognition started');
    this.callbacks.onSpeechStart?.();
  }

  private onSpeechEnd(event: SpeechEndEvent) {
    console.log('Speech recognition ended');
    this.isListening = false;
    this.callbacks.onSpeechEnd?.();
  }

  private onSpeechResults(event: SpeechResultsEvent) {
    console.log('Speech results:', event.value);
    if (event.value && event.value.length > 0) {
      this.callbacks.onSpeechResults?.(event.value);
    }
  }

  private onSpeechPartialResults(event: SpeechResultsEvent) {
    console.log('Speech partial results:', event.value);
    if (event.value && event.value.length > 0) {
      this.callbacks.onSpeechPartialResults?.(event.value);
    }
  }

  private onSpeechError(event: SpeechErrorEvent) {
    console.error('Speech recognition error:', event.error);
    this.isListening = false;

    let errorMessage = '음성 인식 중 오류가 발생했습니다.';

    switch (event.error?.code) {
      case '1':
        errorMessage = '네트워크 연결을 확인해주세요.';
        break;
      case '2':
        errorMessage = '오디오 녹음 중 오류가 발생했습니다.';
        break;
      case '3':
        errorMessage = '오디오를 받을 수 없습니다.';
        break;
      case '4':
        errorMessage = '서버 오류가 발생했습니다.';
        break;
      case '5':
        errorMessage = '클라이언트 오류가 발생했습니다.';
        break;
      case '6':
        errorMessage = '음성을 인식할 수 없습니다. 다시 시도해주세요.';
        break;
      case '7':
        errorMessage = '음성 인식 서비스를 사용할 수 없습니다.';
        break;
      case '8':
        errorMessage = '충분한 권한이 없습니다.';
        break;
      case '9':
        errorMessage = '음성이 너무 짧습니다. 조금 더 길게 말씀해주세요.';
        break;
      default:
        if (event.error?.message) {
          errorMessage = event.error.message;
        }
    }

    this.callbacks.onSpeechError?.(errorMessage);
  }

  private onSpeechVolumeChanged(event: SpeechVolumeChangeEvent) {
    const volume = event.value || 0;
    this.callbacks.onSpeechVolumeChanged?.(volume);
  }

  // 한국어 금융 용어 특화 설정
  optimizeForKoreanFinance() {
    // 금융 용어 인식을 위한 설정 최적화
    this.config = {
      ...this.config,
      locale: 'ko-KR',
      continuous: false,
      interimResults: true,
      timeout: 15000, // 15초로 단축
    };
  }

  // 숫자 및 금액 인식 최적화
  optimizeForNumbers() {
    this.config = {
      ...this.config,
      locale: 'ko-KR',
      interimResults: false, // 최종 결과만 받아서 정확도 향상
    };
  }
}

// 싱글톤 인스턴스
export const voiceService = new VoiceService();
export default VoiceService;