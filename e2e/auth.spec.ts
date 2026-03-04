import { test, expect } from '@playwright/test'

test.describe('認證流程', () => {
  test('登入成功後跳轉到儀表板', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('帳號').fill('admin')
    await page.getByLabel('密碼').fill('password')
    await page.getByRole('button', { name: '登入' }).click()
    await expect(page).toHaveURL('/dashboard')
  })

  test('登入失敗顯示錯誤訊息', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('帳號').fill('wrong')
    await page.getByLabel('密碼').fill('wrong')
    await page.getByRole('button', { name: '登入' }).click()
    await expect(page.getByRole('alert')).toBeVisible()
  })

  test('登出後跳轉到登入頁', async ({ page }) => {
    // 先登入
    await page.goto('/login')
    await page.getByLabel('帳號').fill('admin')
    await page.getByLabel('密碼').fill('password')
    await page.getByRole('button', { name: '登入' }).click()
    await expect(page).toHaveURL('/dashboard')

    // 登出
    await page.getByRole('button', { name: '登出' }).click()
    await expect(page).toHaveURL('/login')
  })
})
