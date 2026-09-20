import { describe, expect, it, vi } from "vitest";
import { authorizePhotoDownload } from "./download-workflow";

describe("authorizePhotoDownload", () => {
  it("blocks the download, flags forbidden, and opens checkout on 403", async () => {
    const openCheckout = vi.fn();

    const result = await authorizePhotoDownload({
      request: vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ error: "Upgrade for $4 to download your ERAS-ready photo." }),
          { status: 403, headers: { "Content-Type": "application/json" } },
        ),
      ),
      openCheckout,
    });

    expect(result).toEqual({ allowed: false, forbidden: true });
    expect(openCheckout).toHaveBeenCalledOnce();
  });

  it("allows the download only after server authorization succeeds", async () => {
    const openCheckout = vi.fn();

    const result = await authorizePhotoDownload({
      request: vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ allowed: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" } },
        ),
      ),
      openCheckout,
    });

    expect(result).toEqual({ allowed: true });
    expect(openCheckout).not.toHaveBeenCalled();
  });

  it("throws a specific error on non-403 failures so the UI can show retry", async () => {
    const result = authorizePhotoDownload({
      request: vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: "Rate limited, try again soon." }), {
          status: 429,
          headers: { "Content-Type": "application/json" },
        }),
      ),
      openCheckout: vi.fn(),
    });

    await expect(result).rejects.toThrow("Rate limited, try again soon.");
  });
});
