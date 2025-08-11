// RowWrapWithDividers.tsx
import { theme } from 'antd';
import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';

export interface BAIRowWrapWithDividersProps {
  children: React.ReactNode;
  wrap?: boolean;
  rowGap?: number | string;
  columnGap?: number | string;
  dividerWidth?: number;
  dividerColor?: string;
  /** Top/bottom inset of the vertical divider. Does not affect container size. */
  dividerInset?: number;
  itemStyle?: React.CSSProperties;
  style?: React.CSSProperties;
  className?: string;
}

/**
 * Wraps like flex-wrap and draws vertical dividers only between items on the same row.
 * dividerInset shortens only the divider line without changing the container padding.
 */
const BAIRowWrapWithDividers: React.FC<BAIRowWrapWithDividersProps> = ({
  children,
  wrap = true,
  rowGap = 0,
  columnGap = 0,
  dividerWidth = 1,
  dividerColor,
  dividerInset = 0,
  itemStyle,
  style,
  className,
}) => {
  const { token } = theme.useToken();
  const color = dividerColor ?? token.colorBorderSecondary;

  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [rowEnds, setRowEnds] = useState<boolean[]>([]);

  const childArray = useMemo(
    () => React.Children.toArray(children).filter(Boolean),
    [children],
  );

  // Expose columnGap as a CSS variable to overlay the divider within the gap (item width unchanged)
  const gapVar = useMemo(
    () =>
      typeof columnGap === 'number' ? `${columnGap}px` : String(columnGap),
    [columnGap],
  );

  const measure = () => {
    const nodes = itemRefs.current
      .slice(0, childArray.length)
      .filter(Boolean) as HTMLDivElement[];
    if (nodes.length === 0) {
      setRowEnds([]);
      return;
    }
    const ends: boolean[] = new Array(nodes.length).fill(false);
    for (let i = 0; i < nodes.length; i++) {
      const curr = nodes[i]!;
      const next = nodes[i + 1];
      const isEnd =
        i === nodes.length - 1 || (next && next.offsetTop > curr.offsetTop);
      ends[i] = !!isEnd;
    }
    setRowEnds(ends);
  };

  useLayoutEffect(() => {
    itemRefs.current.length = childArray.length;
    measure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childArray.length]);

  useLayoutEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const ro = new ResizeObserver(measure);
    ro.observe(root);

    const childRO = new ResizeObserver(measure);
    itemRefs.current.forEach((n) => n && childRO.observe(n));

    const mo = new MutationObserver(measure);
    mo.observe(root, { childList: true, subtree: true, attributes: true });

    window.addEventListener('resize', measure);
    measure();

    return () => {
      ro.disconnect();
      childRO.disconnect();
      mo.disconnect();
      window.removeEventListener('resize', measure);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      style={
        {
          display: 'flex',
          flexWrap: wrap ? 'wrap' : 'nowrap',
          columnGap,
          rowGap,
          alignItems: 'stretch',
          // Provide gap CSS variable for children
          '--bai-gap': gapVar,
          ...style,
        } as React.CSSProperties
      }
    >
      {childArray.map((child, i) => {
        const isRowEnd = rowEnds[i] ?? i === childArray.length - 1;
        return (
          <div
            key={(child as any)?.key ?? i}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            style={{
              position: 'relative', // Positioning context for the absolutely positioned divider
              display: 'flex',
              alignItems: 'stretch',
              // No layout impact (keep item width fixed; no padding)
              ...itemStyle,
            }}
          >
            {child}

            {/* Vertical divider: overlay centered within the gap (no layout impact) */}
            <span
              aria-hidden
              style={{
                position: 'absolute',
                top: dividerInset,
                bottom: dividerInset,
                // Shift half the gap to the right to center the line between two items
                right: 'calc(-0.5 * var(--bai-gap, 0px))',
                width: dividerWidth,
                background: color,
                pointerEvents: 'none',
                visibility: isRowEnd ? 'hidden' : 'visible',
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default BAIRowWrapWithDividers;
