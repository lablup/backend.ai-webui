/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import _ from 'lodash';
import { useState, useEffect } from 'react';

export const useScrollBreakPoint = (
  {
    x: xBreakPoint,
    y: yBreakPoint,
  }: {
    x?: number;
    y?: number;
  },
  element?: HTMLDivElement | null,
) => {
  const [x, setX] = useState(false);
  const [y, setY] = useState(false);

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLDivElement;
      if (xBreakPoint !== undefined) {
        const currentScrollX = _.isUndefined(target.scrollLeft)
          ? window.scrollX
          : target.scrollLeft;
        setX(currentScrollX > xBreakPoint);
      }

      if (yBreakPoint !== undefined) {
        const currentScrollY = _.isUndefined(target.scrollTop)
          ? window.scrollY
          : target.scrollTop;
        setY(currentScrollY > yBreakPoint);
      }
    };
    const target = element || window;

    target.addEventListener('scroll', handleScroll);

    return () => {
      target.removeEventListener('scroll', handleScroll);
    };
  }, [xBreakPoint, yBreakPoint, element]);

  return {
    x,
    y,
  } as {
    x: boolean;
    y: boolean;
  };
};
