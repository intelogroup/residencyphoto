import { describe, expect, it } from "vitest";
import { buildSupportMailto } from "./support-email";

describe("buildSupportMailto", () => {
  it("builds an encoded support email without sensitive identifiers", () => {
    const href = buildSupportMailto({
      topic: "Technical issue",
      message: "The crop preview is blank.",
      replyEmail: "applicant@example.com",
      page: "/dashboard?tab=editor",
      plan: "Free",
    });

    expect(href).toContain("mailto:support@residencyphoto.com");
    expect(href).toContain("Technical%20issue");
    expect(href).toContain("The%20crop%20preview%20is%20blank.");
    expect(href).toContain("applicant%40example.com");
    expect(href).toContain("%2Fdashboard%3Ftab%3Deditor");
    expect(href).not.toContain("userId");
    expect(href).not.toContain("attachment");
  });
});
