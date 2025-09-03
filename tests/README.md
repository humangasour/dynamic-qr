# Test Suite

This directory contains the test suite for the Dynamic QR application, organized for scalability and maintainability.

## Test Structure

```
tests/
├── unit/                       # Unit tests by feature/module
├── integration/                # Integration tests by feature/module
├── e2e/                        # Playwright end-to-end tests
├── fixtures/                   # Shared test fixtures (all test types)
├── utils/                      # Shared test utilities
└── setup/                      # Global/setup helpers
```

### Test Types

- Unit Tests: Test individual functions and components in isolation
- Integration Tests: Test interactions between components and database
- E2E Tests: Test the application in the browser via Playwright

### Path Aliases

`@test/*` → `tests/*` (configured in `tsconfig.json` and `vitest.config.ts`)
