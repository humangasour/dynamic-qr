import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const textVariants = cva('text-foreground', {
  variants: {
    size: {
      body: 'text-base leading-7',
      sm: 'text-sm leading-6',
      xs: 'text-xs leading-5',
      lead: 'text-lg leading-8',
    },
    tone: {
      default: 'text-foreground',
      muted: 'text-muted-foreground',
      secondary: 'text-secondary-foreground',
      primary: 'text-primary',
      destructive: 'text-destructive',
    },
    weight: {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
    },
  },
  defaultVariants: {
    size: 'body',
    tone: 'default',
    weight: 'normal',
  },
});

type TextProps<As extends React.ElementType> = {
  as?: As;
  className?: string;
} & VariantProps<typeof textVariants> &
  Omit<React.ComponentProps<As>, 'as' | 'className'>;

function Text<As extends React.ElementType = 'p'>(props: TextProps<As>) {
  const { as, className, size, tone, weight, ...rest } = props;
  const Comp = (as ?? 'p') as React.ElementType;
  return <Comp className={cn(textVariants({ size, tone, weight }), className)} {...rest} />;
}

export { Text, textVariants };
