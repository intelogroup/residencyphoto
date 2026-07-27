import { describe, expect, it } from "vitest";
import { getPostAuthRedirect, mapNeonSessionToEraUser } from "./auth-session";

describe("Neon auth session mapping", () => {
  it("maps the authenticated Neon user into the dashboard user shape", () => {
    expect(
      mapNeonSessionToEraUser({
        user: {
          id: "user_123",
          email: "olivia@example.com",
          name: "Olivia Chen",
          createdAt: new Date("2026-07-15T12:00:00.000Z"),
        },
      }),
    ).toEqual({
      authId: "user_123",
      email: "olivia@example.com",
      name: "Olivia Chen",
      createdAt: "2026-07-15T12:00:00.000Z",
    });
  });

  it("returns null when no authenticated user exists", () => {
    expect(mapNeonSessionToEraUser(null)).toBeNull();
  });

  it("uses the email prefix when Neon has no display name", () => {
    expect(
      mapNeonSessionToEraUser({
        user: {
          id: "user_456",
          email: "jordan.lee@example.com",
          name: "",
          createdAt: "2026-07-15T12:00:00.000Z",
        },
      })?.name,
    ).toBe("Jordan.lee");
  });
});

describe("post-auth redirects", () => {
  it("allows safe in-app destinations", () => {
    expect(getPostAuthRedirect("/dashboard?tab=editor")).toBe("/dashboard?tab=editor");
  });

  it("rejects absolute and protocol-relative redirects", () => {
    expect(getPostAuthRedirect("https://evil.example/steal")).toBe("/dashboard");
    expect(getPostAuthRedirect("//evil.example/steal")).toBe("/dashboard");
  });
});
