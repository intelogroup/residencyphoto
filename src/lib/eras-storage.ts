// Single point of access for the two localStorage-backed "tables" this demo
// uses instead of a real backend (see AGENTS.md / no server exists yet).
// Every read/parse/write used to be copy-pasted across 6 components; centralized
// here so a schema change (e.g. adding `plan`) only touches one file.

export interface EraUser {
  authId?: string;
  email: string;
  name: string;
  plan?: "Free" | "Resident" | "Program";
  token?: string;
  createdAt?: string;
}

export interface HistoryRecord {
  id: string;
  name: string;
  sizeKB: number;
  date: string;
  thumbnail: string;
  expiresAt?: number;
}

const USER_KEY = "eras_user";
const HISTORY_KEY = "eras_history";
const HISTORY_LIMIT = 20;
const HISTORY_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function readJSON<T>(key: string): T | null {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Failed to parse localStorage key "${key}"`, err);
    return null;
  }
}

export function getUser(): EraUser | null {
  return readJSON<EraUser>(USER_KEY);
}

export function saveUser(user: EraUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// Reads the current user, applies patch, writes it back. Used by settings
// (name edit, plan upgrade) where callers only know the field they're changing.
export function updateUser(patch: Partial<EraUser>): EraUser | null {
  const current = getUser();
  if (!current) return null;
  const updated = { ...current, ...patch };
  saveUser(updated);
  return updated;
}

export function clearUser(): void {
  localStorage.removeItem(USER_KEY);
}

export function getHistory(): HistoryRecord[] {
  const now = Date.now();
  const all = readJSON<HistoryRecord[]>(HISTORY_KEY) ?? [];
  const fresh = all.filter((record) => !record.expiresAt || record.expiresAt > now);
  if (fresh.length !== all.length) {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(fresh));
  }
  return fresh;
}

export function addHistoryRecord(record: Omit<HistoryRecord, "expiresAt">): void {
  if (!isPhotoHistoryEnabled()) return;
  const withExpiry: HistoryRecord = { ...record, expiresAt: Date.now() + HISTORY_TTL_MS };
  const history = [withExpiry, ...getHistory()].slice(0, HISTORY_LIMIT);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}

export function removeHistoryRecord(id: string): void {
  const history = getHistory().filter((item) => item.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}
import { isPhotoHistoryEnabled } from "./privacy-settings";
