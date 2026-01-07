/**
 * Простое логирование метрик для мониторинга
 * В будущем можно заменить на Prometheus, DataDog и т.д.
 */

type MetricType = "counter" | "gauge" | "histogram";

interface Metric {
  name: string;
  type: MetricType;
  value: number;
  labels?: Record<string, string>;
  timestamp: number;
}

const metrics: Metric[] = [];

/**
 * Логирует метрику
 */
export function logMetric(
  name: string,
  value: number,
  type: MetricType = "counter",
  labels?: Record<string, string>
) {
  const metric: Metric = {
    name,
    type,
    value,
    labels,
    timestamp: Date.now(),
  };

  metrics.push(metric);

  // Логируем в консоль (в production можно отправлять в систему метрик)
  if (process.env.NODE_ENV === "development") {
    console.log(`[METRIC] ${name}: ${value}`, labels || "");
  }

  // Отправляем в Sentry как дополнительный контекст
  if (typeof window === "undefined") {
    try {
      const Sentry = require("@sentry/nextjs");
      Sentry.setContext("metrics", {
        [name]: value,
        ...labels,
      });
    } catch {
      // Sentry не доступен
    }
  }
}

/**
 * Счетчик запросов
 */
export function incrementCounter(name: string, labels?: Record<string, string>) {
  logMetric(name, 1, "counter", labels);
}

/**
 * Измерение времени выполнения
 */
export function measureDuration(name: string, durationMs: number, labels?: Record<string, string>) {
  logMetric(name, durationMs, "histogram", labels);
}

/**
 * Текущее значение (например, количество активных соединений)
 */
export function setGauge(name: string, value: number, labels?: Record<string, string>) {
  logMetric(name, value, "gauge", labels);
}

/**
 * Обертка для измерения времени выполнения функции
 */
export async function measureTime<T>(
  name: string,
  fn: () => Promise<T>,
  labels?: Record<string, string>
): Promise<T> {
  const start = Date.now();
  try {
    const result = await fn();
    const duration = Date.now() - start;
    measureDuration(name, duration, { ...labels, status: "success" });
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    measureDuration(name, duration, { ...labels, status: "error" });
    throw error;
  }
}

/**
 * Получить все метрики (для отладки)
 */
export function getMetrics(): Metric[] {
  return [...metrics];
}

/**
 * Очистить метрики (для тестов)
 */
export function clearMetrics() {
  metrics.length = 0;
}

