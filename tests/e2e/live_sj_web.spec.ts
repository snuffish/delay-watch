import { test, expect } from '@playwright/test'

test.describe('Live SJ.se E2E Web Integration Tests', () => {

  test('should perform an unmocked live scan against real SJ API (prod-api.adp.sj.se) and render live results on web UI', async ({ page }) => {
    test.setTimeout(45000)

    await page.goto('/')

    // Wait for main layout
    await page.waitForSelector('h1', { timeout: 10000 })

    // Click Start Scan to initiate live SJ API requests via Vite's baked-in API middleware
    const scanBtn = page.getByRole('button', { name: 'Start Scan' })
    await scanBtn.click()

    // Expect button text to show scanning state
    await expect(page.getByText('Scanning...')).toBeVisible({ timeout: 5000 })

    // Wait for scanning to complete and results to render (max 30s)
    await expect(page.getByText('Scanning...')).not.toBeVisible({ timeout: 30000 })

    // Check that either live delayed train cards or "No Delayed Trains Found" status card is rendered
    const hasDelayedCards = await page.locator('text=Delayed Train(s)').count()
    const hasNoDelaysCard = await page.locator('text=No Delayed Trains Found').count()

    expect(hasDelayedCards > 0 || hasNoDelaysCard > 0).toBe(true)

    if (hasDelayedCards > 0) {
      // Validate live delayed train card elements
      await expect(page.locator('text=Total Delay').first()).toBeVisible()
      
      // Validate modern SJ train link format
      const sjLink = page.locator('a:has-text("Train SJ Info")').first()
      await expect(sjLink).toBeVisible()
      const href = await sjLink.getAttribute('href')
      expect(href).toMatch(/^https:\/\/www\.sj\.se\/trafikinformation\/tag\/\d+\?date=\d{4}-\d{2}-\d{2}$/)
    } else {
      await expect(page.locator('text=No Delayed Trains Found')).toBeVisible()
    }
  })
})
