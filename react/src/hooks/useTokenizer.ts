/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { startTransition, useEffect, useState } from 'react';

export const encodeAsync = async (str: string) => {
  const { encode } = await import('gpt-tokenizer');

  return encode(str).length;
};

export const useTokenCount = (input: string = '') => {
  'use memo';
  const [value, setNum] = useState(0);

  useEffect(() => {
    let cancelled = false;
    encodeAsync(input)
      .then((count) => {
        if (!cancelled) startTransition(() => setNum(count));
      })
      .catch(() => {
        if (!cancelled) startTransition(() => setNum(input.length));
      });
    return () => {
      cancelled = true;
    };
  }, [input]);

  return value;
};
