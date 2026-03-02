# 文件目錄

本資料夾包含專案的所有技術文件，使用數字前綴分類便於瀏覽。

## 📚 文件列表

### 01 - 快速開始

- **[01-quick-reference.md](./01-quick-reference.md)** - 快速參考指南
  - 快速開始步驟
  - 核心概念說明（Token 流程、狀態管理、型別管理）
  - 關鍵程式碼片段（Token 刷新、Auth Store、Zod 驗證）
  - 測試檢查清單
  - 常見問題 Q&A

### 02 - 架構與設計

- **[02-technical-decisions.md](./02-technical-decisions.md)** - 技術決策與架構設計
  - CSR 架構選擇理由
  - 技術棧選型說明（React Router、TanStack Query、Zustand、Axios）
  - Token 儲存與刷新策略
  - Domain-based 專案結構設計
  - 錯誤處理策略
  - 替代方案比較與影響分析
  - 未來可能的調整方向

### 03 - 實作指南

- **[03-implementation-guide.md](./03-implementation-guide.md)** - 詳細實作指南
  - 專案初始化步驟
  - 系統架構與資料夾結構
  - 型別系統（全域型別、Type Guards、Zod Schema）
  - 核心模組實作（API 客戶端、錯誤處理）
  - 認證模組實作（Auth Store、Token 管理）
  - 使用者列表實作（TanStack Query、分頁）
  - 路由與守衛實作（Protected Routes）
  - Session Restore 實作
  - Runtime 型別驗證（Zod）
  - 完整的程式碼範例

### 04 - API 文件

- **[04-api-documentation.md](./04-api-documentation.md)** - API 文件
  - Base URL 與認證方式
  - API 端點規格（登入、刷新 Token、使用者列表）
  - 請求與響應格式說明
  - 錯誤處理與狀態碼
  - Token 生命週期說明

### 05 - 測試

- **[05-testing-strategy.md](./05-testing-strategy.md)** - 簡化測試策略（推薦）
  - 務實的測試策略，平衡覆蓋率與效率
  - 單元測試 + 輕量整合測試方案
  - 手動測試檢查清單
  - 快速設定指南

- **[05-api-testing-guide.md](./05-api-testing-guide.md)** - API 測試指南（完整版）
  - 完整測試金字塔策略
  - 單元測試（API 函式、Schema、Type Guards）
  - 整合測試（API 端點、Token 刷新）
  - E2E 測試（登入流程、使用者列表）
  - 測試資料與執行方式

- **[05-test-plan.md](./05-test-plan.md)** - 測試計畫
  - 整體測試策略

## 🗂️ 文件結構

```
docs/
├── README.md                    # 本文件（文件索引）
├── 01-quick-reference.md        # 快速參考指南
├── 02-technical-decisions.md   # 技術決策與架構設計
├── 03-implementation-guide.md  # 詳細實作指南
├── 04-api-documentation.md     # API 文件
├── 05-testing-strategy.md      # 簡化測試策略（推薦）
├── 05-api-testing-guide.md     # API 測試指南（完整版）
└── 05-test-plan.md             # 測試計畫
```

## 📖 閱讀順序建議

1. **快速開始**：[01-quick-reference.md](./01-quick-reference.md) - 了解核心概念與快速上手
2. **API 文件**：[04-api-documentation.md](./04-api-documentation.md) - 了解 API 端點規格與使用方式
3. **技術決策**：[02-technical-decisions.md](./02-technical-decisions.md) - 了解架構設計與技術選型理由
4. **實作指南**：[03-implementation-guide.md](./03-implementation-guide.md) - 查看詳細實作步驟與程式碼
5. **測試策略**：[05-testing-strategy.md](./05-testing-strategy.md) - 了解推薦的測試方法
6. **完整測試**：[05-api-testing-guide.md](./05-api-testing-guide.md) - 深入了解測試實作細節

## 📁 專案計畫

實作路線圖與專案計畫請參考：
- [../plan/implementation-roadmap.md](../plan/implementation-roadmap.md) - 完整的專案實作計畫

---

**返回專案根目錄**：[../README.md](../README.md)
