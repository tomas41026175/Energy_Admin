# TDD 測試方案

本文件定義完整的測試規格，用於 TDD Red-Green-Refactor 流程。
所有測試應在實作程式碼之前建立（Phase 1: RED），預期全部失敗。

---

## 前置條件

### 測試框架

- **Vitest** — 測試執行器（與 Vite 整合）
- **@testing-library/react** — React 元件測試
- **@testing-library/jest-dom** — DOM 斷言擴充
- **@testing-library/user-event** — 使用者互動模擬
- **msw** (Mock Service Worker) — API mock（interceptor 測試用）

### 測試初始化

`src/test/setup.ts`:
```typescript
import '@testing-library/jest-dom';
```

`vitest` 配置（在 `vite.config.ts` 中）:
```typescript
test: {
  globals: true,
  environment: 'jsdom',
  setupFiles: ['./src/test/setup.ts'],
  css: true,
}
```

---

## 型別空殼（Phase 1.1 — 讓 import 編譯通過）

在寫測試之前，需要建立以下**空殼檔案**。只有 interface/type/enum export，邏輯函式全部 `throw new Error('not implemented')`，元件回傳最小 JSX。

| 檔案 | 內容 |
|------|------|
| `src/shared/api/types.ts` | `ApiResponse<T>` interface |
| `src/shared/api/error.ts` | `ApiError` interface, `ApiErrorCode` enum, `normalizeError` stub |
| `src/shared/utils/constants.ts` | `API_BASE_URL`, `STORAGE_KEYS`, `PAGINATION_DEFAULTS` |
| `src/auth/auth.types.ts` | `User`, `UserStatus`, `LoginCredentials`, `LoginResponse`, `TokenResponse` |
| `src/domains/users/users.types.ts` | `GetUsersParams`, `PaginatedResponse<T>`, `UsersResponse` |
| `src/shared/api/client.ts` | 兩個空 axios instance: `apiClient`, `authClient` |
| `src/auth/auth.api.ts` | `authApi` 物件，方法全部 throw |
| `src/auth/auth.store.ts` | `useAuthStore` 空殼 Zustand store（所有 action throw） |
| `src/shared/api/interceptor.ts` | 空檔案 |
| `src/domains/users/users.api.ts` | `usersApi` 空殼 |
| `src/domains/users/users.hooks.ts` | `useUsers` 空殼 |
| `src/auth/auth.guard.tsx` | `RequireAuth` 回傳 `null` |
| `src/domains/users/UsersTable.tsx` | 回傳空 `<table />` |
| `src/shared/ui/Pagination.tsx` | 回傳空 `<nav />` |
| `src/shared/ui/Layout.tsx` | 回傳 `children` |
| `src/pages/login.tsx` | 回傳空 `<div />` |
| `src/pages/users.tsx` | 回傳空 `<div />` |

---

## Test 1: `src/shared/api/__tests__/error.test.ts`

### 測試目標

`normalizeError` — 將各種錯誤來源正規化為統一的 `ApiError` 格式。

### 測試案例

| # | Case | Input | Expected Output |
|---|------|-------|-----------------|
| 1.1 | AxiosError with API error body | `{ isAxiosError: true, response: { status: 401, data: { code: 'TOKEN_EXPIRED', message: 'Token has expired' } } }` | `{ code: 'TOKEN_EXPIRED', message: 'Token has expired' }` |
| 1.2 | AxiosError without data | `{ isAxiosError: true, response: { status: 500 } }` | `{ code: 'SERVER_ERROR', message: expect.any(String) }` |
| 1.3 | Plain Error | `new Error('network failure')` | `{ code: 'SERVER_ERROR', message: 'network failure' }` |
| 1.4 | Unknown value (string) | `'some string error'` | `{ code: 'SERVER_ERROR', message: 'An unknown error occurred' }` |
| 1.5 | null / undefined | `null` | `{ code: 'SERVER_ERROR', message: 'An unknown error occurred' }` |

### 驗證重點

- 使用 `unknown` 型別參數，不使用 `any`
- AxiosError 判斷用 `axios.isAxiosError()` 或 type guard
- 永遠回傳合法的 `ApiError` 物件，不會 throw

### Mock 需求

- 無（純函式測試）

---

## Test 2: `src/auth/__tests__/auth.store.test.ts`

### 測試目標

`useAuthStore` — Zustand 認證狀態管理（login / logout / refresh / restoreSession）。

### 測試案例

| # | Case | 驗證重點 |
|---|------|---------|
| 2.1 | 初始狀態 | `isAuthenticated: false`, `isInitializing: true`, `accessToken: null`, `user: null`, `error: null` |
| 2.2 | login 成功 | 呼叫 `authApi.login` 帶正確參數; 設定 `accessToken`, `user`; `isAuthenticated` 變 `true`; refresh token 存入 `localStorage` |
| 2.3 | login 失敗 | `error` 被設定為錯誤訊息; `isAuthenticated` 維持 `false`; re-throw error（caller 可 catch） |
| 2.4 | logout | 清除 `accessToken`, `user`, `error`; `isAuthenticated` 變 `false`; 移除 `localStorage` 中的 refresh token |
| 2.5 | refreshAccessToken 成功 | 從 `localStorage` 取得 refresh token; 呼叫 `authApi.refreshToken`; 更新 `accessToken`; 回傳新 token 字串 |
| 2.6 | refreshAccessToken 無 token | `localStorage` 無 refresh token 時 throw Error; **不**呼叫 `authApi.refreshToken` |
| 2.7 | refreshAccessToken 失敗 | API 呼叫失敗時呼叫 `logout`; re-throw error |
| 2.8 | restoreSession 有 token 且刷新成功 | `isInitializing` 從 `true` 變 `false`; `isAuthenticated` 變 `true` |
| 2.9 | restoreSession 有 token 但刷新失敗 | `isInitializing` 變 `false`; 呼叫 `logout`; `isAuthenticated` 維持 `false` |
| 2.10 | restoreSession 無 token | `isInitializing` 變 `false`; **不**呼叫任何 API |
| 2.11 | clearError | `error` 從非 null 變為 `null` |

### Mock 需求

- `authApi.login` — vi.fn()
- `authApi.refreshToken` — vi.fn()
- `localStorage` — vi.stubGlobal 或 jsdom 內建

### 注意事項

- 每個測試前需 reset store 狀態（`useAuthStore.setState(initialState)`）
- `isInitializing` 是計畫中的**關鍵修正**（原文件缺少此狀態）
- `restoreSession` 是新增的 action，需要在空殼中定義

---

## Test 3: `src/shared/api/__tests__/interceptor.test.ts`

### 測試目標

Axios interceptor — Token 自動附加與 401 自動 refresh 機制。**此為本專案最核心的測試**。

### 測試案例

| # | Case | 驗證重點 |
|---|------|---------|
| 3.1 | 請求自動附加 token | store 有 `accessToken` 時，請求 header 含 `Authorization: Bearer {token}` |
| 3.2 | 無 token 時不附加 header | store 無 `accessToken` 時，header 中無 `Authorization` |
| 3.3 | 401 + TOKEN_EXPIRED → 自動 refresh + 重試 | 1) 第一次請求收到 401 + `{ code: 'TOKEN_EXPIRED' }` 2) 觸發 `refreshAccessToken` 3) 重試原始請求，帶新 token 4) 最終回傳成功 response |
| 3.4 | 並行 401 → 只 refresh 一次 | 多個請求同時收到 401 TOKEN_EXPIRED; `refreshAccessToken` 只呼叫**一次**; 所有請求都在 refresh 完成後以新 token 重試成功 |
| 3.5 | refresh 失敗 → logout + redirect | refresh API 失敗; 呼叫 `logout`; `window.location.href` 設為 `/login` |
| 3.6 | 非 TOKEN_EXPIRED 的 401 → 不 refresh | 401 + `{ code: 'UNAUTHORIZED' }`; **不**觸發 refresh; 直接 reject |
| 3.7 | 非 401 錯誤 → 直接 reject | 500 / 404 等; 直接 pass through reject; **不**觸發 refresh |

### Mock 需求

- `useAuthStore.getState()` — mock accessToken / refreshAccessToken / logout
- Axios adapter 或 msw — 模擬 API response
- `window.location` — vi.stubGlobal

### 關鍵設計

- `refreshToken` API 必須用 **`authClient`**（獨立 axios instance，無 interceptor），否則 refresh 請求本身失敗也會觸發 interceptor，造成**無限迴圈**
- 使用 `isRefreshing` flag + `failedQueue` 陣列管理並行 refresh
- `finally` 區塊確保 `isRefreshing` 被重設

---

## Test 4: `src/auth/__tests__/auth.guard.test.tsx`

### 測試目標

`RequireAuth` — 路由守衛元件。

### 測試案例

| # | Case | Store 狀態 | Expected |
|---|------|-----------|----------|
| 4.1 | 初始化中 | `isInitializing: true`, `isAuthenticated: false` | 顯示 loading spinner（如 `role="status"` 或含 "loading" text）; **不** redirect |
| 4.2 | 未認證 | `isInitializing: false`, `isAuthenticated: false` | redirect 到 `/login`（`<Navigate to="/login" />`） |
| 4.3 | 已認證 | `isInitializing: false`, `isAuthenticated: true` | render children 內容 |

### Mock 需求

- `useAuthStore` — mock `isInitializing` 和 `isAuthenticated`
- `react-router-dom` `<MemoryRouter>` — 測試環境路由

### 注意事項

- Case 4.1 是**關鍵修正**：原 implementation-guide 的 `RequireAuth` 缺少 `isInitializing` 判斷，導致 session restore 期間閃爍 redirect

---

## Test 5: `src/domains/users/__tests__/UsersTable.test.tsx`

### 測試目標

`UsersTable` — 使用者表格元件。

### 測試資料

```typescript
const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    avatar: 'https://example.com/avatar.jpg',
    status: UserStatus.ACTIVE,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    id: '2',
    username: 'john',
    email: 'john@example.com',
    status: UserStatus.INACTIVE,
    createdAt: '2024-02-20T10:30:00Z',
    updatedAt: '2024-02-20T10:30:00Z',
  },
  {
    id: '3',
    username: 'suspended_user',
    email: 'suspended@example.com',
    status: UserStatus.SUSPENDED,
    createdAt: '2024-03-10T15:45:00Z',
    updatedAt: '2024-03-10T15:45:00Z',
  },
];
```

### 測試案例

| # | Case | 驗證重點 |
|---|------|---------|
| 5.1 | 正確 render 使用者列表 | 表格顯示所有使用者的 username, email, status |
| 5.2 | 狀態 badge 顏色 | `active` → green 相關 class; `inactive` → gray; `suspended` → red |
| 5.3 | 無 avatar 時顯示 fallback | 顯示 username 首字母大寫（如 "J" for "john"）; 不含 `<img>` |
| 5.4 | 有 avatar 時顯示圖片 | 含 `<img>` 且 `src` 為正確 URL |

### Mock 需求

- 無（純 UI 元件，傳入 props）

---

## Test 6: `src/pages/__tests__/login.test.tsx`

### 測試目標

`LoginPage` — 登入頁面（表單驗證 + API 呼叫 + 導航）。

### 測試案例

| # | Case | 操作 | 驗證重點 |
|---|------|------|---------|
| 6.1 | 渲染表單元素 | — | 存在 username input、password input、submit button |
| 6.2 | 空白提交顯示驗證錯誤 | 直接點 submit | 顯示 Zod 驗證錯誤訊息（如「請輸入使用者名稱」「請輸入密碼」） |
| 6.3 | 提交時呼叫 login | 填寫表單 + submit | `authStore.login` 被呼叫，參數為 `{ username, password }` |
| 6.4 | login 成功後導向 /users | login resolve | `navigate` 被呼叫，目標為 `/users` |
| 6.5 | login 失敗顯示錯誤 | login reject | 頁面顯示 error message |
| 6.6 | loading 狀態 | login 進行中 | submit button `disabled`; 顯示「登入中...」 |

### Mock 需求

- `useAuthStore` — mock `login`, `isLoading`, `error`
- `react-router-dom` — mock `useNavigate`
- `@testing-library/user-event` — 模擬使用者輸入與點擊

### 注意事項

- 表單用 `react-hook-form` + `zod` resolver
- 驗證是 client-side（Zod schema），不依賴 API

---

## Test 7: `src/pages/__tests__/users.test.tsx`

### 測試目標

`UsersPage` — 使用者列表頁（資料載入 + 分頁 + 錯誤處理）。

### 測試案例

| # | Case | Hook 狀態 | 驗證重點 |
|---|------|----------|---------|
| 7.1 | loading 狀態 | `isLoading: true` | 顯示 skeleton / loading UI（`animate-pulse` 或 role="status"） |
| 7.2 | 資料載入成功 | `data` 有使用者 + 分頁資訊 | 顯示 `UsersTable` + 分頁控制元件 |
| 7.3 | 空資料 | `data.data: []` | 顯示「沒有使用者資料」或類似空狀態文案 |
| 7.4 | 錯誤狀態 | `error` 非 null | 顯示錯誤訊息 + 「重試」按鈕 |
| 7.5 | 重試按鈕 | 點擊重試 | 呼叫 `refetch` |
| 7.6 | 分頁 — 下一頁 | 點擊「下一頁」 | `page` 參數 +1; 重新 fetch |
| 7.7 | 分頁 — 上一頁 | 在第 2 頁點「上一頁」 | `page` 參數 -1 |
| 7.8 | 分頁 — 邊界 | 第 1 頁 | 「上一頁」disabled |

### Mock 需求

- `useUsers` hook — mock 各種回傳狀態
- `useAuthStore` — mock `logout`
- `@tanstack/react-query` `QueryClientProvider` — 測試環境

### 測試資料

```typescript
const mockUsersResponse: UsersResponse = {
  data: mockUsers, // 同 Test 5
  pagination: {
    page: 1,
    limit: 10,
    total: 25,
    totalPages: 3,
  },
};
```

---

## 實作順序（Phase 2 依賴圖）

```
error.ts (Test 1)
    │
    ▼
client.ts (authClient + apiClient)
    │
    ├──► auth.api.ts (用 authClient for refresh)
    │       │
    │       ▼
    │   auth.store.ts (Test 2)
    │       │
    │       ▼
    │   interceptor.ts (Test 3)
    │       │
    │       ▼
    │   auth.guard.tsx (Test 4)
    │
    ├──► users.api.ts
    │       │
    │       ▼
    │   users.hooks.ts
    │       │
    │       ▼
    │   UsersTable.tsx (Test 5)
    │
    ▼
Pages:
    login.tsx (Test 6)
    users.tsx (Test 7)
        │
        ▼
    router.tsx + providers.tsx + App.tsx
```

---

## 覆蓋率目標

| 模組 | 最低覆蓋率 |
|------|-----------|
| `shared/api/error.ts` | 100% |
| `auth/auth.store.ts` | 90%+ |
| `shared/api/interceptor.ts` | 90%+ |
| `auth/auth.guard.tsx` | 100% |
| `domains/users/UsersTable.tsx` | 90%+ |
| `pages/login.tsx` | 85%+ |
| `pages/users.tsx` | 85%+ |
| **整體** | **80%+** |

---

## 驗證指令

```bash
# Phase 1 完成後（RED）— 所有測試應 FAIL
npm test

# Phase 2 逐步完成後（GREEN）— 對應測試應 PASS
npm test -- --run src/shared/api/__tests__/error.test.ts
npm test -- --run src/auth/__tests__/auth.store.test.ts
npm test -- --run src/shared/api/__tests__/interceptor.test.ts
npm test -- --run src/auth/__tests__/auth.guard.test.tsx
npm test -- --run src/domains/users/__tests__/UsersTable.test.tsx
npm test -- --run src/pages/__tests__/login.test.tsx
npm test -- --run src/pages/__tests__/users.test.tsx

# 全部通過後
npm run test:coverage  # >= 80%
npm run build          # 無 TS 錯誤
```
