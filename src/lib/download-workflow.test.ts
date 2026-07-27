import { describe, expect, it, vi } from "vitest";
import { authorizePhotoDownload } from "./download-workflow";

describe("authorizePhotoDownload", () => {
  it("blocks the download and opens checkout when the server requires payment", async () => {
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

    expect(result).toEqual({ allowed: false });
    expect(openCheckout).toHaveBeenCalledOnce();
  });

  it("allows the download only after server authorization succeeds", async () => {
    const openCheckout = vi.fn();

    const result = await authorizePhotoDownload({
      request: vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ allowed: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
      openCheckout,
    });

    expect(result).toEqual({ allowed: true });
    expect(openCheckout).not.toHaveBeenCalled();
  });
});
