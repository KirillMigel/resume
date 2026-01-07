/**
 * Простой rate limiting для API endpoints
 * В production рекомендуется использовать Redis или специализированные сервисы
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetAt: number;
  };
}

const store: RateLimitStore = {};

// Очистка старых записей каждые 5 минут
setInterval(() => {
  const now = Date.now();
  for (const key in store) {
    if (store[key].resetAt < now) {
      delete store[key];
    }
  }
}, 5 * 60 * 1000);

/**
 * Проверка rate limit
 * @param identifier - Уникальный идентификатор (IP, user ID и т.д.)
 * @param maxRequests - Максимальное количество запросов
 * @param windowMs - Окно времени в миллисекундах
 * @returns true если запрос разрешен, false если превышен лимит
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000 // 1 минута по умолчанию
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = store[identifier];

  if (!record || record.resetAt < now) {
    // Создаем новую запись
    store[identifier] = {
      count: 1,
      resetAt: now + windowMs,
    };
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt: now + windowMs,
    };
  }

  if (record.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: record.resetAt,
    };
  }

  record.count++;
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetAt: record.resetAt,
  };
}

/**
 * Получение IP адреса из Request
 */
export function getClientIP(request: Request): string {
  // Проверяем заголовки прокси
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  
  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }
  
  // Fallback (в production это не сработает, но для разработки OK)
  return "unknown";
}

