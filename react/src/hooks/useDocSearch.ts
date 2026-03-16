/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { DocNavItem } from './useDocNavigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface DocSearchMatch {
  /** Index of the match within the document's text content */
  startIndex: number;
  /** Length of the matched substring */
  length: number;
}

export interface DocSearchResult {
  /** Navigation item for the document */
  navItem: DocNavItem;
  /** Number of matches in this document */
  matchCount: number;
  /** Match positions within the raw text content */
  matches: DocSearchMatch[];
}

interface UseDocSearchResult {
  /** Current search query (debounced) */
  query: string;
  /** Set the search query (raw, before debounce) */
  setQuery: (q: string) => void;
  /** Whether documents are being fetched for search indexing */
  indexing: boolean;
  /** Search results per document (only documents with matches) */
  results: DocSearchResult[];
  /** Total match count across all documents */
  totalMatches: number;
  /** Match count for a specific document path */
  getMatchCount: (docPath: string) => number;
}

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 300;
const PREFETCH_DELAY_MS = 1500; // delay prefetch to let main doc load first
const CONCURRENT_FETCHES = 4; // limit parallel requests

// Module-level cache: persists across modal open/close, invalidated on lang change
let cachedLang = '';
const docCache = new Map<string, string>();

function cleanMarkdown(text: string): string {
  return text
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/^:::\w+(?:\[.*?\])?\s*$/gm, '')
    .replace(/^:::\s*$/gm, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]*)\]\(.*?\)/g, '$1')
    .replace(/#{1,6}\s+/g, '')
    .replace(/[*_`~]{1,3}/g, '');
}

async function fetchWithConcurrencyLimit(
  tasks: (() => Promise<void>)[],
  limit: number,
): Promise<void> {
  let idx = 0;
  const run = async () => {
    while (idx < tasks.length) {
      const currentIdx = idx++;
      await tasks[currentIdx]();
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, run));
}

/**
 * Find the doc path containing a given anchor ID (e.g., "set-preopen-ports").
 * Searches the module-level raw-markdown cache for `<a id="anchorId">` tags.
 */
export function findDocPathByAnchor(anchorId: string): string | null {
  const pattern = new RegExp(
    `<a\\s+id=["']${anchorId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`,
    'i',
  );
  for (const [path, text] of docCache) {
    if (pattern.test(text)) return path;
  }
  return null;
}

/**
 * Hook that provides full-text search across all help documentation pages.
 * Pre-fetches documents after a delay when the modal opens.
 * Receives navItems from the parent to avoid duplicate useDocNavigation calls.
 */
export function useDocSearch(
  docLang: string,
  modalOpen: boolean,
  navItems: DocNavItem[],
): UseDocSearchResult {
  'use memo';

  const [rawQuery, setRawQuery] = useState('');
  const [query, setQuery] = useState('');
  const [indexing, setIndexing] = useState(false);
  const [cacheRevision, setCacheRevision] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefetchingRef = useRef(false);

  // Debounce the query
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      setQuery(rawQuery);
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [rawQuery]);

  // Invalidate cache on language change
  useEffect(() => {
    if (cachedLang !== docLang) {
      docCache.clear();
      cachedLang = docLang;
    }
  }, [docLang]);

  // Pre-fetch all documents with delay and concurrency limit
  useEffect(() => {
    if (!modalOpen || navItems.length === 0 || prefetchingRef.current) return;
    if (docCache.size >= navItems.length) return;

    const basePath = `/packages/backend.ai-webui-docs/src/${docLang}/`;

    prefetchTimerRef.current = setTimeout(() => {
      prefetchingRef.current = true;
      setIndexing(true);

      const tasks = navItems
        .filter((item) => !docCache.has(item.path))
        .map((item) => async () => {
          try {
            const res = await fetch(basePath + item.path);
            if (!res.ok) return;
            const text = await res.text();
            docCache.set(item.path, cleanMarkdown(text));
          } catch {
            // Failed to fetch this document — skip indexing it
          }
        });

      fetchWithConcurrencyLimit(tasks, CONCURRENT_FETCHES).finally(() => {
        setIndexing(false);
        prefetchingRef.current = false;
        setCacheRevision((prev) => prev + 1);
      });
    }, PREFETCH_DELAY_MS);

    return () => {
      if (prefetchTimerRef.current) {
        clearTimeout(prefetchTimerRef.current);
      }
    };
  }, [modalOpen, navItems, docLang]);

  // Compute search results as derived state (no useEffect + setState)
  const results = useMemo<DocSearchResult[]>(() => {
    if (!modalOpen || query.length < MIN_QUERY_LENGTH) {
      return [];
    }

    const lowerQuery = query.toLowerCase();
    const searchResults: DocSearchResult[] = [];

    for (const item of navItems) {
      const text = docCache.get(item.path);
      if (!text) continue;

      const lowerText = text.toLowerCase();
      const matches: DocSearchMatch[] = [];
      let searchFrom = 0;

      while (searchFrom < lowerText.length) {
        const idx = lowerText.indexOf(lowerQuery, searchFrom);
        if (idx === -1) break;
        matches.push({ startIndex: idx, length: query.length });
        searchFrom = idx + 1;
      }

      if (matches.length > 0) {
        searchResults.push({
          navItem: item,
          matchCount: matches.length,
          matches,
        });
      }
    }

    return searchResults;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, modalOpen, navItems, cacheRevision]);

  const totalMatches = results.reduce((sum, r) => sum + r.matchCount, 0);

  const matchCountMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of results) {
      map.set(r.navItem.path, r.matchCount);
    }
    return map;
  }, [results]);

  const getMatchCount = useCallback(
    (docPath: string) => matchCountMap.get(docPath) ?? 0,
    [matchCountMap],
  );

  return {
    query,
    setQuery: setRawQuery,
    indexing,
    results,
    totalMatches,
    getMatchCount,
  };
}
