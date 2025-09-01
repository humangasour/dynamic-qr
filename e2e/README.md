# E2E Testing with Playwright

This directory contains end-to-end tests for the Dynamic QR application using Playwright.

## 🏗️ **Directory Structure**

```
e2e/
├── features/                    # Feature-based test organization
│   ├── auth/                   # Authentication tests
│   │   ├── login.spec.ts      # Login flow tests
│   │   ├── register.spec.ts   # Registration tests
│   │   └── logout.spec.ts     # Logout tests
│   ├── redirect/               # Redirect feature tests
│   │   ├── redirect.spec.ts   # Basic redirect tests
│   │   └── redirect-with-data.spec.ts # Tests with real data
│   ├── qr-codes/              # QR code management tests
│   │   ├── create.spec.ts     # QR code creation
│   │   ├── edit.spec.ts       # QR code editing
│   │   └── delete.spec.ts     # QR code deletion
│   ├── organizations/          # Organization management tests
│   └── users/                 # User management tests
├── shared/                     # Shared test utilities
│   ├── test-data.ts           # Database test data helpers
│   └── page-objects.ts        # Page object models
├── utils/                      # Utility functions
│   └── test-helpers.ts        # Common test helpers
├── fixtures/                   # Test data fixtures
│   └── test-users.ts          # User test data
└── README.md                   # This file
```

## 🚀 **Running Tests**

### **All E2E Tests**

```bash
npm run test:e2e
```

### **Specific Feature Tests**

```bash
# Redirect tests only
npm run test:e2e e2e/features/redirect/

# Auth tests only
npm run test:e2e e2e/features/auth/

# Specific test file
npm run test:e2e e2e/features/redirect/redirect.spec.ts
```

### **Interactive Mode**

```bash
# UI mode
npm run test:e2e:ui

# Headed mode (see browser)
npm run test:e2e:headed

# Debug mode
npm run test:e2e:debug
```

## 📋 **Test Organization Principles**

### **1. Feature-Based Structure**

- Tests are organized by application features, not technical concerns
- Each feature has its own directory with related test files
- Makes it easy to find and run tests for specific functionality

### **2. Shared Utilities**

- Common test operations are extracted to shared utilities
- Page objects for consistent UI interactions
- Test data helpers for database operations

### **3. Test Data Management**

- Fixtures provide consistent test data
- Database helpers for setup/teardown
- Isolated test data to prevent conflicts

### **4. Naming Conventions**

- `*.spec.ts` for test files
- Descriptive test names that explain the scenario
- Consistent describe/test block structure

## 🧪 **Writing Tests**

### **Basic Test Structure**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something specific', async ({ page }) => {
    // Arrange
    await page.goto('/some-page');

    // Act
    await page.click('[data-testid="button"]');

    // Assert
    await expect(page.locator('.result')).toBeVisible();
  });
});
```

### **Using Page Objects**

```typescript
import { NavigationPage } from '../../shared/page-objects';

test('should navigate correctly', async ({ page }) => {
  const nav = new NavigationPage(page);
  await nav.goToDashboard();
  await expect(page).toHaveTitle(/Dashboard/);
});
```

### **Using Test Data**

```typescript
import { createTestData, cleanupTestData } from '../../shared/test-data';

test.describe('With Test Data', () => {
  let testData: Awaited<ReturnType<typeof createTestData>>;

  test.beforeEach(async () => {
    testData = await createTestData();
  });

  test.afterEach(async () => {
    await cleanupTestData(testData);
  });

  test('should work with data', async ({ page }) => {
    // Test implementation
  });
});
```

## 🔧 **Configuration**

Tests are configured in `playwright.config.ts`:

- **Base URL**: `http://localhost:3001`
- **Web Server**: Automatically starts dev server on port 3001
- **Browsers**: Chromium by default (others commented out)
- **Timeouts**: Configurable via environment variables
- **Screenshots/Videos**: Captured on test failures

## 🌍 **Environment Variables**

Create `.env.e2e` for E2E-specific configuration:

```bash
# Database
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Test Configuration
E2E_BASE_URL=http://localhost:3001
E2E_TIMEOUT=30000
E2E_NAVIGATION_TIMEOUT=10000
```

## 📊 **Test Reports**

- **HTML Reports**: Generated in `playwright-report/` (default)
- **JUnit Reports**: Generated in CI environments
- **Screenshots**: Captured on failures in `test-results/screenshots/`
- **Videos**: Recorded on failures in `test-results/videos/`

## 🚨 **Best Practices**

1. **Isolation**: Each test should be independent
2. **Cleanup**: Always clean up test data in `afterEach`
3. **Selectors**: Use `data-testid` attributes for reliable element selection
4. **Assertions**: Make assertions specific and meaningful
5. **Timeouts**: Use appropriate timeouts for different operations
6. **Page Objects**: Extract common UI interactions to reusable classes

## 🔍 **Debugging**

### **Debug Mode**

```bash
npm run test:e2e:debug
```

### **Trace Viewer**

```bash
npx playwright show-trace test-results/trace-*.zip
```

### **Console Logs**

Tests run with verbose logging to help debug issues.

## 📚 **Resources**

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Testing Best Practices](https://playwright.dev/docs/best-practices)
- [Page Object Model](https://playwright.dev/docs/pom)
- [Test Fixtures](https://playwright.dev/docs/test-fixtures)
