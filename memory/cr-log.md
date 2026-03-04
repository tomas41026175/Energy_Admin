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

## [2026-03-03 15:06] CR #8 — users 篩選強化 + 手機版修復

**審查範圍:** 未 commit 工作目錄變更（6 個檔案）
**分支:** main（local 工作目錄）

### 變更清單
- `src/domains/users/users.types.ts` — 新增 `id / createdFrom / createdTo` 至 `UsersParams`
- `src/shared/mocks/handlers.ts` — 靜態 → 動態篩選 MSW，資料擴充至 15 筆
- `src/pages/__tests__/users.test.tsx` — 新增 11 個篩選測試（email/id/日期/page reset）
- `src/pages/users.tsx` — 兩列篩選 UI（email/id/date range）+ select appearance-none
- `src/domains/users/UsersTable.tsx` — 分頁改 icon、UserCard ID 移至 email 下方、`formatDateUTC8` UTC+8 轉換
- `src/domains/users/__tests__/UsersTable.test.tsx` — 新增 3 個 `formatDateUTC8` 驗證測試

### Learnings 命中
無（本次無歷史錯誤模式命中）

### 發現問題
| # | 等級 | 面向 | 檔案:行號 | 問題描述 |
|---|------|------|----------|---------|
| 1 | 🟡 | 測試覆蓋 | `UsersTable.tsx:15-27` | `formatDateUTC8` 無驗證性測試 — date-only / ISO+timezone / invalid date 三個 branch 未 assert 輸出 → **已修正** |
| 2 | 🟢 | 可維護性 | `users.tsx:33-63` | 6 個 handler 結構相同，可用工廠函式消除重複 |
| 3 | 🟢 | 可維護性 | `UsersTable.tsx:187-224` | `ChevronLeft`/`ChevronRight` SVG 幾乎相同，可合併為帶 `direction` prop 的單一組件 |
| 4 | 🟢 | Type Safety | `handlers.ts:5` | `MOCK_USERS` 未標注型別，`status` 推斷為 `string` 而非 `UserStatus` |

### 統計
- 🔴 Critical: 0 個
- 🟠 Domain Issue: 0 個
- 🟡 Warning: 1 個（已修正）
- 🟢 Info: 3 個
- Learnings 命中: 0 個

### 例外清單
| # | 等級 | 面向 | 檔案:行號 | 例外理由 |
|---|------|------|----------|---------|
| 2 | 🟢 | 可維護性 | `users.tsx:33-63` | 6 個 handler 各 3 行且命名清晰，工廠函式增加間接層降低可讀性；可讀性優先 |
| 3 | 🟢 | 可維護性 | `UsersTable.tsx:187-224` | 兩個 SVG 各 12 行，合併會增加 `direction` prop 複雜度；目前可讀性良好 |
| 4 | 🟢 | Type Safety | `handlers.ts:5` | `MOCK_USERS` 為 test-only mock，型別推斷可接受；不影響生產代碼型別安全 |

### 測試結果（修正後）
- Test Files: 27 passed
- Tests: 224 passed（新增 14 個測試）
- formatDateUTC8 覆蓋：date-only / ISO+Z / invalid 三個 branch ✅

### 8 面向檢查表
- TypeScript 型別安全：✅
- 效能問題：✅（formatDateUTC8 per-render 計算，最多 10 筆可接受）
- 安全性：✅
- 可維護性：✅（例外標注）
- i18n：✅（zh-TW hardcode，單語專案）
- 狀態管理：✅（無 Zustand 相關）
- React 最佳實踐：✅（無 useEffect，aria-hidden 正確）
- 測試覆蓋：✅（修正後）

### 修正狀態: ✅ Approved（使用者要求全修）

### Re-review（2026-03-03 15:15）

| # | 等級 | 問題 | 狀態 |
|---|------|------|------|
| 1 | 🟡 | `formatDateUTC8` 無驗證測試 | ✅ 補 3 個測試（date-only/ISO+Z/invalid） |
| 2 | 🟢 | 6 個 handler 重複模式 | ✅ 提取 `makeInputHandler` 工廠函式，5 個 input handler 複用 |
| 3 | 🟢 | ChevronLeft/Right 重複 SVG | ✅ 合併為 `ChevronIcon` + `CHEVRON_POINTS` 常數表 |
| 4 | 🟢 | MOCK_USERS 未標注型別 | ✅ import `User` 並標注 `MOCK_USERS: User[]` |

**最終結論：Approved ✅ — 所有 4 個問題全數修正**

---

## [2026-03-03 11:51] CR #7 — fix/layout-whitespace

**審查範圍:** 佈局 CSS 修正（sticky header + sidebar + min-h-screen）
**Commit:** 待提交
**分支:** fix/layout-whitespace

### 變更清單
- `src/app/layout/AppLayout.tsx` — 3 行 CSS class 改動
  - 第 21 行：`h-screen` → `min-h-screen`
  - 第 25 行：header 加 `sticky top-0 z-10`
  - 第 48 行：main 移除 `overflow-y-auto`
- `src/app/layout/Sidebar.tsx` — 1 行 CSS class 改動
  - 第 101 行：desktop aside 加 `sticky top-0 h-screen`

### 變更分析

#### AppLayout 修正邏輯
1. **容器高度** (`min-h-screen`)
   - 原始 `h-screen`：固定視口高度，內容超高時被切割
   - 修正 `min-h-screen`：最低視口高度，內容超高時自然延伸
   - **效果**：解決內容溢出問題

2. **Header 固定** (`sticky top-0 z-10`)
   - 視口滾動時保持頂部可見
   - z-10 層級 < 手機版 sidebar z-40，不衝突
   - **效果**：改善可用性，方便存取登出

3. **Main 滾動邏輯** (移除 `overflow-y-auto`)
   - 由 AppLayout 外層 `flex min-h-screen` 統一控制滾動
   - 避免嵌套滾動容器
   - **效果**：簡化 CSS 邏輯，依賴父容器自然流

#### Sidebar 修正邏輯
1. **桌面版固定** (`sticky top-0 h-screen`)
   - 側邊欄跟隨 viewport 滾動時固定在頂部
   - `h-screen` 限制高度為視口高度，防止超溢
   - **效果**：固定導覽欄位，提升可用性

2. **手機版 overlay** (分離控制)
   - 手機版 `fixed inset-0 z-40`（第 107 行）
   - 與桌面版 sticky 邏輯完全分離
   - **效果**：響應式層級正確，無衝突

### 發現問題
| # | 等級 | 面向 | 檔案:行號 | 問題描述 |
|---|------|------|----------|---------|
| 無 Critical / Warning / Info 問題 | | | | |

### z-index 層級驗證
- `body`：0
- header：10 ✅
- 手機 sidebar backdrop/drawer：40 ✅
- header < mobile overlay，層級正確

### 瀏覽器相容性
- `sticky position`：IE11 不支援，Edge 12+、Chrome 56+ 支援 ✅
- 適用專案技術棧（React 18 + 現代瀏覽器）✅
- `min-height`：所有瀏覽器支援 ✅

### 測試驗證
```
✓ src/app/layout/__tests__/AppLayout.test.tsx (8 tests) 87ms
  - renders Outlet (main content area)
  - displays user.username in header
  - renders logout button
  - calls logout when logout button is clicked
  - shows toast after logout
  - renders sidebar with navigation links
  - shows hamburger menu button on mobile
  - hamburger button toggles sidebar visibility
```
**測試結果：全數通過 ✅**

### 8 面向檢查表
- TypeScript 型別安全：✅ 無型別變更
- 效能問題：✅ sticky/h-screen 無效能損失
- 安全性：✅ 純 CSS 改動
- 可維護性：✅ 邏輯清晰，註解完善
- i18n：✅ 無新增字串
- Jotai 狀態：N/A 專案使用 Zustand
- React 最佳實踐：✅ 無 Hook 改變
- 測試覆蓋：✅ 全數通過

### 統計
- 🔴 Critical: 0 個
- 🟡 Warning: 0 個
- 🟢 Info: 0 個
- Learnings 命中: 0 個
- 異常處理: 0 個

### 修正狀態: ✅ Approved（無需修正）

**結論**：
高品質的 CSS 修正，邏輯清晰、層級正確、測試完善。
✅ 可直接 merge

---

## [2026-03-03 15:42] CR #9 — refactor/users-smart-search

**審查範圍:** git diff main...HEAD（4 個檔案）
**Commit:** 9bd93df

### 變更清單
- `src/domains/users/users.types.ts` — 移除不支援的 API 參數（`id` / `createdFrom` / `createdTo`）
- `src/shared/mocks/handlers.ts` — 移除對應的篩選邏輯（id / createdFrom / createdTo）
- `src/pages/users.tsx` — 統一搜尋框（`@` 自動路由至 email，否則路由至 name）；移除獨立 email/id/date 輸入
- `src/pages/__tests__/users.test.tsx` — 更新測試（新增 `getTable()` helper；新增 `@` 路由行為測試；移除舊篩選測試）

### Learnings 命中
無（learnings.md 不存在，無歷史錯誤模式可比對）

### 發現問題
| # | 等級 | 面向 | 檔案:行號 | 問題描述 |
|---|------|------|----------|---------|
| 無問題 | | | | 本次為刪減型重構，無新增風險點 |

### 統計
- 🔴 Critical: 0 個
- 🟠 Domain Issue: 0 個
- 🟡 Warning: 0 個
- 🟢 Info: 1 個（`getByTestId` 用於 mock 組件暴露 params — 刻意設計，非測試實作細節）
- Learnings 命中: 0 個

### 8 面向檢查表
- TypeScript 型別安全：✅ 移除未使用型別，無 any
- 效能問題：✅ 無新增 re-render 風險
- 安全性：✅ 無敏感資料
- 可維護性：✅ 79 行新增 / 215 行刪除，淨減 136 行
- i18n：✅ 單語專案，zh-TW hardcode 可接受
- 狀態管理：✅ 無 Zustand 相關
- React 最佳實踐：✅ 無 useEffect，aria-label 正確
- 測試覆蓋：✅ 215 個測試全數通過

### 修正狀態: ✅ Approved（無需修正）

---

## [2026-03-03 16:05] CR #10 — fix/react-router-v7-warnings

**審查範圍:** git diff main...HEAD（6 個檔案）
**Commit:** 4a6947c

### 變更清單
- `src/app/router.tsx` — `createBrowserRouter` 加入 `future: { v7_startTransition, v7_relativeSplatPath }`
- `src/app/layout/__tests__/AppLayout.test.tsx` — `MemoryRouter` 加入 `future` prop
- `src/auth/__tests__/auth.guard.test.tsx` — `MemoryRouter` 加入 `future` prop
- `src/pages/__tests__/dashboard.test.tsx` — `MemoryRouter` 加入 `future` prop
- `src/pages/__tests__/login.test.tsx` — `MemoryRouter` 加入 `future` prop
- `memory/cr-log.md` — 補充 CR #9 紀錄

### Learnings 命中
無

### 發現問題
| # | 等級 | 面向 | 檔案:行號 | 問題描述 |
|---|------|------|----------|---------|
| 1 | 🟢 | 可維護性 | 4 個測試檔 | `ROUTER_FUTURE` 常數在各檔獨立定義，可提取至 test-utils [例外：2 屬性小物件，重複可接受] |

### 統計
- 🔴 Critical: 0 個
- 🟠 Domain Issue: 0 個
- 🟡 Warning: 0 個
- 🟢 Info: 1 個（例外接受）
- Learnings 命中: 0 個

### 例外清單
| # | 等級 | 面向 | 檔案:行號 | 例外理由 |
|---|------|------|----------|---------|
| 1 | 🟢 | 可維護性 | 4 測試檔 | 只有 2 個屬性的常數物件，提取共用增加複雜度不值得 |

### 修正狀態: ✅ Approved（無需修正）

---


## [2026-03-03 16:50] CR #11 — refactor/health-check-fixes

**審查範圍:** git diff main...HEAD（9 個檔案）
**Commit:** 1f9f1b9

### 變更清單
- `src/shared/components/StatusBadge.tsx` — 新建共用元件（從 dashboard/UsersTable 提取）
- `src/domains/users/UsersTable.tsx` — 改用共用 StatusBadge，移除本地定義
- `src/pages/dashboard.tsx` — 改用共用 StatusBadge，移除本地定義
- `src/shared/ui/ErrorMessage.tsx` — "Retry" → "重試"
- `src/main.tsx` — 移除非空斷言，加入 null check
- `src/shared/components/ErrorBoundary.tsx` — 移除 console.error，移除未使用 import
- `src/app/layout/__tests__/AppLayout.test.tsx` — getByTestId → getByText
- `src/shared/ui/__tests__/ErrorMessage.test.tsx` — 更新按鈕文字匹配
- `src/domains/users/__tests__/UsersTable.test.tsx` — 更新按鈕文字匹配

### 發現問題
無（本次為品質改善，無新增風險）

### 統計
- 🔴 Critical: 0 個
- 🟠 Domain Issue: 0 個
- 🟡 Warning: 0 個
- 🟢 Info: 0 個

### 修正狀態: ✅ Approved

---
