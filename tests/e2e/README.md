# E2E Testing with Playwright

This directory contains end-to-end tests for the Dynamic QR application using Playwright.

## 🏗️ **Directory Structure**

```
tests/e2e/
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
├── shared/                     # E2E-specific helpers
│   ├── test-data.ts           # Data setup/cleanup helpers
│   └── page-objects.ts        # Page object models
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
npm run test:e2e tests/e2e/features/redirect/

# Auth tests only
npm run test:e2e tests/e2e/features/auth/

# Specific test file
npm run test:e2e tests/e2e/features/redirect/redirect.spec.ts
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

- Fixtures provide consistent test data (shared in `tests/fixtures`)
- Database helpers for setup/teardown
- Isolated test data to prevent conflicts

### **4. Naming Conventions**

- `*.spec.ts` for test files
- Descriptive test names that explain the scenario
- Consistent describe/test block structure
