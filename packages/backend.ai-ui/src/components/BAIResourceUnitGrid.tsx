/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `BAIResourceUnitGrid` (FR-3569) — generic unit-square grid visualization:
 groups of quantized unit cells packed on one shared lattice (serpentine or
 word-wrap), each group merged into a tinted rounded plate, with an anchored
 hoverable popover frame, an optional palette-override picker, and a legend
 row. Color-agnostic and domain-agnostic: callers pass resolved unit colors,
 legend items, and popover content. Rendering core ported from the tuned
 `prototype/session-resource-grid` prototype; geometry lives in
 `BAIResourceUnitGrid.geometry.ts`.
*/
import { useBAIi18n } from '../hooks/useBAIi18n';
import BAIFlex from './BAIFlex';
import './BAIResourceUnitGrid.css';
import {
  deriveMetrics,
  extractSegments,
  gridSize,
  groupConsecutiveSegments,
  latticeColsForWidth,
  letterCellIndices,
  packGroups,
  placeCells,
  platePath,
  type UnitGridLayout,
  type UnitGridMetrics,
} from './BAIResourceUnitGrid.geometry';
import { Text } from '@astryxdesign/core/Text';
import classNames from 'classnames';
import React, {
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

const DEFAULT_MAX_UNITS_PER_GROUP = 256;
/** Token-backed defaults declared in BAIResourceUnitGrid.css. */
const DEFAULT_PALETTE = Array.from(
  { length: 7 },
  (_, i) => `var(--bai-resource-unit-grid-group-${i + 1})`,
);
// Popover geometry, tuned in the prototype: clamp width, flip threshold,
// anchor offset, and the hide delay that lets the mouse travel onto it.
const POPOVER_CLAMP_WIDTH = 330;
const POPOVER_FLIP_MIN_TOP = 340;
const POPOVER_OFFSET = 6;
const POPOVER_HIDE_DELAY_MS = 150;
// Legible at both plate stroke widths (1.5 rest / 2.5 hover).
const PLATE_DASH_PATTERN = '6 4';
// The letter is vertically centered, so below this fraction the center sits
// on the empty underlay (fills grow bottom-up) — pick ink against it instead.
const LETTER_ON_EMPTY_MAX_FRACTION = 0.6;
const EMPTY_FILL_COLOR = 'var(--bai-resource-unit-grid-cell-empty)';
// The empty fill is a translucent token; composite it over this backdrop
// before judging its luminance.
const EMPTY_FILL_BACKDROP = 'var(--color-background-card)';

const parseAlpha = (raw: string | undefined): number => {
  if (raw === undefined) return 1;
  const v = parseFloat(raw);
  if (!Number.isFinite(v)) return 1;
  return raw.endsWith('%') ? v / 100 : v;
};

/** `[r, g, b (0..255), alpha (0..1)]` of `#rrggbb` / `rgb()` / `color(srgb)`. */
const parseColorChannels = (
  color: string,
): [number, number, number, number] | null => {
  const trimmed = color.trim();
  const hex = /^#?([0-9a-f]{6})$/i.exec(trimmed);
  if (hex) {
    const [r, g, b] = [0, 2, 4].map((i) =>
      parseInt(hex[1].slice(i, i + 2), 16),
    );
    return [r, g, b, 1];
  }
  const rgb =
    /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.%]+))?/.exec(
      trimmed,
    );
  if (rgb) {
    return [
      parseFloat(rgb[1]),
      parseFloat(rgb[2]),
      parseFloat(rgb[3]),
      parseAlpha(rgb[4]),
    ];
  }
  // color-mix()/color() fills computed-style-serialize as CSS Color 4
  // `color(srgb r g b / a)` with 0..1 channels.
  const srgb =
    /^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.%]+))?/.exec(
      trimmed,
    );
  if (srgb) {
    return [
      parseFloat(srgb[1]) * 255,
      parseFloat(srgb[2]) * 255,
      parseFloat(srgb[3]) * 255,
      parseAlpha(srgb[4]),
    ];
  }
  return null;
};

const luminanceOfChannels = (channels: [number, number, number]): number => {
  const [r, g, b] = channels.map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** WCAG relative luminance of the ink-decision input (alpha ignored). */
const relativeLuminance = (color: string): number | null => {
  const channels = parseColorChannels(color);
  return channels
    ? luminanceOfChannels([channels[0], channels[1], channels[2]])
    : null;
};

// Luminances of the two ink custom properties — the hex here mirrors
// --bai-resource-unit-grid-ink-dark/-light in BAIResourceUnitGrid.css.
const INK_DARK_LUMINANCE = relativeLuminance('#262626') ?? 0;
const INK_LIGHT_LUMINANCE = relativeLuminance('#fafafa') ?? 1;

const contrastRatio = (a: number, b: number): number =>
  (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

/** Keyboard activation for the SVG `role="button"` picker controls. */
const activateOnKey = (
  e: React.KeyboardEvent<SVGSVGElement>,
  action: () => void,
): void => {
  if (e.key === 'Enter' || e.key === ' ') {
    // Space must not scroll the page while activating the control.
    if (e.key === ' ') e.preventDefault();
    action();
  }
};

/** Pick the ink with the higher WCAG contrast ratio against the fill. */
const inkForLuminance = (fillLuminance: number | null): string => {
  // Unresolvable fills (first pre-effect paint, jsdom) assume a light fill.
  const lum = fillLuminance ?? 0.8;
  return contrastRatio(lum, INK_DARK_LUMINANCE) >=
    contrastRatio(lum, INK_LIGHT_LUMINANCE)
    ? 'var(--bai-resource-unit-grid-ink-dark)'
    : 'var(--bai-resource-unit-grid-ink-light)';
};

/**
 * Resolve arbitrary CSS color strings (including `var(...)` references) to
 * concrete computed colors via hidden probes under `host`, so the resolution
 * sees the component's own cascade (theme scope, `light-dark()`).
 */
const resolveColorsInDOM = (
  host: HTMLElement,
  colors: readonly string[],
): Record<string, string> => {
  const probeHost = document.createElement('div');
  probeHost.setAttribute('aria-hidden', 'true');
  probeHost.style.cssText =
    'position:absolute;visibility:hidden;pointer-events:none;width:0;height:0;overflow:hidden';
  const probes = colors.map((color) => {
    const el = document.createElement('div');
    el.style.color = color;
    probeHost.appendChild(el);
    return el;
  });
  host.appendChild(probeHost);
  const out: Record<string, string> = {};
  colors.forEach((color, i) => {
    out[color] = getComputedStyle(probes[i]).color;
  });
  host.removeChild(probeHost);
  return out;
};

const readMetricsFromDOM = (host: HTMLElement): UnitGridMetrics => {
  const cs = getComputedStyle(host);
  const len = (name: string, fallback: number): number => {
    const v = parseFloat(cs.getPropertyValue(name));
    return Number.isFinite(v) ? v : fallback;
  };
  return deriveMetrics(
    len('--spacing-4', 16),
    len('--spacing-0-5', 2),
    Math.min(len('--radius-element', 4), 4),
  );
};

export interface BAIUnitGridUnit {
  /** Resolved fill color of this unit cell. */
  color: string;
  /** 0..1 partial fill of this unit (fraction cells render bottom-up). */
  fraction?: number;
}

export interface BAIUnitGridGroup {
  key: string;
  /** Shown as the group initial and the popover chrome; falls back to `key`. */
  label?: string;
  units: BAIUnitGridUnit[];
  /** Plate outline style; 'dashed' marks a group as visually tentative. */
  plateVariant?: 'solid' | 'dashed';
}

export interface BAIResourceUnitGridProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> {
  groups: BAIUnitGridGroup[];
  layout?: UnitGridLayout;
  /** Resolved group hues; defaults to the component's token-backed muted 7-set. */
  groupPalette?: string[];
  /** Controlled per-group palette-index overrides, keyed by `group.key`. */
  hueOverrides?: Record<string, number>;
  /** Enables the popover's palette picker row when provided. */
  onHueOverrideChange?: (key: string, paletteIdx: number) => void;
  legendItems?: Array<{ color: string; label: string }>;
  renderGroupPopover?: (
    group: BAIUnitGridGroup,
    ctx: { hue: string; closePopover: () => void },
  ) => React.ReactNode;
  onClickGroup?: (key: string) => void;
  emptyFallback?: React.ReactNode;
  maxUnitsPerGroup?: number;
  /**
   * Fixed lattice column count. When omitted the count is derived from the
   * measured wrapper width (ResizeObserver); pass it for fixed layouts and
   * for jsdom tests, where no real layout exists.
   */
  columns?: number;
}

const BAIResourceUnitGrid: React.FC<BAIResourceUnitGridProps> = ({
  groups,
  layout = 'serpentine',
  groupPalette,
  hueOverrides,
  onHueOverrideChange,
  legendItems,
  renderGroupPopover,
  onClickGroup,
  emptyFallback,
  maxUnitsPerGroup = DEFAULT_MAX_UNITS_PER_GROUP,
  columns,
  className,
  ...divProps
}) => {
  'use memo';
  const { t } = useBAIi18n();
  const palette =
    groupPalette && groupPalette.length > 0 ? groupPalette : DEFAULT_PALETTE;

  const rootRef = useRef<HTMLDivElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [wrapperWidth, setWrapperWidth] = useState(0);

  const visibleGroups = groups.filter((g) => g.units.length > 0);
  const hasGroups = visibleGroups.length > 0;

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      setWrapperWidth(entries[0]?.contentRect.width ?? 0);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [hasGroups]);

  // Concrete colors (for the WCAG letter-ink decision) and token-derived
  // metrics, resolved against the live cascade. Paint itself uses the raw
  // strings — `var(...)` fills keep tracking theme changes; only the ink
  // decision is a snapshot per color-set change.
  const [metrics, setMetrics] = useState<UnitGridMetrics>(() =>
    deriveMetrics(),
  );
  const [resolvedColors, setResolvedColors] = useState<Record<string, string>>(
    {},
  );
  const distinctColors = Array.from(
    new Set(visibleGroups.flatMap((g) => g.units.map((u) => u.color))),
  );
  const colorsKey = distinctColors.join(' ');
  const refreshResolved = useEffectEvent(() => {
    const host = rootRef.current;
    if (!host) return;
    const nextMetrics = readMetricsFromDOM(host);
    setMetrics((prev) =>
      prev.cellPx === nextMetrics.cellPx &&
      prev.gapPx === nextMetrics.gapPx &&
      prev.radiusPx === nextMetrics.radiusPx
        ? prev
        : nextMetrics,
    );
    const next = resolveColorsInDOM(host, [
      ...distinctColors,
      EMPTY_FILL_COLOR,
      EMPTY_FILL_BACKDROP,
    ]);
    setResolvedColors((prev) => {
      const keys = Object.keys(next);
      const same =
        keys.length === Object.keys(prev).length &&
        keys.every((k) => prev[k] === next[k]);
      return same ? prev : next;
    });
  });
  // Live theme flips change what the same var()/color-mix() strings resolve
  // to, so the ink snapshot must re-probe on root theme attribute changes.
  const [themeEpoch, setThemeEpoch] = useState(0);
  useEffect(() => {
    const observer = new MutationObserver(() => setThemeEpoch((e) => e + 1));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'data-astryx-theme', 'class', 'style'],
    });
    return () => observer.disconnect();
  }, []);
  useLayoutEffect(() => {
    refreshResolved();
  }, [colorsKey, themeEpoch]);

  // Anchored, hoverable popover: hiding is delayed so the mouse can travel
  // from the cells onto it.
  const [hoverKey, setHoverKey] = useState<string | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelHide = () => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  };
  const scheduleHide = () => {
    cancelHide();
    hideTimer.current = setTimeout(() => {
      setHoverKey(null);
      setPickerFor(null);
    }, POPOVER_HIDE_DELAY_MS);
  };
  useEffect(() => cancelHide, []);

  // Which group the picker was opened for — compared against hoverKey so
  // moving to another group closes it without an effect.
  const [pickerFor, setPickerFor] = useState<string | null>(null);
  const pickerOpen = pickerFor !== null && pickerFor === hoverKey;

  // Wrapper viewport rect, measured post-render (reading refs during render
  // is forbidden); the popover positions itself from these coordinates.
  const [wrapperRect, setWrapperRect] = useState<{
    left: number;
    top: number;
  } | null>(null);
  useEffect(() => {
    if (hoverKey !== null) {
      const r = wrapperRef.current?.getBoundingClientRect();
      setWrapperRect(r ? { left: r.left, top: r.top } : null);
    }
  }, [hoverKey]);

  // The popover is fixed-position, so any scroll invalidates its anchor —
  // dismiss instead of drifting.
  const hoverOpen = hoverKey !== null;
  useEffect(() => {
    if (!hoverOpen) return;
    const onScroll = () => {
      setHoverKey(null);
      setPickerFor(null);
    };
    window.addEventListener('scroll', onScroll, true);
    return () => window.removeEventListener('scroll', onScroll, true);
  }, [hoverOpen]);

  const groupByKey = new Map(visibleGroups.map((g) => [g.key, g]));
  const flowIndexByKey = new Map(visibleGroups.map((g, i) => [g.key, i]));

  // Default hues cycle the palette in FLOW order so adjacent groups are
  // always distinct; overrides are keyed by the group's stable key.
  const hueIndexFor = (key: string): number => {
    const base = hueOverrides?.[key] ?? flowIndexByKey.get(key) ?? 0;
    return ((base % palette.length) + palette.length) % palette.length;
  };
  const hueFor = (key: string): string => palette[hueIndexFor(key)];

  const letterFor = (key: string): string => {
    const group = groupByKey.get(key);
    return ((group?.label || key).charAt(0) || '?').toUpperCase();
  };

  const inkFor = (color: string): string =>
    inkForLuminance(relativeLuminance(resolvedColors[color] ?? color));

  const emptyFillLuminance = ((): number | null => {
    const fg = parseColorChannels(resolvedColors[EMPTY_FILL_COLOR] ?? '');
    if (!fg) return null;
    if (fg[3] >= 1) return luminanceOfChannels([fg[0], fg[1], fg[2]]);
    const bg = parseColorChannels(resolvedColors[EMPTY_FILL_BACKDROP] ?? '');
    if (!bg) return null;
    const a = fg[3];
    return luminanceOfChannels([
      fg[0] * a + bg[0] * (1 - a),
      fg[1] * a + bg[1] * (1 - a),
      fg[2] * a + bg[2] * (1 - a),
    ]);
  })();

  const letterInkFor = (unit: BAIUnitGridUnit): string =>
    unit.fraction !== undefined && unit.fraction < LETTER_ON_EMPTY_MAX_FRACTION
      ? inkForLuminance(emptyFillLuminance)
      : inkFor(unit.color);

  const latticeCols = columns ?? latticeColsForWidth(wrapperWidth, metrics);
  const packed = packGroups(visibleGroups, maxUnitsPerGroup);
  const placed = placeCells(packed, layout, latticeCols, metrics);
  const { width: svgWidth, height: svgHeight } = gridSize(
    placed,
    latticeCols,
    metrics,
  );
  const segGroups = groupConsecutiveSegments(extractSegments(placed, metrics));
  const letterIdx = letterCellIndices(placed);

  const hoveredGroup =
    hoverKey === null ? null : (groupByKey.get(hoverKey) ?? null);
  const hoverAnchorIdx =
    hoverKey === null ? undefined : letterIdx.get(hoverKey);
  const hoverAnchor =
    hoverAnchorIdx === undefined ? null : (placed[hoverAnchorIdx] ?? null);
  // No ref access here: this is handed to `renderGroupPopover`, which runs
  // during render. A pending hide timer is harmless — it re-sets null.
  const closePopover = () => {
    setHoverKey(null);
    setPickerFor(null);
  };

  const groupKeyFromEvent = (e: React.MouseEvent): string | null =>
    (e.target as Element).getAttribute?.('data-group-key') ?? null;

  const showGrid = hasGroups && (columns !== undefined || wrapperWidth > 0);
  const showPopover =
    hoveredGroup !== null &&
    hoverKey !== null &&
    hoverAnchor !== null &&
    wrapperRect !== null &&
    (renderGroupPopover !== undefined || onHueOverrideChange !== undefined);

  return (
    <BAIFlex
      ref={rootRef}
      direction="column"
      align="stretch"
      gap="sm"
      className={classNames('bai-resource-unit-grid', className)}
      {...divProps}
    >
      {legendItems && legendItems.length > 0 && (
        <BAIFlex gap="sm" wrap="wrap" align="center">
          {legendItems.map((item, i) => (
            <BAIFlex key={i} gap={4} align="center">
              <svg width={10} height={10} role="img" aria-label={item.label}>
                <rect
                  width={10}
                  height={10}
                  rx={2}
                  style={{ fill: item.color }}
                />
              </svg>
              <Text size="sm" color="secondary">
                {item.label}
              </Text>
            </BAIFlex>
          ))}
        </BAIFlex>
      )}
      {!hasGroups ? (
        (emptyFallback ?? null)
      ) : (
        <div ref={wrapperRef} className="bai-resource-unit-grid-wrapper">
          {showGrid && (
            <svg
              width={svgWidth}
              height={svgHeight}
              role="img"
              aria-label={
                divProps['aria-label'] ??
                t('comp:BAIResourceUnitGrid.ResourceGrid')
              }
              className={classNames('bai-resource-unit-grid-svg', {
                'bai-resource-unit-grid-svg--clickable':
                  onClickGroup !== undefined,
              })}
              onMouseMove={(e) => {
                const key = groupKeyFromEvent(e);
                if (key === null) {
                  scheduleHide();
                } else {
                  cancelHide();
                  setHoverKey(key);
                }
              }}
              onMouseLeave={scheduleHide}
              onClick={(e) => {
                const key = groupKeyFromEvent(e);
                if (key !== null && onClickGroup) {
                  onClickGroup(key);
                }
              }}
            >
              {segGroups.map((segs) => {
                const key = segs[0].groupKey;
                const group = groupByKey.get(key);
                const hue = hueFor(key);
                const hovered = hoverKey === key;
                // Hover highlights the hovered group (stronger tint + border)
                // instead of dimming everything else.
                return (
                  <path
                    key={key}
                    data-group-key={key}
                    d={platePath(segs, metrics)}
                    style={{ fill: hue, stroke: hue }}
                    fillOpacity={hovered ? 0.32 : 0.15}
                    strokeWidth={hovered ? 2.5 : 1.5}
                    strokeDasharray={
                      group?.plateVariant === 'dashed'
                        ? PLATE_DASH_PATTERN
                        : undefined
                    }
                  >
                    <title>{group?.label ?? key}</title>
                  </path>
                );
              })}
              {placed.map((cell, i) => {
                const isPartial =
                  cell.unit.fraction !== undefined && cell.unit.fraction < 1;
                const cellHovered = hoverKey === cell.groupKey;
                return (
                  <g key={i}>
                    <rect
                      className="bai-resource-unit-grid-cell"
                      data-group-key={cell.groupKey}
                      x={cell.px}
                      y={cell.py}
                      width={metrics.cellPx}
                      height={metrics.cellPx}
                      rx={metrics.radiusPx}
                      style={{
                        fill: isPartial
                          ? 'var(--bai-resource-unit-grid-cell-empty)'
                          : cell.unit.color,
                        stroke: cellHovered
                          ? hueFor(cell.groupKey)
                          : 'var(--bai-resource-unit-grid-cell-stroke)',
                      }}
                      strokeWidth={cellHovered ? 1 : 0.5}
                    />
                    {isPartial && (
                      <rect
                        data-group-key={cell.groupKey}
                        x={cell.px}
                        y={
                          cell.py +
                          metrics.cellPx * (1 - (cell.unit.fraction ?? 0))
                        }
                        width={metrics.cellPx}
                        height={metrics.cellPx * (cell.unit.fraction ?? 0)}
                        rx={1}
                        style={{ fill: cell.unit.color }}
                      />
                    )}
                    {letterIdx.get(cell.groupKey) === i && (
                      <text
                        x={cell.px + metrics.cellPx / 2}
                        y={cell.py + metrics.cellPx / 2}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={metrics.cellPx * 0.62}
                        fontWeight={700}
                        pointerEvents="none"
                        style={{ fill: letterInkFor(cell.unit) }}
                      >
                        {letterFor(cell.groupKey)}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          )}
          {/* The svg's role="img" flattens its subtree for assistive tech, so
              per-group labels are exposed through this parallel sr-only list. */}
          <ul className="bai-resource-unit-grid-sr-only">
            {visibleGroups.map((g) => (
              <li key={g.key}>{g.label || g.key}</li>
            ))}
          </ul>
          {showPopover && (
            <div
              className="bai-resource-unit-grid-popover"
              onMouseEnter={cancelHide}
              onMouseLeave={scheduleHide}
              style={{
                borderColor: hueFor(hoverKey),
                ...(() => {
                  const left =
                    wrapperRect.left +
                    Math.max(
                      0,
                      Math.min(
                        hoverAnchor.px - metrics.platePadX,
                        Math.max(0, wrapperWidth - POPOVER_CLAMP_WIDTH),
                      ),
                    );
                  const cellTop = wrapperRect.top + hoverAnchor.py;
                  // Above the cell when there is viewport room, else below.
                  return cellTop >= POPOVER_FLIP_MIN_TOP
                    ? {
                        left,
                        top: cellTop - metrics.platePadY - POPOVER_OFFSET,
                        transform: 'translateY(-100%)',
                      }
                    : {
                        left,
                        top:
                          cellTop +
                          metrics.cellPx +
                          metrics.platePadY +
                          POPOVER_OFFSET,
                      };
                })(),
              }}
            >
              <BAIFlex direction="column" align="stretch" gap={6}>
                {pickerOpen && onHueOverrideChange && (
                  <BAIFlex gap={4} align="center">
                    {palette.map((hue, pi) => {
                      const pickThis = () => {
                        onHueOverrideChange(hoverKey, pi);
                        setPickerFor(null);
                      };
                      return (
                        <svg
                          key={pi}
                          width={20}
                          height={20}
                          role="button"
                          tabIndex={0}
                          aria-label={t('comp:BAIResourceUnitGrid.UseColorN', {
                            n: pi + 1,
                          })}
                          className="bai-resource-unit-grid-swatch"
                          onClick={pickThis}
                          onKeyDown={(e) => activateOnKey(e, pickThis)}
                        >
                          <rect
                            x={1}
                            y={1}
                            width={18}
                            height={18}
                            rx={5}
                            style={{ fill: hue, stroke: hue }}
                            fillOpacity={0.35}
                            strokeWidth={hueIndexFor(hoverKey) === pi ? 2 : 1}
                          />
                          {hueIndexFor(hoverKey) === pi && (
                            <text
                              x={10}
                              y={10.5}
                              textAnchor="middle"
                              dominantBaseline="central"
                              fontSize={11}
                              fontWeight={700}
                              pointerEvents="none"
                              style={{ fill: hue }}
                            >
                              ✓
                            </text>
                          )}
                        </svg>
                      );
                    })}
                  </BAIFlex>
                )}
                {onHueOverrideChange && (
                  <BAIFlex gap={6} align="center">
                    <svg
                      width={16}
                      height={16}
                      role="button"
                      tabIndex={0}
                      aria-label={t(
                        'comp:BAIResourceUnitGrid.ChangeGroupColor',
                      )}
                      className="bai-resource-unit-grid-swatch"
                      onClick={() =>
                        setPickerFor((v) => (v === hoverKey ? null : hoverKey))
                      }
                      onKeyDown={(e) =>
                        activateOnKey(e, () =>
                          setPickerFor((v) =>
                            v === hoverKey ? null : hoverKey,
                          ),
                        )
                      }
                    >
                      <rect
                        x={1}
                        y={1}
                        width={14}
                        height={14}
                        rx={4}
                        style={{
                          fill: hueFor(hoverKey),
                          stroke: hueFor(hoverKey),
                        }}
                        fillOpacity={0.15}
                        strokeWidth={1.5}
                      />
                    </svg>
                    <Text size="sm" weight="semibold">
                      {hoveredGroup.label || hoveredGroup.key}
                    </Text>
                  </BAIFlex>
                )}
                {renderGroupPopover?.(hoveredGroup, {
                  hue: hueFor(hoverKey),
                  closePopover,
                })}
              </BAIFlex>
            </div>
          )}
        </div>
      )}
    </BAIFlex>
  );
};

export default BAIResourceUnitGrid;
