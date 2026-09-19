import pino, { type DestinationStream } from "pino";

// Server-side only: never import this module from client components.
// pino writes newline-delimited JSON so Vercel / log drains can parse it.

const isProd = process.env.NODE_ENV === "production";

export function createLogger(destination?: DestinationStream) {
  return pino(
    {
      level:
        process.env.LOG_LEVEL ?? (isProd ? "info" : "debug"),
      formatters: {
        level: (label) => ({ level: label }),
      },
      redact: {
        paths: [
          "req.headers.authorization",
          "headers.authorization",
          "authorization",
          "*.secret",
          "*.webhookSecret",
          "stripeSignature",
          "apiKey",
          "userId",
        ],
        censor: "[REDACTED]",
      },
    },
    destination,
  );
}

/** Shared process-wide logger. Prefer a request-scoped child via childLogger(). */
export const logger = createLogger();

export type AppLogger = typeof logger;

/** Pull the request id from the inbound header, or mint one. */
export function getRequestId(headers: Headers): string {
  return headers.get("x-request-id")?.trim() || crypto.randomUUID();
}

/** Child logger that tags every line with the request id. */
export function childLogger(log: AppLogger, requestId: string): AppLogger {
  return log.child({ requestId });
}
