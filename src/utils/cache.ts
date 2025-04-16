import { connection } from '../lib/redis';

export async function getCache<T>(key: string): Promise<T | null> {
  const cached = await connection.get(key);
  return cached ? JSON.parse(cached) : null;
}

export async function setCache<T>(
  key: string,
  data: T,
  ttlSeconds = 60,
): Promise<void> {
  await connection.set(key, JSON.stringify(data), 'EX', ttlSeconds);
}

export async function deleteCache(key: string): Promise<void> {
  await connection.del(key);
}
