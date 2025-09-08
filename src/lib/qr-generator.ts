import QRCode from 'qrcode';

/**
 * QR code generation options
 */
export interface QRCodeOptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

/**
 * Default QR code options
 */
const DEFAULT_OPTIONS: QRCodeOptions = {
  width: 1024,
  margin: 4,
  color: {
    dark: '#000000',
    light: '#FFFFFF',
  },
  errorCorrectionLevel: 'Q',
};

export const QR_PRESETS = {
  // Vector preset: omit width to keep vector scalable; keep quiet zone and EC level
  svg: {
    margin: 4,
    color: { dark: '#000000', light: '#FFFFFF' },
    errorCorrectionLevel: 'Q' as const,
  },
  // Print-quality PNG
  printPNG: {
    width: 1024,
    margin: 4,
    color: { dark: '#000000', light: '#FFFFFF' },
    errorCorrectionLevel: 'Q' as const,
  },
  // UI preview PNG
  previewPNG: {
    width: 512,
    margin: 4,
    color: { dark: '#000000', light: '#FFFFFF' },
    errorCorrectionLevel: 'Q' as const,
  },
} satisfies Record<string, QRCodeOptions>;

/**
 * Generate QR code as SVG string
 */
export async function generateQRSVG(data: string, options: QRCodeOptions = {}): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return QRCode.toString(data, {
    type: 'svg',
    // For SVG we allow width to be undefined (vector scalable)
    width: opts.width,
    margin: opts.margin,
    color: opts.color,
    errorCorrectionLevel: opts.errorCorrectionLevel,
  });
}

/**
 * Generate QR code as PNG buffer
 */
export async function generateQRPNG(data: string, options: QRCodeOptions = {}): Promise<Buffer> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return QRCode.toBuffer(data, {
    type: 'png',
    width: opts.width,
    margin: opts.margin,
    color: opts.color,
    errorCorrectionLevel: opts.errorCorrectionLevel,
  });
}

/**
 * Generate both SVG and PNG versions of a QR code
 */
export async function generateQRCode(
  data: string,
  options: QRCodeOptions = {},
): Promise<{
  svg: string;
  png: Buffer;
}> {
  const [svg, png] = await Promise.all([
    generateQRSVG(data, options),
    generateQRPNG(data, options),
  ]);

  return { svg, png };
}
