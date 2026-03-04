# Energy Admin — 專案概覽

> 後台使用者管理系統 | React 18 + TypeScript + TanStack Query

---

## 專案簡介

**Energy Admin** 是一套生產級後台管理系統，提供完整的使用者管理功能，包含認證機制、使用者列表、Dashboard 資料視覺化，並涵蓋完整的測試體系與 CI/CD 部署流程。

| 項目 | 說明 |
|------|------|
| 類型 | B2B SaaS 後台（使用者管理系統） |
| 框架 | React 18 + TypeScript (strict) + Vite |
| 部署 | Vercel + GitHub Actions CI/CD |
| 測試 | 267 tests / 30 files / 99.8% statement coverage |

---

## 技術棧

| 類別 | 工具 | 用途 |
|------|------|------|
| UI 框架 | React 18 + Vite | 應用程式核心 |
| 型別系統 | TypeScript strict | 靜態型別安全 |
| Server State | TanStack Query v5 | API 快取與狀態管理 |
| Client State | Zustand | 認證狀態（Access Token） |
| HTTP 客戶端 | Axios | 攔截器 + Token 刷新機制 |
| 路由 | React Router v6 | SPA 路由 + 路由守衛 |
| 表單 | React Hook Form + Zod | 表單驗證 |
| 樣式 | Tailwind CSS + Headless UI | UI 元件系統 |
| 圖表 | Recharts | Dashboard 資料視覺化 |
| 測試 | Vitest + MSW + React Testing Library | 完整測試體系 |

---

## 系統架構

### 資料夾結構（Domain-Driven）

```
src/
├── app/           # Providers、Router、AppLayout、Sidebar
├── auth/          # 橫切關注點：登入、Token 管理、路由守衛
├── domains/
│   └── users/     # 業務領域：types · schemas · api · hooks · components
├── shared/        # 跨領域共用：API client、UI 元件、工具函式
├── pages/         # 路由層級（薄層，組合 domain）
└── types/         # 全域型別定義
```

**設計原則**：以業務邊界而非技術層次組織程式碼。每個 domain 自行管理型別、Schema、API 呼叫、Hooks 與 UI 元件，職責邊界清晰，新增功能不需跨目錄散落修改。

### 路由結構

```
/login          → LoginPage（公開）
AuthGuard
  └── AppLayout（Sidebar + Header + Outlet）
      ├── /dashboard  → DashboardPage（登入後預設）
      ├── /users      → UsersPage
      └── *           → redirect /dashboard
```

### 狀態管理分層

| 狀態類型 | 工具 | 說明 |
|---------|------|------|
| Server State | TanStack Query v5 | 使用者列表、API 資料 |
| Client State | Zustand | Access Token（in-memory） |
| URL State | useSearchParams | 搜尋/篩選/分頁（可分享） |
| Local State | useState | 元件內小狀態 |

---

## 核心功能

### 認證模組

- **登入**：React Hook Form + Zod 表單驗證，即時欄位錯誤提示
- **Token 刷新**：請求佇列機制，多個請求同時 401 時只觸發一次刷新，全部無感重試
- **Session Restore**：應用啟動時自動以 Refresh Token 還原登入狀態
- **路由守衛**：未登入訪問受保護頁面自動導向登入頁

**Token 儲存策略**：

| Token | 儲存位置 | 理由 |
|-------|---------|------|
| Access Token（300s） | Zustand in-memory | 不落地，降低 XSS 風險 |
| Refresh Token | localStorage | 支援重整頁面後恢復登入 |

### 使用者列表

- **搜尋**：智慧路由（含 `@` → email 參數；否則 → name 參數）
- **篩選**：狀態篩選（啟用 / 停用）+ 每頁筆數（10 / 25 / 50）
- **排序**：Client-side 排序（ID / 姓名 / 建立日期，含 ▲▼ 指示器）
- **分頁**：URL Query Params 驅動，翻頁可分享、可書籤
- **分頁預取**：背景預取下一頁，多數情況翻頁無 loading
- **狀態處理**：Skeleton Loading / 差異化 Empty State / Error + 重試按鈕

### Dashboard

- 統計卡片（總使用者 / 啟用 / 停用）
- 圓餅圖（啟用 vs 停用比例，Recharts）
- 最近 5 名使用者列表（含頭像、載入失敗 Fallback）
- 各卡片獨立 Error 狀態

---

## UX 細節

| 功能 | 實作 |
|------|------|
| Skeleton Loading | 資料載入時骨架屏，避免白屏閃爍 |
| isPlaceholderData Spinner | 翻頁時右上角小 spinner，舊資料保留不閃爍 |
| 差異化 Empty State | 無搜尋結果 vs 尚無使用者，顯示不同提示 |
| 鍵盤快捷鍵 | `/` 聚焦搜尋框，`Esc` 清除搜尋 |
| 搜尋清除按鈕 | 輸入非空時顯示 ✕，並提示「共 N 筆結果」 |
| Sidebar 收合 | Desktop: w-64 ↔ w-16（icon-only + tooltip）；行動版點擊導覽自動收合 |
| 離線 Banner | `useNetworkStatus` 偵測，斷線時頂部提示列 |
| Sticky Header | 頁面捲動時保持頂部導覽列 |
| Toast 通知 | 登出、錯誤等操作的使用者回饋；所有訊息改為中文 |
| 響應式設計 | Mobile overlay sidebar / Desktop sticky sidebar |
| 圖表無障礙 | Recharts 加 `aria-hidden="true"` + `[&_svg_*]:outline-none` |
| iOS 表單優化 | Input `text-base md:text-sm` 避免 iOS Safari 自動縮放 |

---

## 錯誤處理架構

攔截器將所有 Axios error 正規化為 `AppError`，UI 層只處理 domain level error。所有使用者可見的錯誤訊息改為繁體中文，不直接傳遞後端英文訊息：

| 等級 | 觸發情境 | 中文訊息 | 處理方式 |
|------|---------|--------|---------|
| Critical | 401 AuthError (Token 無效) | `帳號或密碼錯誤，請重新確認` | 強制登出 |
| Critical | 401 AuthError (Token 過期) | `登入工作階段已過期，請重新登入` | 自動刷新 + 重試 |
| Recoverable | 網路錯誤 | `網路連線錯誤` | Toast 提示 + 可重試 |
| Recoverable | 5xx 伺服器錯誤 | `伺服器錯誤，請稍後再試` | Toast 提示 + 可重試 |
| Warning | 其他錯誤 | `請求失敗，請稍後再試` | Toast 提示 |
| Validation | 400 Bad Request | `輸入資料有誤` + Zod 欄位訊息 | 表單欄位錯誤提示 |

---

## 測試

### 工具

| 工具 | 用途 |
|------|------|
| Vitest | 測試框架（Vite-native） |
| MSW v2 | API Mock（Service Worker 層，不 mock axios） |
| React Testing Library | 元件行為測試 |

### 測試分層

```
Unit Tests      → API 函式、Schema、Type Guards、工具函式
Integration     → TanStack Query Hooks（搭配 MSW）、Token 刷新流程
Component Tests → Loading / Error / Empty 狀態、使用者互動
```

### 覆蓋率

```
Test Files  30 passed
Tests       267 passed
Statements  99.8%  |  Branches  99.13%  |  Functions  97.18%
```

---

## CI/CD 與部署

### GitHub Actions

```yaml
on:
  pull_request:
    branches: [main]
jobs:
  test:
    steps:
      - npm run lint     # ESLint
      - npm run test     # 267 tests
      - npm run build    # TypeScript 型別檢查 + Vite build
```

### Vercel

- `main` branch → Production 自動部署
- PR → Preview 部署（含獨立 URL）
- `vercel.json` rewrites 確保 SPA 路由直接訪問不 404
- Security Headers：X-Content-Type-Options / X-Frame-Options / X-XSS-Protection / Referrer-Policy

---

## 程式碼品質規範

- TypeScript strict mode，禁止 `any`（用 `unknown` + type guard）
- 函式不超過 50 行，單檔不超過 400 行
- 不可變更新（spread / map / filter，禁止 push / splice）
- 提交前零 `console.log` / 零未使用 import
- ESLint + Prettier 強制格式化
- Git commit 格式：`<type>(<scope>): <中文摘要>`
- 所有實作遵循 TDD（RED → GREEN → REFACTOR）

---

## 相關文件

- [01-quick-reference.md](./01-quick-reference.md) — 快速參考與核心概念
- [02-technical-decisions.md](./02-technical-decisions.md) — 技術決策與選型理由
- [03-implementation-guide.md](./03-implementation-guide.md) — 詳細實作指南
- [04-api-documentation.md](./04-api-documentation.md) — API 端點規格
- [05-testing-strategy.md](./05-testing-strategy.md) — 測試策略

---

---

## 最近更新（Phase 7）

**日期**: 2026-03-04

**變更摘要**：
- 錯誤訊息全面中文化（PR #25, #28）：所有 API 錯誤改用統一的中文訊息，不傳遞後端英文
- 行動版 Sidebar 自動收合（PR #20）：點擊導覽連結後自動隱藏 Sidebar
- 圖表 focus outline 移除（PR #22, #26）：使用 `aria-hidden="true"` 和 `[&_svg_*]:outline-none`
- iOS Safari 自動縮放修正（PR #23）：Input 元件改用 `text-base md:text-sm`

詳細內容見 [02-technical-decisions.md](./02-technical-decisions.md) 的第 16-19 決策。

---

*最後更新: 2026-03-04*
