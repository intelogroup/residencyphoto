import { describe, expect, it } from "vitest";
import { sanitizeErrorMessage } from "./analytics-client";

describe("sanitizeErrorMessage", () => {
  it("redacts emails, tokens, and key=value secrets", () => {
    const cleaned = sanitizeErrorMessage(
      "Failed for user jim@example.com with token abcdefghijklmnopqrstuvwxyz0123456789 and code=secret-code-123",
    );
    expect(cleaned).not.toContain("jim@example.com");
    expect(cleaned).not.toContain("abcdefghijklmnopqrstuvwxyz0123456789");
    expect(cleaned).not.toContain("secret-code-123");
    expect(cleaned).toContain("[email]");
  });

  it("keeps ordinary error text and caps length", () => {
    expect(sanitizeErrorMessage("We could not authorize this download.")).toBe(
      "We could not authorize this download.",
    );
    // A long run of ordinary words (no 32+ char token-shaped runs).
    const long = "We could not authorize this download, please try again later. ".repeat(12);
    expect(long.length).toBeGreaterThan(500);
    expect(sanitizeErrorMessage(long).length).toBe(500);
  });
});
