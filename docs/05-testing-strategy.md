# 簡化測試策略

> 務實的測試策略，平衡測試覆蓋率與開發效率

---

## 🎯 測試目標

- **確保程式碼品質**：透過測試驗證核心功能的正確性
- **保持開發效率**：不過度投入測試設定和維護
- **重點測試關鍵邏輯**：專注於容易出錯和業務核心的部分

---

## 📊 推薦的測試結構

```
測試覆蓋率目標：70-80%

單元測試     ████████████████████ 80%
整合測試     ████                 20%
E2E 測試     ∅                     0%  (用手動測試替代)
```

---

## ✅ 必須要做的測試

### 1. API 函式單元測試

測試 API 呼叫邏輯，使用 Mock 避免真實請求。

#### `src/auth/__tests__/auth.api.test.ts`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { authApi } from '../auth.api';
import { apiClient } from '@/shared/api/client';

vi.mock('@/shared/api/client');

describe('authApi', () => {
  it('應成功登入', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        access_token: 'token',
        refresh_token: 'refresh',
        user: { username: 'admin' },
      },
    });

    const result = await authApi.login({
      username: 'admin',
      password: 'password123',
    });

    expect(result.accessToken).toBe('token');
  });
});
```

#### `src/domains/users/__tests__/users.api.test.ts`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { usersApi } from '../users.api';

describe('usersApi', () => {
  it('應成功取得使用者列表', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        data: [{ id: 1, name: 'John' }],
        pagination: { total: 1, current_page: 1 },
      },
    });

    const result = await usersApi.getUsers({ page: 1 });
    expect(result.data).toHaveLength(1);
  });
});
```

---

### 2. Zod Schema 測試

確保資料驗證邏輯正確。

#### `src/auth/__tests__/auth.schemas.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { LoginCredentialsSchema } from '../auth.schemas';

describe('LoginCredentialsSchema', () => {
  it('應驗證正確的登入憑證', () => {
    const result = LoginCredentialsSchema.safeParse({
      username: 'admin',
      password: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('應拒絕空的 username', () => {
    const result = LoginCredentialsSchema.safeParse({
      username: '',
      password: 'password123',
    });
    expect(result.success).toBe(false);
  });
});
```

---

### 3. Type Guards 測試

測試 runtime 型別檢查函式。

#### `src/shared/utils/__tests__/type-guards.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { isApiError, isTokenExpiredError } from '../type-guards';

describe('Type Guards', () => {
  it('應識別 ApiError', () => {
    const error = { code: 'ERROR', message: 'Error' };
    expect(isApiError(error)).toBe(true);
  });

  it('應識別 Token 過期錯誤', () => {
    const error = { code: 'TOKEN_EXPIRED', message: 'Expired' };
    expect(isTokenExpiredError(error)).toBe(true);
  });
});
```

---

## 🔗 推薦的整合測試

使用 **MSW** 模擬 API，測試關鍵整合點。

### 安裝 MSW

```bash
npm install -D msw
```

### Token 刷新機制整合測試

這是**最重要的整合測試**，確保 Token 過期時能自動刷新。

#### `src/shared/api/__tests__/interceptor.integration.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { apiClient } from '../client';
import { useAuthStore } from '@/auth/auth.store';

let requestCount = 0;

const server = setupServer(
  http.get('*/api/users', ({ request }) => {
    requestCount++;

    // 第一次請求返回 TOKEN_EXPIRED
    if (requestCount === 1) {
      return HttpResponse.json(
        { code: 'TOKEN_EXPIRED', message: 'Token expired' },
        { status: 401 }
      );
    }

    // 刷新後成功
    return HttpResponse.json({ data: [], pagination: {} });
  }),

  http.post('*/auth/refresh', () => {
    return HttpResponse.json({
      access_token: 'new_token',
      expires_in: 300,
    });
  })
);

beforeAll(() => server.listen());
afterAll(() => server.close());

describe('Token 刷新機制', () => {
  it('應自動刷新 token 並重試請求', async () => {
    useAuthStore.setState({ accessToken: 'old_token' });
    localStorage.setItem('refreshToken', 'valid_refresh');

    const response = await apiClient.get('/api/users');

    expect(response.status).toBe(200);
    expect(useAuthStore.getState().accessToken).toBe('new_token');
    expect(requestCount).toBeGreaterThan(1); // 證明有重試
  });
});
```

---

## ❌ 不需要做的測試

### E2E 測試（用手動測試替代）

E2E 測試設定複雜、執行慢、維護成本高，對於中小型專案來說**投資報酬率較低**。

**替代方案：使用手動測試檢查清單**

---

## 📋 手動測試檢查清單

在 PR 前或展示前，手動執行以下檢查：

### 認證功能

- [ ] 使用正確帳號密碼可以登入
- [ ] 使用錯誤帳號密碼顯示錯誤訊息
- [ ] 空欄位顯示驗證錯誤
- [ ] 登入後導向使用者列表頁

### Token 管理

- [ ] 重新整理頁面後仍保持登入狀態
- [ ] Token 過期時自動刷新（可透過 DevTools 修改 token 測試）
- [ ] Refresh token 無效時登出並導向登入頁

### 使用者列表

- [ ] 顯示使用者列表
- [ ] 分頁功能正常
- [ ] Loading 狀態顯示（重新整理時檢查）
- [ ] 網路錯誤時顯示錯誤訊息和重試按鈕

### 響應式設計

- [ ] 手機版顯示正常
- [ ] 平板版顯示正常
- [ ] 桌面版顯示正常

---

## 🚀 快速設定

### 1. 安裝測試依賴

```bash
npm install -D vitest @vitest/ui msw
```

### 2. 設定 Vitest

#### `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.test.ts',
        '**/*.test.tsx',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

#### `src/test/setup.ts`

```typescript
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

// 每次測試後清理
afterEach(() => {
  cleanup();
});
```

### 3. 設定測試腳本

#### `package.json`

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}
```

---

## 📁 推薦的測試檔案結構

```
src/
├── auth/
│   ├── __tests__/
│   │   ├── auth.api.test.ts           ✅ 必須
│   │   └── auth.schemas.test.ts       ✅ 必須
│   ├── auth.api.ts
│   ├── auth.schemas.ts
│   └── auth.store.ts
│
├── domains/
│   └── users/
│       ├── __tests__/
│       │   ├── users.api.test.ts      ✅ 必須
│       │   └── users.schemas.test.ts  ✅ 必須
│       ├── users.api.ts
│       └── users.schemas.ts
│
└── shared/
    ├── api/
    │   └── __tests__/
    │       └── interceptor.integration.test.ts  ✅ 推薦
    └── utils/
        └── __tests__/
            └── type-guards.test.ts    ✅ 必須
```

---

## 📊 測試覆蓋率目標

| 模組 | 目標覆蓋率 | 優先級 |
|------|-----------|--------|
| API 函式 | 90%+ | 🔴 高 |
| Zod Schemas | 100% | 🔴 高 |
| Type Guards | 100% | 🟡 中 |
| React Hooks | 70%+ | 🟡 中 |
| UI 組件 | 50%+ | 🟢 低 |

**總體目標：70-80%**

---

## 🎯 為什麼選擇這個策略？

### ✅ 優點

1. **測試品質**
   - 有完整的單元測試
   - 有關鍵的整合測試
   - 測試覆蓋率達標

2. **開發效率高**
   - 測試執行快（秒級）
   - 不需複雜設定
   - 維護成本低

3. **實用性強**
   - 測試不依賴外部 API
   - 可在本地快速執行
   - CI/CD 易於整合

4. **易於協作**
   - 團隊成員可以快速執行測試
   - 測試結果穩定可靠
   - 程式碼清晰易讀

### ⚠️ 接受的取捨

1. **無 E2E 測試**
   - 用手動測試檢查清單替代
   - 降低維護成本

2. **較少整合測試**
   - 只測試關鍵整合點（Token 刷新）
   - 其他部分依賴單元測試

3. **UI 測試覆蓋率較低**
   - UI 變動頻繁，測試維護成本高
   - 重點測試邏輯層

---

## 🚀 執行測試

```bash
# 執行所有測試
npm test

# 執行測試並生成覆蓋率報告
npm run test:coverage

# 開啟 Vitest UI（推薦）
npm run test:ui
```

---

## 📚 參考資源

- [Vitest 官方文件](https://vitest.dev/)
- [MSW 官方文件](https://mswjs.io/)
- [Testing Library](https://testing-library.com/)

---

**返回文件目錄**：[README.md](./README.md)
