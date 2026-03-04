/** TanStack Query: staleTime for user-related queries (30 seconds) */
export const QUERY_STALE_TIME = 30_000

/** Axios HTTP client timeout (10 seconds) */
export const API_TIMEOUT = 10_000

/** Debounce delay for search inputs (400ms) */
export const DEBOUNCE_DELAY = 400

/** Available page size options for the users table */
export const PAGE_SIZE_OPTIONS = [10, 25, 50] as const

/** Toast 自動關閉動畫觸發時間（ms），動畫結束後 200ms 才移除元素 */
export const TOAST_DISMISS_MS = 2800

/** 分頁視窗最多顯示的頁碼數量 */
export const PAGINATION_WINDOW_SIZE = 7

/** ActiveRatioChart 環形圖內徑 */
export const CHART_INNER_RADIUS = 55

/** ActiveRatioChart 環形圖外徑 */
export const CHART_OUTER_RADIUS = 80

/** ActiveRatioChart 圓餅圖顏色（Recharts 需 hex，無法直接用 Tailwind token） */
export const CHART_COLORS = { active: '#16a34a', inactive: '#9ca3af' } as const
