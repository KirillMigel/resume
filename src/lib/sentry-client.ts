import * as Sentry from "@sentry/react";

let isInited = false;

export function initSentry() {
  if (isInited) return;
  if (typeof window === "undefined") return;
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) {
    console.log("[Sentry] DSN not configured, skipping initialization");
    return;
  }

  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    normalizeDepth: 5,
    integrations: [Sentry.browserTracingIntegration()],
  });

  // Делаем Sentry доступным глобально для тестирования
  if (typeof window !== "undefined") {
    (window as any).Sentry = Sentry;
  }

  isInited = true;
  console.log("[Sentry] Initialized successfully");
}


