import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const headingVariants = cva('text-foreground tracking-tight font-semibold', {
  variants: {
    size: {
      display: 'text-4xl md:text-5xl',
      h1: 'text-3xl md:text-4xl',
      h2: 'text-2xl md:text-3xl',
      h3: 'text-xl md:text-2xl',
      h4: 'text-lg md:text-xl',
      h5: 'text-base md:text-lg',
      h6: 'text-sm md:text-base',
    },
    weight: {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    },
  },
  defaultVariants: {
    size: 'h2',
    weight: 'semibold',
  },
});

type HeadingProps<As extends React.ElementType> = {
  as?: As;
  className?: string;
} & VariantProps<typeof headingVariants> &
  Omit<React.ComponentProps<As>, 'as' | 'className'>;

function Heading<As extends React.ElementType = 'h2'>(props: HeadingProps<As>) {
  const { as, className, size, weight, ...rest } = props;
  const Comp = (as ?? 'h2') as React.ElementType;
  return <Comp className={cn(headingVariants({ size, weight }), className)} {...rest} />;
}

export { Heading, headingVariants };
