# 채팅 인터페이스 구현

사용자가 AI와 자연스럽게 대화할 수 있는 채팅 UI를 구현합니다.

## 실행할 작업

1. **채팅 화면 레이아웃**
   - `src/screens/chat/ChatScreen.tsx` - 메인 채팅 화면
   - 상단: 천마비고 제목 및 상태
   - 중앙: 메시지 리스트
   - 하단: 입력 영역

2. **메시지 컴포넌트**
   - `src/components/chat/MessageBubble.tsx` - 메시지 버블
   - 사용자 메시지: 오른쪽 정렬, 보라색 배경
   - AI 응답: 왼쪽 정렬, 흰색 배경, 그림자
   - 타임스탬프 표시
   - 메시지 상태 (전송중, 완료, 실패)

3. **입력 영역 구현**
   - `src/components/chat/MessageInput.tsx`
   - 텍스트 입력 필드
   - 전송 버튼 (보라색 원형)
   - 음성 입력 버튼
   - 자동 높이 조절

4. **메시지 리스트**
   - `src/components/chat/MessageList.tsx`
   - FlatList 또는 VirtualizedList 사용
   - 역순 정렬 (최신 메시지가 하단)
   - 자동 스크롤
   - 당겨서 새로고침

5. **타이핑 인디케이터**
   - AI 응답 대기 중 애니메이션
   - 점 3개 애니메이션
   - 로딩 상태 표시

6. **메시지 타입 처리**
   - 텍스트 메시지
   - 거래 확인 메시지 (카드 형태)
   - 차트/그래프 메시지
   - 액션 버튼 포함 메시지

7. **실시간 기능**
   - 즉시 메시지 전송
   - AI 응답 스트리밍 (가능한 경우)
   - 메시지 상태 업데이트
   - 에러 처리 및 재전송

8. **UX 개선사항**
   - 키보드 높이 자동 조절
   - 스크롤 위치 기억
   - 메시지 복사 기능
   - 길게 누르기 컨텍스트 메뉴

**채팅 컴포넌트 구조**:
```typescript
interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type: 'text' | 'transaction' | 'chart';
  status: 'sending' | 'sent' | 'error';
  metadata?: any;
}

interface ChatState {
  messages: Message[];
  isTyping: boolean;
  inputText: string;
  isLoading: boolean;
}
```

**UI 스타일링**:
- 메시지 버블: 16px 둥근 모서리
- 사용자 메시지: 보라색 그라데이션
- AI 메시지: 흰색 배경, 미묘한 그림자
- 입력 필드: 둥근 모서리, 보더
- 전송 버튼: 원형, 보라색 배경

**추가 인수**: $ARGUMENTS (특정 메시지 타입이나 기능)

채팅 인터페이스 완료 후 `/7-voice-input` 명령어로 음성 입력을 구현하세요.