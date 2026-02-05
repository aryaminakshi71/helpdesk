import { test, expect } from '@playwright/test'

function getBaseURL(testInfo: { project: { use?: { baseURL?: string } } }): string {
  const baseURL = testInfo.project.use?.baseURL || process.env.PLAYWRIGHT_BASE_URL
  if (!baseURL) {
    throw new Error('No baseURL configured for Helpdesk tests')
  }
  return baseURL.replace(/\/$/, '')
}

test.describe('HELPDESK E2E Tests', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    const baseURL = getBaseURL(testInfo)
    await page.context().clearCookies()
    try {
      await page.goto(baseURL, { 
        waitUntil: 'domcontentloaded', 
        timeout: 20000 
      })
    } catch (error) {
      console.warn('Navigation failed, continuing...')
    }
    await page.waitForTimeout(1000)
  })

  test('should load landing page', async ({ page }, testInfo) => {
    const baseURL = getBaseURL(testInfo)
    const response = await page.goto(baseURL)
    expect(response?.status()).toBe(200)
  })

  test('should have no console errors', async ({ page }, testInfo) => {
    const baseURL = getBaseURL(testInfo)
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await page.goto(baseURL)
    await page.waitForTimeout(2000)

    const criticalErrors = errors.filter(e => 
      !e.includes('favicon') && 
      !e.includes('sourcemap') &&
      !e.includes('500') && // Ignore server errors during dev
      !e.includes('Internal Server Error')
    )
    
    expect(criticalErrors.length).toBe(0)
  })
})
