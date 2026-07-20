import { test, expect } from '@playwright/test'
import { mockScanResultPayload, mockPaybackResponse } from '../mocks'
import { mockRouteJson } from '../helpers'

test.describe('Delay Watch React & TanStack Web Application E2E Tests', () => {

  test('should load the homepage layout and header correctly', async ({ page }) => {
    await page.goto('/')

    // Wait for React app root to render
    await expect(page.locator('h1')).toBeVisible()

    // Check Header branding
    await expect(page.locator('h1')).toContainText('Delay Watch')
    await expect(page.locator('text=v1.7.9')).toBeVisible()

    // Check navigation links
    await expect(page.locator('text=⚡ Live Scanner')).toBeVisible()
    await expect(page.locator('text=🚉 Station Explorer')).toBeVisible()
    await expect(page.locator('text=💰 Paybacks')).toBeVisible()

    // Check scanner section
    await expect(page.locator('text=Station Scanner Setup')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Start Scan' })).toBeVisible()
  })

  test('should support station autocomplete dropdown and station badge removal', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toBeVisible()

    const input = page.locator('input[placeholder*="Skövde or SK"]')
    await input.fill('Stockholm')

    // Expect floating autocomplete dropdown to appear
    const dropdownItem = page.getByText('Stockholm Central')
    await expect(dropdownItem).toBeVisible({ timeout: 5000 })

    // Click suggestion
    await dropdownItem.click()

    // Verify badge added to list
    const badge = page.locator('text=[CST]')
    await expect(badge).toBeVisible()

    // Remove badge
    const removeBtn = page.getByRole('button', { name: 'Remove Stockholm Central from selection' })
    await removeBtn.click()

    // Verify badge removed
    await expect(badge).not.toBeVisible()
  })

  test('should trigger live scan and render delay cards with modern SJ URL links', async ({ page }) => {
    // Intercept /api/scan endpoint using centralized mock helper
    await mockRouteJson(page, '/api/scan', mockScanResultPayload)

    await page.goto('/')
    await expect(page.locator('h1')).toBeVisible()

    // Click Start Scan
    await page.getByRole('button', { name: 'Start Scan' }).click()

    // Verify delayed train card is rendered
    await expect(page.locator('text=Train #421')).toBeVisible()
    await expect(page.locator('text=+25 min')).toBeVisible()

    // Verify modern SJ train link
    const sjLink = page.locator('a:has-text("Train SJ Info")')
    await expect(sjLink).toBeVisible()
    await expect(sjLink).toHaveAttribute('href', 'https://www.sj.se/trafikinformation/tag/421?date=2026-07-19')
  })

  test('should navigate to Station Explorer and Paybacks routes via TanStack Router', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toBeVisible()

    // Navigate to Station Explorer
    await page.click('text=🚉 Station Explorer')
    await expect(page).toHaveURL('/stations')
    await expect(page.locator('text=Swedish Railway Stations')).toBeVisible()

    // Search for a station
    const searchInput = page.locator('input[placeholder*="Search station name"]')
    await searchInput.fill('Göteborg')
    await expect(page.getByText('Göteborg C', { exact: true })).toBeVisible()

    // Intercept payback API using centralized mock helper
    await mockRouteJson(page, '/api/payback', mockPaybackResponse)

    // Navigate to Paybacks
    await page.click('text=💰 Paybacks')
    await expect(page).toHaveURL('/payback')
    await expect(page.locator('text=Total Payback Received')).toBeVisible()
    await expect(page.locator('p:has-text("250 kr")')).toBeVisible()
    await expect(page.locator('text=V-10023')).toBeVisible()
  })
})
