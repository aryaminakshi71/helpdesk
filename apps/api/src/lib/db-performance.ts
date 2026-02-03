/**
 * Database Performance Monitoring
 * 
 * Provides query performance tracking and slow query logging.
 */

interface QueryMetric {
  name: string;
  duration: number;
  timestamp: number;
  error?: string;
}

const queryMetrics: QueryMetric[] = [];
const MAX_METRICS = 1000;

export async function trackQuery<T>(
  queryName: string,
  queryFn: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();
  let error: string | undefined;

  try {
    const result = await queryFn();
    const duration = Date.now() - startTime;

    recordMetric({
      name: queryName,
      duration,
      timestamp: Date.now(),
    });

    if (duration > 1000) {
      console.warn(`[Slow Query] ${queryName} took ${duration}ms`);
    }

    return result;
  } catch (err) {
    error = err instanceof Error ? err.message : "Unknown error";
    const duration = Date.now() - startTime;

    recordMetric({
      name: queryName,
      duration,
      timestamp: Date.now(),
      error,
    });

    throw err;
  }
}

function recordMetric(metric: QueryMetric): void {
  queryMetrics.push(metric);
  if (queryMetrics.length > MAX_METRICS) {
    queryMetrics.shift();
  }
}

export function getSlowQueries(thresholdMs: number = 1000): QueryMetric[] {
  return queryMetrics.filter((m) => m.duration > thresholdMs);
}

export function getQueryStats(queryName?: string) {
  const metrics = queryName
    ? queryMetrics.filter((m) => m.name === queryName)
    : queryMetrics;

  if (metrics.length === 0) {
    return {
      count: 0,
      avgDuration: 0,
      minDuration: 0,
      maxDuration: 0,
      p50: 0,
      p95: 0,
      p99: 0,
      errorRate: 0,
    };
  }

  const durations = metrics.map((m) => m.duration).sort((a, b) => a - b);
  const errors = metrics.filter((m) => m.error).length;

  return {
    count: metrics.length,
    avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
    minDuration: durations[0],
    maxDuration: durations[durations.length - 1],
    p50: durations[Math.floor(durations.length * 0.5)],
    p95: durations[Math.floor(durations.length * 0.95)],
    p99: durations[Math.floor(durations.length * 0.99)],
    errorRate: errors / metrics.length,
  };
}

export function getAllMetrics(): QueryMetric[] {
  return [...queryMetrics];
}

export function clearMetrics(): void {
  queryMetrics.length = 0;
}

export function getMetricsByQuery(): Record<string, ReturnType<typeof getQueryStats>> {
  const queryNames = new Set(queryMetrics.map((m) => m.name));
  const summary: Record<string, ReturnType<typeof getQueryStats>> = {};

  for (const name of queryNames) {
    summary[name] = getQueryStats(name);
  }

  return summary;
}
