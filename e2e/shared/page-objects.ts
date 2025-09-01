import type { Page, Locator } from '@playwright/test';

export class BasePage {
  constructor(protected page: Page) {}

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async getTitle() {
    return await this.page.title();
  }
}

export class NavigationPage extends BasePage {
  async goToHome() {
    await this.page.goto('/');
  }

  async goToLogin() {
    await this.page.goto('/auth/login');
  }

  async goToDashboard() {
    await this.page.goto('/dashboard');
  }
}

export class CommonElements extends BasePage {
  get loadingSpinner(): Locator {
    return this.page.locator('[data-testid="loading-spinner"]');
  }

  get errorMessage(): Locator {
    return this.page.locator('[data-testid="error-message"]');
  }

  get successMessage(): Locator {
    return this.page.locator('[data-testid="success-message"]');
  }
}
