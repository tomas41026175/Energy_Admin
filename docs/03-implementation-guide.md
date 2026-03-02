# 實作指南 - CSR 模式

本文件提供基於 CSR 模式的詳細實作步驟與程式碼範例。

## 📋 目錄

1. [專案初始化](#專案初始化)
2. [核心模組實作](#核心模組實作)
3. [認證模組實作](#認證模組實作)
4. [API 客戶端實作](#api-客戶端實作)
5. [使用者列表實作](#使用者列表實作)
6. [路由與守衛實作](#路由與守衛實作)
7. [Session Restore 實作](#session-restore-實作)

---

## 🚀 專案初始化

### Step 1: 建立 React + TypeScript 專案

```bash
# 使用 Vite（推薦）
npm create vite@latest my-admin-app -- --template react-ts
cd my-admin-app

# 或使用 Create React App
npx create-react-app my-admin-app --template typescript
cd my-admin-app
```

### Step 2: 安裝核心依賴

```bash
# 路由
npm install react-router-dom

# API 管理與 HTTP 客戶端
npm install @tanstack/react-query axios

# 狀態管理
npm install zustand

# 表單處理
npm install react-hook-form @hookform/resolvers zod

# UI 組件庫
npm install @headlessui/react

# 樣式
npm install tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 圖示
npm install @heroicons/react

# 開發工具
npm install -D @types/react-router-dom
```

### Step 3: 設定 Tailwind CSS

#### `tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

#### `src/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Step 4: 建立專案結構

```bash
# 建立完整的專案結構
mkdir -p src/{app,auth,domains/users,shared/{api,ui,utils},pages,types}

# 建立型別定義檔案
touch src/types/global.d.ts
touch src/types/common.ts
touch src/shared/utils/type-guards.ts
```

完整的專案結構：

```
src/
├── app/                        # 應用程式入口
├── auth/                       # 認證模組
│   ├── auth.types.ts          # 認證型別
│   ├── auth.api.ts
│   ├── auth.store.ts
│   └── auth.guard.tsx
├── domains/                    # 業務領域
│   └── users/
│       ├── users.types.ts     # 使用者領域型別
│       ├── users.api.ts
│       ├── users.hooks.ts
│       └── UsersTable.tsx
├── shared/                     # 共用資源
│   ├── api/
│   │   ├── types.ts           # API 共用型別
│   │   ├── error.ts           # 錯誤型別
│   │   ├── client.ts
│   │   └── interceptor.ts
│   ├── ui/                    # 共用 UI 組件
│   └── utils/
│       ├── constants.ts
│       └── type-guards.ts     # 型別守衛（新增）
├── types/                      # 全域型別（新增）
│   ├── global.d.ts            # 全域型別擴充
│   └── common.ts              # 通用型別
└── pages/                      # 頁面組件
```

---

## 🔧 核心模組實作

### 1. 型別定義

#### `src/shared/api/error.ts`

```typescript
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export enum ApiErrorCode {
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
}

export const normalizeError = (error: any): ApiError => {
  if (error.response?.data) {
    return error.response.data as ApiError;
  }
  return {
    code: ApiErrorCode.SERVER_ERROR,
    message: error.message || '發生未知錯誤',
  };
};
```

#### `src/auth/auth.types.ts`

```typescript
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}
```

#### `src/domains/users/users.types.ts`

```typescript
import { User } from '@/auth/auth.types';

export interface GetUsersParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type UsersResponse = PaginatedResponse<User>;
```

#### `src/types/common.ts`

```typescript
/**
 * 通用型別定義
 * 用於整個應用程式的共用基礎型別
 */

// ID 型別
export type ID = string;

// 時間戳型別
export type Timestamp = string; // ISO 8601 格式

// 狀態型別
export type Status = 'idle' | 'loading' | 'success' | 'error';

// 可為空的型別
export type Nullable<T> = T | null;

// 部分必填欄位
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// 必填所有欄位
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

// 排除特定屬性
export type Without<T, K extends keyof T> = Omit<T, K>;
```

#### `src/types/global.d.ts`

```typescript
/**
 * 全域型別擴充
 * 用於擴充第三方套件或全域命名空間的型別定義
 */

// 擴充 Window 介面（如需要）
interface Window {
  // 可在此加入全域變數型別
  // 例如：__APP_VERSION__?: string;
}

// 擴充環境變數型別
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  // 可在此加入其他環境變數
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// 模組宣告
declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}
```

#### `src/shared/utils/type-guards.ts`

```typescript
/**
 * 型別守衛（Type Guards）
 * 用於 runtime 型別檢查，確保型別安全
 */

import { ApiError, ApiErrorCode } from '@/shared/api/error';
import { User } from '@/auth/auth.types';

/**
 * 檢查是否為 ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  );
}

/**
 * 檢查是否為特定錯誤代碼
 */
export function isErrorCode(
  error: unknown,
  code: ApiErrorCode
): error is ApiError {
  return isApiError(error) && error.code === code;
}

/**
 * 檢查是否為 Token 過期錯誤
 */
export function isTokenExpiredError(error: unknown): error is ApiError {
  return isErrorCode(error, ApiErrorCode.TOKEN_EXPIRED);
}

/**
 * 檢查是否為 User 物件
 */
export function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'username' in value &&
    'email' in value
  );
}

/**
 * 檢查是否為非空值
 */
export function isNotNull<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * 檢查陣列是否為非空
 */
export function isNonEmptyArray<T>(value: T[]): value is [T, ...T[]] {
  return Array.isArray(value) && value.length > 0;
}
```

### 2. 常數定義

#### `src/shared/utils/constants.ts`

```typescript
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  'https://lbbj5pioquwxdexqmcnwaxrpce0lcoqx.lambda-url.ap-southeast-1.on.aws';

export const STORAGE_KEYS = {
  REFRESH_TOKEN: 'refreshToken',
} as const;
```

---

## 🔐 認證模組實作

### 1. Auth API

#### `src/auth/auth.api.ts`

```typescript
import { apiClient } from '@/shared/api/client';
import { LoginCredentials, LoginResponse, TokenResponse } from './auth.types';
import { ApiResponse } from '@/shared/api/types';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      '/auth/login',
      credentials
    );
    return response.data.data;
  },

  refreshToken: async (refreshToken: string): Promise<TokenResponse> => {
    const response = await apiClient.post<ApiResponse<TokenResponse>>(
      '/auth/refresh',
      { refreshToken }
    );
    return response.data.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },
};
```

### 2. Auth Store

#### `src/auth/auth.store.ts`

```typescript
import { create } from 'zustand';
import { authApi } from './auth.api';
import { LoginCredentials, User } from './auth.types';
import { STORAGE_KEYS } from '@/shared/utils/constants';

interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<string>;
  setUser: (user: User) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  accessToken: null,
  user: null,
  isLoading: false,
  error: null,

  login: async (credentials: LoginCredentials) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authApi.login(credentials);
      
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);

      set({
        isAuthenticated: true,
        accessToken: response.accessToken,
        user: response.user,
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '登入失敗';
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    set({
      isAuthenticated: false,
      accessToken: null,
      user: null,
      error: null,
    });
  },

  refreshAccessToken: async (): Promise<string> => {
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await authApi.refreshToken(refreshToken);
      
      // 更新 refresh token（如果 API 回傳新的）
      if (response.refreshToken) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
      }

      set({
        accessToken: response.accessToken,
        isAuthenticated: true,
      });

      return response.accessToken;
    } catch (error) {
      get().logout();
      throw error;
    }
  },

  setUser: (user: User) => {
    set({ user });
  },

  clearError: () => {
    set({ error: null });
  },
}));
```

### 3. Auth Guard

#### `src/auth/auth.guard.tsx`

```typescript
import { Navigate } from 'react-router-dom';
import { useAuthStore } from './auth.store';

interface RequireAuthProps {
  children: React.ReactNode;
}

export const RequireAuth = ({ children }: RequireAuthProps) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
```

---

## 🌐 API 客戶端實作

### 1. API Types

#### `src/shared/api/types.ts`

```typescript
export interface ApiResponse<T> {
  data: T;
  message?: string;
}
```

### 2. API Client

#### `src/shared/api/client.ts`

```typescript
import axios, { AxiosInstance } from 'axios';
import { API_BASE_URL } from '@/shared/utils/constants';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### 3. Interceptor

#### `src/shared/api/interceptor.ts`

```typescript
import { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { apiClient } from './client';
import { useAuthStore } from '@/auth/auth.store';
import { ApiError, ApiErrorCode } from './error';

// Refresh lock 與請求佇列
let isRefreshing = false;
const failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue.length = 0; // 清空佇列
};

// 請求攔截器：自動附加 Access Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 回應攔截器：處理 Token 刷新
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // 處理 401 錯誤且錯誤碼為 TOKEN_EXPIRED
    if (
      error.response?.status === 401 &&
      error.response?.data?.code === ApiErrorCode.TOKEN_EXPIRED
    ) {
      // 如果正在刷新，將請求加入佇列
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      // 標記為重試請求
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // 呼叫 refresh API
        const newToken = await useAuthStore.getState().refreshAccessToken();

        // 處理佇列中的請求
        processQueue(null, newToken);
        isRefreshing = false;

        // 重試原始請求
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        // 刷新失敗，處理佇列並登出
        processQueue(refreshError, null);
        isRefreshing = false;
        useAuthStore.getState().logout();
        
        // 重導向至登入頁
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      }
    }

    // 其他錯誤直接 reject
    return Promise.reject(error);
  }
);
```

#### `src/shared/api/index.ts`

```typescript
// 匯出所有 API 相關模組
export * from './client';
export * from './interceptor';
export * from './error';
export * from './types';

// 初始化攔截器（執行一次即可）
import './interceptor';
```

---

## 🔍 Runtime 型別驗證（Zod）

### 為什麼需要 Runtime 驗證？

TypeScript 提供 **編譯時型別檢查**，但無法在 runtime 驗證 API 回應的型別正確性。使用 Zod 可以：

- ✅ 驗證 API 回應是否符合預期格式
- ✅ 自動推導 TypeScript 型別
- ✅ 提供清晰的錯誤訊息
- ✅ 防止未預期的資料導致 runtime 錯誤

### 1. Zod Schema 定義

#### `src/auth/auth.schemas.ts`

```typescript
import { z } from 'zod';

/**
 * 使用者狀態 Schema
 */
export const UserStatusSchema = z.enum(['active', 'inactive', 'suspended']);

/**
 * 使用者 Schema
 */
export const UserSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().email(),
  avatar: z.string().url().optional(),
  status: UserStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

/**
 * 登入憑證 Schema
 */
export const LoginCredentialsSchema = z.object({
  username: z.string().min(1, '使用者名稱不可為空'),
  password: z.string().min(1, '密碼不可為空'),
});

/**
 * 登入回應 Schema
 */
export const LoginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: UserSchema,
});

/**
 * Token 回應 Schema
 */
export const TokenResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

// 從 Schema 推導型別
export type User = z.infer<typeof UserSchema>;
export type UserStatus = z.infer<typeof UserStatusSchema>;
export type LoginCredentials = z.infer<typeof LoginCredentialsSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type TokenResponse = z.infer<typeof TokenResponseSchema>;
```

#### `src/domains/users/users.schemas.ts`

```typescript
import { z } from 'zod';
import { UserSchema } from '@/auth/auth.schemas';

/**
 * 取得使用者列表參數 Schema
 */
export const GetUsersParamsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
});

/**
 * 分頁資訊 Schema
 */
export const PaginationSchema = z.object({
  page: z.number().int(),
  limit: z.number().int(),
  total: z.number().int(),
  totalPages: z.number().int(),
});

/**
 * 分頁回應 Schema（泛型）
 */
export const createPaginatedResponseSchema = <T extends z.ZodTypeAny>(
  dataSchema: T
) => {
  return z.object({
    data: z.array(dataSchema),
    pagination: PaginationSchema,
  });
};

/**
 * 使用者列表回應 Schema
 */
export const UsersResponseSchema = createPaginatedResponseSchema(UserSchema);

// 從 Schema 推導型別
export type GetUsersParams = z.infer<typeof GetUsersParamsSchema>;
export type UsersResponse = z.infer<typeof UsersResponseSchema>;
```

### 2. 在 API 中使用 Zod 驗證

#### `src/auth/auth.api.ts`（加入驗證）

```typescript
import { apiClient } from '@/shared/api/client';
import {
  LoginCredentials,
  LoginResponse,
  TokenResponse,
  LoginCredentialsSchema,
  LoginResponseSchema,
  TokenResponseSchema,
} from './auth.schemas';

export const authApi = {
  /**
   * 登入
   */
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    // 驗證輸入參數
    const validatedCredentials = LoginCredentialsSchema.parse(credentials);

    const response = await apiClient.post('/auth/login', validatedCredentials);

    // 驗證 API 回應
    return LoginResponseSchema.parse(response.data);
  },

  /**
   * 刷新 Token
   */
  refreshToken: async (refreshToken: string): Promise<TokenResponse> => {
    const response = await apiClient.post('/auth/refresh', { refreshToken });

    // 驗證 API 回應
    return TokenResponseSchema.parse(response.data);
  },

  /**
   * 登出
   */
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },
};
```

#### `src/domains/users/users.api.ts`（加入驗證）

```typescript
import { apiClient } from '@/shared/api/client';
import {
  GetUsersParams,
  UsersResponse,
  GetUsersParamsSchema,
  UsersResponseSchema,
} from './users.schemas';

export const usersApi = {
  /**
   * 取得使用者列表
   */
  getUsers: async (params: GetUsersParams = {}): Promise<UsersResponse> => {
    // 驗證輸入參數
    const validatedParams = GetUsersParamsSchema.parse(params);

    const response = await apiClient.get('/users', {
      params: validatedParams,
    });

    // 驗證 API 回應
    return UsersResponseSchema.parse(response.data);
  },
};
```

### 3. 錯誤處理

#### `src/shared/api/error.ts`（加入 Zod 錯誤處理）

```typescript
import { z } from 'zod';

// ... 現有的錯誤定義 ...

/**
 * 正規化錯誤，包含 Zod 驗證錯誤
 */
export const normalizeError = (error: any): ApiError => {
  // Zod 驗證錯誤
  if (error instanceof z.ZodError) {
    return {
      code: ApiErrorCode.VALIDATION_ERROR,
      message: '資料驗證失敗',
      details: {
        issues: error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      },
    };
  }

  // Axios 錯誤
  if (error.response?.data) {
    return error.response.data as ApiError;
  }

  // 其他錯誤
  return {
    code: ApiErrorCode.SERVER_ERROR,
    message: error.message || '發生未知錯誤',
  };
};
```

### 4. 使用建議

#### ✅ 何時使用 Zod 驗證

- **API 回應驗證**：確保後端回應符合預期格式
- **表單驗證**：配合 React Hook Form 使用
- **環境變數驗證**：在應用啟動時驗證環境變數

#### ⚠️ 注意事項

- **效能考量**：Zod 驗證有一定效能成本，但對於 API 回應驗證是值得的
- **錯誤處理**：妥善處理 ZodError，提供清晰的錯誤訊息
- **Schema 維護**：保持 Schema 與 API 文件同步

#### 📚 參考資源

- [Zod 官方文件](https://zod.dev/)
- [Zod + React Hook Form](https://react-hook-form.com/get-started#SchemaValidation)

---

## 📋 使用者列表實作

### 1. Users API

#### `src/domains/users/users.api.ts`

```typescript
import { apiClient } from '@/shared/api/client';
import { GetUsersParams, UsersResponse } from './users.types';
import { ApiResponse } from '@/shared/api/types';

export const usersApi = {
  getUsers: async (params: GetUsersParams = {}): Promise<UsersResponse> => {
    const response = await apiClient.get<ApiResponse<UsersResponse>>('/users', {
      params: {
        page: params.page || 1,
        limit: params.limit || 10,
      },
    });
    return response.data.data;
  },
};
```

### 2. Users Hooks

#### `src/domains/users/users.hooks.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { usersApi } from './users.api';
import { GetUsersParams } from './users.types';
import { useAuthStore } from '@/auth/auth.store';

export const useUsers = (params: GetUsersParams = {}) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ['users', params],
    queryFn: () => usersApi.getUsers(params),
    enabled: isAuthenticated, // 僅在已登入時執行
    staleTime: 5 * 60 * 1000, // 5 分鐘
    retry: 1,
  });
};
```

### 3. Users Table Component

#### `src/domains/users/UsersTable.tsx`

```typescript
import { User, UserStatus } from '@/auth/auth.types';

interface UsersTableProps {
  users: User[];
}

export const UsersTable = ({ users }: UsersTableProps) => {
  const getStatusBadgeColor = (status: UserStatus) => {
    switch (status) {
      case UserStatus.ACTIVE:
        return 'bg-green-100 text-green-800';
      case UserStatus.INACTIVE:
        return 'bg-gray-100 text-gray-800';
      case UserStatus.SUSPENDED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              使用者
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              電子郵件
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              狀態
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              建立時間
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    {user.avatar ? (
                      <img
                        className="h-10 w-10 rounded-full"
                        src={user.avatar}
                        alt={user.username}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-gray-600 text-sm font-medium">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {user.username}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{user.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(
                    user.status
                  )}`}
                >
                  {user.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(user.createdAt).toLocaleDateString('zh-TW')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

---

## 🛣️ 路由與守衛實作

### 1. Router Configuration

#### `src/app/router.tsx`

```typescript
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RequireAuth } from '@/auth/auth.guard';
import { LoginPage } from '@/pages/login';
import { UsersPage } from '@/pages/users';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/users',
    element: (
      <RequireAuth>
        <UsersPage />
      </RequireAuth>
    ),
  },
  {
    path: '/',
    element: <Navigate to="/users" replace />,
  },
]);
```

### 2. Providers

#### `src/app/providers.tsx`

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

export const Providers = ({ children }: ProvidersProps) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 分鐘
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
```

### 3. App Component

#### `src/app/App.tsx`

```typescript
import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { Providers } from './providers';
import { useAuthStore } from '@/auth/auth.store';
import { STORAGE_KEYS } from '@/shared/utils/constants';

export const App = () => {
  const refreshAccessToken = useAuthStore((state) => state.refreshAccessToken);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    // Session Restore: 嘗試恢復登入狀態
    const restoreSession = async () => {
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (refreshToken) {
        try {
          await refreshAccessToken();
        } catch (error) {
          // Refresh 失敗，清除無效 token
          logout();
        }
      }
    };

    restoreSession();
  }, [refreshAccessToken, logout]);

  return (
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  );
};
```

---

## 📄 頁面組件實作

### 1. Login Page

#### `src/pages/login.tsx`

```typescript
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/auth/auth.store';

const loginSchema = z.object({
  username: z.string().min(1, '請輸入使用者名稱'),
  password: z.string().min(1, '請輸入密碼'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      navigate('/users');
    } catch (err) {
      // 錯誤已在 store 中處理
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            後台管理系統
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            請登入您的帳號
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                使用者名稱
              </label>
              <input
                {...register('username')}
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="admin"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                密碼
              </label>
              <input
                {...register('password')}
                type="password"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="password123"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? '登入中...' : '登入'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
```

### 2. Users Page

#### `src/pages/users.tsx`

```typescript
import { useState } from 'react';
import { useUsers } from '@/domains/users/users.hooks';
import { UsersTable } from '@/domains/users/UsersTable';
import { useAuthStore } from '@/auth/auth.store';

export const UsersPage = () => {
  const [page, setPage] = useState(1);
  const limit = 10;
  const { data, isLoading, error, refetch } = useUsers({ page, limit });
  const logout = useAuthStore((state) => state.logout);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">載入失敗，請稍後再試</p>
          <button
            onClick={() => refetch()}
            className="mt-2 text-sm text-red-600 underline"
          >
            重試
          </button>
        </div>
      </div>
    );
  }

  if (!data?.data.length) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-gray-500">目前沒有使用者資料</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">使用者列表</h1>
        <button
          onClick={logout}
          className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          登出
        </button>
      </div>

      <UsersTable users={data.data} />

      {data.pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            顯示第 {data.pagination.page} 頁，共 {data.pagination.totalPages}{' '}
            頁
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              上一頁
            </button>
            <button
              onClick={() =>
                setPage((p) => Math.min(data.pagination.totalPages, p + 1))
              }
              disabled={page === data.pagination.totalPages}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              下一頁
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
```

---

## 🔄 Session Restore 實作

Session Restore 機制已在 `App.tsx` 中實作：

1. **App 啟動時檢查**：從 localStorage 讀取 refresh token
2. **嘗試刷新**：呼叫 refresh API 取得新的 access token
3. **成功恢復**：更新 store 狀態，使用者可繼續操作
4. **失敗處理**：清除無效 token，保持未登入狀態

---

## 📝 環境變數設定

### `.env`

```env
VITE_API_BASE_URL=https://lbbj5pioquwxdexqmcnwaxrpce0lcoqx.lambda-url.ap-southeast-1.on.aws
```

### `.env.example`

```env
VITE_API_BASE_URL=your_api_base_url_here
```

---

## ✅ 實作檢查清單

- [ ] 專案初始化完成
- [ ] 認證模組實作完成
- [ ] API 客戶端與攔截器實作完成
- [ ] Token 刷新機制運作正常
- [ ] 使用者列表頁實作完成
- [ ] 路由保護運作正常
- [ ] Session Restore 運作正常
- [ ] RWD 設計完成
- [ ] 錯誤處理完善

---

**實作完成後，請測試所有核心功能，確保 Token 刷新機制運作正常！**
