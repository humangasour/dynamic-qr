'use client';
import Link from 'next/link';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/typography/Text';
import { Heading } from '@/components/typography/Heading';

interface QrDetailsProps {
  id: string;
  name: string;
  targetUrl: string;
  slug: string;
  svgUrl: string;
  pngUrl: string;
}

export function QrDetails(props: QrDetailsProps) {
  const { name, targetUrl, slug, svgUrl, pngUrl } = props;

  const shortPath = `/r/${slug}`;
  const fullLink =
    typeof window !== 'undefined' ? `${window.location.origin}${shortPath}` : shortPath;

  const copyText = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    } catch (err) {
      console.error('Copy failed', err);
      toast.error(`Failed to copy ${label}`);
    }
  };

  const copyImage = async (url: string, mime: 'image/png' | 'image/svg+xml', label: string) => {
    try {
      // Primary path: ClipboardItem API (not supported everywhere, e.g., Safari)
      const hasClipboardItem = typeof window !== 'undefined' && 'ClipboardItem' in window;
      if (hasClipboardItem && navigator.clipboard?.write) {
        const res = await fetch(url);
        const blob = await res.blob();
        const typedBlob = blob.type ? blob : new Blob([blob], { type: mime });
        type ClipboardItemCtor = new (items: Record<string, Blob>) => ClipboardItem;
        const ClipboardItemCtor = (globalThis as unknown as { ClipboardItem?: ClipboardItemCtor })
          .ClipboardItem;
        if (ClipboardItemCtor) {
          const item = new ClipboardItemCtor({ [mime]: typedBlob });
          await navigator.clipboard.write([item]);
        } else if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(url);
        }
        toast.success(`${label} copied to clipboard`);
        return;
      }

      // Fallback 1: copy URL text instead of image
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        toast.success(`${label} URL copied to clipboard`);
        return;
      }

      // Fallback 2: trigger a download
      const a = document.createElement('a');
      a.href = url;
      a.download = '';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success(`${label} download started`);
    } catch (err) {
      console.error('Copy image failed', err);
      toast.error(`Failed to copy ${label}`);
    }
  };

  const fileBase = slug || name || 'qr-code';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>
            <Heading as="h2" size="h3">
              Preview (PNG)
            </Heading>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4">
            {/* Use next/image for PNG preview */}
            <div className="border border-border rounded-lg p-3 bg-background">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={pngUrl}
                alt={`${name} PNG`}
                className="w-64 h-64 object-contain"
                width={256}
                height={256}
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <a href={pngUrl} download={`${fileBase}.png`}>
                  Download PNG
                </a>
              </Button>
              <Button
                variant="outline"
                aria-label="Copy PNG to clipboard"
                onClick={() => copyImage(pngUrl, 'image/png', 'PNG')}
              >
                Copy PNG
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <Heading as="h2" size="h3">
              Preview (SVG)
            </Heading>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4">
            <div className="border border-border rounded-lg p-3 bg-background">
              {/* Render SVG directly for crisp preview */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={svgUrl}
                alt={`${name} SVG`}
                className="w-64 h-64 object-contain"
                width={256}
                height={256}
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <a href={svgUrl} download={`${fileBase}.svg`}>
                  Download SVG
                </a>
              </Button>
              <Button
                variant="outline"
                aria-label="Copy SVG to clipboard"
                onClick={() => copyImage(svgUrl, 'image/svg+xml', 'SVG')}
              >
                Copy SVG
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>
            <Heading as="h2" size="h3">
              Link & Target
            </Heading>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <Text as="p" className="font-medium">
                  Short Link
                </Text>
                <Text tone="muted">{shortPath}</Text>
              </div>
              <div className="flex gap-2">
                <Button asChild variant="outline" aria-label="Open short link in new tab">
                  <Link href={shortPath} target="_blank" rel="noopener noreferrer">
                    Open Link
                  </Link>
                </Button>
                <Button aria-label="Copy short link" onClick={() => copyText(fullLink, 'link')}>
                  Copy Link
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <Text as="p" className="font-medium">
                  Current Target URL
                </Text>
                <Text tone="muted" className="truncate max-w-[60ch]" title={targetUrl}>
                  {targetUrl}
                </Text>
              </div>
              <div className="flex gap-2">
                <Button asChild variant="outline" aria-label="Open target URL in new tab">
                  <a href={targetUrl} target="_blank" rel="noopener noreferrer">
                    Open Target
                  </a>
                </Button>
                <Button
                  aria-label="Copy target URL"
                  onClick={() => copyText(targetUrl, 'target URL')}
                >
                  Copy Target
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
