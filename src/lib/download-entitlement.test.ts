import { describe, expect, it } from "vitest";
import { getDownloadEntitlement } from "./download-entitlement";

describe("getDownloadEntitlement", () => {
  it("requires payment for a Free applicant", () => {
    expect(getDownloadEntitlement("Free")).toEqual({ allowed: false, remaining: 0 });
  });

  it.each(["Resident", "Program"] as const)("allows unlimited %s downloads", (plan) => {
    expect(getDownloadEntitlement(plan)).toEqual({ allowed: true, remaining: null });
  });
});
