# 後台使用者管理系統

> 一個輕量級的後台管理系統，展示生產級前端架構、認證處理與 API 整合能力。

---

## 🚀 專案概覽

本專案為一個簡易後台管理系統，旨在展示**真實世界前端系統**應如何結構化與擴展。

核心重點：
- 認證與 Token 生命週期管理
- 清晰的架構設計與職責邊界
- 穩定的 API 整合與錯誤處理
- 實用的內部後台工具 UX 模式

---

## 🧩 核心功能

### 認證功能

- 登入與 API 整合
- Access Token (300秒) + Refresh Token 機制
- Token 過期時自動刷新
- 無縫請求重試，使用者無感知中斷
- 頁面重新整理後維持登入狀態

### 使用者管理

- 受保護的使用者列表頁（需認證）
- 伺服器端分頁
- 使用者頭像、基本資訊與狀態顯示
- Loading / Empty / Error 狀態處理（含重試功能）

---

## 🏗️ 架構亮點

- **CSR 模式的 React 應用**
- **Domain-driven 資料夾結構**
- Auth 與 API 作為**橫切關注點**
- 集中化的 API 客戶端與錯誤正規化
- 最小化全域狀態（僅 Auth）

```
src/
├─ auth/        # 登入、token、路由守衛
├─ domains/     # 功能導向模組 (users)
├─ shared/      # API 客戶端、UI、工具函數
├─ pages/       # 路由層級組件
└─ app/         # Providers 與 Router
```

詳細架構設計與技術決策請參考 [technical-decisions.md](./docs/02-technical-decisions.md)。

---

## 🔐 Token 策略（關鍵設計）

| Token | 儲存位置 | 理由 |
|-----|--------|-------|
| Access Token | In-memory | 短效，降低風險 |
| Refresh Token | localStorage | 重新整理後恢復登入狀態 |

- Axios 攔截器處理 `TOKEN_EXPIRED`
- Refresh lock + 請求佇列避免競態條件
- 原始請求自動重試

---

## ⚙️ 技術棧

- **TypeScript**
- **React (CSR)**
- **Axios**
- **TanStack Query**
- **Zustand（僅 Auth）**
- **Tailwind CSS + Headless UI**
- **React Router**
- **React Hook Form + Zod**

---

## 📋 前置需求

- Node.js 20+
- npm

---

## 🔧 環境變數

複製 `.env.example` 為 `.env`：
```bash
cp .env.example .env
```

| 變數名稱 | 說明 | 範例值 |
|---------|------|--------|
| `VITE_API_BASE_URL` | API Base URL | `https://lbbj5pioquwxdexqmcnwaxrpce0lcoqx.lambda-url.ap-southeast-1.on.aws` |

---

## 🚀 快速開始

### 測試帳號
```
username: admin
password: password123
```

### 開發伺服器
```bash
npm install
cp .env.example .env
npm run dev
```

開啟 [http://localhost:5173](http://localhost:5173) 查看應用程式。

### 完整安裝指南
詳細的專案初始化、依賴安裝與設定步驟請參考：
- [quick-reference.md](./docs/01-quick-reference.md) - 快速參考指南（含完整安裝步驟）
- [implementation-guide.md](./docs/03-implementation-guide.md) - 詳細實作指南

---

## 📁 專案結構

```
src/
├── app/         # 應用程式入口與 Providers
├── auth/        # 認證模組（橫切關注點）
├── domains/     # 業務領域（users）
├── shared/      # 共用資源（API、UI、工具）
└── pages/       # 路由層級組件
```

完整的目錄結構與職責說明請參考 [implementation-guide.md](./docs/03-implementation-guide.md)。

---

## 🎯 核心功能說明

### Token 自動刷新機制

- Access Token 設定為 300 秒過期，自動偵測過期並刷新
- 使用 refresh lock 與請求佇列避免競態條件
- 刷新失敗則登出並重導向至登入頁

### Session Restore

- 頁面重新整理後自動從 localStorage 恢復登入狀態

詳細實作流程與程式碼範例請參考 [quick-reference.md](./docs/01-quick-reference.md)。

---

## 🎯 UX 考量

- Skeleton loading 取代 spinner
- 清晰的空狀態與錯誤狀態
- 可恢復錯誤的重試功能
- 響應式佈局支援不同螢幕尺寸

---

## 🧪 測試

```bash
# 執行單元測試
npm run test

# 執行測試並顯示覆蓋率
npm run test:coverage

# 監聽模式
npm run test:watch
```

---

## 🏗️ 建置

```bash
# 建置生產版本
npm run build

# 預覽生產版本
npm run preview
```

---

## 🚢 部署（Vercel）

1. 在 Vercel Dashboard 匯入 GitHub Repository
2. Framework Preset: **Vite**
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. 設定環境變數：`VITE_API_BASE_URL`
6. Push to `main` 觸發 Production 部署，開 PR 觸發 Preview 部署

CI/CD 由 GitHub Actions 自動執行 lint、type-check、test、build。

---

## ⚖️ Trade-offs

- **CSR 選擇**：簡化 Token 生命週期處理
- **未導入 Redux**：降低複雜度
- **聚焦範圍**：優先於功能完整性

---

## 🔮 未來改進方向

- 角色基礎存取控制（RBAC）
- 大量資料的表格虛擬化
- 可觀測性（錯誤追蹤與日誌）

---

## 📝 開發規範

### Commit 規範

使用 [Conventional Commits](https://www.conventionalcommits.org/) 格式：

```
<type>(<scope>): <subject>

<body>

<footer>
```

範例：
```
feat(auth): 實作登入功能

- 新增登入表單組件
- 串接登入 API
- 實作 Token 儲存機制
```

### 程式碼風格

- 使用 ESLint 與 Prettier 自動格式化
- TypeScript strict mode
- 遵循 React Hooks 規則

---

## 🔍 API 文件

詳細的 API 規格文件請參考：[api-documentation.md](./docs/api-documentation.md)

### Base URL

```
https://lbbj5pioquwxdexqmcnwaxrpce0lcoqx.lambda-url.ap-southeast-1.on.aws
```

---

## 🐛 問題排除

### Token 刷新失敗

- 檢查 Refresh Token 是否有效
- 確認 API 端點正確
- 檢查網路連線

### 重新整理後登出

- 確認 LocalStorage 是否正常運作
- 檢查 Token 儲存邏輯
- 查看瀏覽器 Console 錯誤訊息

---

## 🧠 總結

本專案不僅僅是為了運作，更是為了：

- **易於擴展**
- **易於理解**
- **易於其他工程師維護**

這反映了我在真實團隊環境中建構生產級後台系統的方法。

---

## 📚 相關文件

所有技術文件統一存放在 [`docs/`](./docs/) 資料夾中：

- [📁 文件目錄](./docs/README.md) - 文件索引與閱讀順序
- [01-quick-reference.md](./docs/01-quick-reference.md) - 快速參考指南
- [02-technical-decisions.md](./docs/02-technical-decisions.md) - 技術決策與架構設計
- [03-implementation-guide.md](./docs/03-implementation-guide.md) - 詳細實作指南
- [04-api-documentation.md](./docs/04-api-documentation.md) - API 文件
- [05-testing-strategy.md](./docs/05-testing-strategy.md) - 簡化測試策略（推薦）
- [05-api-testing-guide.md](./docs/05-api-testing-guide.md) - API 測試指南（完整版）
- [05-test-plan.md](./docs/05-test-plan.md) - 測試計畫

---

**開發愉快！** 🚀
