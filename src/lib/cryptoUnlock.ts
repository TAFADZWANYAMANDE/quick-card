import nacl from 'tweetnacl';

/**
 * QuickCard Offline Unlock Cryptography (Ed25519 via tweetnacl)
 * Spec: Part A8, B5, B10
 *
 * Golden Rule B5:
 * - The unlock state is derived from a verified signature check.
 * - The public key is bundled in the app.
 * - The private key stays on the seller's laptop.
 */

// Official Demo Public Key bundled in the app (32 bytes hex)
export const QUICKCARD_PUBLIC_KEY_HEX =
  'bbb96652cc2e13c6bb44e0b1ac5f8e2394bc465942b061b0c813a95b1a5c136e';

// Corresponding Private Key used exclusively by the Seller Signing Tool simulation
// (demonstrating the seller's offline laptop terminal script)
export const DEMO_SELLER_PRIVATE_KEY_HEX =
  'b23a5f4ca7b22ff3fb8a04fb98d4dbf169fb399d7c8c8d6be581f699bb1437f2bbb96652cc2e13c6bb44e0b1ac5f8e2394bc465942b061b0c813a95b1a5c136e';

// Helpers for Uint8Array <-> Hex / Text conversion
function hexToBytes(hex: string): Uint8Array {
  const clean = hex.replace(/[^0-9a-fA-F]/g, '');
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < clean.length; i += 2) {
    bytes[i / 2] = parseInt(clean.substring(i, i + 2), 16);
  }
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function stringToBytes(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

function bytesToString(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

/**
 * Generates or retrieves deterministic/stored Device ID for this device
 * Format: QC-XXXX-YYYY (e.g. QC-7A39-E401)
 */
export function getOrCreateDeviceId(): string {
  const storageKey = 'quickcard_device_id';
  let devId = localStorage.getItem(storageKey);
  if (!devId) {
    const chars = '0123456789ABCDEF';
    const randPart = (len: number) =>
      Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    devId = `QC-${randPart(4)}-${randPart(4)}`;
    localStorage.setItem(storageKey, devId);
  }
  return devId;
}

export interface VerificationResult {
  isValid: boolean;
  tier: 'free' | 'unlocked' | 'event_pass';
  deviceId: string;
  expiresAt?: number;
  message: string;
}

/**
 * Offline Verification function built into the app
 * Code format: Base64(Payload).Hex(Ed25519Signature)
 * Payload format: <deviceId>:<tier>:<expiresAt>
 */
export function verifyUnlockCode(
  code: string,
  currentDeviceId: string,
  publicKeyHex = QUICKCARD_PUBLIC_KEY_HEX
): VerificationResult {
  const cleanCode = (code || '').trim();
  if (!cleanCode) {
    return {
      isValid: false,
      tier: 'free',
      deviceId: currentDeviceId,
      message: 'Code cannot be empty',
    };
  }

  const parts = cleanCode.split('.');
  if (parts.length !== 2) {
    return {
      isValid: false,
      tier: 'free',
      deviceId: currentDeviceId,
      message: 'Invalid code format. Expected payload.signature',
    };
  }

  const [encodedPayload, signatureHex] = parts;

  let payloadStr: string;
  try {
    payloadStr = atob(encodedPayload);
  } catch {
    return {
      isValid: false,
      tier: 'free',
      deviceId: currentDeviceId,
      message: 'Failed to decode code payload',
    };
  }

  // Parse payload
  // Expected format: devId:tier:expiresAt (expiresAt can be '0' for lifetime)
  const payloadSegments = payloadStr.split(':');
  if (payloadSegments.length < 3) {
    return {
      isValid: false,
      tier: 'free',
      deviceId: currentDeviceId,
      message: 'Malformed license payload contents',
    };
  }

  const [codeDevId, tierStr, expiresAtStr] = payloadSegments;

  // 1. Check Device ID match
  if (codeDevId.toUpperCase() !== currentDeviceId.toUpperCase()) {
    return {
      isValid: false,
      tier: 'free',
      deviceId: currentDeviceId,
      message: `Code was issued for device ${codeDevId}, not this phone (${currentDeviceId})`,
    };
  }

  // 2. Check Expiration
  const expiresAt = parseInt(expiresAtStr, 10);
  if (expiresAt > 0 && Date.now() > expiresAt) {
    return {
      isValid: false,
      tier: 'free',
      deviceId: currentDeviceId,
      expiresAt,
      message: `Code expired on ${new Date(expiresAt).toLocaleDateString()}`,
    };
  }

  // 3. Cryptographic Signature Verification using Ed25519
  try {
    const pubKeyBytes = hexToBytes(publicKeyHex);
    const sigBytes = hexToBytes(signatureHex);
    const messageBytes = stringToBytes(payloadStr);

    if (sigBytes.length !== 64) {
      return {
        isValid: false,
        tier: 'free',
        deviceId: currentDeviceId,
        message: 'Invalid signature length',
      };
    }

    const verified = nacl.sign.detached.verify(messageBytes, sigBytes, pubKeyBytes);
    if (!verified) {
      return {
        isValid: false,
        tier: 'free',
        deviceId: currentDeviceId,
        message: 'Cryptographic signature mismatch. Tampered or counterfeit code.',
      };
    }

    const validTier = tierStr === 'event_pass' ? 'event_pass' : 'unlocked';
    return {
      isValid: true,
      tier: validTier,
      deviceId: currentDeviceId,
      expiresAt: expiresAt > 0 ? expiresAt : undefined,
      message:
        validTier === 'unlocked'
          ? 'Lifetime QuickCard license verified offline! Watermark removed & 100 recipients unlocked.'
          : '30-Day Event Pass verified! Unlimited recipients unlocked.',
    };
  } catch (err) {
    return {
      isValid: false,
      tier: 'free',
      deviceId: currentDeviceId,
      message: `Verification error: ${(err as Error).message}`,
    };
  }
}

/**
 * Seller Signing Tool (Simulation of the offline python/node script on the seller's laptop)
 * In production, the seller runs this offline when a customer sends EcoCash proof and their Device ID.
 */
export function generateSellerUnlockCode(
  deviceId: string,
  tier: 'unlocked' | 'event_pass' = 'unlocked',
  daysValid = 30,
  sellerPrivateKeyHex = DEMO_SELLER_PRIVATE_KEY_HEX
): string {
  const cleanDevId = deviceId.trim().toUpperCase();
  const expiresAt = tier === 'event_pass' ? Date.now() + daysValid * 24 * 60 * 60 * 1000 : 0;
  const payloadStr = `${cleanDevId}:${tier}:${expiresAt}`;

  const privKeyBytes = hexToBytes(sellerPrivateKeyHex);
  const messageBytes = stringToBytes(payloadStr);

  const signature = nacl.sign.detached(messageBytes, privKeyBytes);
  const signatureHex = bytesToHex(signature);
  const encodedPayload = btoa(payloadStr);

  return `${encodedPayload}.${signatureHex}`;
}
