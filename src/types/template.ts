export type OccasionType =
  | 'church'
  | 'wedding'
  | 'funeral'
  | 'birthday'
  | 'savings'
  | 'lists';

export interface FieldBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type FieldFontType = 'heading' | 'subheading' | 'body' | 'meta' | 'mono';
export type TextAlign = 'center' | 'left' | 'right';

export interface TemplateField {
  key: string;
  label: string;
  default: string;
  box: FieldBox;
  font: FieldFontType;
  maxSize: number;
  minSize: number;
  align: TextAlign;
  maxLines: number;
  isMultiline?: boolean;
  isPersonalisedName?: boolean;
}

export interface Palette {
  id: string;
  name: string;
  background: string;
  cardSurface?: string;
  text: string;
  accent: string;
  secondaryText: string;
  border: string;
}

export interface FontPair {
  id: string;
  name: string;
  headingFont: string;
  bodyFont: string;
}

export interface Decoration {
  type: 'border' | 'cross' | 'rings' | 'floral' | 'ribbon' | 'confetti' | 'banner' | 'divider' | 'columns';
  color?: 'accent' | 'border' | 'text' | 'secondaryText';
  x: number;
  y: number;
  width: number;
  height: number;
  opacity?: number;
}

export interface CardTemplate {
  version: 1;
  id: string;
  occasion: OccasionType;
  occasionName: string;
  name: string;
  tagline: string;
  size: { width: number; height: number };
  decorations: Decoration[];
  fields: TemplateField[];
  palettes: Palette[];
  fontPairs: FontPair[];
  defaultValues: Record<string, string>;
  isTable?: boolean; // For Contributions Record & Grocery List
  tableConfig?: {
    itemLabel: string;
    valueLabel: string;
    unit?: string;
    isCurrency?: boolean;
  };
}

export interface Recipient {
  id: string;
  name: string;
  rawInput: string;
  phone: string;
  isValid: boolean;
  status: 'pending' | 'sent' | 'skipped';
  validationMessage?: string;
}

export interface DraftCard {
  id: string;
  templateId: string;
  updatedAt: number;
  name: string;
  paletteId: string;
  fontPairId: string;
  fieldValues: Record<string, string>;
  tableItems?: Array<{ id: string; name: string; amount: number; checked?: boolean }>;
}

export interface UnlockLicense {
  isUnlocked: boolean;
  tier: 'free' | 'unlocked' | 'event_pass';
  deviceId: string;
  verifiedCode?: string;
  expiresAt?: number;
}
