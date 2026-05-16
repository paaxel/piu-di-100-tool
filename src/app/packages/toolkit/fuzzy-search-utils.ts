import Fuse from 'fuse.js';
import type { FuseOptionKey } from 'fuse.js';

export function fuzzySearch<T>(
  items: T[],
  query: string,
  keys: ReadonlyArray<FuseOptionKey<T>>,
  limit = 20,
): T[] {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) {
    return [...items];
  }

  const fuse = new Fuse(items, {
    threshold: 0.35,
    ignoreLocation: true,
    minMatchCharLength: 2,
    keys: [...keys],
  });

  return fuse.search(normalizedQuery, { limit }).map((entry) => entry.item);
}
