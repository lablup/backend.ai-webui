/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 PILOT PHASE 3 (cn-oss-removal / ticket 10) — local Astryx-backed
 `BAIFetchKeyButton` (the auto-refresh button).

 BUI's original is 412 LOC of antd `Button` + `Dropdown` + `Tooltip` +
 `BAICountdownBorder`. This rebuild keeps the semantics that matter and is
 explicit about what it drops.

 Reproduced from the BUI source:
 - `onChange(new Date().toISOString())` on every refresh, manual or automatic.
 - `autoUpdateDelay` (ms, `null` = off) drives a `setInterval`, and the interval
   is PAUSED while `loading` is true so a slow fetch never stacks requests.
 - A manual click re-anchors the interval (BUI does this with a `cycleKey`;
   here the effect's dependency on `cycleKey` has the same effect).
 - **The 700 ms anti-flicker floor on the spinner** — BUI keeps the spinning
   icon visible for at least 700 ms so a fast refetch does not strobe. This is
   easy to miss and is the single most behaviour-carrying detail in the file.
 - "Last updated N minutes ago" tooltip, re-rendered on a 5 s tick.

 PHASE 4 — the interval picker is now rebuilt:
 `ButtonGroup` (replacing antd's `Space.Compact`) joining the icon-only refresh
 button to a chevron trigger that shows the active interval ("30s"), opening a
 `DropdownMenu` in compound-component mode containing a
 `DropdownMenuRadioGroup` of `DropdownMenuRadioItem`s.

 Why this trio over `MoreMenu`: the original is a SPLIT control (a primary
 action welded to a menu trigger) whose menu is a single-choice list with
 exactly one check mark — `ButtonGroup` + `DropdownMenuRadioGroup` reproduces
 both halves natively, and `role="menuitemradio"` states the single-choice
 semantics that antd could only fake with a hidden/visible `CheckOutlined`.

 Faithfully carried over from BUI:
 - `AUTO_UPDATE_DELAY_OPTIONS` = 5/10/15/30/60 s, with "Off" always prepended.
 - `formatInterval` picks the largest whole unit and translates via the same
   `comp:BAIFetchKeyButton.Every{Seconds,Minutes,Hours}` keys.
 - **Sticky off-list intervals**: a persisted value outside the preset list
   (e.g. a legacy 7 s) is merged in and remembered for the component's lifetime
   so it stays selectable and exactly one item is always checked.
 - Changing the interval re-anchors the refresh cycle.

 PILOT-DECISION:
 - **i18n namespace split.** The `comp:BAIFetchKeyButton.*` keys live in
   `packages/backend.ai-ui/src/locale/*.json`, which is loaded by **BUI's own
   i18next instance** (FR-2986). A local rebuild under `react/src` uses the HOST
   `react-i18next` instance, which does not see that namespace — so the labels
   rendered as raw keys until explicit default values were supplied. Any BUI
   component pulled into the host during the migration hits this; the real fix
   is to move the keys into `resources/i18n/*.json` (22 files) as part of the
   component's move.
 - **`BAICountdownBorder` still dropped.** BUI animates a depleting border
   around the control showing time-to-next-refresh. It is a bespoke SVG/CSS
   animation with no Astryx counterpart and would have to be ported verbatim.
 - **P8 handled properly.** Astryx requires a string `label` that doubles as the
   accessible name. The BUI original renders an icon-only antd Button whose only
   accessible name came from the tooltip `title`. Here the label is an explicit,
   translated string ("Refresh"), and the last-updated text goes to the tooltip
   — so the control is *more* accessible than the original, not less.
*/
import { ButtonGroup } from '@astryxdesign/core/ButtonGroup';
import {
  DropdownMenu,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@astryxdesign/core/DropdownMenu';
import { IconButton } from '@astryxdesign/core/IconButton';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import { RefreshCwIcon } from 'lucide-react';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

dayjs.extend(relativeTime);
dayjs.extend(duration);

/** Same presets BUI offers. */
export const AUTO_UPDATE_DELAY_OPTIONS = [
  5_000, 10_000, 15_000, 30_000, 60_000,
];

export interface BAIFetchKeyButtonAstryxProps {
  /** Current fetch key. Not read — kept for prop-surface parity with BUI. */
  value?: string;
  loading?: boolean;
  onChange: (fetchKey: string) => void;
  /** Auto-refresh interval in ms; `null`/absent disables auto-refresh. */
  autoUpdateDelay?: number | null;
  onChangeAutoUpdateDelay?: (delayMs: number | null) => void;
  autoUpdateDelayOptions?: ReadonlyArray<number>;
  showLastLoadTime?: boolean;
  /** Accepted and ignored — the countdown border is not rebuilt. */
  pauseWhenHidden?: boolean;
  /**
   * P1 (17 -> 21 occurrences): `AutoUpdateFetchKeyButton` has ~15 consumers
   * outside the pilot graph that pass antd's size names and a `readonly`
   * options tuple. Accepting BOTH vocabularies keeps them compiling — the
   * same 'wrapper absorbs the API delta' move as everywhere else.
   */
  size?: 'sm' | 'md' | 'lg' | 'small' | 'middle' | 'large';
}

const SIZE_MAP: Record<string, 'sm' | 'md' | 'lg'> = {
  small: 'sm',
  middle: 'md',
  large: 'lg',
  sm: 'sm',
  md: 'md',
  lg: 'lg',
};

/** Minimum time the spinner stays visible, mirroring BUI's anti-flicker floor. */
const MIN_SPIN_MS = 700;

const BAIFetchKeyButtonAstryx: React.FC<BAIFetchKeyButtonAstryxProps> = ({
  loading = false,
  onChange,
  autoUpdateDelay = null,
  onChangeAutoUpdateDelay,
  autoUpdateDelayOptions = AUTO_UPDATE_DELAY_OPTIONS,
  showLastLoadTime = true,
  size = 'md',
}) => {
  'use memo';
  const { t } = useTranslation();

  const [lastLoadTime, setLastLoadTime] = useState<Date>(new Date());
  const [displayLoading, setDisplayLoading] = useState(false);
  const [cycleKey, setCycleKey] = useState(0);
  // Re-render on a 5 s tick so "3 minutes ago" stays honest.
  const [, setTick] = useState(0);

  // Providing `onChangeAutoUpdateDelay` opts the control into the interval
  // picker — the exact same switch BUI uses.
  const isAutoUpdateConfigurable = onChangeAutoUpdateDelay !== undefined;

  // Sticky off-list intervals (BUI parity): a persisted value outside the
  // preset list stays selectable for the component's lifetime, so exactly one
  // menu item is always checked and the consumer's option list is never mutated.
  const [seenOffListDelays, setSeenOffListDelays] = useState<Array<number>>([]);
  const [trackedDelay, setTrackedDelay] = useState<number | null | undefined>(
    undefined,
  );
  if (autoUpdateDelay !== trackedDelay) {
    setTrackedDelay(autoUpdateDelay);
    if (
      autoUpdateDelay != null &&
      !autoUpdateDelayOptions.includes(autoUpdateDelay)
    ) {
      setSeenOffListDelays((prev) =>
        prev.includes(autoUpdateDelay) ? prev : [...prev, autoUpdateDelay],
      );
    }
  }

  const turnOffTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadingStartRef = useRef<number | null>(null);

  // 700 ms anti-flicker floor — see the header note.
  useEffect(() => {
    if (loading) {
      if (turnOffTimeoutRef.current !== null) {
        clearTimeout(turnOffTimeoutRef.current);
        turnOffTimeoutRef.current = null;
      }
      loadingStartRef.current = Date.now();
      // Immediate icon-on is what preserves the min-700ms anti-flicker
      // timing (same disable the BUI original carries).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplayLoading(true);
    } else if (loadingStartRef.current !== null) {
      const elapsed = Date.now() - loadingStartRef.current;
      loadingStartRef.current = null;
      turnOffTimeoutRef.current = setTimeout(
        () => {
          setDisplayLoading(false);
          turnOffTimeoutRef.current = null;
        },
        Math.max(MIN_SPIN_MS - elapsed, 0),
      );
    }
    return () => {
      if (turnOffTimeoutRef.current !== null) {
        clearTimeout(turnOffTimeoutRef.current);
        turnOffTimeoutRef.current = null;
      }
    };
  }, [loading]);

  useLayoutEffect(() => {
    // The last-load timestamp is derived from the loading edge, as in BUI.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!loading) setLastLoadTime(new Date());
  }, [loading]);

  // Auto-refresh. Paused while `loading`, re-anchored by `cycleKey`.
  useEffect(() => {
    if (!autoUpdateDelay || loading) return;
    const id = setInterval(() => {
      onChange(new Date().toISOString());
      setCycleKey((k) => k + 1);
    }, autoUpdateDelay);
    return () => clearInterval(id);
    // `onChange` is stable at every call site in this graph.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoUpdateDelay, loading, cycleKey]);

  useEffect(() => {
    if (!showLastLoadTime) return;
    const id = setInterval(() => setTick((n) => n + 1), 5_000);
    return () => clearInterval(id);
  }, [showLastLoadTime]);

  const tooltip = showLastLoadTime
    ? `${t('comp:BAIFetchKeyButton.LastUpdated', 'Last Updated')}: ${dayjs(lastLoadTime).fromNow()}`
    : undefined;

  const resolvedSize = SIZE_MAP[size] ?? 'md';

  const triggerRefresh = () => {
    onChange(new Date().toISOString());
    setCycleKey((k) => k + 1);
  };

  const refreshButton = (
    <IconButton
      // P8: an explicit accessible name, which the antd original never had —
      // there the only name came from the tooltip.
      label={t('comp:BAIFetchKeyButton.Refresh', 'Refresh')}
      icon={
        <RefreshCwIcon
          style={
            displayLoading
              ? { animation: 'bai-fetchkey-spin 1s linear infinite' }
              : undefined
          }
        />
      }
      tooltip={tooltip}
      variant="ghost"
      size={resolvedSize}
      onClick={triggerRefresh}
    />
  );

  // Not configurable (the default, and what most consumers use): render exactly
  // the single icon button, with no layout change. BUI behaves the same way.
  if (!isAutoUpdateConfigurable) return refreshButton;

  /**
   * Largest whole unit, translated through the same keys BUI uses, so ko/ja
   * ("5분" / "5分") keep working unchanged.
   */
  const formatInterval = (ms: number) => {
    const d = dayjs.duration(ms);
    const hours = d.asHours();
    const minutes = d.asMinutes();
    if (Number.isInteger(hours) && hours >= 1) {
      return t('comp:BAIFetchKeyButton.EveryHours', '{{count}}h', {
        count: hours,
      });
    }
    if (Number.isInteger(minutes) && minutes >= 1) {
      return t('comp:BAIFetchKeyButton.EveryMinutes', '{{count}}m', {
        count: minutes,
      });
    }
    return t('comp:BAIFetchKeyButton.EverySeconds', '{{count}}s', {
      count: d.asSeconds(),
    });
  };

  const mergedOptions = [
    ...new Set([
      ...autoUpdateDelayOptions,
      ...seenOffListDelays,
      ...(autoUpdateDelay != null ? [autoUpdateDelay] : []),
    ]),
  ].sort((a, b) => a - b);

  const isAutoRefreshOn = autoUpdateDelay != null;

  return (
    <ButtonGroup
      label={t('comp:BAIFetchKeyButton.AutoRefresh', 'Auto Refresh')}
      size={resolvedSize}
    >
      {refreshButton}
      <DropdownMenu
        placement="below"
        alignment="end"
        button={{
          // The trigger shows the active interval ("30s") next to the chevron,
          // exactly as the antd original does; "Off" shows chevron only.
          label: t('comp:BAIFetchKeyButton.AutoRefresh', 'Auto Refresh'),
          variant: 'ghost',
          size: resolvedSize,
          children: isAutoRefreshOn
            ? formatInterval(autoUpdateDelay)
            : undefined,
          tooltip: t('comp:BAIFetchKeyButton.AutoRefresh', 'Auto Refresh'),
        }}
      >
        <DropdownMenuRadioGroup
          label={t('comp:BAIFetchKeyButton.AutoRefresh', 'Auto Refresh')}
          value={autoUpdateDelay == null ? 'off' : String(autoUpdateDelay)}
          onChange={(next) => {
            onChangeAutoUpdateDelay?.(next === 'off' ? null : Number(next));
            // Changing the interval re-anchors the refresh cycle, as in BUI.
            setCycleKey((k) => k + 1);
          }}
        >
          <DropdownMenuRadioItem
            value="off"
            label={t('comp:BAIFetchKeyButton.Off', 'Off')}
          />
          {mergedOptions.map((ms) => (
            <DropdownMenuRadioItem
              key={ms}
              value={String(ms)}
              label={formatInterval(ms)}
            />
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenu>
    </ButtonGroup>
  );
};

export default BAIFetchKeyButtonAstryx;
