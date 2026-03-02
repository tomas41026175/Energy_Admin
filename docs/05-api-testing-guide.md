# API 測試指南

本文檔說明如何測試後台管理系統的 API 端點，確保 API 整合的正確性與穩定性。

---

## 📋 目錄

1. [測試策略](#測試策略)
2. [單元測試](#單元測試)
3. [整合測試](#整合測試)
4. [E2E 測試](#e2e-測試)
5. [測試資料](#測試資料)
6. [執行測試](#執行測試)

---

## 🎯 測試策略

### 測試金字塔

```
       ╱╲
      ╱E2E╲       少量 - 關鍵使用者流程
     ╱────╲
    ╱ 整合 ╲      中量 - API 端點整合
   ╱────────╲
  ╱  單元測試 ╲    大量 - 函式、Schema、Utils
 ╱────────────╲
```

### 測試範圍

| 測試類型 | 測試目標 | 數量 | 執行速度 |
|---------|---------|------|---------|
| 單元測試 | API 函式、Schema 驗證、Type Guards | 多 | 快 |
| 整合測試 | API 端點、錯誤處理、Token 刷新 | 中 | 中 |
| E2E 測試 | 登入流程、使用者列表、Token 過期 | 少 | 慢 |

---

## 🧪 單元測試

### 1. Auth API 單元測試

#### `src/auth/__tests__/auth.api.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authApi } from '../auth.api';
import { apiClient } from '@/shared/api/client';

// Mock axios client
vi.mock('@/shared/api/client');

describe('authApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('應成功登入並返回 tokens 和 user', async () => {
      // Arrange
      const mockResponse = {
        data: {
          access_token: 'mock_access_token',
          refresh_token: 'mock_refresh_token',
          expires_in: 300,
          user: {
            username: 'admin',
            role: 'admin',
          },
        },
      };
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

      // Act
      const result = await authApi.login({
        username: 'admin',
        password: 'password123',
      });

      // Assert
      expect(apiClient.post).toHaveBeenCalledWith('/auth', {
        username: 'admin',
        password: 'password123',
      });
      expect(result).toEqual({
        accessToken: 'mock_access_token',
        refreshToken: 'mock_refresh_token',
        user: {
          username: 'admin',
          role: 'admin',
        },
      });
    });

    it('應拋出錯誤當 username 為空', async () => {
      // Act & Assert
      await expect(
        authApi.login({ username: '', password: 'password123' })
      ).rejects.toThrow('使用者名稱不可為空');
    });

    it('應拋出錯誤當 password 為空', async () => {
      // Act & Assert
      await expect(
        authApi.login({ username: 'admin', password: '' })
      ).rejects.toThrow('密碼不可為空');
    });

    it('應處理 401 錯誤（使用者名稱或密碼錯誤）', async () => {
      // Arrange
      const mockError = {
        response: {
          status: 401,
          data: {
            message: 'Username or password is incorrect',
          },
        },
      };
      vi.mocked(apiClient.post).mockRejectedValue(mockError);

      // Act & Assert
      await expect(
        authApi.login({ username: 'admin', password: 'wrong' })
      ).rejects.toMatchObject({
        response: {
          status: 401,
        },
      });
    });
  });

  describe('refreshToken', () => {
    it('應成功刷新 token', async () => {
      // Arrange
      const mockResponse = {
        data: {
          access_token: 'new_access_token',
          expires_in: 300,
        },
      };
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

      // Act
      const result = await authApi.refreshToken('mock_refresh_token');

      // Assert
      expect(apiClient.post).toHaveBeenCalledWith('/auth/refresh', {
        refresh_token: 'mock_refresh_token',
      });
      expect(result).toEqual({
        accessToken: 'new_access_token',
      });
    });

    it('應處理 401 錯誤（Refresh token 無效）', async () => {
      // Arrange
      const mockError = {
        response: {
          status: 401,
          data: {
            message: 'Invalid refresh token: token is malformed',
            code: 'INVALID_REFRESH_TOKEN',
          },
        },
      };
      vi.mocked(apiClient.post).mockRejectedValue(mockError);

      // Act & Assert
      await expect(
        authApi.refreshToken('invalid_token')
      ).rejects.toMatchObject({
        response: {
          status: 401,
          data: {
            code: 'INVALID_REFRESH_TOKEN',
          },
        },
      });
    });
  });
});
```

### 2. Users API 單元測試

#### `src/domains/users/__tests__/users.api.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usersApi } from '../users.api';
import { apiClient } from '@/shared/api/client';

vi.mock('@/shared/api/client');

describe('usersApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUsers', () => {
    it('應成功取得使用者列表', async () => {
      // Arrange
      const mockResponse = {
        data: {
          data: [
            {
              id: 1,
              name: 'John Doe',
              email: 'john@example.com',
              avatar: 'https://example.com/avatar.jpg',
              status: 'active',
              created_at: '2024-01-01T00:00:00Z',
            },
          ],
          pagination: {
            total: 1,
            current_page: 1,
            per_page: 10,
            total_pages: 1,
          },
        },
      };
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

      // Act
      const result = await usersApi.getUsers({ page: 1, limit: 10 });

      // Assert
      expect(apiClient.get).toHaveBeenCalledWith('/api/users', {
        params: { page: 1, limit: 10 },
      });
      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });

    it('應使用預設參數', async () => {
      // Arrange
      const mockResponse = {
        data: {
          data: [],
          pagination: {
            total: 0,
            current_page: 1,
            per_page: 10,
            total_pages: 0,
          },
        },
      };
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

      // Act
      await usersApi.getUsers();

      // Assert
      expect(apiClient.get).toHaveBeenCalledWith('/api/users', {
        params: {},
      });
    });

    it('應拋出錯誤當 page < 1', async () => {
      // Act & Assert
      await expect(usersApi.getUsers({ page: 0 })).rejects.toThrow();
    });

    it('應拋出錯誤當 limit > 100', async () => {
      // Act & Assert
      await expect(usersApi.getUsers({ limit: 101 })).rejects.toThrow();
    });

    it('應支援篩選參數', async () => {
      // Arrange
      const mockResponse = {
        data: {
          data: [],
          pagination: {
            total: 0,
            current_page: 1,
            per_page: 10,
            total_pages: 0,
          },
        },
      };
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

      // Act
      await usersApi.getUsers({
        page: 1,
        limit: 10,
        name: 'John',
        email: 'john@example.com',
        status: 'active',
      });

      // Assert
      expect(apiClient.get).toHaveBeenCalledWith('/api/users', {
        params: {
          page: 1,
          limit: 10,
          name: 'John',
          email: 'john@example.com',
          status: 'active',
        },
      });
    });
  });
});
```

### 3. Zod Schema 單元測試

#### `src/auth/__tests__/auth.schemas.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import {
  LoginCredentialsSchema,
  LoginResponseSchema,
  UserSchema,
} from '../auth.schemas';

describe('Auth Schemas', () => {
  describe('LoginCredentialsSchema', () => {
    it('應驗證正確的登入憑證', () => {
      const validData = {
        username: 'admin',
        password: 'password123',
      };

      const result = LoginCredentialsSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('應拒絕空的 username', () => {
      const invalidData = {
        username: '',
        password: 'password123',
      };

      const result = LoginCredentialsSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('使用者名稱');
      }
    });

    it('應拒絕空的 password', () => {
      const invalidData = {
        username: 'admin',
        password: '',
      };

      const result = LoginCredentialsSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('密碼');
      }
    });
  });

  describe('UserSchema', () => {
    it('應驗證正確的使用者物件', () => {
      const validUser = {
        id: '1',
        username: 'john_doe',
        email: 'john@example.com',
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      const result = UserSchema.safeParse(validUser);
      expect(result.success).toBe(true);
    });

    it('應拒絕無效的 email', () => {
      const invalidUser = {
        id: '1',
        username: 'john_doe',
        email: 'not-an-email',
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      const result = UserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
    });

    it('應允許選擇性的 avatar', () => {
      const userWithoutAvatar = {
        id: '1',
        username: 'john_doe',
        email: 'john@example.com',
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      const result = UserSchema.safeParse(userWithoutAvatar);
      expect(result.success).toBe(true);
    });
  });
});
```

### 4. Type Guards 單元測試

#### `src/shared/utils/__tests__/type-guards.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import {
  isApiError,
  isTokenExpiredError,
  isUser,
  isNotNull,
} from '../type-guards';
import { ApiErrorCode } from '@/shared/api/error';

describe('Type Guards', () => {
  describe('isApiError', () => {
    it('應識別有效的 ApiError', () => {
      const error = {
        code: 'SERVER_ERROR',
        message: '伺服器錯誤',
      };

      expect(isApiError(error)).toBe(true);
    });

    it('應拒絕缺少 code 的物件', () => {
      const error = {
        message: '錯誤訊息',
      };

      expect(isApiError(error)).toBe(false);
    });

    it('應拒絕 null 和 undefined', () => {
      expect(isApiError(null)).toBe(false);
      expect(isApiError(undefined)).toBe(false);
    });
  });

  describe('isTokenExpiredError', () => {
    it('應識別 Token 過期錯誤', () => {
      const error = {
        code: ApiErrorCode.TOKEN_EXPIRED,
        message: 'Token has expired',
      };

      expect(isTokenExpiredError(error)).toBe(true);
    });

    it('應拒絕其他錯誤代碼', () => {
      const error = {
        code: ApiErrorCode.UNAUTHORIZED,
        message: 'Unauthorized',
      };

      expect(isTokenExpiredError(error)).toBe(false);
    });
  });

  describe('isUser', () => {
    it('應識別有效的 User 物件', () => {
      const user = {
        id: '1',
        username: 'john_doe',
        email: 'john@example.com',
      };

      expect(isUser(user)).toBe(true);
    });

    it('應拒絕缺少必要欄位的物件', () => {
      const incomplete = {
        id: '1',
        username: 'john_doe',
      };

      expect(isUser(incomplete)).toBe(false);
    });
  });

  describe('isNotNull', () => {
    it('應識別非 null/undefined 值', () => {
      expect(isNotNull(0)).toBe(true);
      expect(isNotNull('')).toBe(true);
      expect(isNotNull(false)).toBe(true);
      expect(isNotNull({})).toBe(true);
    });

    it('應拒絕 null 和 undefined', () => {
      expect(isNotNull(null)).toBe(false);
      expect(isNotNull(undefined)).toBe(false);
    });
  });
});
```

---

## 🔗 整合測試

整合測試使用真實的 API 端點（或 Mock Server），測試完整的請求/回應流程。

### 1. Auth Integration Tests

#### `src/auth/__tests__/auth.integration.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { authApi } from '../auth.api';

// 設定 Mock Server
const server = setupServer(
  // POST /auth - 登入
  http.post('*/auth', async ({ request }) => {
    const body = await request.json();

    if (body.username === 'admin' && body.password === 'password123') {
      return HttpResponse.json({
        access_token: 'mock_access_token',
        refresh_token: 'mock_refresh_token',
        expires_in: 300,
        user: {
          username: 'admin',
          role: 'admin',
        },
      });
    }

    return HttpResponse.json(
      { message: 'Username or password is incorrect' },
      { status: 401 }
    );
  }),

  // POST /auth/refresh - 刷新 Token
  http.post('*/auth/refresh', async ({ request }) => {
    const body = await request.json();

    if (body.refresh_token === 'valid_refresh_token') {
      return HttpResponse.json({
        access_token: 'new_access_token',
        expires_in: 300,
      });
    }

    return HttpResponse.json(
      {
        message: 'Invalid refresh token: token is malformed',
        code: 'INVALID_REFRESH_TOKEN',
      },
      { status: 401 }
    );
  })
);

beforeAll(() => server.listen());
afterAll(() => server.close());

describe('Auth API Integration Tests', () => {
  describe('POST /auth', () => {
    it('應成功登入並返回 tokens', async () => {
      const result = await authApi.login({
        username: 'admin',
        password: 'password123',
      });

      expect(result).toMatchObject({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
        user: {
          username: 'admin',
          role: 'admin',
        },
      });
    });

    it('應返回 401 當憑證錯誤', async () => {
      await expect(
        authApi.login({
          username: 'admin',
          password: 'wrong',
        })
      ).rejects.toThrow();
    });
  });

  describe('POST /auth/refresh', () => {
    it('應成功刷新 token', async () => {
      const result = await authApi.refreshToken('valid_refresh_token');

      expect(result).toMatchObject({
        accessToken: expect.any(String),
      });
    });

    it('應返回 401 當 refresh token 無效', async () => {
      await expect(
        authApi.refreshToken('invalid_token')
      ).rejects.toThrow();
    });
  });
});
```

### 2. Users Integration Tests

#### `src/domains/users/__tests__/users.integration.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { usersApi } from '../users.api';

const server = setupServer(
  http.get('*/api/users', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    // 檢查 Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        {
          message: 'Unauthorized: missing or invalid Authorization header',
          code: 'INVALID_TOKEN',
        },
        { status: 401 }
      );
    }

    // 模擬分頁資料
    const mockUsers = Array.from({ length: limit }, (_, i) => ({
      id: (page - 1) * limit + i + 1,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      avatar: `https://example.com/avatar${i + 1}.jpg`,
      status: 'active',
      created_at: '2024-01-01T00:00:00Z',
    }));

    return HttpResponse.json({
      data: mockUsers,
      pagination: {
        total: 100,
        current_page: page,
        per_page: limit,
        total_pages: Math.ceil(100 / limit),
      },
    });
  })
);

beforeAll(() => server.listen());
afterAll(() => server.close());

describe('Users API Integration Tests', () => {
  describe('GET /api/users', () => {
    it('應成功取得使用者列表', async () => {
      // 需要先設定 access token
      // 這裡假設已經透過其他方式設定了 token

      const result = await usersApi.getUsers({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(10);
      expect(result.pagination).toMatchObject({
        total: 100,
        current_page: 1,
        per_page: 10,
        total_pages: 10,
      });
    });

    it('應返回 401 當缺少 Authorization header', async () => {
      // 清除 token
      // ...

      await expect(usersApi.getUsers()).rejects.toThrow();
    });

    it('應支援分頁', async () => {
      const page1 = await usersApi.getUsers({ page: 1, limit: 10 });
      const page2 = await usersApi.getUsers({ page: 2, limit: 10 });

      expect(page1.data[0].id).not.toBe(page2.data[0].id);
    });
  });
});
```

### 3. Token Refresh Integration Test

#### `src/shared/api/__tests__/interceptor.integration.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { apiClient } from '../client';
import { useAuthStore } from '@/auth/auth.store';

let requestCount = 0;

const server = setupServer(
  http.get('*/api/users', ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    requestCount++;

    // 第一次請求返回 TOKEN_EXPIRED
    if (requestCount === 1) {
      return HttpResponse.json(
        {
          message: 'Unauthorized: token has expired',
          code: 'TOKEN_EXPIRED',
        },
        { status: 401 }
      );
    }

    // 刷新後的請求應該成功
    if (authHeader === 'Bearer new_access_token') {
      return HttpResponse.json({
        data: [],
        pagination: {
          total: 0,
          current_page: 1,
          per_page: 10,
          total_pages: 0,
        },
      });
    }

    return HttpResponse.json(
      { message: 'Invalid token', code: 'INVALID_TOKEN' },
      { status: 401 }
    );
  }),

  http.post('*/auth/refresh', () => {
    return HttpResponse.json({
      access_token: 'new_access_token',
      expires_in: 300,
    });
  })
);

beforeAll(() => server.listen());
afterAll(() => {
  server.close();
  requestCount = 0;
});

describe('Token Refresh Integration Test', () => {
  it('應自動刷新 token 並重試請求', async () => {
    // 設定初始 token（會過期）
    useAuthStore.setState({
      accessToken: 'expired_token',
      isAuthenticated: true,
    });

    // 設定 refresh token
    localStorage.setItem('refreshToken', 'valid_refresh_token');

    // 發起請求（會觸發 token 刷新）
    const response = await apiClient.get('/api/users');

    // 驗證請求成功
    expect(response.status).toBe(200);

    // 驗證 token 已更新
    const newToken = useAuthStore.getState().accessToken;
    expect(newToken).toBe('new_access_token');

    // 驗證請求被重試（第一次失敗，刷新 token 後重試）
    expect(requestCount).toBeGreaterThanOrEqual(2);
  });
});
```

---

## 🎭 E2E 測試

E2E 測試使用 Playwright 模擬真實使用者操作。

### 1. 登入流程 E2E 測試

#### `e2e/auth.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('登入流程', () => {
  test('應成功登入並導向使用者列表頁', async ({ page }) => {
    // 前往登入頁
    await page.goto('/login');

    // 填寫登入表單
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'password123');

    // 提交表單
    await page.click('button[type="submit"]');

    // 等待導向
    await page.waitForURL('/users');

    // 驗證已登入
    expect(page.url()).toContain('/users');
  });

  test('應顯示錯誤訊息當憑證錯誤', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'wrong_password');

    await page.click('button[type="submit"]');

    // 驗證錯誤訊息
    await expect(page.locator('text=使用者名稱或密碼錯誤')).toBeVisible();
  });

  test('應顯示驗證錯誤當欄位為空', async ({ page }) => {
    await page.goto('/login');

    await page.click('button[type="submit"]');

    // 驗證表單驗證錯誤
    await expect(page.locator('text=使用者名稱不可為空')).toBeVisible();
    await expect(page.locator('text=密碼不可為空')).toBeVisible();
  });
});
```

### 2. Token 過期處理 E2E 測試

#### `e2e/token-refresh.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Token 過期處理', () => {
  test('應自動刷新 token 並繼續請求', async ({ page, context }) => {
    // 登入
    await page.goto('/login');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/users');

    // 攔截 API 請求，模擬 token 過期
    let isTokenExpired = true;
    await page.route('**/api/users', (route) => {
      if (isTokenExpired) {
        isTokenExpired = false;
        route.fulfill({
          status: 401,
          body: JSON.stringify({
            message: 'Unauthorized: token has expired',
            code: 'TOKEN_EXPIRED',
          }),
        });
      } else {
        route.continue();
      }
    });

    // 刷新頁面或發起新請求
    await page.reload();

    // 驗證頁面仍然正常顯示（token 已自動刷新）
    await expect(page.locator('table')).toBeVisible();
  });

  test('應登出並導向登入頁當 refresh token 無效', async ({ page }) => {
    // 設定無效的 refresh token
    await page.addInitScript(() => {
      localStorage.setItem('refreshToken', 'invalid_token');
    });

    // 前往受保護的頁面
    await page.goto('/users');

    // 驗證被導向登入頁
    await page.waitForURL('/login');
    expect(page.url()).toContain('/login');
  });
});
```

### 3. 使用者列表 E2E 測試

#### `e2e/users.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('使用者列表', () => {
  test.beforeEach(async ({ page }) => {
    // 登入
    await page.goto('/login');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/users');
  });

  test('應顯示使用者列表', async ({ page }) => {
    // 驗證表格存在
    await expect(page.locator('table')).toBeVisible();

    // 驗證至少有一個使用者
    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCountGreaterThan(0);
  });

  test('應支援分頁', async ({ page }) => {
    // 點擊下一頁
    await page.click('button:has-text("下一頁")');

    // 驗證 URL 參數改變
    await page.waitForURL(/page=2/);

    // 驗證表格內容更新
    await expect(page.locator('table')).toBeVisible();
  });

  test('應顯示 Loading 狀態', async ({ page }) => {
    // 刷新頁面
    await page.reload();

    // 驗證 Loading 狀態（Skeleton 或 Spinner）
    await expect(
      page.locator('[data-testid="skeleton"]').first()
    ).toBeVisible();

    // 等待資料載入
    await expect(page.locator('table')).toBeVisible();
  });

  test('應處理空狀態', async ({ page }) => {
    // 攔截 API 請求，返回空資料
    await page.route('**/api/users*', (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: [],
          pagination: {
            total: 0,
            current_page: 1,
            per_page: 10,
            total_pages: 0,
          },
        }),
      });
    });

    await page.reload();

    // 驗證空狀態訊息
    await expect(page.locator('text=沒有使用者資料')).toBeVisible();
  });

  test('應處理錯誤狀態並提供重試', async ({ page }) => {
    // 攔截 API 請求，返回錯誤
    await page.route('**/api/users*', (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({
          message: 'Failed to load users data',
        }),
      });
    });

    await page.reload();

    // 驗證錯誤訊息
    await expect(page.locator('text=載入失敗')).toBeVisible();

    // 驗證重試按鈕存在
    await expect(page.locator('button:has-text("重試")')).toBeVisible();
  });
});
```

---

## 📊 測試資料

### 測試帳號

```typescript
export const TEST_ACCOUNTS = {
  admin: {
    username: 'admin',
    password: 'password123',
    role: 'admin',
  },
  user: {
    username: 'user',
    password: 'password123',
    role: 'user',
  },
};
```

### Mock 使用者資料

```typescript
export const MOCK_USERS = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://i.pravatar.cc/150?img=1',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    avatar: 'https://i.pravatar.cc/150?img=2',
    status: 'active',
    created_at: '2024-01-02T00:00:00Z',
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob@example.com',
    avatar: 'https://i.pravatar.cc/150?img=3',
    status: 'inactive',
    created_at: '2024-01-03T00:00:00Z',
  },
];
```

### Mock API 回應

```typescript
export const MOCK_LOGIN_RESPONSE = {
  access_token: 'mock_access_token_' + Date.now(),
  refresh_token: 'mock_refresh_token_' + Date.now(),
  expires_in: 300,
  user: {
    username: 'admin',
    role: 'admin',
  },
};

export const MOCK_USERS_RESPONSE = {
  data: MOCK_USERS,
  pagination: {
    total: 100,
    current_page: 1,
    per_page: 10,
    total_pages: 10,
  },
};
```

---

## 🚀 執行測試

### 安裝測試依賴

```bash
# Vitest (單元測試與整合測試)
npm install -D vitest @vitest/ui

# MSW (Mock Service Worker)
npm install -D msw

# Playwright (E2E 測試)
npm install -D @playwright/test
npx playwright install
```

### 設定測試腳本

#### `package.json`

```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run --reporter=verbose",
    "test:integration": "vitest run --reporter=verbose src/**/*.integration.test.ts",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:debug": "playwright test --debug"
  }
}
```

### 執行測試命令

```bash
# 執行所有單元測試
npm run test:unit

# 執行整合測試
npm run test:integration

# 執行測試並生成覆蓋率報告
npm run test:coverage

# 執行 E2E 測試
npm run test:e2e

# 執行 E2E 測試（有頭模式）
npm run test:e2e:headed

# 以 debug 模式執行 E2E 測試
npm run test:e2e:debug

# 開啟 Vitest UI
npm run test:ui
```

### CI/CD 整合

#### `.github/workflows/test.yml`

```yaml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:unit

  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 📋 測試檢查清單

在 PR 前確保：

- [ ] 所有單元測試通過
- [ ] 所有整合測試通過
- [ ] 所有 E2E 測試通過
- [ ] 測試覆蓋率 ≥ 80%
- [ ] 新增功能包含對應測試
- [ ] API 變更更新測試案例
- [ ] 錯誤處理情境有測試涵蓋
- [ ] Token 刷新機制測試通過

---

## 🔗 相關文件

- [API 文件](./api-documentation.md) - API 端點規格
- [測試計畫](./test-plan.md) - 整體測試策略
- [實作指南](./implementation-guide.md) - 實作細節

---

**返回文件目錄**：[README.md](./README.md)
