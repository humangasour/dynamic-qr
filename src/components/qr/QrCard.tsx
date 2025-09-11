'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { ExternalLink, Copy, Download as DownloadIcon, MoreVertical } from 'lucide-react';

import { Card, CardContent, CardFooter, CardHeader, CardAction } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Text } from '@/components/typography/Text';
import { Heading } from '@/components/typography/Heading';
import { fromNow } from '@/shared/utils/date';
import { copyTextToClipboard, withDownloadParam } from '@/lib/clipboard';

// Props kept identical for drop-in use
export interface Props {
  id: string;
  name: string;
  slug: string;
  svgUrl: string;
  pngUrl?: string | null;
  targetUrl: string;
  versionCount?: number;
  weekScans?: number;
  updatedAt: string | Date;
}

export function QrCard(props: Props) {
  const { id, name, slug, svgUrl, pngUrl, targetUrl, versionCount, weekScans, updatedAt } = props;

  const tCard = useTranslations('qr.card.linkSection');
  const tToast = useTranslations('qr.details.toast');
  const tCopy = useTranslations('qr.details.copy');
  const locale = useLocale();
  const shortPath = `/r/${slug}`;
  const detailsHref = `/${locale}/qr/${id}`;

  // SSR-safe origin for absolute copy
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') setOrigin(window.location.origin);
  }, []);

  const fullLink = origin ? `${origin}${shortPath}` : shortPath;

  const resolvedPngUrl = useMemo(
    () => pngUrl ?? svgUrl.replace(/\.svg(\?.*)?$/i, '.png$1'),
    [pngUrl, svgUrl],
  );

  async function handleCopy(value: string, label: string) {
    const ok = await copyTextToClipboard(value);
    if (ok) toast.success(tToast('copied', { label }));
    else toast.error(tToast('copyFail', { label }));
  }

  const fileBase = slug || name || 'qr-code';

  return (
    <Card role="group" aria-labelledby={`qr-${id}-title`} className="overflow-hidden gap-4 py-2">
      <CardHeader className="p-4 pb-2 gap-x-0">
        <div className="flex items-start gap-4 min-w-0 row-span-2 col-start-1">
          {/* Thumbnail */}
          <div className="border border-border rounded-md p-2 bg-background shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={svgUrl}
              alt={`QR code for ${name}`}
              className="size-16 object-contain"
              width={64}
              height={64}
            />
          </div>

          <div className="min-w-0 flex-1">
            <Heading
              id={`qr-${id}-title`}
              as="h3"
              size="h4"
              className="truncate max-w-[28ch] sm:max-w-[34ch] lg:max-w-[40ch]"
              title={name}
            >
              {name}
            </Heading>

            {/* Links moved to CardContent below */}
          </div>

          {/* Top-right actions */}
          <CardAction>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="More" className="rounded-full">
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <a href={withDownloadParam(resolvedPngUrl, `${fileBase}.png`)}>
                    <DownloadIcon className="mr-2 size-4" /> Download PNG
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href={withDownloadParam(svgUrl, `${fileBase}.svg`)}>
                    <DownloadIcon className="mr-2 size-4" /> Download SVG
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardAction>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-2 pt-3">
        {/* Links block under title/thumbnail with labels */}
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2 min-w-0 w-full">
            <Text as="span" size="xs" tone="muted" className="shrink-0">
              {tCard('short')}
            </Text>
            <Text
              as="span"
              size="sm"
              tone="muted"
              className="truncate block font-mono w-0 flex-1 min-w-0"
              title={fullLink}
            >
              {shortPath}
            </Text>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  aria-label={tCopy('linkAria')}
                  onClick={() => handleCopy(fullLink, tCopy('link'))}
                >
                  <Copy className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{tCopy('link')}</TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-center gap-2 min-w-0 w-full">
            <Text as="span" size="xs" tone="muted" className="shrink-0">
              {tCard('target')}
            </Text>
            <Text
              as="span"
              size="sm"
              tone="muted"
              className="truncate block w-0 flex-1 min-w-0"
              title={targetUrl}
            >
              {targetUrl}
            </Text>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  aria-label={tCopy('targetAria')}
                  onClick={() => handleCopy(targetUrl, tCopy('target'))}
                >
                  <Copy className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{tCopy('target')}</TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {typeof versionCount === 'number' ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="secondary" aria-label={`Versions: ${versionCount}`}>
                  v{versionCount}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>Versions</TooltipContent>
            </Tooltip>
          ) : null}

          {typeof weekScans === 'number' ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="secondary" aria-label={`Scans this week: ${weekScans}`}>
                  {weekScans} scans
                </Badge>
              </TooltipTrigger>
              <TooltipContent>Scans this week</TooltipContent>
            </Tooltip>
          ) : null}

          <Text as="span" size="xs" tone="muted" className="ml-auto whitespace-nowrap">
            Updated {fromNow(updatedAt)}
          </Text>
        </div>
      </CardContent>

      {/* Footer: primary quick actions (equal width) */}
      <CardFooter className="px-4 pt-0 pb-4">
        <div className="grid w-full grid-cols-2 gap-2">
          <Button asChild size="sm" aria-label="Open short link" className="w-full">
            <Link href={shortPath} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-4" />
              <span className="ml-2">{tCard('open')}</span>
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline" aria-label="Edit details" className="w-full">
            <Link href={detailsHref}>Edit</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

export default QrCard;
