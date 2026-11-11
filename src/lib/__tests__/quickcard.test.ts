import { describe, it, expect } from 'vitest';
import { cleanPhoneNumber, parseRecipientList } from '../phoneUtils';
import { mergeTemplateText } from '../mergeUtils';
import {
  verifyUnlockCode,
  generateSellerUnlockCode,
  QUICKCARD_PUBLIC_KEY_HEX,
} from '../cryptoUnlock';
import { STARTER_TEMPLATES } from '../templates';

describe('Phone Number Cleaning (Rule B10)', () => {
  it('normalises standard Zimbabwe mobile with leading 0 (077...) to +26377...', () => {
    const res = cleanPhoneNumber('0771234567');
    expect(res.isValid).toBe(true);
    expect(res.normalized).toBe('+263771234567');
    expect(res.countryCode).toBe('263');
  });

  it('normalises NetOne (071...) and Telecel (073...)', () => {
    const netOne = cleanPhoneNumber('0712345678');
    expect(netOne.isValid).toBe(true);
    expect(netOne.normalized).toBe('+263712345678');

    const telecel = cleanPhoneNumber('0732345678');
    expect(telecel.isValid).toBe(true);
    expect(telecel.normalized).toBe('+263732345678');
  });

  it('strips spaces, hyphens, and brackets from phone numbers', () => {
    const res = cleanPhoneNumber('+263 (77) 123-4567');
    expect(res.isValid).toBe(true);
    expect(res.normalized).toBe('+263771234567');
  });

  it('flags phone number that is too short', () => {
    const res = cleanPhoneNumber('077123');
    expect(res.isValid).toBe(false);
    expect(res.errorMessage).toContain('must have 9 digits');
  });

  it('flags invalid network prefix', () => {
    const res = cleanPhoneNumber('0721234567'); // 72 is not valid in Zimbabwe
    expect(res.isValid).toBe(false);
    expect(res.errorMessage).toContain('not a standard Zimbabwe mobile');
  });

  it('handles international numbers correctly', () => {
    const res = cleanPhoneNumber('+27821234567'); // South Africa
    expect(res.isValid).toBe(true);
    expect(res.normalized).toBe('+27821234567');
  });
});

describe('Recipient List Parsing', () => {
  it('parses comma-separated "Name, 077..." lines', () => {
    const input = `Rudo, 0771234567\nFarai, 0782345678\nTariro, 0712345678`;
    const recipients = parseRecipientList(input);
    expect(recipients.length).toBe(3);
    expect(recipients[0].name).toBe('Rudo');
    expect(recipients[0].phone).toBe('+263771234567');
    expect(recipients[0].isValid).toBe(true);
    expect(recipients[1].name).toBe('Farai');
    expect(recipients[2].name).toBe('Tariro');
  });

  it('handles missing names and assigns fallback', () => {
    const input = `0771234567`;
    const recipients = parseRecipientList(input);
    expect(recipients.length).toBe(1);
    expect(recipients[0].name).toBe('Guest 1');
    expect(recipients[0].phone).toBe('+263771234567');
  });
});

describe('{name} Merge Utilities (Rule B10)', () => {
  it('replaces {name} case-insensitively', () => {
    const text = 'Hello {name}, you are warmly invited. RSVP for {NAME}.';
    const merged = mergeTemplateText(text, { name: 'Nyasha' });
    expect(merged).toBe('Hello Nyasha, you are warmly invited. RSVP for Nyasha.');
  });

  it('handles missing or empty name gracefully with Friend fallback', () => {
    const text = 'Dearest {name}, please join us!';
    const merged = mergeTemplateText(text, { name: '' });
    expect(merged).toBe('Dearest Friend, please join us!');
  });

  it('handles special characters and spaces in names', () => {
    const text = 'Welcome {name} to the celebration';
    const merged = mergeTemplateText(text, { name: "O'Connor & Chipo" });
    expect(merged).toBe("Welcome O'Connor & Chipo to the celebration");
  });
});

describe('Offline Unlock Codes via Ed25519 (Rule A8, B5, B10)', () => {
  const deviceA = 'QC-8419-BC01';
  const deviceB = 'QC-9999-0000';

  it('verifies a genuine signed code for the correct device ID', () => {
    const validCode = generateSellerUnlockCode(deviceA, 'unlocked');
    const result = verifyUnlockCode(validCode, deviceA, QUICKCARD_PUBLIC_KEY_HEX);

    expect(result.isValid).toBe(true);
    expect(result.tier).toBe('unlocked');
    expect(result.message).toContain('Lifetime QuickCard license verified');
  });

  it('rejects a code issued for a different device ID', () => {
    const codeForA = generateSellerUnlockCode(deviceA, 'unlocked');
    const result = verifyUnlockCode(codeForA, deviceB, QUICKCARD_PUBLIC_KEY_HEX);

    expect(result.isValid).toBe(false);
    expect(result.message).toContain(`Code was issued for device ${deviceA}, not this phone`);
  });

  it('rejects tampered signature', () => {
    const validCode = generateSellerUnlockCode(deviceA, 'unlocked');
    const [payload, sig] = validCode.split('.');
    // Corrupt last character of signature hex
    const corruptedSig = sig.slice(0, -1) + (sig.slice(-1) === 'a' ? 'b' : 'a');
    const tamperedCode = `${payload}.${corruptedSig}`;

    const result = verifyUnlockCode(tamperedCode, deviceA, QUICKCARD_PUBLIC_KEY_HEX);
    expect(result.isValid).toBe(false);
    expect(result.message).toContain('signature mismatch');
  });

  it('rejects an expired Event Pass code', () => {
    // Generate an expired code by passing -1 days
    const expiredCode = generateSellerUnlockCode(deviceA, 'event_pass', -1);
    const result = verifyUnlockCode(expiredCode, deviceA, QUICKCARD_PUBLIC_KEY_HEX);

    expect(result.isValid).toBe(false);
    expect(result.message).toContain('Code expired');
  });

  it('rejects empty or malformed code string', () => {
    const emptyResult = verifyUnlockCode('', deviceA);
    expect(emptyResult.isValid).toBe(false);

    const junkResult = verifyUnlockCode('RANDOM_JUNK_CODE', deviceA);
    expect(junkResult.isValid).toBe(false);
  });
});

describe('Starter Templates Validation (Rule A9, B6)', () => {
  it('contains exactly 12 starter templates', () => {
    expect(STARTER_TEMPLATES.length).toBe(12);
  });

  it('ensures every template has 1080x1080 size and at least 4 palettes', () => {
    STARTER_TEMPLATES.forEach((template) => {
      expect(template.size.width).toBe(1080);
      expect(template.size.height).toBe(1080);
      expect(template.palettes.length).toBeGreaterThanOrEqual(4);
      expect(template.fontPairs.length).toBeGreaterThanOrEqual(2);
      expect(template.fields.length).toBeGreaterThan(0);
    });
  });

  it('ensures funeral notice (template #6) avoids cartoonish palettes', () => {
    const funeral = STARTER_TEMPLATES.find((t) => t.id === 'funeral-notice-06');
    expect(funeral).toBeDefined();
    expect(funeral?.name).toContain('Funeral');
    // Calm, solemn palettes
    const paletteNames = funeral?.palettes.map((p) => p.name.toLowerCase()).join(' ');
    expect(paletteNames).toContain('charcoal');
  });
});
