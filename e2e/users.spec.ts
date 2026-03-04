import { test, expect } from '@playwright/test'

test.describe('使用者管理', () => {
  test.beforeEach(async ({ page }) => {
    // 假設已有 session 或使用 storageState
    await page.goto('/users')
  })

  test('搜尋使用者', async ({ page }) => {
    const searchInput = page.getByLabel('搜尋使用者姓名或 Email')
    await searchInput.fill('Alice')
    // 搜尋結果只顯示 Alice
    await expect(page.getByText('Alice Wang')).toBeVisible()
  })

  test('依狀態篩選', async ({ page }) => {
    await page.getByLabel('依狀態篩選').selectOption('active')
    // 僅顯示啟用使用者
    const inactiveStatuses = page.getByText('停用')
    await expect(inactiveStatuses).toHaveCount(0)
  })

  test('切換分頁', async ({ page }) => {
    // 切換到下一頁
    const nextPageButton = page.getByLabel('前往下一頁')
    if (await nextPageButton.isEnabled()) {
      await nextPageButton.click()
      await expect(page).toHaveURL(/page=2/)
    }
  })

  test('/ 快捷鍵聚焦搜尋框', async ({ page }) => {
    await page.keyboard.press('/')
    const searchInput = page.getByLabel('搜尋使用者姓名或 Email')
    await expect(searchInput).toBeFocused()
  })
})
