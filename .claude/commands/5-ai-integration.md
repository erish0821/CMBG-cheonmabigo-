# LGAI EXAONE 3.5 7.8B AI 모델 통합

천마비고의 핵심인 한국어 최적화 AI 모델을 통합합니다.

## 실행할 작업

1. **AI 라이브러리 설치**
   ```bash
   npm install @xenova/transformers react-native-fs
   # 또는 API 방식의 경우
   npm install axios react-native-async-storage
   ```

2. **EXAONE 모델 설정**
   - 모델명: "LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct"
   - 시스템 프롬프트 정의
   - 토크나이저 설정
   - 모델 로딩 최적화

3. **AI 서비스 모듈 생성**
   - `src/services/ai/ExaoneService.ts` - 메인 AI 서비스
   - `src/services/ai/PromptManager.ts` - 프롬프트 관리
   - `src/services/ai/ResponseParser.ts` - 응답 파싱
   - `src/types/ai.ts` - AI 관련 타입 정의

4. **프롬프트 엔지니어링**
   ```typescript
   const systemPrompt = `
   당신은 천마비고라는 이름의 도움이 되는 한국 재정 어시스턴트입니다.
   
   역할:
   - 친근하고 자연스러운 대화
   - 개인화된 재정 조언 제공
   - 거래 내용을 정확히 분류
   - 실현 가능한 절약 방법 제시
   - 긍정적이고 건설적인 피드백
   
   응답 형식:
   - 간결하고 이해하기 쉽게
   - 구체적인 금액과 데이터 활용
   - 단계별 가이드 제공
   `;
   ```

5. **의도 분류 시스템**
   - 거래 기록: 지출/수입 입력
   - 질문/상담: 재정 조언 요청
   - 목표 설정: 저축/예산 목표
   - 분석 요청: 지출 패턴 분석

6. **응답 처리 로직**
   - 거래 정보 추출 (금액, 카테고리, 날짜)
   - 엔티티 인식 (상호명, 결제수단)
   - 감정 분석 및 톤 조절
   - 오류 처리 및 재시도 로직

7. **캐싱 및 최적화**
   - 응답 캐싱 시스템
   - 토큰 사용량 최적화
   - 배치 처리 지원
   - 오프라인 대응

8. **한국어 특화 기능**
   - 한국 통화 단위 처리 (원, 만원)
   - 한국 결제 문화 이해
   - 지역별 상호명 인식
   - 구어체 표현 처리

**API 설정 예시**:
```typescript
interface ExaoneConfig {
  modelName: string;
  maxTokens: number;
  temperature: number;
  systemPrompt: string;
  contextWindow: number;
}

class ExaoneService {
  async processMessage(userInput: string): Promise<AIResponse> {
    // 메시지 처리 로직
  }
  
  async extractTransaction(text: string): Promise<Transaction> {
    // 거래 정보 추출
  }
  
  async generateAdvice(context: UserContext): Promise<string> {
    // 개인화 조언 생성
  }
}
```

**추가 인수**: $ARGUMENTS (모델 설정이나 특정 기능)

AI 통합 완료 후 `/6-chat-interface` 명령어로 채팅 UI를 구현하세요.