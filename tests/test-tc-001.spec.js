const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://127.0.0.1:8000';

const VIEWPORTS = {
  desktop: { width: 1920, height: 1080 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 }
};

const PAGES = {
  home: '/index.html',
  search: '/search.html',
  packages: '/packages.html'
};

// Arrow functions to avoid TypeScript warnings
const normalizeUrl = (url) => url.replace(/\/index\.html$/i, '/');

const waitForNavigation = async (page) => {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
};

test.describe('TC001: Navigation Menu Testing', () => {
  
  test.describe('Step 1-3: Tablet Navigation Links (All Browsers)', () => {
    
    test('should navigate correctly from index.html', async ({ page }) => {
      await page.goto(BASE_URL + PAGES.home);
      await page.setViewportSize(VIEWPORTS.tablet);
      
      const aboutUsLink = page.locator('a:has-text("About Us")').first();
      await aboutUsLink.click();
      await waitForNavigation(page);
      
      const currentUrl = normalizeUrl(page.url());
      const expectedUrl = normalizeUrl(BASE_URL + '/');
      expect(currentUrl).toBe(expectedUrl);
      
      const searchLink = page.locator('a:has-text("Search")').first();
      await searchLink.click();
      await waitForNavigation(page);
      expect(page.url()).toContain('/search.html');
      
      await page.goto(BASE_URL + PAGES.home);
      
      const popularLink = page.locator('a:has-text("Popular Destinations")').first();
      await popularLink.click();
      await waitForNavigation(page);
      expect(page.url()).toContain('/search.html');
      expect(page.url()).toContain('#popular');
      
      await page.goto(BASE_URL + PAGES.home);
      
      const packagesLink = page.locator('a:has-text("Packages")').first();
      await packagesLink.click();
      await waitForNavigation(page);
      expect(page.url()).toContain('/packages.html');
      
      await page.goto(BASE_URL + PAGES.home);
      
      const contactLink = page.locator('a:has-text("Contact")').first();
      await contactLink.click();
      await page.waitForTimeout(1000);
      
      const footer = page.locator('footer, #contact').first();
      await expect(footer).toBeInViewport();
    });
    
    test('should navigate correctly from search.html', async ({ page }) => {
      await page.goto(BASE_URL + '/search.html');
      await page.setViewportSize(VIEWPORTS.tablet); 
      
      const aboutUsLink = page.locator('a:has-text("About Us")').first();
      await aboutUsLink.click();
      await waitForNavigation(page);
      
      const currentUrl = normalizeUrl(page.url());
      const expectedUrl = normalizeUrl(BASE_URL + '/');
      expect(currentUrl).toBe(expectedUrl);
      
      await page.goto(BASE_URL + '/search.html');
      
      const packagesLink = page.locator('a:has-text("Packages")').first();
      await packagesLink.click();
      await waitForNavigation(page);
      expect(page.url()).toContain('/packages.html');
      
      await page.goto(BASE_URL + '/search.html');
      
      const contactLink = page.locator('a:has-text("Contact")').first();
      await contactLink.click();
      await page.waitForTimeout(1000);
      
      expect(page.url()).toContain('/search.html');
      const footer = page.locator('footer, #contact').first();
      await expect(footer).toBeInViewport();
    });
    
    test('should navigate correctly from packages.html', async ({ page }) => {
      await page.goto(BASE_URL + '/packages.html');
      await page.setViewportSize(VIEWPORTS.tablet); 
      
      const aboutUsLink = page.locator('a:has-text("About Us")').first();
      await aboutUsLink.click();
      await waitForNavigation(page);
      
      const currentUrl = normalizeUrl(page.url());
      const expectedUrl = normalizeUrl(BASE_URL + '/');
      expect(currentUrl).toBe(expectedUrl);
      
      await page.goto(BASE_URL + '/packages.html');
      
      const searchLink = page.locator('a:has-text("Search")').first();
      await searchLink.click();
      await waitForNavigation(page);
      expect(page.url()).toContain('/search.html');
      
      await page.goto(BASE_URL + '/packages.html');
      
      const contactLink = page.locator('a:has-text("Contact")').first();
      await contactLink.click();
      await page.waitForTimeout(1000);
      
      expect(page.url()).toContain('/packages.html');
      const footer = page.locator('footer, #contact').first();
      await expect(footer).toBeInViewport();
    });
    
    test('should have no broken navigation links', async ({ page }) => {
      const pages = [PAGES.home, '/search.html', '/packages.html'];
      
      for (const pagePath of pages) {
        await page.goto(BASE_URL + pagePath);
        
        const navLinks = page.locator('nav a, .navbar a');
        const count = await navLinks.count();
        
        expect(count).toBeGreaterThan(0);
        
        for (let i = 0; i < count; i++) {
          const href = await navLinks.nth(i).getAttribute('href');
          expect(href).toBeTruthy();
          expect(href).not.toBe('');
          expect(href).not.toBe('#');
        }
      }
    });
  });  

  test.describe('Step 4: Tablet Viewport Testing (768x1024)', () => {
    test('should display navigation correctly on tablet', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.tablet);
      await page.goto(BASE_URL + PAGES.home);
      
      const hamburger = page.locator('.navbar-toggler, button[data-bs-toggle="collapse"]');
      await expect(hamburger).toBeVisible();
      
      await hamburger.click();
      await page.waitForTimeout(500);
      
      const navMenu = page.locator('.navbar-collapse, #navbarNav');
      await expect(navMenu).toHaveClass(/show/);
      
      const searchLink = page.locator('a:has-text("Search")').first();
      await expect(searchLink).toBeVisible();
      await searchLink.click();
      await waitForNavigation(page);
      
      expect(page.url()).toContain('/search.html');
    });
  });  
});  