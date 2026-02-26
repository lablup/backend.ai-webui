/**
 * Navigation utilities for handling nested navigation structures.
 * Provides backward compatibility by automatically detecting and flattening nested structures.
 */

/**
 * Navigation entry that supports recursive children (nested structure)
 */
export interface NavEntry {
  title: string;
  path?: string;        // Optional for category nodes
  children?: NavEntry[]; // Recursive children support
}

/**
 * Flat navigation entry (legacy format)
 */
export interface FlatNavEntry {
  title: string;
  path: string;
}

/**
 * Detect whether navigation structure is flat or nested
 */
export function detectNavigationStructure(entries: NavEntry[]): 'flat' | 'nested' {
  for (const entry of entries) {
    if (entry.children && entry.children.length > 0) {
      return 'nested';
    }
  }
  return 'flat';
}

/**
 * Recursively flatten nested navigation structure to flat array
 * Skips category nodes that don't have a path
 */
export function flattenNavigation(entries: NavEntry[]): FlatNavEntry[] {
  const result: FlatNavEntry[] = [];

  function recurse(items: NavEntry[]): void {
    for (const item of items) {
      // If item has a path, add it to the result
      if (item.path) {
        result.push({
          title: item.title,
          path: item.path,
        });
      }

      // Recursively process children
      if (item.children && item.children.length > 0) {
        recurse(item.children);
      }
    }
  }

  recurse(entries);
  return result;
}

/**
 * Validate navigation structure and provide helpful error messages
 */
export function validateNavigation(entries: NavEntry[]): void {
  const errors: string[] = [];

  function validateEntry(entry: NavEntry, path: string): void {
    if (!entry.title || typeof entry.title !== 'string' || entry.title.trim() === '') {
      errors.push(`Invalid title at ${path}: must be a non-empty string`);
    }

    if (entry.path !== undefined) {
      if (typeof entry.path !== 'string' || entry.path.trim() === '') {
        errors.push(`Invalid path at ${path}: must be a non-empty string when provided`);
      }
    }

    if (entry.children !== undefined) {
      if (!Array.isArray(entry.children)) {
        errors.push(`Invalid children at ${path}: must be an array when provided`);
      } else {
        entry.children.forEach((child, index) => {
          validateEntry(child, `${path}.children[${index}]`);
        });
      }
    }

    // Check that entry has either path or children (or both)
    if (!entry.path && (!entry.children || entry.children.length === 0)) {
      errors.push(`Invalid entry at ${path}: must have either 'path' or non-empty 'children'`);
    }
  }

  if (!Array.isArray(entries)) {
    throw new Error('Navigation must be an array');
  }

  entries.forEach((entry, index) => {
    validateEntry(entry, `[${index}]`);
  });

  if (errors.length > 0) {
    throw new Error(`Navigation validation errors:\n${errors.map(e => `  - ${e}`).join('\n')}`);
  }
}

/**
 * Count total number of documents in navigation (entries with paths)
 */
export function countNavigationDocuments(entries: NavEntry[]): number {
  let count = 0;

  function recurse(items: NavEntry[]): void {
    for (const item of items) {
      if (item.path) {
        count++;
      }
      if (item.children && item.children.length > 0) {
        recurse(item.children);
      }
    }
  }

  recurse(entries);
  return count;
}

/**
 * Auto-detect navigation structure and flatten if needed
 * This is the main utility function that should be used by processors
 */
export function processNavigation(entries: NavEntry[]): {
  flattened: FlatNavEntry[];
  structureType: 'flat' | 'nested';
  documentCount: number;
} {
  // Validate first
  validateNavigation(entries);

  const structureType = detectNavigationStructure(entries);
  const documentCount = countNavigationDocuments(entries);

  let flattened: FlatNavEntry[];
  if (structureType === 'flat') {
    // Convert to FlatNavEntry format (ensure path exists)
    flattened = entries
      .filter((entry): entry is NavEntry & { path: string } => !!entry.path)
      .map(entry => ({
        title: entry.title,
        path: entry.path,
      }));
  } else {
    // Flatten nested structure
    flattened = flattenNavigation(entries);
  }

  return {
    flattened,
    structureType,
    documentCount,
  };
}