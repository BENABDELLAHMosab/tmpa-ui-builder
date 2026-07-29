import { createHash } from 'crypto';

export function stableSerialize(value: unknown): string {
  if (value === null) {
    return 'null';
  }

  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      const arrayItems = value.map(item => stableSerialize(item)).join(',');
      return `[${arrayItems}]`;
    }

    const sortedKeys = Object.keys(value).sort();
    const objectItems = sortedKeys
      .map(key => `"${key}":${stableSerialize((value as Record<string, unknown>)[key])}`)
      .join(',');
    return `{${objectItems}}`;
  }

  if (typeof value === 'string') {
    return JSON.stringify(value);
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return 'undefined';
}

export function generateContentHash(value: unknown): string {
  const serialized = stableSerialize(value);
  return createHash('sha256').update(serialized).digest('hex');
}

export function cloneJsonValue<T>(value: T): T {
  if (value === undefined) return value;
  return JSON.parse(JSON.stringify(value));
}
