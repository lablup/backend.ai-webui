import { useState, useEffect } from 'react';

export const useScrollBreakPoint = ({
  x: xBreakPoint,
  y: yBreakPoint,
}: {
  x?: number;
  y?: number;
}) => {
  const [x, setX] = useState(false);
  const [y, setY] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (xBreakPoint !== undefined) {
        const currentScrollX = window.scrollX;
        setX(currentScrollX > xBreakPoint);
      }

      if (yBreakPoint !== undefined) {
        const currentScrollY = window.scrollY;
        setY(currentScrollY > yBreakPoint);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [xBreakPoint, yBreakPoint]);

  return {
    x,
    y,
  } as {
    x: boolean;
    y: boolean;
  };
};
