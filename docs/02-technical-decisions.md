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

### 11. URL Query Params 作為搜尋/篩選的唯一狀態來源

**決策**：使用 `useSearchParams`（React Router）取代 `useState`，以 URL 作為篩選狀態的唯一來源。

**理由**：
- 支援瀏覽器前進/後退（History API 自然實作）
- 可分享連結（URL 即狀態）
- 重新整理後保持篩選條件
- 與 React Router 深度整合，無需額外依賴
- `replace: true` 避免每次輸入都污染歷史記錄

**實作方式**：
```tsx
const [searchParams, setSearchParams] = useSearchParams()
const page = Number(searchParams.get('page') ?? '1')

const handleSearch = (value: string) => {
  setSearchParams(prev => {
    const next = new URLSearchParams(prev)
    if (value) next.set('q', value) else next.delete('q')
    next.delete('page') // 搜尋時重置頁碼
    return next
  }, { replace: true })
}
```

**替代方案**：
- `useState`：無法分享、重整後丟失
- 全域 store (Zustand)：過重，且 URL 無法反映狀態

**影響**：
- 使用者體驗提升（可分享、歷史記錄正常）
- 測試需要 `MemoryRouter` wrapper
- 組件需移除原有的 `useState` 狀態

---

### 12. Client-side 排序（API 不支援 sort 參數的應對策略）

**決策**：在 API 不支援 `sort`/`order` 參數時，在前端 `useMemo` 對當前頁資料排序。

**理由**：
- API 僅支援 `GET /api/users?page&limit&name&email&status`，無排序參數
- Client-side sort 成本低（每頁最多 50 筆）
- 用戶可快速驗證當前頁資料
- 無需後端協助即可提供功能

**實作方式**：
```tsx
// 在元件內加上排序 state，useMemo 處理
const sortedUsers = useMemo(() => {
  if (!data?.data || !sortField) return data?.data ?? []
  return [...data.data].sort((a, b) => {
    const cmp = String(a[sortField]).localeCompare(String(b[sortField]))
    return sortOrder === 'asc' ? cmp : -cmp
  })
}, [data?.data, sortField, sortOrder])
```

**限制（已在 UI 程式碼加註釋）**：
- 排序僅影響當前頁；跨頁排序需 API 支援

**影響**：
- 功能上可用，但跨頁排序有限制
- 切換頁碼時 sort state 保留，行為一致

---

### 13. 分頁預取（Prefetch）策略

**決策**：在 `useUsers` hook 中，用戶停留當前頁時自動預取下一頁。

**理由**：
- 使用者翻頁時達成近乎即時的載入體驗
- TanStack Query 的 `prefetchQuery` 存入同一 cache，命中時直接使用
- 搭配 `keepPreviousData` 讓翻頁體驗平滑（舊資料保留至新資料到達）

**實作方式**：
```ts
// useEffect 在此處合理：prefetch 是 DOM 外的 cache 側效應
useEffect(() => {
  const nextPage = (params.page ?? 1) + 1
  if (query.data && nextPage <= query.data.pagination.total_pages) {
    void queryClient.prefetchQuery({ queryKey: ['users', { ...params, page: nextPage }], ... })
  }
}, [query.data, params, queryClient])
```

**影響**：
- 翻頁體驗改善（大多數情況下無 loading）
- 略增網路請求（但 staleTime 30s 內不重複）

---

### 14. 資料視覺化：選擇 Recharts

**決策**：使用 Recharts 實作 Dashboard 圓餅圖。

**理由**：
- React 原生（基於 D3），與 React 生命週期整合良好
- 內建 TypeScript 型別定義
- `ResponsiveContainer` 輕鬆實作響應式
- 相對輕量（相較 ECharts、Chart.js）
- 與現有 Tailwind 設計系統可並存

**替代方案**：
- Chart.js：非 React-native，需要 wrapper
- ECharts：功能強大但套件較大
- Victory：API 類似但維護活躍度較低

**影響**：
- 增加 bundle 約 ~150KB（recharts + d3 依賴）
- 測試時需 mock `recharts`（jsdom 不支援 SVG 計算）

---

### 15. Sidebar 收合狀態管理

**決策**：sidebar `collapsed` state 由 `AppLayout` 以 prop 傳遞，不使用全域 store。

**理由**：
- 狀態僅影響 layout 層，不跨 domain
- 保持組件關係清晰（AppLayout → Sidebar）
- 避免 Zustand store 膨脹

**未來考量**：
- 若需記憶使用者偏好（重開頁面後保留），可改存 localStorage

---

### 16. i18n 錯誤訊息中文化

**決策**：所有使用者可見的錯誤訊息改為繁體中文，不直接傳遞後端英文訊息。

**理由**：
- 提升使用者體驗（用戶使用中文介面）
- 統一錯誤訊息風格（前端全體負責文字呈現）
- 後端無需關切客戶端呈現語言
- 便於未來的多語言支援

**實作方式**：
- Zod Schema 驗證訊息使用中文（如 `請輸入帳號`, `密碼至少需要 6 個字元`）
- API 攔截器 (`error-handler.ts`) 將所有 HTTP 狀態碼轉換為固定中文訊息：
  - 401 → `帳號或密碼錯誤，請重新確認`（登入失敗）或 `登入工作階段已過期，請重新登入`（Token 過期）
  - 400 → `輸入資料有誤`
  - 5xx → `伺服器錯誤，請稍後再試`
  - 其他 → `請求失敗，請稍後再試`
  - 網路錯誤 → `網路連線錯誤`

**錯誤類別對應表**：

| 錯誤類別 | 預設訊息 | 適用情況 |
|---------|--------|--------|
| `AuthError` | `帳號或密碼錯誤` | 登入失敗或 Token 無效 |
| `AuthError` | `登入工作階段已過期，請重新登入` | Token 過期或刷新失敗 |
| `ValidationError` | `輸入資料有誤` | 400 Bad Request |
| `ServerError` | `伺服器錯誤，請稍後再試` | 5xx 伺服器錯誤 |
| `NetworkError` | `網路連線錯誤` | 無網路連線 |
| `AppError` | `請求失敗，請稍後再試` | 其他 HTTP 錯誤 |

**影響**：
- 後端回應的 error message 不再呈現給使用者
- UI 層完全由前端控制訊息文字
- 易於測試（訊息固定且全為中文）

---

### 17. 行動版 Sidebar 自動收合

**決策**：在行動版（小螢幕）點擊導覽連結後，Sidebar 自動收合。

**理由**：
- 行動版螢幕有限，導覽後應主動隱藏以騰出空間
- 改善行動體驗，減少使用者操作步驟
- Desktop 版本導航欄保持展開（sticky 側欄）

**實作方式**：
- 監聽導覽連結的 click 事件
- 在行動版時設定 `collapsed = true`（透過 `window.matchMedia` 偵測）
- Desktop 版本（lg 以上）不觸發自動收合

**影響**：
- 行動使用者體驗改善
- 導覽後自動清出閱讀區域

---

### 18. 圖表 Focus Outline 移除

**決策**：在圖表 SVG 元素上加 `aria-hidden="true"` 並使用 `[&_svg_*]:outline-none` 移除 focus border。

**理由**：
- Recharts 圖表是裝飾性元素，不需要鍵盤交互
- SVG 子元素預設可 focus，造成視覺混亂
- `aria-hidden="true"` 告知螢幕閱讀器忽略圖表
- 用 Tailwind 的任意變體 `[&_svg_*]` 高效地移除所有 SVG 子元素的 outline

**實作方式**：
```tsx
<div aria-hidden="true" className="[&_svg_*]:outline-none">
  <ResponsiveContainer>
    {/* Recharts chart */}
  </ResponsiveContainer>
</div>
```

**影響**：
- 保留圖表視覺效果，避免 focus 污染
- 無障礙體驗更好（螢幕閱讀器跳過圖表）
- 鍵盤使用者不會意外進入圖表元素

---

### 19. iOS Safari auto-zoom 修正

**決策**：Input 元素改用 `text-base md:text-sm`（行動版 16px，Desktop 14px）。

**理由**：
- iOS Safari 會自動縮放 < 16px 的 Input，造成視覺混亂
- 16px 是 iOS 的自動縮放閾值
- Desktop 版本仍使用 14px（不需要自動縮放）

**實作方式**：
```tsx
<input className="text-base md:text-sm" />
```

**影響**：
- iOS 上 Input focus 時不再自動縮放頁面
- 改善行動端表單輸入體驗
- Desktop 版本保持原有 14px 字級

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
