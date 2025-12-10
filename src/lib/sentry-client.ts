import * as Sentry from "@sentry/react";

let isInited = false;

export function initSentry() {
  if (isInited) return;
  if (typeof window === "undefined") return;
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    normalizeDepth: 5,
    integrations: [Sentry.browserTracingIntegration()],
  });

  isInited = true;
}


