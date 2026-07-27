import { describe, expect, it } from "vitest";
import { buildContentSecurityPolicy, contentSecurityPolicy } from "./security-headers";

describe("content security policy", () => {
  it("restricts scripts, connections, workers, and images to required sources", () => {
    expect(contentSecurityPolicy).toContain("script-src 'self' 'unsafe-inline'");
    expect(contentSecurityPolicy).toContain("connect-src 'self'");
    expect(contentSecurityPolicy).toContain("worker-src 'self' blob:");
    expect(contentSecurityPolicy).toContain("img-src 'self' data: blob:");
    expect(contentSecurityPolicy).toContain("object-src 'none'");
    expect(contentSecurityPolicy).toContain("frame-ancestors 'none'");
  });

  it("allows React development tooling without weakening the production policy", () => {
    expect(buildContentSecurityPolicy("development")).toContain(
      "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https://vercel.live 'unsafe-eval'"
    );
    expect(buildContentSecurityPolicy("production")).toContain(
      "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'"
    );
    expect(
      buildContentSecurityPolicy("production").split(";")[4].split(" ")
    ).not.toContain("'unsafe-eval'");
  });
});
