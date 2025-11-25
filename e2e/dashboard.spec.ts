import { test, expect } from '@playwright/test';

test.describe('Dashboard Page', () => {
  test.beforeEach(async ({ page, context }) => {
    // Mock authentication by setting session in localStorage
    await context.addInitScript(() => {
      const mockSession = {
        user: {
          id: 'test-user-123',
          email: 'test@example.com',
          user_metadata: {},
        },
        access_token: 'mock-token',
      };
      localStorage.setItem('sb-amhneqlsgzcfhmrbkkae-auth-token', JSON.stringify(mockSession));
    });
  });

  test('should display dashboard with all sections', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check for main heading
    await expect(page.locator('text=Painel do Produtor')).toBeVisible();
    
    // Check for all main sections
    await expect(page.locator('text=Produtos')).toBeVisible();
    await expect(page.locator('text=Checkouts')).toBeVisible();
    await expect(page.locator('text=Vendas')).toBeVisible();
    await expect(page.locator('text=Presells')).toBeVisible();
    await expect(page.locator('text=Upsells')).toBeVisible();
    await expect(page.locator('text=Downsells')).toBeVisible();
  });

  test('should navigate to products page', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Click on Produtos button
    await page.click('button:has-text("Ver Produtos")');
    
    // Should navigate to products page
    await expect(page).toHaveURL('/products');
    await expect(page.locator('text=Produtos')).toBeVisible();
  });

  test('should navigate to checkouts page', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Click on Checkouts button
    await page.click('button:has-text("Ver Checkouts")');
    
    // Should navigate to checkouts page
    await expect(page).toHaveURL('/checkouts');
    await expect(page.locator('text=Checkouts')).toBeVisible();
  });

  test('should navigate to sales page', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Click on Vendas button
    await page.click('button:has-text("Ver Vendas")');
    
    // Should navigate to sales page
    await expect(page).toHaveURL('/sales');
    await expect(page.locator('text=Vendas')).toBeVisible();
  });

  test('should have logout button', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check for logout button
    await expect(page.locator('button:has-text("Sair")')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Click logout button
    await page.click('button:has-text("Sair")');
    
    // Should be redirected to auth
    await expect(page).toHaveURL('/auth');
  });
});
