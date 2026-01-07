/**
 * Инициализация Sentry для server-side
 * Вызывается в middleware или API routes
 */
export async function initSentryServer() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;

  try {
    const Sentry = await import("@sentry/nextjs");
    
    if (Sentry.getCurrentHub().getClient()) {
      return; // Уже инициализирован
    }

    Sentry.init({
      dsn,
      tracesSampleRate: 0.1,
      environment: process.env.NODE_ENV || "development",
      // Не логируем PII (персональные данные)
      beforeSend(event) {
        // Удаляем потенциальные PII из контекста
        if (event.user) {
          delete event.user.email;
          delete event.user.ip_address;
        }
        return event;
      },
    });
  } catch {
    // Sentry не установлен или не доступен
  }
}

/**
 * Обертка для API routes с обработкой ошибок
 */
export function withSentry<T extends (...args: any[]) => Promise<any>>(
  handler: T
): T {
  return (async (...args: Parameters<T>) => {
    try {
      await initSentryServer();
      return await handler(...args);
    } catch (error) {
      try {
        const Sentry = await import("@sentry/nextjs");
        Sentry.captureException(error);
      } catch {
        // Sentry не доступен
      }
      throw error;
    }
  }) as T;
}

