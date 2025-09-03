export class NavigationPage {
  constructor(private page: import('@playwright/test').Page) {}

  async goToDashboard() {
    await this.page.goto('/');
  }
}
