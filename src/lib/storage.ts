import { DraftCard, UnlockLicense } from '../types/template';
import { getOrCreateDeviceId, verifyUnlockCode } from './cryptoUnlock';

const DRAFTS_KEY = 'quickcard_drafts_v1';
const UNLOCK_CODE_KEY = 'quickcard_verified_unlock_code';

export function loadSavedDrafts(): DraftCard[] {
  try {
    const raw = localStorage.getItem(DRAFTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load drafts from storage', err);
    return [];
  }
}

export function saveDraft(draft: DraftCard): DraftCard[] {
  try {
    const drafts = loadSavedDrafts();
    const existingIdx = drafts.findIndex((d) => d.id === draft.id);
    let updated: DraftCard[];
    if (existingIdx >= 0) {
      updated = [...drafts];
      updated[existingIdx] = { ...draft, updatedAt: Date.now() };
    } else {
      updated = [{ ...draft, updatedAt: Date.now() }, ...drafts];
    }
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save draft to storage', err);
    return [];
  }
}

export function deleteDraft(id: string): DraftCard[] {
  try {
    const drafts = loadSavedDrafts();
    const updated = drafts.filter((d) => d.id !== id);
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to delete draft', err);
    return [];
  }
}

/**
 * Loads and cryptographically checks the stored unlock code.
 * Adheres to Rule B5: "Unlock state is derived from a verified code;
 * a plain 'premium' value in storage must never be trusted by itself."
 */
export function getVerifiedUnlockState(): UnlockLicense {
  const deviceId = getOrCreateDeviceId();
  const storedCode = localStorage.getItem(UNLOCK_CODE_KEY);

  if (!storedCode) {
    return {
      isUnlocked: false,
      tier: 'free',
      deviceId,
    };
  }

  const result = verifyUnlockCode(storedCode, deviceId);
  if (result.isValid) {
    return {
      isUnlocked: true,
      tier: result.tier,
      deviceId,
      verifiedCode: storedCode,
      expiresAt: result.expiresAt,
    };
  }

  // If code was tampered with, remove it
  localStorage.removeItem(UNLOCK_CODE_KEY);
  return {
    isUnlocked: false,
    tier: 'free',
    deviceId,
  };
}

export function saveUnlockCode(code: string): { success: boolean; message: string; license: UnlockLicense } {
  const deviceId = getOrCreateDeviceId();
  const result = verifyUnlockCode(code, deviceId);

  if (result.isValid) {
    localStorage.setItem(UNLOCK_CODE_KEY, code.trim());
    return {
      success: true,
      message: result.message,
      license: {
        isUnlocked: true,
        tier: result.tier,
        deviceId,
        verifiedCode: code.trim(),
        expiresAt: result.expiresAt,
      },
    };
  }

  return {
    success: false,
    message: result.message,
    license: {
      isUnlocked: false,
      tier: 'free',
      deviceId,
    },
  };
}

/**
 * Removes unlock code (for testing or reset)
 */
export function resetUnlockState(): UnlockLicense {
  localStorage.removeItem(UNLOCK_CODE_KEY);
  return {
    isUnlocked: false,
    tier: 'free',
    deviceId: getOrCreateDeviceId(),
  };
}

/**
 * Rule B4: "Provide a 'Delete all data' button."
 * Wipes all drafts, recipients, and caches cleanly.
 */
export function deleteAllUserData(): void {
  localStorage.removeItem(DRAFTS_KEY);
  localStorage.removeItem(UNLOCK_CODE_KEY);
  localStorage.removeItem('quickcard_recipients_cache');
  localStorage.removeItem('quickcard_active_draft');
}
