import { REGION_API_URL, REGION_TIMEOUT_MS } from '../../config/main.config';
import AppError from '../../helpers/app-error.helper';

interface CacheEntry<T> {
  expiresAt: number;
  data: T;
}

const cache = new Map<string, CacheEntry<unknown>>();
const PROVINCE_TTL_MS = 24 * 3600 * 1000;
const REGENCY_TTL_MS = 12 * 3600 * 1000;

async function fetchUpstream<T>(path: string): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REGION_TIMEOUT_MS);
  try {
    const res = await fetch(`${REGION_API_URL}${path}`, { signal: controller.signal });
    if (!res.ok) {
      throw AppError(`Layanan wilayah gagal (${res.status})`, 502);
    }
    return (await res.json()) as T;
  } catch (err) {
    if ((err as Error & { expose?: boolean }).expose === true) throw err;
    throw AppError('Layanan wilayah tidak dapat dijangkau', 502);
  } finally {
    clearTimeout(timer);
  }
}

async function cached<T>(key: string, ttlMs: number, loader: () => Promise<T>): Promise<T> {
  const hit = cache.get(key) as CacheEntry<T> | undefined;
  if (hit && hit.expiresAt > Date.now()) return hit.data;
  const data = await loader();
  cache.set(key, { expiresAt: Date.now() + ttlMs, data });
  return data;
}

export interface Province {
  code: string;
  province: string;
}

export interface Regency {
  code: string;
  regency: string;
  type: string;
}

export const regionService = {
  async listProvinces(): Promise<Province[]> {
    return cached('provinces', PROVINCE_TTL_MS, async () => {
      const body = await fetchUpstream<{ data: Province[] }>('/province?limit=100');
      return body.data;
    });
  },

  async listRegencies(provinceCode: string): Promise<Regency[]> {
    return cached(`regencies:${provinceCode}`, REGENCY_TTL_MS, async () => {
      const body = await fetchUpstream<{ data: Regency[] }>(
        `/regency?provinceCode=${encodeURIComponent(provinceCode)}&limit=100`,
      );
      return body.data;
    });
  },
};
