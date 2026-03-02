# 快速參考指南

## 🚀 快速開始

### 1. 初始化專案

```bash
# 使用 Vite
npm create vite@latest my-admin-app -- --template react-ts
cd my-admin-app

# 安裝依賴
npm install react-router-dom @tanstack/react-query axios zustand react-hook-form @hookform/resolvers zod @headlessui/react @heroicons/react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 2. 設定環境變數

建立 `.env`：
```env
VITE_API_BASE_URL=https://lbbj5pioquwxdexqmcnwaxrpce0lcoqx.lambda-url.ap-southeast-1.on.aws
```

### 3. 建立專案結構

```
src/
├── app/
│   ├── App.tsx
│   ├── router.tsx
│   └── providers.tsx
├── auth/
│   ├── auth.store.ts
│   ├── auth.api.ts
│   ├── auth.guard.tsx
│   ├── auth.types.ts
│   └── auth.schemas.ts        # Zod Schema（新增）
├── domains/users/
│   ├── users.api.ts
│   ├── users.hooks.ts
│   ├── users.types.ts
│   ├── users.schemas.ts       # Zod Schema（新增）
│   └── UsersTable.tsx
├── shared/
│   ├── api/
│   │   ├── client.ts
│   │   ├── interceptor.ts
│   │   ├── error.ts
│   │   └── types.ts
│   └── utils/
│       ├── constants.ts
│       └── type-guards.ts     # Type Guards（新增）
├── types/                      # 全域型別（新增）
│   ├── global.d.ts            # 全域型別擴充
│   └── common.ts              # 通用型別
└── pages/
    ├── login.tsx
    └── users.tsx
```

---

## 🔑 核心概念

### Token 管理流程

```
1. Login → 取得 Access Token + Refresh Token
2. Access Token 存入 Zustand (in-memory)
3. Refresh Token 存入 localStorage
4. API 請求自動附加 Access Token
5. 401 錯誤 → 自動刷新 Token → 重試請求
```

### 狀態管理策略

| 狀態類型 | 管理工具 | 使用場景 |
|---------|---------|---------|
| Server State | TanStack Query | 使用者列表、分頁資料 |
| Auth State | Zustand | 認證狀態、Token |
| UI State | useState | 表單、本地 UI 狀態 |

### 型別管理策略

| 型別類別 | 位置 | 說明 |
|---------|------|------|
| 模組型別 | `{module}.types.ts` | 各模組專屬型別（如 `auth.types.ts`） |
| Zod Schema | `{module}.schemas.ts` | Runtime 驗證 Schema（如 `auth.schemas.ts`） |
| 全域型別 | `types/global.d.ts` | 全域型別擴充（Window、環境變數） |
| 通用型別 | `types/common.ts` | 共用基礎型別（ID、Timestamp） |
| Type Guards | `utils/type-guards.ts` | Runtime 型別檢查函式 |

### 型別驗證流程

```
1. 定義 Zod Schema → 自動推導 TypeScript 型別
2. API 請求前 → Schema.parse() 驗證輸入
3. API 回應後 → Schema.parse() 驗證輸出
4. 錯誤處理 → ZodError 轉換為 ApiError
```

---

## 📝 關鍵程式碼片段

### Token 刷新機制

```typescript
// shared/api/interceptor.ts
let isRefreshing = false;
const failedQueue = [];

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && 
        error.response?.data?.code === 'TOKEN_EXPIRED') {
      
      if (isRefreshing) {
        // 加入佇列
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      isRefreshing = true;
      const newToken = await refreshAccessToken();
      processQueue(null, newToken);
      isRefreshing = false;
      
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(originalRequest);
    }
  }
);
```

### Auth Store

```typescript
// auth/auth.store.ts
export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  isAuthenticated: false,
  
  login: async (credentials) => {
    const response = await authApi.login(credentials);
    localStorage.setItem('refreshToken', response.refreshToken);
    set({ accessToken: response.accessToken, isAuthenticated: true });
  },
  
  refreshAccessToken: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await authApi.refreshToken(refreshToken);
    set({ accessToken: response.accessToken });
    return response.accessToken;
  },
}));
```

### Protected Route

```typescript
// auth/auth.guard.tsx
export const RequireAuth = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" />;
  return <>{children}</>;
};
```

### Type Guards 使用

```typescript
// shared/utils/type-guards.ts
import { isApiError, isTokenExpiredError } from '@/shared/utils/type-guards';

// 在錯誤處理中使用
try {
  await someApiCall();
} catch (error) {
  if (isTokenExpiredError(error)) {
    // TypeScript 知道這是 ApiError，且 code 為 TOKEN_EXPIRED
    console.log('Token 已過期，需要刷新');
  } else if (isApiError(error)) {
    // TypeScript 知道這是 ApiError
    console.log('API 錯誤：', error.message);
  } else {
    console.log('未知錯誤');
  }
}
```

### Zod Schema 驗證

```typescript
// auth/auth.schemas.ts
import { z } from 'zod';

// 定義 Schema
export const LoginCredentialsSchema = z.object({
  username: z.string().min(1, '使用者名稱不可為空'),
  password: z.string().min(1, '密碼不可為空'),
});

// 從 Schema 推導型別
export type LoginCredentials = z.infer<typeof LoginCredentialsSchema>;

// auth/auth.api.ts
import { LoginCredentialsSchema, LoginResponseSchema } from './auth.schemas';

export const authApi = {
  login: async (credentials: LoginCredentials) => {
    // 驗證輸入
    const validated = LoginCredentialsSchema.parse(credentials);

    const response = await apiClient.post('/auth/login', validated);

    // 驗證輸出（確保 API 回應符合預期）
    return LoginResponseSchema.parse(response.data);
  },
};
```

---

## 🧪 測試重點

### 1. Token 刷新流程

- [ ] 多個請求同時收到 401，只觸發一次 refresh
- [ ] Refresh 成功後，所有請求都能重試成功
- [ ] Refresh 失敗後，正確登出並重導向

### 2. Session Restore

- [ ] 重新整理後，能自動恢復登入狀態
- [ ] Refresh token 無效時，正確清除狀態

### 3. 使用者列表

- [ ] 分頁功能正常
- [ ] Loading / Error / Empty 狀態正確顯示

---

## 📚 文件索引

- [technical-decisions.md](./technical-decisions.md) - 技術決策與架構設計
- [implementation-guide.md](./implementation-guide.md) - 詳細實作指南
- [test-plan.md](./test-plan.md) - 測試計畫
- [README.md](../README.md) - 專案說明

---

## 🔍 常見問題

### Q: 為什麼 Access Token 存在記憶體而非 localStorage？

A: Access Token 生命週期短（300秒），存在記憶體可降低風險。Refresh Token 存在 localStorage 以支援重新整理後恢復登入。

### Q: 如何處理多個請求同時觸發 refresh？

A: 使用 `isRefreshing` lock 與請求佇列機制，確保只觸發一次 refresh，其他請求等待並重試。

### Q: 重新整理後如何恢復登入狀態？

A: App 啟動時從 localStorage 讀取 refresh token，嘗試刷新取得新的 access token。

---

**更多詳細資訊請參考完整文件。**
