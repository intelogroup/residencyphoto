import { Writable } from "node:stream";
import { describe, expect, it } from "vitest";
import { childLogger, createLogger, getRequestId } from "./logger";

function capture() {
  const lines: string[] = [];
  const stream = new Writable({
    write(chunk, _encoding, callback) {
      lines.push(chunk.toString());
      callback();
    },
  });
  return { lines, stream };
}

describe("getRequestId", () => {
  it("uses the inbound x-request-id header when present", () => {
    const headers = new Headers({ "x-request-id": "req-123" });
    expect(getRequestId(headers)).toBe("req-123");
  });

  it("mints a uuid when the header is missing", () => {
    const id = getRequestId(new Headers());
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });
});

describe("logger", () => {
  it("emits JSON lines with the request id on child loggers", () => {
    const { lines, stream } = capture();
    const log = childLogger(createLogger(stream), "req-abc");
    log.info({ plan: "Resident" }, "purchase processed");

    expect(lines).toHaveLength(1);
    const line = JSON.parse(lines[0]);
    expect(line.requestId).toBe("req-abc");
    expect(line.msg).toBe("purchase processed");
    expect(line.plan).toBe("Resident");
    expect(line.level).toBe("info");
  });

  it("redacts authorization headers", () => {
    const { lines, stream } = capture();
    const log = createLogger(stream);
    log.info({ headers: { authorization: "Bearer secret" } }, "incoming");

    const line = JSON.parse(lines[0]);
    expect(line.headers.authorization).toBe("[REDACTED]");
  });
});
