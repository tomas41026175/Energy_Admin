# 後台使用者管理系統

> 一個輕量級的後台管理系統，展示生產級前端架構、認證處理、API 整合與互動動畫能力。

---

## 🌐 線上展示

**[https://energy-admin-one.vercel.app/login](https://energy-admin-one.vercel.app/login)**

測試帳號：`admin` / `password123`

---

## 🚀 專案概覽

本專案為一個後台管理系統，旨在展示**真實世界前端系統**應如何結構化與擴展。

核心重點：
- 認證與 Token 生命週期管理
- 清晰的架構設計與職責邊界
- 穩定的 API 整合與統一錯誤處理
- 完整的 UX 細節（動畫、鍵盤快捷鍵、響應式、離線偵測）

---

## 🧩 已實作功能

### 認證（Auth）

| 功能 | 說明 |
|---|---|
| 登入 / 登出 | 表單驗證（Zod）、API 串接、中文錯誤提示 |
| Token 自動刷新 | Access Token 300s 過期，自動偵測並靜默刷新 |
| Refresh lock | 多個請求同時過期時，只發送一次 refresh，其餘排隊等候 |
| Session Restore | 頁面重新整理後從 localStorage 自動恢復登入狀態 |
| 路由守衛 | 未登入自動導向 `/login`，登入後導向 `/dashboard` |

### 儀表板（Dashboard）

| 功能 | 說明 |
|---|---|
| 統計卡片 | 總使用者數 / 活躍數 / 停用數，獨立 Query 各自快取 |
| 使用者狀態圓餅圖 | Recharts PieChart，啟用/停用比例視覺化 |
| 最近使用者列表 | 顯示最新 5 筆，含頭像、Email、狀態徽章 |
| 載入骨架屏 | 資料尚未到達時顯示 Skeleton，避免版面跳動 |

### 使用者管理（Users）

| 功能 | 說明 |
|---|---|
| 資料表格 | ID / 姓名（含頭像）/ Email / 狀態 / 建立日期 |
| 響應式佈局 | 桌面顯示完整表格，行動裝置自動切換為卡片列表 |
| 伺服器端分頁 | 支援每頁 10 / 20 / 50 筆，頁碼範圍智慧縮減 |
| 欄位排序 | 點擊 ID / 姓名 / 建立日期 欄位進行前端排序（升/降序） |
| 關鍵字搜尋 | 輸入包含 `@` 自動路由至 Email 搜尋，否則搜尋姓名 |
| 狀態篩選 | 全部 / 啟用 / 停用 下拉選單 |
| 換頁過渡指示 | 切頁時舊資料保留並半透明，右上角顯示 Spinner |
| 錯誤 / 空狀態 | 專屬 UI 提示（含搜尋無結果、API 錯誤）、一鍵重試 |

---

## ✨ UX 細節

### 互動動畫

| 元件 | 動畫效果 |
|---|---|
| Toast 通知 | 從右側滑入（`slide-in-right`），關閉時滑出（`slide-out-right`） |
| 路由切換 | 每次換頁整體淡入（`fade-in`，Y 軸微位移） |
| 表格列 | 交錯進場，每列遞延 30ms（Stagger effect） |
| 行動裝置 Sidebar | 從左側滑入（`slide-in-left`） |
| 離線橫幅 | 從頂部滑下（`slide-down`） |
| 按鈕按壓 | `active:scale-[0.97]` 縮放回饋 |
| 搜尋清除按鈕 | 出現時彈出動畫（`pop-in`） |
| Input focus ring | `transition` 包含 box-shadow，焦點光暈平滑過渡 |
| Pagination 頁碼 | `hover:scale-105` 懸停放大 |

### 鍵盤快捷鍵

| 按鍵 | 行為 |
|---|---|
| `/` | 聚焦搜尋輸入框 |
| `Esc` | 清除搜尋條件 |

### Toast 通知系統

- 4 種類型：`success` / `error` / `warning` / `info`
- 自動 3 秒消失（含離場動畫）
- 可手動點擊 × 關閉
- 多個 Toast 同時疊加顯示

### 網路偵測

- 離線時頂部橫幅自動出現，提示資料可能不是最新
- 網路恢復後橫幅自動消失

### 載入狀態全覆蓋

| 場景 | Loading UI |
|---|---|
| Session 還原中 | 全螢幕置中 Spinner |
| 路由懶載入 | 全螢幕置中 Spinner |
| Dashboard 統計卡片 | Skeleton rectangular |
| Dashboard 圓餅圖 | Skeleton rectangular |
| Dashboard 最近使用者 | 5 列 Skeleton rectangular |
| Users 初始載入 | SkeletonTable（6 列） |
| Users 換頁過渡 | 半透明舊資料 + 右上角 Spinner sm |
| 登入按鈕提交中 | 按鈕內嵌 Spinner sm |

### 統一中文錯誤訊息

所有 API 錯誤在前端統一轉換為繁體中文，不顯示後端原始英文訊息：

| HTTP 狀態 | 顯示訊息 |
|---|---|
| 無回應 | 網路連線錯誤 |
| 400 | 輸入資料有誤 |
| 401 | 帳號或密碼錯誤，請重新確認 |
| 5xx | 伺服器錯誤，請稍後再試 |
| 其他 | 請求失敗，請稍後再試 |

---

## 🏗️ 架構設計

### Domain-driven 資料夾結構

```
src/
├── app/        # Providers、Router、AppLayout、Sidebar
├── auth/       # 橫切關注點：登入、Token、路由守衛
├── domains/    # 業務領域模組（users/）
│   └── users/
│       ├── users.api.ts
│       ├── users.hooks.ts
│       ├── users.schemas.ts
│       ├── users.types.ts
│       └── UsersTable.tsx
├── shared/     # 跨領域共用
│   ├── api/    # Axios client、攔截器、錯誤類別
│   ├── ui/     # Button、Input、Toast、Skeleton、Spinner…
│   ├── hooks/  # useDebounce、useKeyboard、useToast…
│   └── utils/  # cn()、type-guards
└── pages/      # 路由層級薄層（Dashboard、Users、Login）
```

### 狀態管理策略

| 類型 | 工具 | 用途 |
|---|---|---|
| Server State | TanStack Query v5 | 所有 API 資料，含快取與重試 |
| Global Client State | Zustand | 僅 Auth（user、logout） |
| URL State | useSearchParams | 搜尋條件、分頁、篩選 |
| Local State | useState | UI 狀態（Sidebar open、sort） |

### Token 策略

| Token | 儲存位置 | 理由 |
|---|---|---|
| Access Token | In-memory | 短效（300s），降低 XSS 洩漏風險 |
| Refresh Token | localStorage | 重新整理後恢復登入狀態 |

- Axios 攔截器偵測 `TOKEN_EXPIRED` code
- Refresh lock + 請求佇列避免競態條件
- 原始請求在刷新成功後自動重試

---

## ⚙️ 技術棧

| 類別 | 技術 |
|---|---|
| 核心框架 | React 18 + TypeScript (strict) |
| 建置工具 | Vite |
| Server State | TanStack Query v5 |
| Client State | Zustand |
| HTTP | Axios（含攔截器） |
| 路由 | React Router v6 |
| 表單 | React Hook Form + Zod |
| 樣式 | Tailwind CSS |
| 圖表 | Recharts |
| 測試 | Vitest + MSW + React Testing Library |

---

## 📋 前置需求

- Node.js 20+
- npm

---

## 🔧 環境變數

建立 `.env` 並設定：

```env
VITE_API_BASE_URL=https://lbbj5pioquwxdexqmcnwaxrpce0lcoqx.lambda-url.ap-southeast-1.on.aws
```

---

## 🚀 快速開始

```bash
npm install
# 建立 .env 並填入 VITE_API_BASE_URL
npm run dev
```

開啟 [http://localhost:5173](http://localhost:5173)，使用測試帳號 `admin` / `password123` 登入。

---

## 🧪 測試

```bash
# 執行所有測試
npm run test

# 測試 + 覆蓋率報告
npm run test:coverage

# 監聽模式
npm run test:watch
```

測試分層：Unit（API / Schema / Utils）→ Integration（Hooks + MSW）→ Component（RTL 行為測試）

---

## 🏗️ 建置 & 部署

```bash
npm run build    # 生產建置
npm run preview  # 預覽生產版本
```

**CI/CD 流程（GitHub Actions → Vercel）：**

```
PR 開啟
  ├── TypeScript check
  ├── ESLint
  ├── Vitest + coverage
  └── Vite build
         ↓ 全過才能 merge
merge to main → Vercel 自動 deploy
```

**Production**：[https://energy-admin-one.vercel.app](https://energy-admin-one.vercel.app)

---

## ⚖️ 設計取捨

| 決策 | 理由 |
|---|---|
| CSR（非 SSR） | 簡化 Token 生命週期管理，後台系統 SEO 需求低 |
| URL 作為篩選狀態 | 支援分享 / 重新整理保留篩選條件，無需額外 store |
| 前端排序（非後端） | Demo API 不支援排序參數，排序僅在當頁資料上執行 |
| 純 Tailwind 動畫 | 無新依賴，keyframes 寫入 tailwind.config.js 即可全站複用 |
| Toast setTimeout 替代 onAnimationEnd | jsdom 不觸發 CSS 事件，確保測試可靠性 |

---

## 🔮 未來改進方向

- 角色基礎存取控制（RBAC）
- 使用者新增 / 編輯 / 刪除
- 大量資料的表格虛擬化
- 可觀測性（錯誤追蹤與日誌）

---

## 📚 相關文件

- [01-quick-reference.md](./docs/01-quick-reference.md) — 快速參考指南
- [02-technical-decisions.md](./docs/02-technical-decisions.md) — 技術決策與架構設計
- [03-implementation-guide.md](./docs/03-implementation-guide.md) — 詳細實作指南
- [04-api-documentation.md](./docs/04-api-documentation.md) — API 文件
- [05-testing-strategy.md](./docs/05-testing-strategy.md) — 測試策略

---

**開發愉快！** 🚀
