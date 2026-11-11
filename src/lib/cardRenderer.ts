import { CardTemplate, Palette, FontPair, Decoration } from '../types/template';
import { mergeTemplateText } from './mergeUtils';

export interface RenderCardOptions {
  template: CardTemplate;
  fieldValues: Record<string, string>;
  palette: Palette;
  fontPair: FontPair;
  isUnlocked?: boolean;
  personalisedName?: string;
  tableItems?: Array<{ id: string; name: string; amount: number; checked?: boolean }>;
}

export interface TextWrapResult {
  lines: string[];
  fontSize: number;
  lineHeight: number;
  fits: boolean;
  totalHeight: number;
}

/**
 * Text wrapping and shrinking engine (Spec: Part A7, B6, B10)
 * Wraps text inside box width, and shrinks font size from maxSize down towards minSize.
 * If text still doesn't fit within maxHeight or maxLines, sets fits = false.
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

  // Split into explicit paragraphs first
  const rawParagraphs = text.split('\n');

  let bestLines: string[] = [];
  let bestFontSize = minSize;
  let fits = false;

  // Search downwards in font size from maxSize to minSize
  for (let currentSize = maxSize; currentSize >= minSize; currentSize -= 2) {
    ctx.font = `${fontWeight} ${currentSize}px '${fontFamily}', sans-serif`;
    const lineHeight = currentSize * 1.28;

    const wrappedLines: string[] = [];
    let lineLimitExceeded = false;

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
          // If a single word is wider than maxWidth, let it wrap or break
          const singleWordWidth = ctx.measureText(words[i]).width;
          if (singleWordWidth > maxWidth) {
            // Word is too wide even on its own line
          }
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

    // Keep the minimum size lines as fallback if none fit completely
    if (currentSize === minSize) {
      bestLines = wrappedLines;
      bestFontSize = minSize;
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

/**
 * Renders decorative vector ornaments (Rule B6, B7: SVG decorations drawn by us)
 */
function drawDecoration(
  ctx: CanvasRenderingContext2D,
  dec: Decoration,
  palette: Palette
) {
  ctx.save();
  ctx.globalAlpha = dec.opacity ?? 1;

  let color = palette.accent;
  if (dec.color === 'border') color = palette.border;
  if (dec.color === 'text') color = palette.text;
  if (dec.color === 'secondaryText') color = palette.secondaryText;

  ctx.strokeStyle = color;
  ctx.fillStyle = color;

  const { x, y, width, height } = dec;

  if (dec.type === 'border') {
    // Bold outer hairline (4px)
    ctx.lineWidth = 4;
    ctx.strokeStyle = palette.border || color;
    ctx.strokeRect(x, y, width, height);

    // Inner inset accent line (2px, 16px inset)
    ctx.lineWidth = 2;
    ctx.strokeStyle = palette.accent;
    ctx.strokeRect(x + 16, y + 16, width - 32, height - 32);

    // Corner diamond flourishes
    const drawDiamond = (cx: number, cy: number, size = 6) => {
      ctx.fillStyle = palette.accent;
      ctx.beginPath();
      ctx.moveTo(cx, cy - size);
      ctx.lineTo(cx + size, cy);
      ctx.lineTo(cx, cy + size);
      ctx.lineTo(cx - size, cy);
      ctx.closePath();
      ctx.fill();
    };

    drawDiamond(x + 16, y + 16, 7);
    drawDiamond(x + width - 16, y + 16, 7);
    drawDiamond(x + 16, y + height - 16, 7);
    drawDiamond(x + width - 16, y + height - 16, 7);
  } else if (dec.type === 'divider') {
    ctx.beginPath();
    ctx.lineWidth = height || 2;
    ctx.strokeStyle = palette.accent;
    ctx.moveTo(x, y);
    ctx.lineTo(x + width, y);
    ctx.stroke();

    // Central divider diamond knot
    const midX = x + width / 2;
    ctx.fillStyle = palette.accent;
    ctx.beginPath();
    ctx.moveTo(midX, y - 7);
    ctx.lineTo(midX + 8, y);
    ctx.lineTo(midX, y + 7);
    ctx.lineTo(midX - 8, y);
    ctx.closePath();
    ctx.fill();

    // Flanking anchor dots
    ctx.beginPath();
    ctx.arc(midX - 18, y, 2.5, 0, Math.PI * 2);
    ctx.arc(midX + 18, y, 2.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (dec.type === 'cross') {
    // Reverent Latin Cross
    const cx = x + width / 2;
    const topY = y;
    const bottomY = y + height;
    const barY = y + height * 0.32;
    const barHalfWidth = width * 0.38;

    ctx.lineWidth = 4;
    ctx.lineCap = 'round';

    // Vertical beam
    ctx.beginPath();
    ctx.moveTo(cx, topY);
    ctx.lineTo(cx, bottomY);
    ctx.stroke();

    // Horizontal beam
    ctx.beginPath();
    ctx.moveTo(cx - barHalfWidth, barY);
    ctx.lineTo(cx + barHalfWidth, barY);
    ctx.stroke();

    // Small subtle center glint
    ctx.beginPath();
    ctx.arc(cx, barY, 3, 0, Math.PI * 2);
    ctx.fill();
  } else if (dec.type === 'rings') {
    // Interlocking Wedding Rings
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

    // Small diamond atop one ring
    ctx.beginPath();
    ctx.arc(cx2, cy2 - r, 3.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (dec.type === 'floral') {
    // Gentle botanical olive / laurel branch
    const cx = x + width / 2;
    const cy = y + height / 2;

    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy + 20, 40, Math.PI * 0.8, Math.PI * 2.2);
    ctx.stroke();

    // Leaves
    for (let angle = 0.9; angle <= 2.1; angle += 0.3) {
      const lx = cx + Math.cos(angle * Math.PI) * 40;
      const ly = cy + 20 + Math.sin(angle * Math.PI) * 40;
      ctx.beginPath();
      ctx.ellipse(lx, ly, 6, 3, angle, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (dec.type === 'confetti') {
    // Joyful celebration stars/dots
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
    // Scholastic crest/book shield
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
  startY = 340,
  maxTableHeight = 480
) {
  const { template, palette, tableItems = [] } = options;
  const config = template.tableConfig || {
    itemLabel: 'Item',
    valueLabel: 'Amount',
    isCurrency: true,
    unit: '$',
  };

  const leftX = 110;
  const rightX = 970;
  const rowHeight = 44;
  let currentY = startY;

  // Header row
  ctx.font = `600 24px '${fontFamily}', sans-serif`;
  ctx.fillStyle = palette.secondaryText;
  ctx.textAlign = 'left';
  ctx.fillText(config.itemLabel.toUpperCase(), leftX, currentY);

  ctx.textAlign = 'right';
  ctx.fillText(config.valueLabel.toUpperCase(), rightX, currentY);

  currentY += 28;

  // Thin header rule
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

    // Alternating zebra subtle band
    if (idx % 2 === 1) {
      ctx.fillStyle = palette.text;
      ctx.save();
      ctx.globalAlpha = 0.04;
      ctx.fillRect(leftX - 10, currentY - 26, rightX - leftX + 20, 36);
      ctx.restore();
    }

    // Item name
    ctx.font = `400 26px '${fontFamily}', sans-serif`;
    ctx.fillStyle = palette.text;
    ctx.textAlign = 'left';

    // Dot leader or check box
    const checkPrefix = item.checked ? '✓ ' : '';
    ctx.fillText(`${checkPrefix}${item.name}`, leftX, currentY);

    // Value
    ctx.font = `600 26px 'JetBrains Mono', monospace`;
    ctx.fillStyle = palette.accent;
    ctx.textAlign = 'right';

    let valStr = `${item.amount}`;
    if (config.isCurrency) {
      valStr = `$${Number(item.amount).toFixed(2)}`;
    } else if (config.unit) {
      valStr = `${item.amount} ${config.unit}`;
    }
    ctx.fillText(valStr, rightX, currentY);

    currentY += rowHeight;
  });

  // Total summary footer
  const totalY = 880;
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
  const totalFormatted = config.isCurrency
    ? `$${totalSum.toFixed(2)} USD`
    : `${totalSum} ITEMS`;
  ctx.fillText(totalFormatted, rightX, totalY + 12);
}

/**
 * Primary Canvas Card Drawing Function
 * Output: renders onto canvas, returns status and any text overflow warnings.
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
  } = options;

  const width = template.size.width;
  const height = template.size.height;

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return { hasOverflow: false, overflowFields: [] };

  // 1. Draw solid background
  ctx.fillStyle = palette.background;
  ctx.fillRect(0, 0, width, height);

  // 2. Draw subtle paper/grain card surface if specified
  if (palette.cardSurface) {
    ctx.fillStyle = palette.cardSurface;
    ctx.fillRect(30, 30, width - 60, height - 60);
  }

  // 3. Draw decorations
  if (template.decorations) {
    template.decorations.forEach((dec) => {
      drawDecoration(ctx, dec, palette);
    });
  }

  let hasOverflow = false;
  const overflowFields: string[] = [];

  // 4. If table template (Contributions / Grocery), draw table items
  if (template.isTable) {
    drawTableItems(ctx, options, fontPair.bodyFont);
  }

  // 5. Draw fields
  template.fields.forEach((field) => {
    let rawText = fieldValues[field.key] ?? field.default;

    // Apply {name} merge if personalised or if field is marked
    if (personalisedName) {
      rawText = mergeTemplateText(rawText, { name: personalisedName });
    } else {
      // If no personalised name supplied, show fallback
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
      field.maxSize,
      field.minSize,
      targetFont,
      field.maxLines,
      fontWeight
    );

    if (!wrapResult.fits) {
      hasOverflow = true;
      overflowFields.push(field.label);
    }

    // Set field color
    let textColor = palette.text;
    if (isHeading) {
      textColor = palette.text;
    } else if (isMeta) {
      textColor = palette.accent;
    } else if (field.font === 'subheading') {
      textColor = palette.accent;
    }

    ctx.fillStyle = textColor;
    ctx.font = `${fontWeight} ${wrapResult.fontSize}px '${targetFont}', sans-serif`;
    ctx.textBaseline = 'top';

    // Alignment
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

    // Vertically center lines within box
    const startY =
      field.box.y +
      Math.max(0, (field.box.height - wrapResult.totalHeight) / 2);

    wrapResult.lines.forEach((line, lineIdx) => {
      ctx.fillText(line, anchorX, startY + lineIdx * wrapResult.lineHeight);
    });
  });

  // 6. Watermark Tag on Free Cards (Rule A3: "Small 'Made with QuickCard' tag on free cards. Unlock removes tag.")
  if (!isUnlocked) {
    ctx.save();
    ctx.font = "600 20px 'Lato', sans-serif";
    ctx.fillStyle = palette.secondaryText;
    ctx.globalAlpha = 0.75;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText('Made with QuickCard', width - 50, height - 48);

    // Subtle diamond icon
    ctx.fillStyle = palette.accent;
    ctx.beginPath();
    const iconX = width - 268;
    const iconY = height - 58;
    ctx.arc(iconX, iconY, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  return { hasOverflow, overflowFields };
}

/**
 * Exports current canvas as high-res 1080x1080 JPEG
 */
export function exportCanvasAsJpg(canvas: HTMLCanvasElement, filename = 'quickcard.jpg'): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        resolve(blob);
      },
      'image/jpeg',
      0.92
    );
  });
}

/**
 * Triggers instant browser download of the generated card
 */
export async function downloadCardImage(canvas: HTMLCanvasElement, cardName: string) {
  const safeName = (cardName || 'card')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const filename = `quickcard-${safeName}.jpg`;

  const blob = await exportCanvasAsJpg(canvas, filename);
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
