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
  const [value, setNum] = useState(0);

  useEffect(() => {
    startTransition(() => {
      encodeAsync(input)
        .then(setNum)
        .catch(() => {
          setNum(input.length);
        });
    });
  }, [input]);

  return value;
};
