import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should redirect to auth when accessing protected route', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should be redirected to auth page
    await expect(page).toHaveURL('/auth');
  });

  test('should show auth page with login and signup options', async ({ page }) => {
    await page.goto('/auth');
    
    // Check for login form elements
    await expect(page.locator('text=Entrar')).toBeVisible();
    await expect(page.locator('text=Criar Conta')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should toggle between login and signup', async ({ page }) => {
    await page.goto('/auth');
    
    // Initially shows login
    await expect(page.locator('text=Entrar')).toBeVisible();
    
    // Click to switch to signup
    await page.click('text=Não tem conta');
    
    // Should show signup form
    await expect(page.locator('text=Criar Conta')).toBeVisible();
    await expect(page.locator('input[id="name"]')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/auth');
    
    // Fill in invalid credentials
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    
    // Click submit
    await page.click('button:has-text("Entrar")');
    
    // Should show error message
    await expect(page.locator('text=/erro|inválido/i')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Protected Routes', () => {
  test('should redirect unauthenticated users to auth', async ({ page }) => {
    const protectedRoutes = ['/dashboard', '/products', '/checkouts', '/sales', '/presells'];
    
    for (const route of protectedRoutes) {
      await page.goto(route);
      await expect(page).toHaveURL('/auth');
    }
  });

  test('should allow access to public routes without auth', async ({ page }) => {
    const publicRoutes = ['/', '/c/test-slug'];
    
    for (const route of publicRoutes) {
      await page.goto(route);
      // Should not redirect to auth
      await expect(page).not.toHaveURL('/auth');
    }
  });
});
