import { DraftCard, UnlockLicense, ContactGroup, Recipient } from '../types/template';
import { getOrCreateDeviceId, verifyUnlockCode } from './cryptoUnlock';

const DRAFTS_KEY = 'quickcard_drafts_v1';
const UNLOCK_CODE_KEY = 'quickcard_verified_unlock_code';
const CONTACT_GROUPS_KEY = 'quickcard_contact_groups_v1';
const QUEUE_STATE_KEY = 'quickcard_queue_state_v1';

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

export function loadContactGroups(): ContactGroup[] {
  try {
    const raw = localStorage.getItem(CONTACT_GROUPS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveContactGroup(name: string, rawText: string, count: number): ContactGroup[] {
  try {
    const groups = loadContactGroups();
    const newGroup: ContactGroup = {
      id: `grp-${Date.now()}`,
      name: name.trim() || 'Saved Group',
      rawText,
      count,
      updatedAt: Date.now(),
    };
    const updated = [newGroup, ...groups.filter((g) => g.name.toLowerCase() !== newGroup.name.toLowerCase())];
    localStorage.setItem(CONTACT_GROUPS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function deleteContactGroup(id: string): ContactGroup[] {
  try {
    const groups = loadContactGroups();
    const updated = groups.filter((g) => g.id !== id);
    localStorage.setItem(CONTACT_GROUPS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export interface PersistedQueueState {
  rawText: string;
  messageTemplate: string;
  recipients: Recipient[];
  currentIndex: number;
  step: 'input' | 'queue' | 'finished';
  updatedAt: number;
}

export function loadPersistedQueue(): PersistedQueueState | null {
  try {
    const raw = localStorage.getItem(QUEUE_STATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.recipients)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function savePersistedQueue(state: PersistedQueueState): void {
  try {
    localStorage.setItem(QUEUE_STATE_KEY, JSON.stringify({ ...state, updatedAt: Date.now() }));
  } catch {
    // ignore quota errors
  }
}

export function clearPersistedQueue(): void {
  localStorage.removeItem(QUEUE_STATE_KEY);
}

/**
 * Full offline JSON backup export & import
 */
export function exportAllBackupJson(): string {
  const backup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    drafts: loadSavedDrafts(),
    contactGroups: loadContactGroups(),
    appTheme: localStorage.getItem('quickcard_app_theme') || 'dark-slate',
  };
  return JSON.stringify(backup, null, 2);
}

export function importAllBackupJson(jsonStr: string): { success: boolean; draftsCount: number; groupsCount: number; message: string } {
  try {
    const parsed = JSON.parse(jsonStr);
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, draftsCount: 0, groupsCount: 0, message: 'Invalid backup file format.' };
    }
    let draftsCount = 0;
    let groupsCount = 0;
    if (Array.isArray(parsed.drafts)) {
      const existing = loadSavedDrafts();
      const existingIds = new Set(existing.map((d) => d.id));
      const merged = [...parsed.drafts.filter((d: DraftCard) => !existingIds.has(d.id)), ...existing];
      localStorage.setItem(DRAFTS_KEY, JSON.stringify(merged));
      draftsCount = parsed.drafts.length;
    }
    if (Array.isArray(parsed.contactGroups)) {
      const existingG = loadContactGroups();
      const existingIds = new Set(existingG.map((g) => g.id));
      const mergedG = [...parsed.contactGroups.filter((g: ContactGroup) => !existingIds.has(g.id)), ...existingG];
      localStorage.setItem(CONTACT_GROUPS_KEY, JSON.stringify(mergedG));
      groupsCount = parsed.contactGroups.length;
    }
    return {
      success: true,
      draftsCount,
      groupsCount,
      message: `Restored ${draftsCount} draft(s) and ${groupsCount} contact group(s)!`,
    };
  } catch {
    return { success: false, draftsCount: 0, groupsCount: 0, message: 'Could not read JSON backup file.' };
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
  localStorage.removeItem(CONTACT_GROUPS_KEY);
  localStorage.removeItem(QUEUE_STATE_KEY);
  localStorage.removeItem('quickcard_recipients_cache');
  localStorage.removeItem('quickcard_active_draft');
}
