import { beforeEach, describe, expect, it, vi } from "vitest";
import { addHistoryRecord, getHistory } from "./eras-storage";
import { isPhotoHistoryEnabled, setPhotoHistoryEnabled } from "./privacy-settings";

const values = new Map<string, string>();

beforeEach(() => {
  values.clear();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  });
});

describe("photo history", () => {
  it("saves successful downloads by default so they appear in My Photos", () => {
    expect(isPhotoHistoryEnabled()).toBe(true);

    addHistoryRecord({
      id: "photo-1",
      name: "headshot_eras.jpg",
      sizeKB: 92.4,
      date: "Jul 16, 2026",
      thumbnail: "data:image/jpeg;base64,photo",
    });

    expect(getHistory()).toHaveLength(1);
    expect(getHistory()[0]?.name).toBe("headshot_eras.jpg");
  });

  it("respects a user explicitly turning photo history off", () => {
    setPhotoHistoryEnabled(false);

    addHistoryRecord({
      id: "photo-1",
      name: "headshot_eras.jpg",
      sizeKB: 92.4,
      date: "Jul 16, 2026",
      thumbnail: "data:image/jpeg;base64,photo",
    });

    expect(getHistory()).toEqual([]);
  });
});
