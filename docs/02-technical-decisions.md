# 技術決策文件

本文檔記錄專案中的關鍵技術決策及其理由。

## 📋 決策列表

### 1. 選擇 CSR 而非 SSR/SSG

**決策**：使用 CSR（Client-Side Rendering）模式。

**理由**：
- Token lifecycle（refresh / replay）為 client-side concern
- SSR 在本題增加複雜度但未帶來實質收益
- CSR 更貼近多數後台系統實際運作模式
- 後台系統通常不需要 SEO
- 使用者需要登入才能使用，內容不公開

**替代方案**：
- Next.js SSR/SSG：增加複雜度但未帶來實質收益
- Remix：功能強大但生態系統較小

**影響**：
- 首屏載入時間較 SSR 慢（但可接受）
- 更簡單的 Token 管理與錯誤處理
- 開發與維護成本較低

---

### 2. 選擇 React Router 而非 Next.js

**決策**：使用 React Router 進行路由管理。

**理由**：
- 更靈活的 CSR 控制
- 更簡單的設定與部署
- 符合純前端應用需求
- 不需要 Next.js 的 SSR/SSG 功能

**替代方案**：
- Next.js：提供 SSR/SSG 但增加複雜度
- Remix：功能類似但學習曲線較陡

**影響**：
- 更簡單的路由設定
- 需要自行處理部署配置

---

### 3. 選擇 TanStack Query 作為 API 管理工具

**決策**：使用 TanStack Query（React Query）管理伺服器狀態。

**理由**：
- 自動快取與背景更新
- 內建 Loading、Error 狀態管理
- 自動重試機制
- 與 React 深度整合
- 優秀的 TypeScript 支援
- 活躍的社群與持續更新

**替代方案**：
- SWR：功能類似但功能較少
- Redux Toolkit Query：較重，適合大型應用
- 原生 Fetch：需要手動處理快取與狀態

**影響**：
- 減少大量樣板程式碼
- 提升開發效率與使用者體驗
- 需要學習 Query 的概念

---

### 4. 選擇 Zustand 作為客戶端狀態管理

**決策**：使用 Zustand 管理認證等客戶端狀態。

**理由**：
- 極輕量（< 1KB）
- 簡單直觀的 API
- 無需 Provider，減少樣板程式碼
- TypeScript 友好
- 效能優異

**替代方案**：
- Redux Toolkit：功能強大但較重
- Context API：內建但效能較差
- Jotai：原子化狀態管理，較複雜

**影響**：
- 認證狀態管理變得簡單
- 減少不必要的重新渲染
- 學習成本低

---

### 5. 選擇 Axios 作為 HTTP 客戶端

**決策**：使用 Axios 而非原生 Fetch。

**理由**：
- 強大的攔截器功能（請求/回應）
- 自動 JSON 轉換
- 請求取消支援
- 更好的錯誤處理
- 廣泛使用，文件完善

**替代方案**：
- Fetch API：原生但功能較少
- Ky：輕量但功能較少

**影響**：
- Token 刷新機制實作更簡單
- 錯誤處理更統一
- 增加 bundle 大小（但可接受）

---

### 6. Token 儲存策略

**決策**：
- Access Token：In-memory (Zustand)
- Refresh Token：localStorage

**理由**：
- Access Token 短效（300秒），存在記憶體可降低風險
- Refresh Token 存在 localStorage 以支援重新整理後恢復登入
- 簡單實作，無需複雜的 Cookie 設定

**替代方案**：
- HttpOnly Cookies：更安全但需要後端配合
- SessionStorage：重新整理後會丟失
- 純記憶體：重新整理後需重新登入

**影響**：
- 實作簡單
- 安全性較 HttpOnly Cookies 低，適合內部系統或非敏感應用
- 支援重新整理後維持登入狀態

---

### 7. Token 刷新機制設計

**決策**：使用請求佇列機制，避免多個請求同時觸發刷新。

**理由**：
- 避免重複的 Refresh API 呼叫
- 確保所有失敗請求都能正確重試
- 提供流暢的使用者體驗

**實作方式**：
- 使用 `isRefreshing` 標記
- 失敗請求加入佇列
- 刷新成功後依序重試

**影響**：
- 使用者不會感受到登出或中斷
- 減少不必要的 API 呼叫
- 程式碼複雜度略增

---

### 8. 選擇 Tailwind CSS + Headless UI

**決策**：使用 Tailwind CSS 作為樣式框架，Headless UI 作為組件庫。

**理由**：
- Tailwind CSS 提供快速開發與一致設計
- Headless UI 提供無樣式的可訪問組件
- 更靈活的樣式客製化
- 與 Tailwind CSS 完美整合
- 優秀的 TypeScript 支援
- 活躍的社群

**替代方案**：
- MUI：功能完整但較重，樣式較難客製化
- Chakra UI：功能類似但生態系統較小
- Shadcn/ui：功能類似但需要更多設定

**影響**：
- 快速開發 UI
- 一致的設計系統
- 易於客製化與維護

---

### 9. Domain-based 專案結構

**決策**：使用 Domain-based 而非 Feature-based 結構。

**理由**：
- 以業務領域組織程式碼
- 每個 domain 獨立管理自己的 API、型別、組件
- 更清晰的職責邊界
- 易於擴展新功能

**替代方案**：
- Feature-based：功能導向但可能重複
- Layer-based：分層但較難找到相關檔案

**影響**：
- 程式碼組織更清晰
- 新功能開發更容易
- 需要明確的 domain 劃分

---

### 10. 錯誤處理策略

**決策**：集中化錯誤處理，UI 僅處理 domain-level error。

**理由**：
- 統一的錯誤格式
- UI 不需要直接處理 Axios error
- 錯誤處理邏輯集中管理
- 更容易維護與測試

**實作方式**：
- API 攔截器統一轉換錯誤格式
- Domain-level error 提供給 UI
- UI 僅處理業務邏輯錯誤

**影響**：
- 錯誤處理更統一
- UI 程式碼更簡潔
- 需要定義清晰的錯誤型別

---

## 🔄 未來可能的調整

### 1. 狀態管理

如果專案規模擴大，可考慮：
- 將更多狀態移至 TanStack Query
- 使用 Jotai 進行原子化狀態管理

### 2. 安全性

生產環境可考慮：
- 使用 HttpOnly Cookies 儲存 Token
- 實作 CSRF 保護
- 新增 Rate Limiting

### 3. 效能優化

可新增：
- 虛擬滾動（如列表很長）
- 圖片懶載入優化
- Service Worker 快取

---

## 📚 參考資源

- [React Router 文件](https://reactrouter.com/)
- [TanStack Query 文件](https://tanstack.com/query/latest)
- [Zustand 文件](https://zustand-demo.pmnd.rs/)
- [Headless UI 文件](https://headlessui.com/)

---

**本文檔會隨著專案發展持續更新。**
