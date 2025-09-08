import { describe, it, expect } from 'vitest';

import { generateQRSVG, generateQRPNG, QR_PRESETS } from '@/lib/qr-generator';

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

describe('QR Generator', () => {
  it('generates valid SVG string', async () => {
    const svg = await generateQRSVG('https://example.com', QR_PRESETS.svg);
    expect(typeof svg).toBe('string');
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
  });

  it('generates valid PNG buffer', async () => {
    const png = await generateQRPNG('https://example.com', QR_PRESETS.previewPNG);
    expect(Buffer.isBuffer(png)).toBe(true);
    const sig = Array.from(png.slice(0, 8));
    expect(sig).toEqual(PNG_SIGNATURE);
  });

  it('different inputs yield different outputs', async () => {
    const [svg1, svg2] = await Promise.all([
      generateQRSVG('https://example.com/a', QR_PRESETS.svg),
      generateQRSVG('https://example.com/b', QR_PRESETS.svg),
    ]);
    expect(svg1).not.toBe(svg2);

    const [png1, png2] = await Promise.all([
      generateQRPNG('https://example.com/a', QR_PRESETS.previewPNG),
      generateQRPNG('https://example.com/b', QR_PRESETS.previewPNG),
    ]);
    expect(Buffer.compare(png1, png2)).not.toBe(0);
  });
});
