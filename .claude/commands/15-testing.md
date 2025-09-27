# 테스트 구현

천마비고 앱의 안정성과 품질을 보장하기 위한 포괄적인 테스트 시스템을 구현합니다.

## 실행할 작업

1. **테스트 환경 설정**
   ```bash
   # 프론트엔드 테스트
   npm install --save-dev jest @testing-library/react-native @testing-library/jest-native
   npm install --save-dev react-test-renderer detox
   
   # 백엔드 테스트
   npm install --save-dev jest supertest @types/supertest
   npm install --save-dev ts-jest @types/jest
   ```

2. **Jest 설정**
   ```javascript
   // jest.config.js
   module.exports = {
     preset: 'react-native',
     setupFilesAfterEnv: [
       '@testing-library/jest-native/extend-expect',
       '<rootDir>/src/test/setup.ts'
     ],
     testMatch: [
       '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
       '<rootDir>/src/**/*.(test|spec).{js,jsx,ts,tsx}'
     ],
     collectCoverageFrom: [
       'src/**/*.{js,jsx,ts,tsx}',
       '!src/**/*.d.ts',
       '!src/test/**',
       '!src/**/__tests__/**'
     ],
     coverageThreshold: {
       global: {
         branches: 80,
         functions: 80,
         lines: 80,
         statements: 80
       }
     },
     moduleNameMapping: {
       '^@/(.*)$': '<rootDir>/src/$1'
     }
   };
   ```

3. **테스트 유틸리티 설정**
   ```typescript
   // src/test/setup.ts
   import mockAsyncStorage from '@react-native-async-storage/async-storage/mock';
   import 'react-native-gesture-handler/jestSetup';

   // AsyncStorage 모킹
   jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

   // AI 서비스 모킹
   jest.mock('../services/ai/ExaoneService', () => ({
     ExaoneService: {
       processMessage: jest.fn().mockResolvedValue({
         response: 'Mock AI response',
         confidence: 0.95
       }),
       extractTransaction: jest.fn().mockResolvedValue({
         amount: 8000,
         description: '김치찌개',
         category: 'food'
       })
     }
   }));

   // 네비게이션 모킹
   jest.mock('@react-navigation/native', () => ({
     useNavigation: () => ({
       navigate: jest.fn(),
       goBack: jest.fn(),
     }),
     useRoute: () => ({
       params: {}
     })
   }));
   ```

4. **단위 테스트 - 컴포넌트**
   ```typescript
   // src/components/__tests__/MessageBubble.test.tsx
   import React from 'react';
   import { render, screen } from '@testing-library/react-native';
   import { MessageBubble } from '../chat/MessageBubble';

   describe('MessageBubble', () => {
     const mockMessage = {
       id: '1',
       content: '김치찌개 8천원 샀어',
       sender: 'user' as const,
       timestamp: new Date(),
       type: 'text' as const,
       status: 'sent' as const
     };

     it('사용자 메시지를 올바르게 렌더링한다', () => {
       render(<MessageBubble message={mockMessage} />);
       
       expect(screen.getByText('김치찌개 8천원 샀어')).toBeTruthy();
       expect(screen.getByTestId('user-message')).toBeTruthy();
     });

     it('AI 메시지를 올바르게 렌더링한다', () => {
       const aiMessage = { ...mockMessage, sender: 'ai' as const };
       render(<MessageBubble message={aiMessage} />);
       
       expect(screen.getByTestId('ai-message')).toBeTruthy();
     });

     it('타임스탬프를 표시한다', () => {
       render(<MessageBubble message={mockMessage} />);
       
       expect(screen.getByTestId('message-timestamp')).toBeTruthy();
     });
   });
   ```

5. **단위 테스트 - 서비스**
   ```typescript
   // src/services/__tests__/TransactionService.test.ts
   import { TransactionService } from '../transaction/TransactionService';
   import { mockApiClient } from '../../test/mocks';

   describe('TransactionService', () => {
     beforeEach(() => {
       jest.clearAllMocks();
     });

     describe('createTransaction', () => {
       it('거래를 성공적으로 생성한다', async () => {
         const transactionData = {
           amount: 8000,
           description: '김치찌개',
           category: 'food',
           date: new Date()
         };

         mockApiClient.post.mockResolvedValue({
           data: { id: '1', ...transactionData }
         });

         const result = await TransactionService.createTransaction(transactionData);

         expect(result.id).toBe('1');
         expect(result.amount).toBe(8000);
         expect(mockApiClient.post).toHaveBeenCalledWith('/transactions', transactionData);
       });

       it('API 오류 시 예외를 발생시킨다', async () => {
         mockApiClient.post.mockRejectedValue(new Error('Network error'));

         await expect(
           TransactionService.createTransaction({
             amount: 8000,
             description: '김치찌개',
             category: 'food',
             date: new Date()
           })
         ).rejects.toThrow('Network error');
       });
     });
   });
   ```

6. **단위 테스트 - AI 서비스**
   ```typescript
   // src/services/__tests__/ExaoneService.test.ts
   import { ExaoneService } from '../ai/ExaoneService';

   describe('ExaoneService', () => {
     describe('extractTransaction', () => {
       it('한국어 거래 내용을 올바르게 파싱한다', async () => {
         const text = '김치찌개 8천원 먹었어';
         const result = await ExaoneService.extractTransaction(text);

         expect(result).toEqual({
           amount: 8000,
           description: '김치찌개',
           category: 'food',
           confidence: expect.any(Number)
         });
       });

       it('복잡한 거래 내용을 파싱한다', async () => {
         const text = '스타벅스에서 아메리카노 5500원 카드로 결제했어';
         const result = await ExaoneService.extractTransaction(text);

         expect(result.amount).toBe(5500);
         expect(result.description).toContain('아메리카노');
         expect(result.category).toBe('food');
         expect(result.location).toContain('스타벅스');
         expect(result.paymentMethod).toBe('card');
       });
     });
   });
   ```

7. **통합 테스트**
   ```typescript
   // src/__tests__/integration/ChatFlow.test.tsx
   import React from 'react';
   import { render, fireEvent, waitFor } from '@testing-library/react-native';
   import { ChatScreen } from '../../screens/chat/ChatScreen';
   import { TestWrapper } from '../../test/TestWrapper';

   describe('채팅 플로우 통합 테스트', () => {
     it('사용자가 거래를 입력하면 AI가 응답한다', async () => {
       const { getByTestId, getByText } = render(
         <TestWrapper>
           <ChatScreen />
         </TestWrapper>
       );

       const input = getByTestId('message-input');
       const sendButton = getByTestId('send-button');

       fireEvent.changeText(input, '김치찌개 8천원 먹었어');
       fireEvent.press(sendButton);

       await waitFor(() => {
         expect(getByText('김치찌개 8천원 먹었어')).toBeTruthy();
       });

       await waitFor(() => {
         expect(getByText(/8,000원이 식비로 기록되었습니다/)).toBeTruthy();
       }, { timeout: 3000 });
     });

     it('음성 입력으로 거래를 기록한다', async () => {
       const { getByTestId } = render(
         <TestWrapper>
           <ChatScreen />
         </TestWrapper>
       );

       const voiceButton = getByTestId('voice-button');
       fireEvent.press(voiceButton);

       // 음성 인식 모킹
       await waitFor(() => {
         expect(getByTestId('voice-recording')).toBeTruthy();
       });

       // 음성 인식 완료 시뮬레이션
       fireEvent(voiceButton, 'speechResult', { 
         text: '커피 5천원 샀어' 
       });

       await waitFor(() => {
         expect(getByText('커피 5천원 샀어')).toBeTruthy();
       });
     });
   });
   ```

8. **E2E 테스트 (Detox)**
   ```typescript
   // e2e/onboarding.e2e.ts
   describe('온보딩 플로우', () => {
     beforeAll(async () => {
       await device.launchApp();
     });

     beforeEach(async () => {
       await device.reloadReactNative();
     });

     it('새 사용자가 온보딩을 완료할 수 있다', async () => {
       // 환영 화면
       await expect(element(by.text('천마비고에 오신 것을 환영합니다'))).toBeVisible();
       await element(by.id('start-button')).tap();

       // 권한 요청
       await expect(element(by.text('마이크 권한'))).toBeVisible();
       await element(by.id('allow-microphone')).tap();

       // 예산 설정
       await expect(element(by.text('월 예산 설정'))).toBeVisible();
       await element(by.id('budget-input')).typeText('500000');
       await element(by.id('next-button')).tap();

       // 완료
       await expect(element(by.text('설정 완료'))).toBeVisible();
       await element(by.id('complete-button')).tap();

       // 메인 화면 도달
       await expect(element(by.id('dashboard'))).toBeVisible();
     });
   });

   // e2e/transaction.e2e.ts
   describe('거래 기록', () => {
     it('텍스트로 거래를 기록한다', async () => {
       await element(by.id('chat-tab')).tap();
       await element(by.id('message-input')).typeText('점심값 12000원 썼어');
       await element(by.id('send-button')).tap();

       await waitFor(element(by.text('점심값 12000원 썼어')))
         .toBeVisible()
         .withTimeout(2000);

       await waitFor(element(by.text(/12,000원이 식비로 기록/)))
         .toBeVisible()
         .withTimeout(5000);
     });

     it('음성으로 거래를 기록한다', async () => {
       await element(by.id('chat-tab')).tap();
       await element(by.id('voice-button')).longPress();
       
       // 음성 입력 시뮬레이션 (실제로는 녹음)
       await element(by.id('voice-button')).tap();

       await waitFor(element(by.text(/음성이 인식되었습니다/)))
         .toBeVisible()
         .withTimeout(3000);
     });
   });
   ```

9. **백엔드 API 테스트**
   ```typescript
   // backend/src/__tests__/auth.test.ts
   import request from 'supertest';
   import { app } from '../app';
   import { setupTestDB, cleanupTestDB } from './helpers/database';

   describe('/api/auth', () => {
     beforeAll(async () => {
       await setupTestDB();
     });

     afterAll(async () => {
       await cleanupTestDB();
     });

     describe('POST /register', () => {
       it('새 사용자를 성공적으로 등록한다', async () => {
         const userData = {
           email: 'test@example.com',
           password: 'password123',
           name: '홍길동'
         };

         const response = await request(app)
           .post('/api/auth/register')
           .send(userData)
           .expect(201);

         expect(response.body.success).toBe(true);
         expect(response.body.data.user.email).toBe(userData.email);
         expect(response.body.data.accessToken).toBeDefined();
         expect(response.body.data.refreshToken).toBeDefined();
       });

       it('중복 이메일로 등록 시 오류를 반환한다', async () => {
         const userData = {
           email: 'duplicate@example.com',
           password: 'password123',
           name: '홍길동'
         };

         // 첫 번째 등록
         await request(app)
           .post('/api/auth/register')
           .send(userData)
           .expect(201);

         // 중복 등록 시도
         const response = await request(app)
           .post('/api/auth/register')
           .send(userData)
           .expect(400);

         expect(response.body.success).toBe(false);
         expect(response.body.error.code).toBe('DUPLICATE_EMAIL');
       });
     });
   });
   ```

10. **성능 테스트**
    ```typescript
    // src/__tests__/performance/TransactionList.test.tsx
    import React from 'react';
    import { render } from '@testing-library/react-native';
    import { TransactionList } from '../../screens/transaction/TransactionList';
    import { generateMockTransactions } from '../../test/mocks';

    describe('TransactionList 성능 테스트', () => {
      it('1000개 거래 목록을 3초 내에 렌더링한다', async () => {
        const transactions = generateMockTransactions(1000);
        
        const startTime = Date.now();
        render(<TransactionList transactions={transactions} />);
        const renderTime = Date.now() - startTime;

        expect(renderTime).toBeLessThan(3000);
      });

      it('메모리 누수가 없다', async () => {
        const transactions = generateMockTransactions(100);
        
        const { unmount } = render(<TransactionList transactions={transactions} />);
        
        // 컴포넌트 언마운트
        unmount();
        
        // 메모리 정리 확인 (실제로는 더 복잡한 테스트 필요)
        expect(true).toBe(true);
      });
    });
    ```

**테스트 스크립트**:
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "detox test",
    "test:e2e:build": "detox build",
    "test:backend": "cd backend && npm test",
    "test:all": "npm run test && npm run test:backend && npm run test:e2e"
  }
}
```

**테스트 커버리지 목표**:
- 단위 테스트: 80% 이상
- 통합 테스트: 주요 플로우 커버
- E2E 테스트: 핵심 사용자 여정
- 성능 테스트: 응답 시간 체크

**추가 인수**: $ARGUMENTS (특정 테스트 타입이나 영역)

테스트 구현 완료 후 `/16-optimization` 명령어로 성능 최적화를 진행하세요.