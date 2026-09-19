import { afterEach, describe, expect, it, vi } from "vitest";
import { captureServerEvent } from "./analytics-server";

describe("captureServerEvent", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("sends the event to PostHog with the project key", async () => {
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "phc_test_key");
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal("fetch", fetchMock);

    await captureServerEvent({
      event: "purchase",
      distinctId: "user_123",
      properties: { plan: "Resident", value: 4 },
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://us.posthog.com/capture/");
    const body = JSON.parse(init.body as string) as Record<string, unknown>;
    expect(body).toMatchObject({
      api_key: "phc_test_key",
      event: "purchase",
      distinct_id: "user_123",
    });
    expect(body.properties).toMatchObject({ plan: "Resident", value: 4 });
  });

  it("does nothing without a project key and never throws", async () => {
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      captureServerEvent({ event: "purchase", distinctId: "user_123" }),
    ).resolves.toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("swallows network failures so tracking never breaks the caller", async () => {
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "phc_test_key");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network down")),
    );
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(
      captureServerEvent({ event: "purchase", distinctId: "user_123" }),
    ).resolves.toBeUndefined();
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
