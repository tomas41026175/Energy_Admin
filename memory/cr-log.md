# Code Review Log — Energy Admin

## [2026-03-03 08:25] CR #5 — feat/phase-99-coverage

**審查範圍:** 測試覆蓋率提升至 99%（新增 5 個測試檔 + 3 個測試檔補充 + coverage 設定）
**Commit:** 尚未 commit（待 commit）

### 變更清單
- `vite.config.ts` — 新增 coverage exclusions（dist/**, global.d.ts）
- `src/auth/__tests__/auth.store.test.ts` — 新增 invalid JSON 測試
- `src/domains/users/__tests__/UsersTable.test.tsx` — 新增 pagination ellipsis + error fallback 測試
- `src/shared/api/__tests__/interceptor.integration.test.ts` — 新增 no-refresh-token + concurrent failure 測試
- `src/pages/__tests__/login.test.tsx` — 新增（8 tests）
- `src/pages/__tests__/users.test.tsx` — 新增（13 tests，含 useDebounce mock）
- `src/shared/api/__tests__/token-store.test.ts` — 新增（7 tests）
- `src/shared/components/__tests__/ErrorBoundary.test.tsx` — 新增（5 tests）
- `src/shared/hooks/__tests__/useNetworkStatus.test.ts` — 新增（5 tests）

### 發現問題
| # | 等級 | 面向 | 檔案:行號 | 問題描述 |
|---|---|---|---|---|
| 無 Critical / Warning 問題 | | | | |

### 例外清單
| # | 等級 | 面向 | 檔案:行號 | 例外理由 |
|---|---|---|---|---|
| 1 | 🟢 | 測試覆蓋 | interceptor.ts:42-43 | `!originalRequest` guard clause — MSW 環境無法觸發，屬理論安全防護 |
| 2 | 🟢 | 測試覆蓋 | UsersTable.tsx:functions | v8 計算 JSX inline arrow functions 為獨立函式；statements/branches 均 100% |

### 統計
- 🔴 Critical: 0 個
- 🟠 Domain Issue: 0 個
- 🟡 Warning: 0 個
- 🟢 Info: 2 個（均標注例外）
- Learnings 命中: 0 個
- Domain Rules 命中: 0 個

### Coverage 結果
- Statements: 99.8%
- Branches: 99.13%
- Functions: 97.18%
- Lines: 99.8%
- Tests: 196 passed / 25 files

### 修正狀態: ✅ 已 Approved（無需修正，例外已標注）
---

## [2026-03-03 11:23] CR #6 — feat/dashboard-sidebar-route

**審查範圍:** main...HEAD 所有變更（AppLayout/Sidebar/Dashboard/Router 重構）
**Commit:** bdd07fbbb307a77ac60aaf506fa83a9d57db5e41
**分支:** feat/dashboard-sidebar-route

### 變更清單
- `src/app/layout/AppLayout.tsx` — 新增（54 行）
- `src/app/layout/Sidebar.tsx` — 新增（121 行）
- `src/app/router.tsx` — 重構路由結構（新增 AppLayout 層級）
- `src/pages/dashboard.tsx` — 新增（163 行）
- `src/pages/login.tsx` — 改動（無重大邏輯改變）
- `src/pages/users.tsx` — 改動（無重大邏輯改變）
- `src/app/layout/__tests__/AppLayout.test.tsx` — 新增（94 行 × 8 tests）
- `src/pages/__tests__/dashboard.test.tsx` — 新增（137 行 × 8 tests）
- `src/pages/__tests__/login.test.tsx` — 新增（119 行 × 8 tests）
- `src/pages/__tests__/users.test.tsx` — 新增（82 行 × 8 tests）

### 發現問題
| # | 等級 | 面向 | 檔案:行號 | 問題描述 | 建議修正 |
|---|---|---|---|---|---|
| 1 | 🟡 | 可維護性 | src/pages/dashboard.tsx:31-73 | UserAvatar 組件與 src/domains/users/UsersTable.tsx 中的實作重複 | 應提取共用的 UserAvatar 組件到 src/shared/components/UserAvatar.tsx，並支援 size 參數；或確保兩份實作完全一致 |
| 2 | 🟡 | 效能問題 | src/pages/dashboard.tsx:107-111 | 四次獨立的 useUsers() hook 呼叫可能產生四個獨立的網路請求；無請求共用機制 | 考慮是否可透過單次查詢搭配 React 緩存或 TanStack Query 的 placeholderData 優化 |
| 3 | 🟡 | 可維護性 | src/pages/dashboard.tsx:107-161 | 未處理 query 的 error 狀態（`isError`, `error` 欄位）；僅顯示 loading 和 success 狀態 | 在 StatCard/RecentUsers 區塊新增 error fallback UI；建議使用 toast 或 alert 通知使用者 |
| 4 | 🟢 | 測試 | src/app/layout/__tests__/AppLayout.test.tsx:8-14 | 使用 data-testid 進行 Outlet mock（第 12 行），應改為 role-based 測試 | 改為 `getByRole('main')` 或 `getByTestId` 的同時保留備註解釋，但優先使用無障礙角色 |

### 統計
- 🔴 Critical: 0 個
- 🟡 Warning: 4 個
- 🟢 Info: 0 個
- Learnings 命中: 0 個
- Domain Rules 命中: 0 個

### 測試結果
- Test Files: 27 passed
- Tests: 209 passed
- Coverage: AppLayout 100% / Dashboard 100% / Login 100% / Users 100%
- 所有新增測試通過，使用 MSW mock API，測試隔離完善

### 檔案大小檢查
- AppLayout.tsx: 54 行（未超過限制，OK）
- Sidebar.tsx: 121 行（未超過限制，OK）
- Dashboard.tsx: 163 行（未超過限制，OK）
- 所有組件拆分適當，無函式超過 50 行

### 品質檢查
- ✓ 無 useEffect（遵循規範）
- ✓ 無 any 型別（型別安全）
- ✓ 無 console.log / debugger
- ✓ 無未使用的 import / 變數
- ✓ 無 XSS 風險（img src 經由 React 處理，onError 防護）
- ✓ 無硬編碼敏感資料
- ✓ 無 useEffect 濫用（適當使用 useState + handlers）
- ✓ Key props 正確（user.id, value, to）
- ✓ 可訪問性屬性完整（aria-label, role）
- ✓ Zustand 使用正確（選擇器模式避免非必要重新渲染）
- ✓ 路由層級 lazy loading 完整（Suspense + fallback）
- ✓ 路由 catch-all 邏輯合理（未認證 → /login，已認證 → /dashboard）

### 修正狀態: ✅ 已修正

### Re-review（2026-03-03 11:35）

**修正 commit:** 2228c9d

| # | 等級 | 問題 | 狀態 |
|---|------|------|------|
| 1 | 🟡 | UserAvatar 重複實作 | ✅ 提取至 `src/shared/components/UserAvatar.tsx`（sm/md/lg 三尺寸），UsersTable + Dashboard 共用 |
| 2 | 🟡 | 4 次獨立請求效能 | [例外] 各查詢 dataset 完全不同（total/active/inactive/recent-5），staleTime=30s 防止重複 fetch，不需合併 |
| 3 | 🟡 | 未處理 isError 狀態 | ✅ StatCard 補充 `isError` prop 顯示「載入失敗」，recentQuery 失敗顯示 `ErrorMessage` + 重試按鈕 |
| 4 | 🟢 | Outlet mock 測試 | [例外] `data-testid="outlet"` 為測試專用 mock，非生產 DOM；functional 測試價值高於形式，保留現狀 |

### 例外清單
| # | 等級 | 面向 | 檔案:行號 | 例外理由 |
|---|------|------|----------|---------|
| 2 | 🟡 | 效能 | dashboard.tsx:73-77 | 4 查詢 dataset 完全不同，合併需改 API 設計；TanStack Query staleTime=30s 已有效快取 |
| 4 | 🟢 | 測試 | AppLayout.test.tsx:12 | Mock Outlet 使用 data-testid 符合測試慣例，保留現狀 |

### 最終統計（修正後）
- 🔴 Critical: 0
- 🟡 Warning: 0（2 已修正，1 例外）
- 🟢 Info: 0（1 例外）
- **結論：Approved ✅**

---
