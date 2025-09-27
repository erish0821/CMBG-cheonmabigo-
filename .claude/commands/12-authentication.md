# 인증 시스템 구현

JWT 기반의 안전한 사용자 인증 및 권한 관리 시스템을 구현합니다.

## 실행할 작업

1. **인증 라이브러리 설치**
   ```bash
   # 백엔드
   npm install jsonwebtoken bcryptjs crypto
   npm install --save-dev @types/jsonwebtoken @types/bcryptjs
   
   # 프론트엔드
   npm install @react-native-async-storage/async-storage
   npm install react-native-keychain
   ```

2. **비밀번호 해싱**
   ```typescript
   // src/utils/password.ts
   import bcrypt from 'bcryptjs';

   export class PasswordUtils {
     static async hash(password: string): Promise<string> {
       const salt = await bcrypt.genSalt(12);
       return bcrypt.hash(password, salt);
     }

     static async verify(password: string, hash: string): Promise<boolean> {
       return bcrypt.compare(password, hash);
     }
   }
   ```

3. **JWT 토큰 관리**
   ```typescript
   // src/services/AuthService.ts
   import jwt from 'jsonwebtoken';

   interface TokenPayload {
     userId: string;
     email: string;
     iat?: number;
     exp?: number;
   }

   export class AuthService {
     static generateAccessToken(payload: TokenPayload): string {
       return jwt.sign(payload, process.env.JWT_SECRET!, {
         expiresIn: '15m'
       });
     }

     static generateRefreshToken(payload: TokenPayload): string {
       return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
         expiresIn: '7d'
       });
     }

     static verifyToken(token: string): TokenPayload {
       return jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
     }
   }
   ```

4. **회원가입 API**
   ```typescript
   // POST /api/auth/register
   {
     "email": "user@example.com",
     "password": "securePassword123",
     "name": "홍길동"
   }
   ```
   - 이메일 중복 검사
   - 비밀번호 강도 검증
   - 이메일 형식 검증
   - 계정 생성 및 토큰 발급

5. **로그인 API**
   ```typescript
   // POST /api/auth/login
   {
     "email": "user@example.com",
     "password": "securePassword123"
   }
   ```
   - 자격 증명 검증
   - 토큰 쌍 발급 (access + refresh)
   - 로그인 기록 저장

6. **토큰 갱신 API**
   ```typescript
   // POST /api/auth/refresh
   {
     "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
   }
   ```
   - Refresh 토큰 검증
   - 새 Access 토큰 발급
   - 토큰 만료 처리

7. **인증 미들웨어**
   ```typescript
   // src/middleware/auth.ts
   export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
     const authHeader = req.headers.authorization;
     const token = authHeader && authHeader.split(' ')[1];

     if (!token) {
       return res.status(401).json({ error: 'Access token required' });
     }

     try {
       const decoded = AuthService.verifyToken(token);
       req.user = decoded;
       next();
     } catch (error) {
       return res.status(403).json({ error: 'Invalid token' });
     }
   };
   ```

8. **프론트엔드 인증 관리**
   ```typescript
   // src/services/auth/AuthManager.ts
   import AsyncStorage from '@react-native-async-storage/async-storage';
   import Keychain from 'react-native-keychain';

   export class AuthManager {
     static async storeTokens(accessToken: string, refreshToken: string) {
       await AsyncStorage.setItem('accessToken', accessToken);
       await Keychain.setInternetCredentials(
         'cheonmabigo_refresh',
         'token',
         refreshToken
       );
     }

     static async getAccessToken(): Promise<string | null> {
       return AsyncStorage.getItem('accessToken');
     }

     static async getRefreshToken(): Promise<string | null> {
       const credentials = await Keychain.getInternetCredentials('cheonmabigo_refresh');
       return credentials ? credentials.password : null;
     }

     static async clearTokens(): Promise<void> {
       await AsyncStorage.removeItem('accessToken');
       await Keychain.resetInternetCredentials('cheonmabigo_refresh');
     }
   }
   ```

9. **자동 토큰 갱신**
   ```typescript
   // src/services/api/ApiClient.ts
   class ApiClient {
     async request(url: string, options: RequestInit) {
       let token = await AuthManager.getAccessToken();
       
       const response = await fetch(url, {
         ...options,
         headers: {
           ...options.headers,
           Authorization: `Bearer ${token}`
         }
       });

       if (response.status === 401) {
         // 토큰 갱신 시도
         const newToken = await this.refreshToken();
         if (newToken) {
           // 요청 재시도
           return this.request(url, options);
         } else {
           // 로그아웃 처리
           await this.logout();
           throw new Error('Authentication failed');
         }
       }

       return response;
     }
   }
   ```

10. **생체 인증 지원**
    ```bash
    npm install react-native-touch-id
    npm install react-native-biometrics
    ```
    - 지문 인식
    - Face ID
    - 패턴/PIN 백업

11. **보안 강화**
    - Rate limiting (로그인 시도 제한)
    - CSRF 보호
    - 세션 고정 방지
    - 브루트 포스 공격 방지
    - 계정 잠금 메커니즘

12. **사용자 상태 관리**
    ```typescript
    // src/stores/authStore.ts
    interface AuthState {
      isAuthenticated: boolean;
      user: User | null;
      isLoading: boolean;
      error: string | null;
    }

    const useAuthStore = create<AuthState>((set) => ({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      error: null,
      
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(email, password);
          await AuthManager.storeTokens(response.accessToken, response.refreshToken);
          set({ isAuthenticated: true, user: response.user, isLoading: false });
        } catch (error) {
          set({ error: error.message, isLoading: false });
        }
      }
    }));
    ```

**인증 플로우**:
```
1. 사용자 로그인 → 토큰 쌍 발급
2. Access Token으로 API 요청
3. 토큰 만료 시 Refresh Token으로 갱신
4. Refresh Token 만료 시 재로그인 요구
5. 로그아웃 시 모든 토큰 삭제
```

**보안 설정**:
- Access Token: 15분 만료
- Refresh Token: 7일 만료
- 토큰 회전 (Rotation) 구현
- 키체인/키스토어 사용
- SSL/TLS 통신 강제

**추가 인수**: $ARGUMENTS (특정 인증 방법이나 기능)

인증 시스템 완료 후 `/13-state-management` 명령어로 상태 관리를 구현하세요.