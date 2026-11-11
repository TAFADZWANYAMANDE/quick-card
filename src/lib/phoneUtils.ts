/**
 * QuickCard Phone Utilities
 * Spec: Part A5, B4, B10
 * - Numbers are stored as text and normalised to international format
 * - Zimbabwe: country code 263, drop leading 0, strip spaces and symbols
 * - Invalid numbers are flagged, not silently dropped.
 */

export interface PhoneValidationResult {
  raw: string;
  normalized: string;
  isValid: boolean;
  countryCode: string;
  errorMessage?: string;
}

export function cleanPhoneNumber(input: string): PhoneValidationResult {
  const raw = (input || '').trim();
  if (!raw) {
    return {
      raw,
      normalized: '',
      isValid: false,
      countryCode: '',
      errorMessage: 'Phone number is empty',
    };
  }

  // Strip all whitespace, hyphens, parentheses, dots
  let sanitized = raw.replace(/[\s\-\(\)\.]/g, '');

  let countryCode = '263';
  let nationalNumber = '';

  if (sanitized.startsWith('+')) {
    sanitized = sanitized.substring(1);
    // Already has country prefix
    if (sanitized.startsWith('263')) {
      countryCode = '263';
      nationalNumber = sanitized.substring(3);
    } else {
      // General international number (e.g. South Africa 27, UK 44, etc.)
      const match = sanitized.match(/^([1-9][0-9]{0,2})([0-9]{6,12})$/);
      if (match) {
        countryCode = match[1];
        nationalNumber = match[2];
      } else {
        return {
          raw,
          normalized: sanitized,
          isValid: false,
          countryCode: '',
          errorMessage: 'Unrecognized international phone format',
        };
      }
    }
  } else if (sanitized.startsWith('00')) {
    // 00 prefix for international
    sanitized = sanitized.substring(2);
    if (sanitized.startsWith('263')) {
      countryCode = '263';
      nationalNumber = sanitized.substring(3);
    } else {
      countryCode = sanitized.substring(0, 2);
      nationalNumber = sanitized.substring(2);
    }
  } else if (sanitized.startsWith('263')) {
    countryCode = '263';
    nationalNumber = sanitized.substring(3);
  } else if (sanitized.startsWith('0')) {
    // Local Zimbabwean format: 077..., 078..., 071..., 073...
    countryCode = '263';
    nationalNumber = sanitized.substring(1);
  } else if (sanitized.length === 9 && (sanitized.startsWith('77') || sanitized.startsWith('78') || sanitized.startsWith('71') || sanitized.startsWith('73'))) {
    // Entered without leading zero: 771234567
    countryCode = '263';
    nationalNumber = sanitized;
  } else {
    // Other format
    countryCode = '263';
    nationalNumber = sanitized;
  }

  // Check if national number is digits only
  if (!/^\d+$/.test(nationalNumber)) {
    return {
      raw,
      normalized: sanitized,
      isValid: false,
      countryCode,
      errorMessage: 'Phone number contains invalid characters',
    };
  }

  // Check Zimbabwe mobile validation ( Econet 77/78, NetOne 71, Telecel 73 )
  if (countryCode === '263') {
    if (nationalNumber.length !== 9) {
      return {
        raw,
        normalized: `+263${nationalNumber}`,
        isValid: false,
        countryCode,
        errorMessage: `Zimbabwe numbers must have 9 digits after 0 (found ${nationalNumber.length})`,
      };
    }
    const prefix = nationalNumber.substring(0, 2);
    const validPrefixes = ['77', '78', '71', '73', '79'];
    if (!validPrefixes.includes(prefix)) {
      return {
        raw,
        normalized: `+263${nationalNumber}`,
        isValid: false,
        countryCode,
        errorMessage: `Prefix '0${prefix}' is not a standard Zimbabwe mobile network`,
      };
    }
  } else {
    // General international length check: 7-12 digits
    if (nationalNumber.length < 6 || nationalNumber.length > 13) {
      return {
        raw,
        normalized: `+${countryCode}${nationalNumber}`,
        isValid: false,
        countryCode,
        errorMessage: 'International number has unexpected digit count',
      };
    }
  }

  const normalized = `+${countryCode}${nationalNumber}`;
  return {
    raw,
    normalized,
    isValid: true,
    countryCode,
  };
}

/**
 * Parses raw text containing one recipient per line.
 * Lines can be:
 * "Rudo, 0771234567"
 * "Farai - +263782345678"
 * "Tariro: 0712345678"
 * "Mai Chenai 0779998888"
 */
export function parseRecipientList(rawText: string) {
  if (!rawText || !rawText.trim()) return [];

  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  
  return lines.map((line, idx) => {
    let name = '';
    let phoneStr = '';

    // Split on comma, semicolon, tab, or dash
    const delimiters = [',', ';', '\t', ' - '];
    let matchedDelimiter: string | null = null;
    for (const d of delimiters) {
      if (line.includes(d)) {
        matchedDelimiter = d;
        break;
      }
    }

    if (matchedDelimiter) {
      const parts = line.split(matchedDelimiter);
      name = parts[0]?.trim() || '';
      phoneStr = parts.slice(1).join(' ').trim();
    } else {
      // Try to find where numbers start (e.g. "Rudo Chidzero 0771234567")
      const phoneMatch = line.match(/(\+?[0-9\s\-\(\)\.]{7,})$/);
      if (phoneMatch && phoneMatch.index !== undefined) {
        name = line.substring(0, phoneMatch.index).trim();
        phoneStr = phoneMatch[0].trim();
      } else {
        name = line;
        phoneStr = '';
      }
    }

    // Default name if missing
    if (!name && phoneStr) {
      name = `Guest ${idx + 1}`;
    }

    const cleaned = cleanPhoneNumber(phoneStr);

    return {
      id: `rec-${idx}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: name || `Guest ${idx + 1}`,
      rawInput: line,
      phone: cleaned.isValid ? cleaned.normalized : phoneStr,
      isValid: cleaned.isValid,
      status: 'pending' as const,
      validationMessage: cleaned.errorMessage,
    };
  });
}

/**
 * Creates official WhatsApp wa.me link
 * Rule B3: The user taps Send for every message. Never automate sending.
 */
export function createWhatsAppLink(phone: string, message: string): string {
  // strip '+' from normalized phone for wa.me URL
  const cleanNum = phone.replace(/\D/g, '');
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${cleanNum}?text=${encoded}`;
}
