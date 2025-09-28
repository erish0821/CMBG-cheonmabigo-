import axios, { AxiosInstance, AxiosResponse } from 'axios';

// 타입 정의
interface ChatRequest {
  message: string;
  system_message?: string;
  max_tokens?: number;
  temperature?: number;
}

interface ChatResponse {
  response: string;
  status: string;
}

interface TransactionRequest {
  text: string;
}

interface TransactionResponse {
  amount: number;
  description: string;
  category: string;
  payment_method: string;
  status: string;
}

interface HealthResponse {
  status: string;
  model_info: {
    model_loaded: boolean;
    tokenizer_loaded: boolean;
    device: string;
    cuda_available: boolean;
    cuda_devices: number;
    model_name: string;
  };
}

class PythonLLMService {
  private client: AxiosInstance;
  private baseUrl: string;
  private maxRetries: number = 3;
  private retryDelay: number = 1000; // 1초

  constructor() {
    // 개발/프로덕션 환경에 따른 URL 설정
    this.baseUrl = __DEV__
      ? 'http://localhost:8001'
      : 'https://api.cheonmabigoapp.com';

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 60000, // 60초 타임아웃 (AI 모델 응답 시간 고려)
      headers: {
        'Content-Type': 'application/json',
      },
      // 재시도 설정
      validateStatus: (status) => status < 500, // 5xx 에러만 재시도
    });

    // 요청/응답 인터셉터 설정
    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // 요청 인터셉터
    this.client.interceptors.request.use(
      (config) => {
        console.log(`[PythonLLM] 요청: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('[PythonLLM] 요청 에러:', error);
        return Promise.reject(error);
      }
    );

    // 응답 인터셉터
    this.client.interceptors.response.use(
      (response) => {
        console.log(`[PythonLLM] 응답 성공: ${response.status}`);
        return response;
      },
      (error) => {
        console.error('[PythonLLM] 응답 에러:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * 재시도 로직이 포함된 안전한 요청 실행
   */
  private async executeWithRetry<T>(
    operation: () => Promise<AxiosResponse<T>>,
    operationName: string
  ): Promise<AxiosResponse<T>> {
    let lastError: any;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`[PythonLLM] ${operationName} 시도 ${attempt}/${this.maxRetries}`);
        const response = await operation();

        if (attempt > 1) {
          console.log(`[PythonLLM] ${operationName} 재시도 성공 (${attempt}번째 시도)`);
        }

        return response;
      } catch (error: any) {
        lastError = error;

        console.warn(`[PythonLLM] ${operationName} 시도 ${attempt} 실패:`, error.message);

        // 마지막 시도가 아니면 재시도
        if (attempt < this.maxRetries) {
          // 지수적 백오프: 1초, 2초, 4초
          const delay = this.retryDelay * Math.pow(2, attempt - 1);
          console.log(`[PythonLLM] ${delay}ms 후 재시도...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }

  /**
   * 서버 상태 확인
   */
  async checkHealth(): Promise<HealthResponse> {
    try {
      const response = await this.executeWithRetry(
        () => this.client.get<HealthResponse>('/health'),
        'Health check'
      );
      return response.data;
    } catch (error) {
      console.error('[PythonLLM] Health check 최종 실패:', error);
      throw new Error('서버 연결에 실패했습니다.');
    }
  }

  /**
   * AI 채팅 응답 생성
   */
  async generateChatResponse(
    message: string,
    systemMessage?: string,
    maxTokens: number = 256,
    temperature: number = 0.7
  ): Promise<string> {
    try {
      const request: ChatRequest = {
        message,
        system_message: systemMessage,
        max_tokens: maxTokens,
        temperature,
      };

      const response = await this.executeWithRetry(
        () => this.client.post<ChatResponse>('/chat', request),
        'Chat response generation'
      );

      if (response.data.status === 'success') {
        return response.data.response;
      } else {
        throw new Error('AI 응답 생성에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('[PythonLLM] 채팅 응답 생성 최종 실패:', error);

      if (error.response?.status === 503) {
        throw new Error('AI 모델이 로드되지 않았습니다. 잠시 후 다시 시도해주세요.');
      } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        throw new Error('서버에 연결할 수 없습니다. 네트워크를 확인해주세요.');
      } else {
        throw new Error('AI 응답 생성 중 오류가 발생했습니다.');
      }
    }
  }

  /**
   * 자연어 거래 내용 파싱
   */
  async parseTransaction(text: string): Promise<{
    amount: number;
    description: string;
    category: string;
    paymentMethod: string;
  }> {
    try {
      const request: TransactionRequest = { text };

      const response = await this.executeWithRetry(
        () => this.client.post<TransactionResponse>('/transaction/parse', request),
        'Transaction parsing'
      );

      if (response.data.status === 'success') {
        return {
          amount: response.data.amount,
          description: response.data.description,
          category: response.data.category,
          paymentMethod: response.data.payment_method,
        };
      } else {
        throw new Error('거래 내용 파싱에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('[PythonLLM] 거래 파싱 최종 실패:', error);

      if (error.response?.status === 503) {
        throw new Error('AI 모델이 로드되지 않았습니다. 잠시 후 다시 시도해주세요.');
      } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        throw new Error('서버에 연결할 수 없습니다. 네트워크를 확인해주세요.');
      } else {
        // 파싱 실패 시 기본값 반환
        console.warn('[PythonLLM] 파싱 실패로 기본값 반환:', text);
        return {
          amount: 0,
          description: text,
          category: '기타',
          paymentMethod: '카드',
        };
      }
    }
  }

  /**
   * 천마비고 AI 코치로서 재정 상담
   */
  async getFinancialAdvice(message: string): Promise<string> {
    const systemMessage = `당신은 천마비고, 한국의 친근한 AI 재정 코치입니다.
사용자의 재정 관리를 도와주는 것이 주요 역할입니다.
- 친근하고 격려적인 말투로 대화해주세요
- 한국의 금융 상황과 문화를 이해하고 있습니다
- 구체적이고 실용적인 조언을 제공해주세요
- 사용자의 소비 패턴을 분석하고 개선점을 제안해주세요`;

    return this.generateChatResponse(message, systemMessage, 256, 0.7);
  }

  /**
   * 서버 연결 테스트
   */
  async testConnection(): Promise<boolean> {
    try {
      const health = await this.checkHealth();
      return health.status === 'healthy' && health.model_info.model_loaded;
    } catch (error) {
      console.error('[PythonLLM] 연결 테스트 실패:', error);
      return false;
    }
  }

  /**
   * 모델 정보 조회
   */
  async getModelInfo(): Promise<any> {
    try {
      const response = await this.client.get('/model/info');
      return response.data;
    } catch (error) {
      console.error('[PythonLLM] 모델 정보 조회 실패:', error);
      throw new Error('모델 정보를 가져올 수 없습니다.');
    }
  }

  /**
   * 서버 URL 반환 (디버깅용)
   */
  getServerUrl(): string {
    return this.baseUrl;
  }
}

// 싱글톤 인스턴스 생성
export const pythonLLMService = new PythonLLMService();

// 기본 내보내기
export default PythonLLMService;