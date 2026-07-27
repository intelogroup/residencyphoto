import { getTableName } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { applicantProfiles, photoRecords } from "./schema";

describe("application database schema", () => {
  it("keeps application profiles separate from Neon Auth-owned tables", () => {
    expect(getTableName(applicantProfiles)).toBe("applicant_profiles");
    expect(applicantProfiles.userId.primary).toBe(true);
    expect(applicantProfiles.downloadCount.notNull).toBe(true);
  });

  it("associates persisted photo metadata with an authenticated user", () => {
    expect(getTableName(photoRecords)).toBe("photo_records");
    expect(photoRecords.userId.notNull).toBe(true);
    expect(photoRecords.createdAt.notNull).toBe(true);
  });
});
