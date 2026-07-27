// IndexedDB-backed persistence for the active in-progress photo. localStorage
// (eras-storage.ts) caps around 5-10MB and stores strings only — unsafe for
// full-size JPEG/PNG blobs, so those live here instead. Single active slot:
// loading a new photo replaces whatever was saved, matching the single-editor
// session UX (see EditorPanel.tsx).

export interface PhotoEditState {
  zoom: number;
  rotation: number;
  position: { x: number; y: number };
  filters: { brightness: number; contrast: number; saturation: number; warmth: number; bgBoost: number };
}

export interface StoredPhoto {
  id: string;
  blob: Blob;
  name: string;
  sizeKB: number;
  format: string;
  savedAt: number;
  expiresAt: number;
  editState: PhotoEditState;
}

const DB_NAME = "eras-photos";
const DB_VERSION = 1;
const STORE_NAME = "photos";
const ACTIVE_ID = "active";
const TTL_MS = 30 * 24 * 60 * 60 * 1000;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode);
    const request = fn(tx.objectStore(STORE_NAME));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}

// Saves/replaces the single active photo, resetting its 30-day expiry.
export async function savePhoto(
  data: Pick<StoredPhoto, "blob" | "name" | "sizeKB" | "format" | "editState">
): Promise<void> {
  const savedAt = Date.now();
  const record: StoredPhoto = { id: ACTIVE_ID, ...data, savedAt, expiresAt: savedAt + TTL_MS };
  await withStore("readwrite", (store) => store.put(record));
}

// Debounced by the caller — only touches editState, keeps savedAt/expiresAt.
export async function updatePhotoEditState(editState: PhotoEditState): Promise<void> {
  const existing = await getActivePhoto();
  if (!existing) return;
  await withStore("readwrite", (store) => store.put({ ...existing, editState }));
}

export async function getActivePhoto(): Promise<StoredPhoto | null> {
  const record = await withStore<StoredPhoto | undefined>("readonly", (store) => store.get(ACTIVE_ID));
  if (!record) return null;
  if (record.expiresAt < Date.now()) {
    await clearPhotos();
    return null;
  }
  return record;
}

export async function clearPhotos(): Promise<void> {
  await withStore("readwrite", (store) => store.delete(ACTIVE_ID));
}

// Lazily called on mount — with a single active slot this is equivalent to
// checking getActivePhoto's own expiry, but kept as an explicit entry point
// so a future multi-slot store only needs to change this function.
export async function purgeExpired(): Promise<void> {
  await getActivePhoto();
}
