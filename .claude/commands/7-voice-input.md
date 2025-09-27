# 음성 입력 기능 구현

사용자가 음성으로 거래를 기록하고 AI와 대화할 수 있는 기능을 구현합니다.

## 실행할 작업

1. **음성 인식 라이브러리 설치**
   ```bash
   npm install @react-native-voice/voice
   # iOS의 경우 추가 설정
   cd ios && pod install
   ```

2. **권한 설정**
   - Android: `android/app/src/main/AndroidManifest.xml`
   - iOS: `ios/천마비고/Info.plist`
   - 마이크 사용 권한 요청
   - 권한 체크 및 요청 로직

3. **음성 서비스 구현**
   - `src/services/voice/VoiceService.ts` - 메인 음성 서비스
   - 음성 인식 시작/중지
   - 실시간 텍스트 변환
   - 에러 처리

4. **음성 입력 컴포넌트**
   - `src/components/voice/VoiceInput.tsx`
   - 마이크 버튼 (원형, 애니메이션)
   - 녹음 상태 표시
   - 음성 레벨 시각화
   - 타이머 표시

5. **음성 인식 상태 관리**
   ```typescript
   interface VoiceState {
     isRecording: boolean;
     isProcessing: boolean;
     recognizedText: string;
     error: string | null;
     audioLevel: number;
   }
   ```

6. **실시간 음성 피드백**
   - 녹음 중 시각적 피드백 (파형 애니메이션)
   - 음성 레벨 표시
   - 인식된 텍스트 실시간 표시
   - 녹음 시간 카운터

7. **한국어 음성 인식 최적화**
   - 한국어 locale 설정 ('ko-KR')
   - 금융 용어 특화 설정
   - 숫자 인식 정확도 향상
   - 구어체 표현 처리

8. **핸즈프리 모드**
   - 음성 명령으로 앱 제어
   - "천마비고야" 웨이크업 워드 (선택사항)
   - 연속 대화 모드
   - 자동 전송 설정

9. **음성 입력 UX**
   - 길게 누르기로 녹음 시작
   - 손 떼면 녹음 종료
   - 슬라이드로 취소 기능
   - 햅틱 피드백

10. **접근성 지원**
    - 시각 장애인을 위한 음성 안내
    - VoiceOver/TalkBack 지원
    - 큰 터치 영역
    - 고대비 모드 지원

**음성 컴포넌트 구조**:
```typescript
interface VoiceInputProps {
  onSpeechResult: (text: string) => void;
  onSpeechStart: () => void;
  onSpeechEnd: () => void;
  onError: (error: string) => void;
  placeholder?: string;
  autoSend?: boolean;
}

class VoiceService {
  async startListening(): Promise<void>
  async stopListening(): Promise<void>
  async checkPermissions(): Promise<boolean>
  async requestPermissions(): Promise<boolean>
  getAvailableLanguages(): Promise<string[]>
}
```

**UI 디자인**:
- 마이크 버튼: 보라색 원형, 중앙 배치
- 녹음 중: 펄스 애니메이션, 빨간색 테두리
- 처리 중: 스피너 애니메이션
- 음성 레벨: 원형 파형 시각화

**에러 처리**:
- 권한 거부 시 안내 메시지
- 네트워크 오류 처리
- 인식 실패 시 재시도 옵션
- 시간 초과 처리

**추가 인수**: $ARGUMENTS (특정 음성 설정이나 언어)

음성 입력 완료 후 `/8-transaction-system` 명령어로 거래 시스템을 구현하세요.