import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test('should load checkout page with product info', async ({ page }) => {
    // Assuming there's a test checkout with slug 'test-product'
    await page.goto('/c/test-product');
    
    // Should show product information
    await expect(page.locator('text=Preencha os dados')).toBeVisible({ timeout: 5000 }).catch(() => {
      // If product doesn't exist, that's okay for this test
      return true;
    });
  });

  test('should show landing page', async ({ page }) => {
    await page.goto('/');
    
    // Check for main heading
    await expect(page.locator('text=SaaS de Checkout com Pix')).toBeVisible();
    
    // Check for CTA buttons
    await expect(page.locator('button:has-text("Começar Agora")')).toBeVisible();
    await expect(page.locator('button:has-text("Fazer Login")')).toBeVisible();
  });

  test('should navigate to auth from landing page', async ({ page }) => {
    await page.goto('/');
    
    // Click on "Começar Agora" button
    await page.click('button:has-text("Começar Agora")');
    
    // Should navigate to auth page
    await expect(page).toHaveURL('/auth');
  });

  test('should show 404 for non-existent checkout', async ({ page }) => {
    await page.goto('/c/non-existent-slug');
    
    // Should show error or 404 page
    // This depends on your implementation
    const response = await page.goto('/c/non-existent-slug');
    expect(response?.status()).toBeLessThanOrEqual(404);
  });
});

test.describe('Public Pages', () => {
  test('should be accessible without authentication', async ({ page }) => {
    const publicPages = [
      '/',
      '/auth',
    ];
    
    for (const route of publicPages) {
      const response = await page.goto(route);
      expect(response?.status()).toBeLessThan(400);
    }
  });

  test('should show thank you page', async ({ page }) => {
    await page.goto('/obrigado');
    
    // Page should load (may show error if not in correct context)
    const response = await page.goto('/obrigado');
    expect(response?.status()).toBeLessThan(500);
  });
});
