/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useBAILogger } from 'backend.ai-ui';
import { parseAsString, useQueryState } from 'nuqs';
import { useEffect, useEffectEvent, useRef } from 'react';

/**
 * Read and clear the sToken URL query parameter using nuqs.
 *
 * The `STokenLoginBoundary` component (Epic FR-2616) intentionally does not
 * read from `window.location` on its own — callers must source `sToken` via
 * nuqs and pass it as a prop. This hook centralizes that lookup so the two
 * call sites (LoginView route wrapper, EduAppLauncher route wrapper) and any
 * future token URL entry point share the same canonical-vs-deprecated
 * handling.
 *
 * Resolution:
 *   1. `?sToken=...` (canonical key) takes precedence.
 *   2. `?stoken=...` (deprecated lowercase alias) is accepted as a fallback.
 *      A single deprecation warning is logged per hook instance when only
 *      `stoken` is present.
 *
 * The returned `clear` setter nulls both keys so the tuple is safe to call
 * from `STokenLoginBoundary`'s `onSuccess` callback without leaking either
 * form of the token into browser history or referers.
 */

export const useSToken = (): [
  string | null,
  (next: string | null) => Promise<URLSearchParams>,
] => {
  'use memo';
  const { logger } = useBAILogger();
  const [sToken, setSToken] = useQueryState('sToken', parseAsString);
  const [stoken, setStoken] = useQueryState('stoken', parseAsString);
  const hasWarnedRef = useRef(false);

  const logDeprecationIfNeeded = useEffectEvent(() => {
    if (stoken && !sToken && !hasWarnedRef.current) {
      hasWarnedRef.current = true;
      logger.warn(
        'Query parameter `stoken` (lowercase) is deprecated; use `sToken`.',
      );
    }
  });

  useEffect(() => {
    logDeprecationIfNeeded();
  }, [sToken, stoken]);

  // React Compiler ('use memo') memoizes the returned tuple; no manual
  // useCallback wrapper is required. Callers typically pass `null` after a
  // successful login to strip the token from the URL.
  const clear = async (next: string | null) => {
    await setSToken(next);
    return setStoken(null);
  };

  const effective = sToken ?? stoken;
  return [effective, clear];
};
