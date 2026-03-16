/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useCallback, useEffect, useState } from 'react';

export interface DocNavItem {
  title: string;
  path: string;
}

interface UseDocNavigationResult {
  navItems: DocNavItem[];
  currentIndex: number;
  prevItem: DocNavItem | null;
  nextItem: DocNavItem | null;
  loading: boolean;
}

/**
 * Parses the flat navigation structure from book.config.yaml.
 * The YAML is simple enough (title/path pairs under language keys)
 * that a lightweight regex-based parser suffices without adding a
 * full YAML library dependency.
 */
function parseNavigation(yamlText: string, lang: string): DocNavItem[] {
  const items: DocNavItem[] = [];
  const lines = yamlText.split('\n');

  let inNavigation = false;
  let inTargetLang = false;
  let currentTitle: string | null = null;

  for (const line of lines) {
    const trimmed = line.trimStart();

    if (trimmed === 'navigation:') {
      inNavigation = true;
      continue;
    }

    if (!inNavigation) continue;

    // Detect language key (e.g., "  en:")
    const langMatch = trimmed.match(/^(\w{2}):$/);
    if (langMatch) {
      if (inTargetLang) break; // We've passed our target language section
      inTargetLang = langMatch[1] === lang;
      continue;
    }

    if (!inTargetLang) continue;

    // Parse title line (e.g., "    - title: Overview")
    const titleMatch = trimmed.match(/^- title:\s*(.+)$/);
    if (titleMatch) {
      currentTitle = titleMatch[1].trim();
      continue;
    }

    // Parse path line (e.g., "      path: overview/overview.md")
    const pathMatch = trimmed.match(/^path:\s*(.+)$/);
    if (pathMatch && currentTitle !== null) {
      items.push({ title: currentTitle, path: pathMatch[1].trim() });
      currentTitle = null;
    }
  }

  return items;
}

/**
 * Hook that fetches book.config.yaml and provides navigation data
 * for the help documentation modal.
 *
 * @param docLang - Current documentation language (en, ko, ja, th)
 * @param currentDocPath - Currently displayed doc path (may include #anchor)
 */
export function useDocNavigation(
  docLang: string,
  currentDocPath: string,
): UseDocNavigationResult {
  'use memo';

  const [navItems, setNavItems] = useState<DocNavItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNavigation = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        '/packages/backend.ai-webui-docs/src/book.config.yaml',
      );
      if (!res.ok) throw new Error(`${res.status}`);
      const text = await res.text();
      setNavItems(parseNavigation(text, docLang));
    } catch {
      setNavItems([]);
    } finally {
      setLoading(false);
    }
  }, [docLang]);

  useEffect(() => {
    fetchNavigation();
  }, [fetchNavigation]);

  // Strip anchor from current path for matching against nav items
  const basePath = currentDocPath.split('#')[0];
  const currentIndex = navItems.findIndex((item) => item.path === basePath);
  const prevItem = currentIndex > 0 ? navItems[currentIndex - 1] : null;
  const nextItem =
    currentIndex >= 0 && currentIndex < navItems.length - 1
      ? navItems[currentIndex + 1]
      : null;

  return { navItems, currentIndex, prevItem, nextItem, loading };
}
