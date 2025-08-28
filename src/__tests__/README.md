# Test Suite

This directory contains the test suite for the Dynamic QR application, organized for scalability and maintainability.

## Test Structure

```
src/
├── __tests__/                    # Global test configuration and utilities
│   ├── setup/                    # Test setup files
│   │   ├── global.ts            # Global test setup
│   │   ├── mocks.ts             # Global mocks
│   │   └── test-utils.ts        # Shared test utilities
│   ├── fixtures/                 # Test data and fixtures
│   │   ├── qr-codes.ts          # QR code test data
│   │   ├── users.ts             # User test data
│   │   └── organizations.ts     # Organization test data
│   └── helpers/                  # Test helper functions
│       ├── database.ts          # Database test helpers
│       ├── api.ts               # API test helpers
│       └── ui.ts                # UI test helpers
├── app/
│   ├── api/
│   │   └── __tests__/           # API route tests
│   │       └── test-env.test.ts
│   └── __tests__/               # Page-level tests
├── lib/
│   └── __tests__/               # Library/utility tests
│       └── supabase/
│           ├── handle-redirect.test.ts
│           └── handle-redirect.integration.test.ts
└── utils/
    └── __tests__/               # Utility function tests
```

### Test Types

- **Unit Tests** - Test individual functions and components in isolation
- **Integration Tests** - Test interactions between components and database
- **API Tests** - Test API routes and endpoints
- **Component Tests** - Test React components (future)

## Running Tests

### Unit Tests (Default)

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test

# Run tests once and exit
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Integration Tests

Integration tests are skipped by default and require a real Supabase database connection.

To run integration tests:

1. Set up a test Supabase project or use your local development database
2. Configure the following environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (for admin operations)

3. Remove the `.skip` from the integration test describe block:

   ```typescript
   // Change this:
   describe.skip('handle_redirect Integration Tests', () => {

   // To this:
   describe('handle_redirect Integration Tests', () => {
   ```

4. Run the tests:
   ```bash
   npm run test:run
   ```

## Test Strategy

The test suite is designed to eliminate duplication and focus each test type on its unique value:

### Unit Tests (`handle-redirect.test.ts`)

**Purpose**: Test client-side behavior, mocking, and edge cases without database dependency

- ✅ Function existence and basic structure
- ✅ Mock behavior verification (parameter passing, response handling)
- ✅ Parameter validation and edge cases (null values, long strings, special characters)
- ✅ Error handling (connection, permission, malformed data)
- ✅ Performance and concurrency (mocked scenarios)
- ✅ Function signature and return type verification

### Integration Tests (`handle-redirect.integration.test.ts`)

**Purpose**: Test database-specific functionality and real RPC execution

- ✅ Real database connectivity and RPC function execution
- ✅ Database state verification (QR code existence, status validation)
- ✅ Scan event logging verification (actual database writes)
- ✅ IP hashing validation (real SHA256 hashing)
- ✅ Database constraints and relationships (foreign keys, status filtering)
- ✅ Database-level filtering (WHERE clauses, status-based queries)

## Test Data Management

### Unit Tests

Unit tests use mocked Supabase clients and don't require a real database connection.

### Integration Tests

Integration tests automatically:

- Create test data (organization, user, QR code)
- Clean up test data after completion
- Use isolated test data to avoid conflicts

## Adding New Tests

### For Unit Tests

1. Add test cases to the appropriate describe block in `handle-redirect.test.ts`
2. Use the existing mock setup for Supabase client
3. Follow the existing test patterns and naming conventions

### For Integration Tests

1. Add test cases to `handle-redirect.integration.test.ts`
2. Use the existing test data setup in `beforeAll`
3. Ensure proper cleanup in `afterAll` if creating new test data

## Test Configuration

The test configuration is defined in `vitest.config.ts`:

- Uses `jsdom` environment for browser-like testing
- Enables global test utilities
- Sets up path aliases (`@` → `./src`)
- Includes test setup file

## Best Practices

1. **Organize by Feature**: Place tests near the code they test using `__tests__` directories
2. **Use Shared Utilities**: Leverage test utilities, fixtures, and helpers for consistency
3. **Avoid Duplication**: Unit tests focus on mocking and client behavior; integration tests focus on database functionality
4. **Mock External Dependencies**: Unit tests should mock Supabase and other external services
5. **Test Edge Cases**: Include tests for null/undefined values, empty strings, special characters
6. **Verify Error Handling**: Test both success and failure scenarios
7. **Clean Test Data**: Integration tests should clean up after themselves
8. **Descriptive Test Names**: Use clear, descriptive test names that explain the scenario
9. **Group Related Tests**: Use describe blocks to group related test cases
10. **Database-Specific Testing**: Integration tests should verify actual database behavior, not just API responses

## Test Utilities

### Global Setup (`src/__tests__/setup/`)

- `global.ts` - Global test configuration and setup
- `mocks.ts` - Shared mock implementations
- `test-utils.ts` - Common test utility functions

### Fixtures (`src/__tests__/fixtures/`)

- `qr-codes.ts` - QR code test data
- `users.ts` - User test data
- `organizations.ts` - Organization test data

### Helpers (`src/__tests__/helpers/`)

- `database.ts` - Database-specific test helpers
- `api.ts` - API testing utilities
- `ui.ts` - UI component testing utilities

### Usage Examples

```typescript
// Using test utilities with @test alias
import { TestUtils } from '@test/setup/test-utils';
import { testQrCodes } from '@test/fixtures/qr-codes';
import { DatabaseTestHelpers } from '@test/helpers/database';

// Create test data
const testQr = TestUtils.createTestQrCode({ slug: 'custom-slug' });

// Use fixtures
const qrCode = testQrCodes.find((qr) => qr.slug === 'test-qr-1');

// Use database helpers
DatabaseTestHelpers.mockQrCodeQuery(mockClient, 'test-slug', true);
```

### Path Aliases

The test suite uses the `@test` alias for clean imports:

- `@test/setup/*` → `src/__tests__/setup/*`
- `@test/fixtures/*` → `src/__tests__/fixtures/*`
- `@test/helpers/*` → `src/__tests__/helpers/*`

This alias is configured in both `tsconfig.json` and `vitest.config.ts` for full IDE and runtime support.

## Troubleshooting

### Tests Not Running

- Ensure all dependencies are installed: `npm install`
- Check that vitest is properly configured in `package.json`

### Integration Tests Failing

- Verify environment variables are set correctly
- Check that the Supabase project is accessible
- Ensure the `handle_redirect` function exists in the database
- Run migrations if needed: `supabase db reset`

### Mock Issues

- Clear mocks between tests using `vi.clearAllMocks()`
- Ensure mocks are properly typed with TypeScript
- Check that mock implementations match expected behavior
