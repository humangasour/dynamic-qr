# Design System

This document describes the design tokens, typography, and component usage conventions for this project. Tokens come primarily from Tailwind CSS defaults, a small Tailwind container config, and semantic CSS variables defined in `src/app/globals.css`. UI components live under `src/components/ui` and use class‑variance‑authority for variants.

## Tokens

### Colors (semantic)

Semantic colors are defined as CSS variables in `src/app/globals.css` and mapped into Tailwind via `@theme inline`. Always prefer semantic classes like `bg-primary`, `text-muted-foreground`, `border-input` over hard‑coded colors.

- Surface: `bg-background`, `text-foreground`
- Card: `bg-card`, `text-card-foreground`
- Popover: `bg-popover`, `text-popover-foreground`
- Brand: `bg-primary`, `text-primary-foreground`, `text-primary`
- Secondary: `bg-secondary`, `text-secondary-foreground`
- Accent: `bg-accent`, `text-accent-foreground`
- Muted: `bg-muted`, `text-muted-foreground`
- Destructive: `bg-destructive`, `text-destructive-foreground`, `text-destructive`
- UI: `border-border`, `border-input`, `ring-ring`
- Charts: `text-[--chart-1]` … `text-[--chart-5]` (use sparingly and semantically)
- Sidebar: `bg-sidebar`, `text-sidebar-foreground`, `bg-sidebar-primary`, etc.

Dark mode overrides are provided via the `.dark` class on `<html>` (see `src/app/layout.tsx` and `src/app/globals.css`). No component‑level logic is required; use the same semantic utilities.

### Radius

CSS variable tokens in `src/app/globals.css` expose a single base radius and derived steps:

- `--radius`: base (default `0.625rem`)
- `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`

Use Tailwind’s `rounded-*` utilities that reference these variables via the `@theme inline` mapping. Components already apply sensible defaults (e.g., buttons and inputs are `rounded-md`).

### Typography and fonts

Fonts are loaded in `src/app/layout.tsx` using `next/font` and exposed as CSS variables:

- `--font-geist-sans` mapped to Tailwind `font-sans`
- `--font-geist-mono` mapped to Tailwind `font-mono`

Default body text uses `font-sans` with `antialiased` on the `<body>`. Prefer the provided typography components for consistency (see below).

### Spacing scale

Tailwind’s default spacing scale is used (no custom `theme.extend.spacing`). Prefer consistent steps: `1, 2, 3, 4, 6, 8, 12` for gaps, paddings, and margins.

Examples reflected in UI components:

- Buttons: heights `h-8 | h-9 | h-10`, paddings `px-3 | px-4 | px-6`
- Cards: `py-6 px-6`
- Inputs: `h-9 px-3 py-1`

### Container and layout

Tailwind container is centered with `2xl` capped at `1280px` (see `tailwind.config.ts`). A utility `.px-page` is provided for page gutters:

- Apply `container` where appropriate (marketing sections) and `.px-page` to maintain consistent horizontal padding.

## Typography Components

Reusable typography primitives are under `src/components/typography`.

### `Heading`

- Sizes: `display | h1 | h2 | h3 | h4 | h5 | h6` (responsive ramps baked in)
- Weights: `normal | medium | semibold | bold` (default `semibold`)
- Example:

```tsx
import { Heading } from '@/components/typography/Heading';

<Heading as="h1" size="h1" className="mb-4">Welcome</Heading>
<Heading as="h2" size="h3" weight="medium">Section</Heading>
```

### `Text`

- Sizes: `xs | sm | body | lead` (defaults to `body`)
- Tones: `default | muted | secondary | primary | destructive`
- Weights: `normal | medium | semibold`
- Example:

```tsx
import { Text } from '@/components/typography/Text';

<Text>Body copy goes here.</Text>
<Text size="sm" tone="muted">Secondary description.</Text>
```

## UI Components and Conventions

All UI components live in `src/components/ui` and are built with class‑variance‑authority (`cva`) for variants. They expose `data-slot` attributes for targeted styling and testing, and use the `cn` helper for merging class names.

### `Button`

- Variants: `default | destructive | outline | secondary | ghost | link`
- Sizes: `sm | default | lg | icon`
- Props: `asChild` to render as a different element via Radix `Slot`
- Examples:

```tsx
import { Button } from '@/components/ui/button';

<Button>Save</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="destructive" size="sm">Delete</Button>
<Button size="icon" aria-label="Close">
  <X className="size-4" />
  <span className="sr-only">Close</span>
  {/* icon-only buttons should include an sr-only label */}
  </Button>
```

Accessibility: focus styles use `ring-ring` and `border-ring` semantics. Invalid state uses `aria-invalid` styles (`aria-invalid:ring-destructive/20`).

### `Input`

- Styled for focus (`focus-visible:ring-ring/50`) and invalid (`aria-invalid`) states
- Use with `Form` primitives for accessible labeling/validation
- Example:

```tsx
import { Input } from '@/components/ui/input';

<Input placeholder="Search" />;
```

### `Label`

- Wraps Radix label and pairs with inputs via `htmlFor`
- Handles disabled states via `group-data-[disabled=true]` and peer utilities
- Example:

```tsx
import { Label } from '@/components/ui/label';

<div className="grid gap-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" />
</div>;
```

### `Card`

- Structure: `Card` → `CardHeader` → (`CardTitle`, `CardDescription`, `CardAction`) → `CardContent` → `CardFooter`
- Spacing: `py-6 px-6` with header/footer borders applied by parent when needed
- Example:

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Optional subtitle</CardDescription>
    <CardAction>
      <Button size="sm">Action</Button>
    </CardAction>
  </CardHeader>
  <CardContent>Content goes here</CardContent>
  <CardFooter>
    <Button variant="secondary">Cancel</Button>
    <Button>Save</Button>
  </CardFooter>
</Card>;
```

### `Form` primitives

Integrates `react-hook-form` for accessible labeling and validation. Compose with `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage`.

```tsx
import { useForm } from 'react-hook-form';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const form = useForm<{ email: string }>();

<Form {...form}>
  <form className="space-y-4" onSubmit={form.handleSubmit(console.log)}>
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input type="email" placeholder="you@example.com" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <Button type="submit">Submit</Button>
  </form>
</Form>;
```

### Notifications

Use the `Toaster` from `src/components/ui/sonner.tsx` once in the app root if needed for toast notifications.

## Usage Conventions

- Semantics: use semantic Tailwind utilities (`bg-primary`, `text-muted-foreground`, `border-input`) rather than literal colors.
- Composition: prefer composition (e.g., `Card` sections, form primitives) over prop bloat; leverage `asChild` when you need a different element.
- Accessibility: preserve focus rings, label associations, and `aria-*` attributes. Add `sr-only` text for icon‑only controls.
- Responsiveness: use Tailwind responsive modifiers; heading sizes already include sensible responsive ramps.
- Class merging: use `cn(...)` from `src/lib/utils.ts` to merge classes safely.
- Layout: apply `container` and `.px-page` for page sections; keep content width consistent.

## References

- Tailwind config: `tailwind.config.ts`
- Global tokens and theme: `src/app/globals.css`
- UI components: `src/components/ui/*`
- Typography components: `src/components/typography/*`
