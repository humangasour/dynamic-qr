# Accessibility Standards (WCAG 2.1 AA)

This document outlines the accessibility standards that all UI components in the Dynamic QR project must follow.

## Core Principles

### 1. Semantic HTML Structure

- Use semantic HTML elements (`<main>`, `<header>`, `<section>`, `<article>`, `<nav>`, `<footer>`)
- Proper heading hierarchy (h1 → h2 → h3, no skipping levels)
- Use `<button>` for actions, `<a>` for navigation
- Use `<form>` for form submissions

### 2. Form Accessibility

- **Labels**: Every form control must have an associated `<label>` with `htmlFor` attribute
- **IDs**: Form controls must have unique `id` attributes matching their labels
- **Error Handling**:
  - Use `aria-describedby` to associate error messages with form controls
  - Provide unique `id` attributes for error messages
  - Use `aria-live="polite"` for dynamic error announcements
- **Auto-complete**: Include `autoComplete` attributes for better UX
- **Validation**: Use `noValidate` on forms to prevent browser validation conflicts

### 3. Focus Management

- **Visible Focus**: All interactive elements must have visible focus indicators
- **Focus Order**: Logical tab order through the page
- **Focus Trapping**: For modals and overlays, trap focus within the component
- **Skip Links**: Provide skip navigation links for keyboard users

### 4. ARIA (Accessible Rich Internet Applications)

- **Roles**: Use ARIA roles when semantic HTML isn't sufficient
- **Labels**: Use `aria-label` or `aria-labelledby` for unlabeled elements
- **Described By**: Use `aria-describedby` for additional context
- **Live Regions**: Use `aria-live` for dynamic content updates
- **States**: Use `aria-expanded`, `aria-selected`, `aria-disabled` for component states

### 5. Color and Contrast

- **Contrast Ratio**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Color Independence**: Don't rely solely on color to convey information
- **Focus Indicators**: High contrast focus rings (minimum 3:1)

### 6. Keyboard Navigation

- **Tab Order**: Logical sequence through interactive elements
- **Keyboard Shortcuts**: Provide keyboard alternatives for mouse actions
- **Escape Key**: Close modals, dropdowns, and overlays with Escape
- **Enter/Space**: Activate buttons and links

## Component-Specific Guidelines

### Forms

```tsx
// ✅ Good: Proper form accessibility
<form aria-label="Sign in form" noValidate>
  <FormField
    control={form.control}
    name="email"
    render={({ field }) => (
      <FormItem>
        <FormLabel htmlFor="email">Email address</FormLabel>
        <FormControl>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-describedby={form.formState.errors.email ? 'email-error' : undefined}
            {...field}
          />
        </FormControl>
        <FormMessage id="email-error" />
      </FormItem>
    )}
  />
</form>
```

### Buttons

```tsx
// ✅ Good: Accessible button
<Button type="submit" disabled={isLoading} aria-describedby="status-message">
  {isLoading ? 'Loading...' : 'Submit'}
</Button>
```

### Links

```tsx
// ✅ Good: Accessible link with focus styles
<Link
  href="/auth/sign-up"
  className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
>
  Sign up
</Link>
```

### Loading States

```tsx
// ✅ Good: Screen reader accessible loading state
<div id="status-message" className="sr-only" aria-live="polite" aria-atomic="true">
  {isLoading ? 'Processing, please wait...' : ''}
</div>
```

### Page Structure

```tsx
// ✅ Good: Semantic page structure
export default function Page() {
  return (
    <main role="main" aria-labelledby="page-heading">
      <header>
        <h1 id="page-heading">Page Title</h1>
      </header>
      <section aria-labelledby="section-heading">
        <h2 id="section-heading">Section Title</h2>
        {/* Content */}
      </section>
    </main>
  );
}
```

## Testing Checklist

### Manual Testing

- [ ] Navigate entire page using only keyboard (Tab, Enter, Space, Arrow keys)
- [ ] Test with screen reader (NVDA, JAWS, VoiceOver)
- [ ] Verify color contrast ratios
- [ ] Test with browser zoom up to 200%
- [ ] Verify focus indicators are visible

### Automated Testing

- [ ] Use eslint-plugin-jsx-a11y for linting
- [ ] Run axe-core accessibility tests
- [ ] Validate HTML structure
- [ ] Check ARIA attributes

## Common Patterns

### Error Handling

```tsx
// ✅ Good: Accessible error handling
const [error, setError] = useState<string | null>(null);

return (
  <div>
    <input aria-describedby={error ? 'error-message' : undefined} aria-invalid={!!error} />
    {error && (
      <div id="error-message" role="alert" aria-live="polite">
        {error}
      </div>
    )}
  </div>
);
```

### Dynamic Content

```tsx
// ✅ Good: Screen reader announcements
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>
```

### Modal/Dialog

```tsx
// ✅ Good: Accessible modal
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <h2 id="modal-title">Modal Title</h2>
  <p id="modal-description">Modal description</p>
  {/* Content */}
</div>
```

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Screen Reader Testing](https://webaim.org/articles/screenreader_testing/)
- [React Accessibility Documentation](https://reactjs.org/docs/accessibility.html)
- [axe-core Testing](https://www.deque.com/axe/)

## Enforcement

All components must pass:

1. Manual accessibility testing
2. Automated linting with eslint-plugin-jsx-a11y
3. axe-core accessibility tests
4. Screen reader testing

Components that don't meet these standards will not be merged.
