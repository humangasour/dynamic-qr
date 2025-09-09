import * as React from 'react';
import Link from 'next/link';
import { Clock } from 'lucide-react';

import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import { Button } from '@/components/ui/button';

interface Cta {
  href: string;
  label: string;
}

interface Props {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  cta?: Cta;
  className?: string;
}

export function ComingSoon({ title, description, icon: iconProp = Clock, cta, className }: Props) {
  const Icon = iconProp;
  return (
    <section className={className} aria-labelledby="coming-soon-title">
      <div className="py-10 md:py-16 px-page max-w-2xl mx-auto text-center">
        <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-full border border-border bg-secondary text-secondary-foreground shadow-sm">
          <Icon className="size-6" aria-hidden="true" />
        </div>
        <Heading id="coming-soon-title" as="h1" size="h1" className="mb-3">
          {title}
        </Heading>
        {description ? (
          <Text tone="muted" className="mb-6">
            {description}
          </Text>
        ) : null}
        {cta ? (
          <Button asChild size="lg">
            <Link href={cta.href}>{cta.label}</Link>
          </Button>
        ) : null}
      </div>
    </section>
  );
}

export default ComingSoon;
