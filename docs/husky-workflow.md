# Husky Workflow Documentation

This project uses Husky to enforce code quality and consistency through Git hooks. The workflow ensures that all code meets our standards before it can be committed or pushed.

## 🪝 Git Hooks

### Pre-commit Hook (`.husky/pre-commit`)

Runs automatically before every commit to ensure code quality:

- **lint-staged**: Automatically fixes and formats staged files
- **TypeScript check**: Ensures type safety across the project
- **ESLint**: Catches code quality issues and enforces style rules
- **Prettier check**: Verifies code formatting consistency

### Pre-push Hook (`.husky/pre-push`)

Runs before pushing to remote repositories to catch any issues:

- **Type checking**: Full TypeScript compilation check
- **Linting**: Complete ESLint validation
- **Formatting**: Prettier format verification
- **Build**: Next.js build verification
- **Build output verification**: Ensures `.next` directory exists

### Commit Message Hook (`.husky/commit-msg`)

Enforces conventional commit message format:

**Format**: `type(scope): description`

**Types**:

- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Build system changes
- `ci`: CI/CD changes
- `chore`: Maintenance tasks
- `revert`: Reverting previous commits

**Examples**:

```bash
feat(auth): add login functionality
fix(ui): resolve button alignment issue
chore(deps): update dependencies
docs(readme): update installation instructions
```

### Prepare Commit Message Hook (`.husky/prepare-commit-msg`)

Automatically generates commit message templates based on branch names:

- **Feature branches**: `feat(scope): [TICKET] `
- **Fix branches**: `fix(scope): [TICKET] `
- **Chore branches**: `chore(scope): [TICKET] `
- **Documentation branches**: `docs(scope): [TICKET] `
- **Refactor branches**: `refactor(scope): [TICKET] `

## 🚀 Available Scripts

```bash
# Run pre-commit checks manually
npm run pre-commit

# Run pre-push checks manually
npm run pre-push

# Run commit message validation manually
npm run commit-msg

# Run all quality checks
npm run check-all

# Format all files
npm run format:write

# Check formatting
npm run format

# Run linting
npm run lint

# Run type checking
npm run typecheck

# Build project
npm run build
```

## 🔧 Lint-staged Configuration

The `lint-staged` configuration automatically processes only the files that are staged for commit:

- **TypeScript/JavaScript files**: ESLint + Prettier formatting
- **Configuration files**: Prettier formatting
- **Documentation**: Prettier formatting
- **Auto-add**: Automatically stages formatted files

## 📋 Workflow Process

### 1. Development

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Stage files: `git add .`

### 2. Pre-commit (Automatic)

- Lint-staged processes staged files
- TypeScript type checking runs
- ESLint validates code
- Prettier checks formatting
- If any check fails, commit is blocked

### 3. Commit

- Write conventional commit message
- Commit message hook validates format
- If format is invalid, commit is blocked

### 4. Pre-push (Automatic)

- Full project validation runs
- Build verification
- If any check fails, push is blocked

## 🚨 Troubleshooting

### Hook Not Running

```bash
# Reinstall Husky
npm run prepare

# Make hooks executable
chmod +x .husky/*
```

### Bypass Hooks (Emergency Only)

```bash
# Skip pre-commit hook
git commit --no-verify -m "emergency fix"

# Skip pre-push hook
git push --no-verify
```

### Manual Hook Execution

```bash
# Run specific hook
npm run pre-commit
npm run pre-push

# Run all checks
npm run check-all
```

## 🎯 Best Practices

1. **Always use conventional commits** - This helps with changelog generation and project history
2. **Don't bypass hooks** - They're there to maintain code quality
3. **Fix issues locally** - Use `npm run check-all` to catch problems early
4. **Use meaningful branch names** - They help with commit message templates
5. **Keep commits atomic** - One logical change per commit

## 🔗 Integration with CI/CD

The Husky workflow mirrors the GitHub Actions CI pipeline:

- **Pre-commit** ≈ CI linting and formatting
- **Pre-push** ≈ CI type checking and build
- **Commit message** ≈ CI commit message validation

This ensures that code that passes local checks will also pass CI checks.
