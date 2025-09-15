// Client-only helpers for clipboard and download actions
// These utilities intentionally avoid showing UI. Callers should toast/i18n.

export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fallthrough to false
  }
  return false;
}

export type CopyImageResult = 'image' | 'url' | 'download' | 'none';

export async function copyImageWithFallback(
  url: string,
  mime: 'image/png' | 'image/svg+xml',
  opts?: { downloadFallback?: boolean; filename?: string },
): Promise<CopyImageResult> {
  try {
    const hasClipboardItem = typeof window !== 'undefined' && 'ClipboardItem' in window;
    if (hasClipboardItem && navigator.clipboard?.write) {
      const res = await fetch(url);
      const blob = await res.blob();
      const typed = blob.type ? blob : new Blob([blob], { type: mime });
      type ClipboardItemCtor = new (items: Record<string, Blob>) => ClipboardItem;
      const ClipboardItemCtor = (globalThis as unknown as { ClipboardItem?: ClipboardItemCtor })
        .ClipboardItem;
      if (ClipboardItemCtor) {
        const item = new ClipboardItemCtor({ [mime]: typed });
        await navigator.clipboard.write([item]);
        return 'image';
      }
    }

    // Fallback 1: copy URL text
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      return 'url';
    }

    // Fallback 2: optional download
    if (opts?.downloadFallback) {
      startDownload(url, opts.filename);
      return 'download';
    }
  } catch {
    // ignore and fall through to 'none'
  }
  return 'none';
}

export function startDownload(url: string, filename?: string) {
  if (typeof document === 'undefined') return;
  const a = document.createElement('a');
  a.href = url;
  if (filename) a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Adds a `download` query param understood by Supabase Storage to return
// Content-Disposition: attachment; optionally sets a filename.
export function withDownloadParam(publicUrl: string, filename?: string): string {
  try {
    const u = new URL(publicUrl);
    if (filename) {
      u.searchParams.set('download', filename);
    } else {
      // presence of the param is enough to force attachment
      if (!u.searchParams.has('download')) u.searchParams.set('download', '');
    }
    return u.toString();
  } catch {
    // Fallback: append as best-effort
    const sep = publicUrl.includes('?') ? '&' : '?';
    return `${publicUrl}${sep}download=${encodeURIComponent(filename ?? '')}`;
  }
}
