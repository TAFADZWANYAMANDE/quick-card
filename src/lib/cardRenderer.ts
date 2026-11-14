import QRCode from 'qrcode';
import {
  CardTemplate,
  Palette,
  FontPair,
  Decoration,
  CardCustomizations,
  BorderStyle,
  CardAspectRatio,
} from '../types/template';
import { mergeTemplateText } from './mergeUtils';

export const DEFAULT_CUSTOMIZATIONS: CardCustomizations = {
  aspectRatio: 'square',
  borderStyle: 'double-classic',
  textScale: 1,
  currencySymbol: '$',
};

export interface RenderCardOptions {
  template: CardTemplate;
  fieldValues: Record<string, string>;
  palette: Palette;
  fontPair: FontPair;
  isUnlocked?: boolean;
  personalisedName?: string;
  tableItems?: Array<{ id: string; name: string; amount: number; checked?: boolean }>;
  customizations?: CardCustomizations;
  onAssetReady?: () => void;
}

export interface TextWrapResult {
  lines: string[];
  fontSize: number;
  lineHeight: number;
  fits: boolean;
  totalHeight: number;
}

export function getCanvasDimensions(aspectRatio: CardAspectRatio = 'square'): { width: number; height: number } {
  switch (aspectRatio) {
    case 'status':
      return { width: 1080, height: 1920 };
    case 'portrait':
      return { width: 1080, height: 1350 };
    case 'square':
    default:
      return { width: 1080, height: 1080 };
  }
}

// Local offline image cache for user-uploaded logos/photos
const imageCache = new Map<string, HTMLImageElement>();

function getCachedImage(dataUrl: string, onAssetReady?: () => void): HTMLImageElement | null {
  if (!dataUrl) return null;
  const cached = imageCache.get(dataUrl);
  if (cached) {
    return cached.complete && cached.naturalWidth > 0 ? cached : null;
  }

  const img = new Image();
  img.onload = () => {
    if (onAssetReady) onAssetReady();
  };
  img.src = dataUrl;
  imageCache.set(dataUrl, img);
  return img.complete && img.naturalWidth > 0 ? img : null;
}

/**
 * Text wrapping and shrinking engine
 */
export function wrapAndFitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxHeight: number,
  maxSize: number,
  minSize: number,
  fontFamily: string,
  maxLines: number,
  fontWeight = 'normal'
): TextWrapResult {
  if (!text) {
    return {
      lines: [],
      fontSize: maxSize,
      lineHeight: maxSize * 1.3,
      fits: true,
      totalHeight: 0,
    };
  }

  const rawParagraphs = text.split('\n');
  let bestLines: string[] = [];
  let bestFontSize = minSize;
  let fits = false;

  const safeMax = Math.max(minSize, Math.round(maxSize));
  const safeMin = Math.max(12, Math.round(minSize));

  for (let currentSize = safeMax; currentSize >= safeMin; currentSize -= 2) {
    ctx.font = `${fontWeight} ${currentSize}px '${fontFamily}', sans-serif`;
    const lineHeight = currentSize * 1.28;

    const wrappedLines: string[] = [];

    for (const paragraph of rawParagraphs) {
      if (paragraph.trim() === '') {
        wrappedLines.push('');
        continue;
      }

      const words = paragraph.split(/\s+/);
      let currentLine = '';

      for (let i = 0; i < words.length; i++) {
        const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
        const metrics = ctx.measureText(testLine);

        if (metrics.width <= maxWidth) {
          currentLine = testLine;
        } else {
          if (currentLine) {
            wrappedLines.push(currentLine);
          }
          currentLine = words[i];
        }
      }

      if (currentLine) {
        wrappedLines.push(currentLine);
      }
    }

    const totalHeight = wrappedLines.length * lineHeight;

    if (wrappedLines.length <= maxLines && totalHeight <= maxHeight) {
      bestLines = wrappedLines;
      bestFontSize = currentSize;
      fits = true;
      break;
    }

    if (currentSize <= safeMin + 1) {
      bestLines = wrappedLines;
      bestFontSize = safeMin;
      fits = false;
    }
  }

  const finalLineHeight = bestFontSize * 1.28;
  return {
    lines: bestLines,
    fontSize: bestFontSize,
    lineHeight: finalLineHeight,
    fits,
    totalHeight: bestLines.length * finalLineHeight,
  };
}

function drawDiamond(ctx: CanvasRenderingContext2D, cx: number, cy: number, size = 6, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx, cy - size);
  ctx.lineTo(cx + size, cy);
  ctx.lineTo(cx, cy + size);
  ctx.lineTo(cx - size, cy);
  ctx.closePath();
  ctx.fill();
}

/**
 * Draws full-bleed card border according to chosen borderStyle
 */
function drawCardFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  palette: Palette,
  borderStyle: BorderStyle = 'double-classic'
) {
  ctx.save();
  const x = 40;
  const y = 40;
  const w = width - 80;
  const h = height - 80;
  const borderColor = palette.border || palette.accent;

  if (borderStyle === 'modern-minimal') {
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    if (typeof (ctx as any).roundRect === 'function') {
      (ctx as any).roundRect(x, y, w, h, 28);
    } else {
      ctx.rect(x, y, w, h);
    }
    ctx.stroke();

    // Subtle accent corner ticks
    ctx.strokeStyle = palette.accent;
    ctx.lineWidth = 4;
    const len = 36;
    const pad = 14;
    // Top-left
    ctx.beginPath();
    ctx.moveTo(x + pad, y + pad + len);
    ctx.lineTo(x + pad, y + pad);
    ctx.lineTo(x + pad + len, y + pad);
    // Top-right
    ctx.moveTo(x + w - pad - len, y + pad);
    ctx.lineTo(x + w - pad, y + pad);
    ctx.lineTo(x + w - pad, y + pad + len);
    // Bottom-left
    ctx.moveTo(x + pad, y + h - pad - len);
    ctx.lineTo(x + pad, y + h - pad);
    ctx.lineTo(x + pad + len, y + h - pad);
    // Bottom-right
    ctx.moveTo(x + w - pad - len, y + h - pad);
    ctx.lineTo(x + w - pad, y + h - pad);
    ctx.lineTo(x + w - pad, y + h - pad - len);
    ctx.stroke();
  } else if (borderStyle === 'ornate-corners') {
    ctx.lineWidth = 4;
    ctx.strokeStyle = borderColor;
    ctx.strokeRect(x, y, w, h);

    ctx.lineWidth = 2;
    ctx.strokeStyle = palette.accent;
    ctx.strokeRect(x + 14, y + 14, w - 28, h - 28);
    ctx.globalAlpha = 0.45;
    ctx.strokeRect(x + 24, y + 24, w - 48, h - 48);
    ctx.globalAlpha = 1;

    // Corner filigree squares & diamonds
    const corners = [
      [x + 14, y + 14, 1, 1],
      [x + w - 14, y + 14, -1, 1],
      [x + 14, y + h - 14, 1, -1],
      [x + w - 14, y + h - 14, -1, -1],
    ];
    corners.forEach(([cx, cy, dx, dy]) => {
      ctx.strokeStyle = palette.accent;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(cx + (dx < 0 ? -28 : 0), cy + (dy < 0 ? -28 : 0), 28, 28);
      drawDiamond(ctx, cx + dx * 14, cy + dy * 14, 7, palette.accent);
      drawDiamond(ctx, cx + dx * 44, cy, 4, palette.accent);
      drawDiamond(ctx, cx, cy + dy * 44, 4, palette.accent);
    });
  } else if (borderStyle === 'arch-frame') {
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, w, h);

    // Cathedral arch inset frame
    const inset = 20;
    const ax = x + inset;
    const ay = y + inset;
    const aw = w - inset * 2;
    const ah = h - inset * 2;
    const archR = Math.min(aw / 2, 220);

    ctx.strokeStyle = palette.accent;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(ax, ay + ah);
    ctx.lineTo(ax, ay + archR);
    ctx.quadraticCurveTo(ax, ay, ax + aw / 2, ay);
    ctx.quadraticCurveTo(ax + aw, ay, ax + aw, ay + archR);
    ctx.lineTo(ax + aw, ay + ah);
    ctx.closePath();
    ctx.stroke();

    drawDiamond(ctx, ax + aw / 2, ay + 12, 6, palette.accent);
    drawDiamond(ctx, ax, ay + ah, 6, palette.accent);
    drawDiamond(ctx, ax + aw, ay + ah, 6, palette.accent);
  } else {
    // double-classic (Default)
    ctx.lineWidth = 4;
    ctx.strokeStyle = borderColor;
    ctx.strokeRect(x, y, w, h);

    ctx.lineWidth = 2;
    ctx.strokeStyle = palette.accent;
    ctx.strokeRect(x + 16, y + 16, w - 32, h - 32);

    drawDiamond(ctx, x + 16, y + 16, 7, palette.accent);
    drawDiamond(ctx, x + w - 16, y + 16, 7, palette.accent);
    drawDiamond(ctx, x + 16, y + h - 16, 7, palette.accent);
    drawDiamond(ctx, x + w - 16, y + h - 16, 7, palette.accent);
  }

  ctx.restore();
}

/**
 * Renders decorative vector ornaments
 */
function drawDecoration(
  ctx: CanvasRenderingContext2D,
  dec: Decoration,
  palette: Palette,
  offsetY = 0
) {
  if (dec.type === 'border') return; // Handled cleanly by drawCardFrame

  ctx.save();
  ctx.globalAlpha = dec.opacity ?? 1;

  let color = palette.accent;
  if (dec.color === 'border') color = palette.border;
  if (dec.color === 'text') color = palette.text;
  if (dec.color === 'secondaryText') color = palette.secondaryText;

  ctx.strokeStyle = color;
  ctx.fillStyle = color;

  const { x, width, height } = dec;
  const y = dec.y + offsetY;

  if (dec.type === 'divider') {
    ctx.beginPath();
    ctx.lineWidth = height || 2;
    ctx.strokeStyle = palette.accent;
    ctx.moveTo(x, y);
    ctx.lineTo(x + width, y);
    ctx.stroke();

    const midX = x + width / 2;
    drawDiamond(ctx, midX, y, 7, palette.accent);

    ctx.beginPath();
    ctx.arc(midX - 18, y, 2.5, 0, Math.PI * 2);
    ctx.arc(midX + 18, y, 2.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (dec.type === 'cross') {
    const cx = x + width / 2;
    const topY = y;
    const bottomY = y + height;
    const barY = y + height * 0.32;
    const barHalfWidth = width * 0.38;

    ctx.lineWidth = 4;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(cx, topY);
    ctx.lineTo(cx, bottomY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx - barHalfWidth, barY);
    ctx.lineTo(cx + barHalfWidth, barY);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, barY, 3, 0, Math.PI * 2);
    ctx.fill();
  } else if (dec.type === 'rings') {
    const r = Math.min(width, height) * 0.35;
    const cx1 = x + width * 0.4;
    const cy1 = y + height * 0.5;
    const cx2 = x + width * 0.6;
    const cy2 = y + height * 0.5;

    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx1, cy1, r, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx2, cy2, r, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx2, cy2 - r, 3.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (dec.type === 'floral') {
    const cx = x + width / 2;
    const cy = y + height / 2;

    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy + 20, 40, Math.PI * 0.8, Math.PI * 2.2);
    ctx.stroke();

    for (let angle = 0.9; angle <= 2.1; angle += 0.3) {
      const lx = cx + Math.cos(angle * Math.PI) * 40;
      const ly = cy + 20 + Math.sin(angle * Math.PI) * 40;
      ctx.beginPath();
      ctx.ellipse(lx, ly, 6, 3, angle, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (dec.type === 'confetti') {
    const cx = x + width / 2;
    const cy = y + height / 2;
    const offsets = [
      [-30, -10],
      [30, -10],
      [-15, 15],
      [15, 15],
      [0, -20],
      [-40, 10],
      [40, 10],
    ];
    offsets.forEach(([ox, oy], i) => {
      ctx.beginPath();
      if (i % 2 === 0) {
        ctx.arc(cx + ox, cy + oy, 3.5, 0, Math.PI * 2);
      } else {
        ctx.rect(cx + ox - 2.5, cy + oy - 2.5, 5, 5);
      }
      ctx.fill();
    });
  } else if (dec.type === 'banner') {
    const cx = x + width / 2;
    const cy = y + height / 2;
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - 24, cy - 16, 48, 32);
    ctx.beginPath();
    ctx.moveTo(cx, cy - 16);
    ctx.lineTo(cx, cy + 16);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Draws Table Items (for Contributions Record and Grocery List)
 */
function drawTableItems(
  ctx: CanvasRenderingContext2D,
  options: RenderCardOptions,
  fontFamily: string,
  offsetY = 0
) {
  const { template, palette, tableItems = [], customizations } = options;
  const config = template.tableConfig || {
    itemLabel: 'Item',
    valueLabel: 'Amount',
    isCurrency: true,
    unit: '$',
  };

  const currencyOverride = customizations?.currencySymbol;
  const effectiveIsCurrency = currencyOverride === 'NONE' ? false : config.isCurrency || Boolean(currencyOverride && currencyOverride !== 'QTY');
  const symbolPrefix =
    currencyOverride === 'ZiG'
      ? 'ZiG '
      : currencyOverride === 'R'
      ? 'R'
      : currencyOverride === '$'
      ? '$'
      : config.unit || '$';
  const totalUnitLabel =
    currencyOverride === 'ZiG'
      ? 'ZiG'
      : currencyOverride === 'R'
      ? 'ZAR'
      : currencyOverride === '$'
      ? 'USD'
      : '';

  const leftX = 110;
  const rightX = 970;
  const rowHeight = 44;
  let currentY = 340 + offsetY;

  ctx.font = `600 24px '${fontFamily}', sans-serif`;
  ctx.fillStyle = palette.secondaryText;
  ctx.textAlign = 'left';
  ctx.fillText(config.itemLabel.toUpperCase(), leftX, currentY);

  ctx.textAlign = 'right';
  ctx.fillText(config.valueLabel.toUpperCase(), rightX, currentY);

  currentY += 28;

  ctx.strokeStyle = palette.border;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(leftX, currentY);
  ctx.lineTo(rightX, currentY);
  ctx.stroke();

  currentY += 32;

  let totalSum = 0;
  const visibleItems = tableItems.slice(0, 10);

  visibleItems.forEach((item, idx) => {
    totalSum += Number(item.amount) || 0;

    if (idx % 2 === 1) {
      ctx.fillStyle = palette.text;
      ctx.save();
      ctx.globalAlpha = 0.04;
      ctx.fillRect(leftX - 10, currentY - 26, rightX - leftX + 20, 36);
      ctx.restore();
    }

    ctx.font = `400 26px '${fontFamily}', sans-serif`;
    ctx.fillStyle = palette.text;
    ctx.textAlign = 'left';

    const checkPrefix = item.checked ? '✓ ' : '';
    ctx.fillText(`${checkPrefix}${item.name}`, leftX, currentY);

    ctx.font = `600 26px 'JetBrains Mono', monospace`;
    ctx.fillStyle = palette.accent;
    ctx.textAlign = 'right';

    let valStr = `${item.amount}`;
    if (effectiveIsCurrency && currencyOverride !== 'QTY') {
      valStr = `${symbolPrefix}${Number(item.amount).toFixed(2)}`;
    } else if (config.unit && currencyOverride !== 'QTY') {
      valStr = `${item.amount} ${config.unit}`;
    }
    ctx.fillText(valStr, rightX, currentY);

    currentY += rowHeight;
  });

  const totalY = 880 + offsetY;
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(leftX, totalY - 30);
  ctx.lineTo(rightX, totalY - 30);
  ctx.stroke();

  ctx.font = `700 32px '${fontFamily}', sans-serif`;
  ctx.fillStyle = palette.text;
  ctx.textAlign = 'left';
  ctx.fillText('TOTAL CALCULATED', leftX, totalY + 12);

  ctx.font = `700 36px 'JetBrains Mono', monospace`;
  ctx.fillStyle = palette.accent;
  ctx.textAlign = 'right';
  const totalFormatted =
    effectiveIsCurrency && currencyOverride !== 'QTY'
      ? `${symbolPrefix}${totalSum.toFixed(2)}${totalUnitLabel ? ` ${totalUnitLabel}` : ''}`
      : `${totalSum} ITEMS`;
  ctx.fillText(totalFormatted, rightX, totalY + 12);
}

/**
 * Draws user-uploaded church crest / portrait / logo offline
 */
function drawCustomLogo(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  width: number,
  height: number,
  palette: Palette,
  placement: 'top-crest' | 'bottom-left' | 'watermark-bg',
  shape: 'circle' | 'rounded' | 'original'
) {
  ctx.save();

  const aspect = img.naturalWidth / Math.max(1, img.naturalHeight);
  let targetW = 104;
  let targetH = 104;
  let cx = width / 2;
  let cy = 122;

  if (placement === 'watermark-bg') {
    targetW = 540;
    targetH = shape === 'original' ? Math.round(540 / aspect) : 540;
    cx = width / 2;
    cy = height / 2;
    ctx.globalAlpha = 0.08;
  } else if (placement === 'bottom-left') {
    targetW = 120;
    targetH = shape === 'original' ? Math.round(120 / aspect) : 120;
    cx = 136;
    cy = height - 138;
  } else {
    // top-crest
    const isTall = height > 1080;
    targetW = isTall ? 132 : 96;
    targetH = shape === 'original' ? Math.round(targetW / aspect) : targetW;
    cx = width / 2;
    cy = isTall ? 175 : 108;
  }

  const dx = cx - targetW / 2;
  const dy = cy - targetH / 2;

  if (shape === 'circle') {
    ctx.beginPath();
    ctx.arc(cx, cy, Math.min(targetW, targetH) / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
  } else if (shape === 'rounded') {
    ctx.beginPath();
    if (typeof (ctx as any).roundRect === 'function') {
      (ctx as any).roundRect(dx, dy, targetW, targetH, 18);
    } else {
      ctx.rect(dx, dy, targetW, targetH);
    }
    ctx.closePath();
    ctx.clip();
  }

  // Cover crop for square shapes, contain for original
  if (shape === 'original') {
    ctx.drawImage(img, dx, dy, targetW, targetH);
  } else {
    const minSide = Math.min(img.naturalWidth, img.naturalHeight);
    const sx = (img.naturalWidth - minSide) / 2;
    const sy = (img.naturalHeight - minSide) / 2;
    ctx.drawImage(img, sx, sy, minSide, minSide, dx, dy, targetW, targetH);
  }
  ctx.restore();

  // Subtle accent ring around crest/bottom-left badges
  if (placement !== 'watermark-bg' && shape !== 'original') {
    ctx.save();
    ctx.strokeStyle = palette.accent;
    ctx.lineWidth = 3;
    if (shape === 'circle') {
      ctx.beginPath();
      ctx.arc(cx, cy, Math.min(targetW, targetH) / 2 + 2, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.beginPath();
      if (typeof (ctx as any).roundRect === 'function') {
        (ctx as any).roundRect(dx - 2, dy - 2, targetW + 4, targetH + 4, 20);
      } else {
        ctx.rect(dx - 2, dy - 2, targetW + 4, targetH + 4);
      }
      ctx.stroke();
    }
    ctx.restore();
  }
}

/**
 * Draws a 100% offline scannable QR code badge in the bottom-right corner
 */
function drawQrBadge(
  ctx: CanvasRenderingContext2D,
  value: string,
  label: string,
  width: number,
  height: number,
  palette: Palette
) {
  if (!value.trim()) return;
  try {
    const qr = QRCode.create(value.trim(), { errorCorrectionLevel: 'M' });
    const modules = qr.modules;
    const count = modules.size;
    const qrDrawSize = 112;
    const pad = 12;
    const labelH = label.trim() ? 24 : 4;
    const boxW = qrDrawSize + pad * 2;
    const boxH = qrDrawSize + pad * 2 + labelH;

    const boxX = width - 76 - boxW;
    const boxY = height - 74 - boxH;

    ctx.save();
    // High-contrast crisp container so any phone camera scans cleanly
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    if (typeof (ctx as any).roundRect === 'function') {
      (ctx as any).roundRect(boxX, boxY, boxW, boxH, 12);
    } else {
      ctx.rect(boxX, boxY, boxW, boxH);
    }
    ctx.fill();

    ctx.strokeStyle = palette.accent;
    ctx.lineWidth = 2;
    ctx.stroke();

    const cellSize = qrDrawSize / count;
    const startX = boxX + pad;
    const startY = boxY + pad;

    ctx.fillStyle = '#0F172A';
    for (let r = 0; r < count; r++) {
      for (let c = 0; c < count; c++) {
        if (modules.get(r, c)) {
          ctx.fillRect(
            startX + c * cellSize,
            startY + r * cellSize,
            Math.ceil(cellSize),
            Math.ceil(cellSize)
          );
        }
      }
    }

    if (label.trim()) {
      ctx.fillStyle = '#0F172A';
      ctx.font = "700 13px 'Lato', sans-serif";
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label.trim().slice(0, 20), boxX + boxW / 2, boxY + qrDrawSize + pad + 12);
    }

    ctx.restore();
  } catch (err) {
    console.warn('QR render skipped:', err);
  }
}

/**
 * Primary Canvas Card Drawing Function
 */
export function drawCardToCanvas(
  canvas: HTMLCanvasElement,
  options: RenderCardOptions
): { hasOverflow: boolean; overflowFields: string[] } {
  const {
    template,
    fieldValues,
    palette,
    fontPair,
    isUnlocked = false,
    personalisedName,
    customizations = DEFAULT_CUSTOMIZATIONS,
    onAssetReady,
  } = options;

  const { width, height } = getCanvasDimensions(customizations.aspectRatio || 'square');
  const stageOffsetY = height > 1080 ? Math.round((height - 1080) * 0.44) : 0;
  const textScale = Math.min(1.2, Math.max(0.8, customizations.textScale || 1));

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return { hasOverflow: false, overflowFields: [] };

  // 1. Solid background
  ctx.fillStyle = palette.background;
  ctx.fillRect(0, 0, width, height);

  // 2. Subtle card surface if specified
  if (palette.cardSurface) {
    ctx.fillStyle = palette.cardSurface;
    ctx.fillRect(30, 30, width - 60, height - 60);
  }

  // 2b. Optional background watermark logo
  const logoImg = customizations.logo?.dataUrl
    ? getCachedImage(customizations.logo.dataUrl, onAssetReady)
    : null;

  if (logoImg && customizations.logo?.placement === 'watermark-bg') {
    drawCustomLogo(ctx, logoImg, width, height, palette, 'watermark-bg', customizations.logo.shape);
  }

  // 3. Full-canvas Card Frame (selected borderStyle)
  drawCardFrame(ctx, width, height, palette, customizations.borderStyle || 'double-classic');

  // 4. Template decorations (cross, rings, dividers, etc.)
  if (template.decorations) {
    template.decorations.forEach((dec) => {
      // Shift inner cross slightly if top-crest logo is on 1080x1080 square
      drawDecoration(ctx, dec, palette, stageOffsetY);
    });
  }

  // 4b. Foreground Logo / Crest if not watermark
  if (logoImg && customizations.logo && customizations.logo.placement !== 'watermark-bg') {
    drawCustomLogo(
      ctx,
      logoImg,
      width,
      height,
      palette,
      customizations.logo.placement,
      customizations.logo.shape
    );
  }

  let hasOverflow = false;
  const overflowFields: string[] = [];

  // 5. If table template (Contributions / Grocery), draw table items
  if (template.isTable) {
    drawTableItems(ctx, options, fontPair.bodyFont, stageOffsetY);
  }

  // 6. Draw fields
  template.fields.forEach((field) => {
    let rawText = fieldValues[field.key] ?? field.default;

    if (personalisedName) {
      rawText = mergeTemplateText(rawText, { name: personalisedName });
    } else {
      rawText = rawText.replace(/\{name\}/gi, 'Honoured Guest');
    }

    const isHeading = field.font === 'heading';
    const isMeta = field.font === 'meta';
    const isMono = field.font === 'mono';

    const targetFont = isHeading ? fontPair.headingFont : isMono ? 'JetBrains Mono' : fontPair.bodyFont;
    const fontWeight = isHeading ? '700' : isMeta ? '600' : '400';

    const wrapResult = wrapAndFitText(
      ctx,
      rawText,
      field.box.width,
      field.box.height,
      field.maxSize * textScale,
      field.minSize * textScale,
      targetFont,
      field.maxLines,
      fontWeight
    );

    if (!wrapResult.fits) {
      hasOverflow = true;
      overflowFields.push(field.label);
    }

    let textColor = palette.text;
    if (isHeading) {
      textColor = palette.text;
    } else if (isMeta || field.font === 'subheading') {
      textColor = palette.accent;
    }

    ctx.fillStyle = textColor;
    ctx.font = `${fontWeight} ${wrapResult.fontSize}px '${targetFont}', sans-serif`;
    ctx.textBaseline = 'top';

    let anchorX = field.box.x;
    if (field.align === 'center') {
      anchorX = field.box.x + field.box.width / 2;
      ctx.textAlign = 'center';
    } else if (field.align === 'right') {
      anchorX = field.box.x + field.box.width;
      ctx.textAlign = 'right';
    } else {
      ctx.textAlign = 'left';
    }

    const startY =
      field.box.y +
      stageOffsetY +
      Math.max(0, (field.box.height - wrapResult.totalHeight) / 2);

    wrapResult.lines.forEach((line, lineIdx) => {
      ctx.fillText(line, anchorX, startY + lineIdx * wrapResult.lineHeight);
    });
  });

  // 7. Offline Scannable QR Code Badge
  if (customizations.qr?.enabled && customizations.qr.value.trim()) {
    drawQrBadge(ctx, customizations.qr.value, customizations.qr.label || 'Scan Link', width, height, palette);
  }

  // 8. Watermark Tag on Free Cards in the clean bottom margin below outer border
  if (!isUnlocked) {
    ctx.save();
    ctx.font = "600 14px 'Lato', sans-serif";
    ctx.textBaseline = 'middle';

    const tagText = 'MADE WITH QUICKCARD';
    const textMetrics = ctx.measureText(tagText);
    const textWidth = textMetrics.width;

    const pillH = 22;
    const pillW = textWidth + 34;
    const pillX = (width - pillW) / 2;
    const pillY = height - 28; // Safely below outer border (height - 40)

    ctx.fillStyle = palette.cardSurface || palette.background;
    ctx.globalAlpha = 0.96;
    ctx.beginPath();
    if (typeof (ctx as any).roundRect === 'function') {
      (ctx as any).roundRect(pillX, pillY, pillW, pillH, 11);
    } else {
      ctx.rect(pillX, pillY, pillW, pillH);
    }
    ctx.fill();

    ctx.strokeStyle = palette.border;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.65;
    ctx.stroke();

    ctx.fillStyle = palette.accent;
    ctx.globalAlpha = 0.9;
    drawDiamond(ctx, pillX + 13, pillY + pillH / 2, 3, palette.accent);

    ctx.fillStyle = palette.secondaryText;
    ctx.globalAlpha = 0.85;
    ctx.textAlign = 'left';
    ctx.fillText(tagText, pillX + 22, pillY + pillH / 2 + 0.5);

    ctx.restore();
  }

  return { hasOverflow, overflowFields };
}

export function exportCanvasImage(
  canvas: HTMLCanvasElement,
  format: 'jpeg' | 'png' = 'jpeg'
): Promise<Blob | null> {
  const mime = format === 'png' ? 'image/png' : 'image/jpeg';
  const quality = format === 'png' ? undefined : 0.93;
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), mime, quality);
  });
}

export function exportCanvasAsJpg(canvas: HTMLCanvasElement, _filename = 'quickcard.jpg'): Promise<Blob | null> {
  return exportCanvasImage(canvas, 'jpeg');
}

export async function downloadCardImage(
  canvas: HTMLCanvasElement,
  cardName: string,
  format: 'jpeg' | 'png' = 'jpeg'
) {
  const safeName = (cardName || 'card')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const ext = format === 'png' ? 'png' : 'jpg';
  const filename = `quickcard-${safeName}.${ext}`;

  const blob = await exportCanvasImage(canvas, format);
  if (!blob) return;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function getCardFile(canvas: HTMLCanvasElement, cardName: string): Promise<File | null> {
  const safeName = (cardName || 'card')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const filename = `quickcard-${safeName}.jpg`;
  const blob = await exportCanvasImage(canvas, 'jpeg');
  if (!blob) return null;
  return new File([blob], filename, { type: 'image/jpeg' });
}

export async function copyCardImageToClipboard(canvas: HTMLCanvasElement): Promise<boolean> {
  try {
    if (typeof navigator === 'undefined' || !navigator.clipboard || typeof ClipboardItem === 'undefined') {
      return false;
    }
    const blob = await exportCanvasImage(canvas, 'png');
    if (!blob) return false;
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    return true;
  } catch (err) {
    console.warn('Clipboard write error:', err);
    return false;
  }
}

export async function shareCardDirectly(
  canvas: HTMLCanvasElement,
  cardName: string,
  text: string
): Promise<{ success: boolean; method: 'web-share' | 'download-fallback'; clipboardCopied?: boolean; error?: string }> {
  try {
    const file = await getCardFile(canvas, cardName);

    if (file && typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: cardName,
        text,
      });
      return { success: true, method: 'web-share' };
    }
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return { success: false, method: 'web-share', error: 'User cancelled share' };
    }
  }

  const clipboardCopied = await copyCardImageToClipboard(canvas);
  await downloadCardImage(canvas, cardName, 'jpeg');
  return { success: true, method: 'download-fallback', clipboardCopied };
}
