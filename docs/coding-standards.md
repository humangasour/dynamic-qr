# Coding Standards

This project follows a clear, consistent naming convention to improve readability and maintainability.

## Naming Conventions

- Types and interfaces: PascalCase
  - Examples: `User`, `OrderItem`, `ApiResponse`
- Variables and functions: camelCase
  - Examples: `userId`, `fetchUser`, `isLoading`
- Constants: UPPER_CASE (for exported or global constants)
  - Examples: `DEFAULT_TIMEOUT_MS`, `API_BASE_URL`

Notes:

- React components (functions or consts that return JSX) should use PascalCase as they are components, not regular functions.
- Files and directories should generally use kebab-case unless framework conventions dictate otherwise.

## ESLint Enforcement

The ESLint configuration enforces the above via `@typescript-eslint/naming-convention`. Additional rules include:

- `@typescript-eslint/consistent-type-definitions`: enforce `interface` for object types
- `prefer-const`: require `const` when variables are never reassigned
- `no-var`: disallow `var`

These rules are configured in `eslint.config.mjs`.
