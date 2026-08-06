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

 PILOT-DECISIONs:
 - **Interval dropdown dropped.** BUI opens an antd `Dropdown` menu to pick the
   interval. Astryx's `DropdownMenu` + `DropdownMenuRadioGroup` could carry it,
   but the pilot page never passes `onChangeAutoUpdateDelay`, so the dropdown
   never renders there. Rebuilding it is real remaining cost, not zero.
 - **`BAICountdownBorder` dropped.** BUI animates a depleting border around the
   button showing time-to-next-refresh. It is a bespoke SVG/CSS animation with
   no Astryx counterpart and would have to be ported verbatim.
 - **P8 handled properly.** Astryx requires a string `label` that doubles as the
   accessible name. The BUI original renders an icon-only antd Button whose only
   accessible name came from the tooltip `title`. Here the label is an explicit,
   translated string ("Refresh"), and the last-updated text goes to the tooltip
   — so the control is *more* accessible than the original, not less.
*/
import { IconButton } from '@astryxdesign/core/IconButton';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { RefreshCwIcon } from 'lucide-react';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

dayjs.extend(relativeTime);

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
    ? `${t('comp:BAIFetchKeyButton.LastUpdated')}: ${dayjs(lastLoadTime).fromNow()}`
    : undefined;

  return (
    <IconButton
      // P8: an explicit accessible name, which the antd original never had.
      label={t('button.Refresh')}
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
      size={SIZE_MAP[size] ?? 'md'}
      onClick={() => {
        onChange(new Date().toISOString());
        setCycleKey((k) => k + 1);
      }}
    />
  );
};

export default BAIFetchKeyButtonAstryx;
