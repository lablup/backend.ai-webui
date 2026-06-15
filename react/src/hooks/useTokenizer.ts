/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { startTransition, useEffect, useState } from 'react';

export const encodeAsync = async (str: string) => {
  const { encode } = await import('gpt-tokenizer');

  return encode(str).length;
};

// Indirection object so `useTokenCount`'s async call can be spied on in tests.
// A direct module-local call to `encodeAsync` cannot be intercepted under ESM,
// which makes the out-of-order cancellation behavior (FR-3091) untestable.
export const tokenCounter = { encodeAsync };

export const useTokenCount = (input: string = '') => {
  'use memo';
  const [value, setNum] = useState(0);

  useEffect(() => {
    let cancelled = false;
    startTransition(() => {
      tokenCounter
        .encodeAsync(input)
        .then((count) => {
          if (!cancelled) setNum(count);
        })
        .catch(() => {
          if (!cancelled) setNum(input.length);
        });
    });
    return () => {
      cancelled = true;
    };
  }, [input]);

  return value;
};
