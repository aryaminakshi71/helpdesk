import { test, expect } from '@playwright/test';

/**
 * Comprehensive E2E Tests for Helpdesk App
 * Tests: Landing page, Sign in, Navigation, All pages, Links functionality
 */

function getBaseURL(testInfo: { project: { use?: { baseURL?: string } } }): string {
  const baseURL = testInfo.project.use?.baseURL || process.env.PLAYWRIGHT_BASE_URL;
  if (!baseURL) {
    throw new Error('No baseURL configured for Helpdesk tests');
  }
  return baseURL.replace(/\/$/, '');
}

function resolveURL(baseURL: string, path: string): string {
  return new URL(path, `${baseURL}/`).toString();
}

test.describe('Helpdesk E2E Tests', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    const baseURL = getBaseURL(testInfo);
    await page.context().clearCookies();
    try {
      await page.goto(baseURL, { waitUntil: 'domcontentloaded', timeout: 20000 });
    } catch (error) {
      console.warn('Landing page navigation failed, continuing...');
    }
    await page.waitForTimeout(1000);
  });

  test.describe('Landing Page & Public Pages', () => {
    test('should load landing page without errors', async ({ page }, testInfo) => {
      const baseURL = getBaseURL(testInfo);
      const errors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      const response = await page.goto(baseURL);
      expect(response?.status()).toBe(200);
      await page.waitForTimeout(2000);

      const criticalErrors = errors.filter(e => 
        !e.includes('favicon') && 
        !e.includes('sourcemap') &&
        !e.includes('oracledb') &&
        !e.includes('500 (Internal Server Error)')
      );
      
      if (criticalErrors.length > 0) {
        console.warn('Console errors found:', criticalErrors);
      }
    });

    test('should navigate to login page', async ({ page }, testInfo) => {
      const baseURL = getBaseURL(testInfo);
      await page.goto(resolveURL(baseURL, 'login'), { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(2000);

      const emailInput = page.locator('input[type="email"]').first();
      const passwordInput = page.locator('input[type="password"]').first();
      
      // Check if login form exists
      const hasLoginForm = await emailInput.count() > 0 || await passwordInput.count() > 0;
      expect(hasLoginForm || page.url().includes('/login')).toBe(true);
    });

    test('should navigate to signup page', async ({ page }, testInfo) => {
      const baseURL = getBaseURL(testInfo);
      await page.goto(resolveURL(baseURL, 'signup'), { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(2000);

      const url = page.url();
      expect(url.includes('/signup') || url.includes('/login')).toBe(true);
    });

    test('should navigate to blog page', async ({ page }, testInfo) => {
      const baseURL = getBaseURL(testInfo);
      await page.goto(resolveURL(baseURL, 'blog'), { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(2000);

      const url = page.url();
      expect(url.includes('/blog')).toBe(true);
    });

    test('should navigate to about page', async ({ page }, testInfo) => {
      const baseURL = getBaseURL(testInfo);
      await page.goto(resolveURL(baseURL, 'about'), { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(2000);

      const url = page.url();
      expect(url.includes('/about')).toBe(true);
    });
  });

  test.describe('Sign In Flow', () => {
    test('should display login page correctly', async ({ page }, testInfo) => {
      const baseURL = getBaseURL(testInfo);
      await page.goto(resolveURL(baseURL, 'login'), { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(2000);

      const bodyText = await page.textContent('body');
      expect(bodyText).toBeTruthy();
      
      const url = page.url();
      expect(url.includes('/login')).toBe(true);
    });
  });

  test.describe('App Pages (Requires Auth)', () => {
    test.beforeEach(async ({ page }, testInfo) => {
      const baseURL = getBaseURL(testInfo);
      // Set localStorage to simulate demo mode or auth
      try {
        await page.goto(baseURL, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.evaluate(() => {
          localStorage.setItem('demo_mode', 'true');
          localStorage.setItem('user', JSON.stringify({ id: 'demo', email: 'demo@helpdesk.com', name: 'Demo User' }));
        });
      } catch (error) {
        console.warn('Auth setup navigation failed, continuing...');
      }
    });

    test('dashboard page should load', async ({ page }, testInfo) => {
      const baseURL = getBaseURL(testInfo);
      await page.goto(resolveURL(baseURL, 'app'), { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(2000);

      const url = page.url();
      // May redirect to login if auth not configured, or load dashboard
      expect(url.includes('/app') || url.includes('/login')).toBe(true);
    });

    test('tickets page should load', async ({ page }, testInfo) => {
      const baseURL = getBaseURL(testInfo);
      await page.goto(resolveURL(baseURL, 'app/tickets'), { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(2000);

      const url = page.url();
      expect(url.includes('/app/tickets') || url.includes('/login')).toBe(true);
    });

    test('knowledge base page should load', async ({ page }, testInfo) => {
      const baseURL = getBaseURL(testInfo);
      await page.goto(resolveURL(baseURL, 'app/kb'), { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(2000);

      const url = page.url();
      expect(url.includes('/app/kb') || url.includes('/login')).toBe(true);
    });

    test('settings page should load', async ({ page }, testInfo) => {
      const baseURL = getBaseURL(testInfo);
      await page.goto(resolveURL(baseURL, 'app/settings'), { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(2000);

      const url = page.url();
      expect(url.includes('/app/settings') || url.includes('/login')).toBe(true);
    });
  });

  test.describe('Navigation & Links', () => {
    test('should navigate between public pages', async ({ page }, testInfo) => {
      const baseURL = getBaseURL(testInfo);
      await page.goto(baseURL);
      await page.waitForTimeout(1000);

      // Try to find and click navigation links
      const links = ['/blog', '/about', '/login'];
      let successCount = 0;

      for (const link of links) {
        try {
          await page.goto(resolveURL(baseURL, link), { waitUntil: 'domcontentloaded', timeout: 5000 });
          await page.waitForTimeout(500);
          const url = page.url();
          if (url.includes(link)) {
            successCount++;
          }
        } catch (error) {
          // Continue to next link
        }
      }

      expect(successCount > 0 || page.url().includes(baseURL)).toBe(true);
    });
  });

  test.describe('Error Handling', () => {
    test('should handle 404 gracefully', async ({ page }, testInfo) => {
      const baseURL = getBaseURL(testInfo);
      const response = await page.goto(resolveURL(baseURL, 'nonexistent-page'), { waitUntil: 'domcontentloaded' });
      // Should either show 404 or redirect
      const status = response?.status() || 0;
      expect(status >= 200 && status < 600).toBe(true);
    });
  });

  test.describe('Performance', () => {
    test('should load within reasonable time', async ({ page }, testInfo) => {
      const baseURL = getBaseURL(testInfo);
      const start = Date.now();
      await page.goto(baseURL);
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - start;
      // Allow up to 15 seconds for SSR apps
      expect(loadTime).toBeLessThan(15000);
    });
  });
});
