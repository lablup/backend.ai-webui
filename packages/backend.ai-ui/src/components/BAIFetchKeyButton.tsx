import { omitNullAndUndefinedFields } from '../helper';
import { useBAIi18n } from '../hooks/useBAIi18n';
import { useInterval, useIntervalValue } from '../hooks/useIntervalValue';
import BAICountdownBorder from './BAICountdownBorder';
import { CheckOutlined, ReloadOutlined } from '@ant-design/icons';
import { useControllableValue } from 'ahooks';
import {
  Button,
  Dropdown,
  Space,
  theme,
  Tooltip,
  type ButtonProps,
  type MenuProps,
} from 'antd';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import * as _ from 'lodash-es';
import { ChevronDown, ChevronUp } from 'lucide-react';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

dayjs.extend(duration);

/**
 * Default auto-refresh interval presets (in milliseconds) offered in the
 * interval-selection dropdown. "Off" (`null`) is always prepended by the
 * component and must NOT be included here. Consumers can override the list
 * via the `autoUpdateDelayOptions` prop.
 */
export const AUTO_UPDATE_DELAY_OPTIONS = [
  5_000, 10_000, 15_000, 30_000, 60_000,
] as const;

export interface BAIFetchKeyButtonProps extends Omit<
  ButtonProps,
  'value' | 'onChange' | 'loading'
> {
  value: string;
  loading?: boolean;
  lastLoadTime?: Date;
  showLastLoadTime?: boolean;
  /**
   * Auto-refresh interval in milliseconds; `null`/absent disables auto-refresh.
   * Controllable — pair with `onChangeAutoUpdateDelay` to let the interval
   * dropdown change it and let the host persist it (e.g. via `useBAISetting`).
   * Without `onChangeAutoUpdateDelay` it is simply a fixed interval, exactly as
   * existing consumers use it.
   */
  autoUpdateDelay?: number | null;
  size?: ButtonProps['size'];
  onChange: (fetchKey: string) => void;
  hidden?: boolean;
  pauseWhenHidden?: boolean;
  /**
   * Fired when the user picks an interval (or "Off") from the dropdown.
   * **Providing this callback opts the button into the interval-selection
   * dropdown** (and makes `autoUpdateDelay` a controllable value). Without it,
   * the component renders exactly as before — a single refresh button. The
   * parent decides whether to show the dropdown simply by wiring this handler
   * (typically to a persisted setting).
   */
  onChangeAutoUpdateDelay?: (delayMs: number | null) => void;
  /**
   * Interval presets shown in the dropdown, in milliseconds. "Off" (`null`) is
   * always prepended by the component and must NOT be included here.
   * Defaults to {@link AUTO_UPDATE_DELAY_OPTIONS}.
   */
  autoUpdateDelayOptions?: readonly number[];
  /**
   * Whether to show the animated countdown border that fills the control while
   * auto-refresh is on. Defaults to `true`.
   */
  showCountdownBorder?: boolean;
}

/**
 * A refresh button that manages fetch keys for data refetching with auto-update capabilities.
 * Extends Ant Design Button with fetch key management, auto-refresh, and last update time display.
 *
 * @param value - Current fetch key value
 * @param loading - Loading state of the data fetch
 * @param lastLoadTime - Timestamp of the last successful load
 * @param showLastLoadTime - When true, shows "Last updated: X ago" in tooltip
 * @param autoUpdateDelay - Auto-refresh interval in milliseconds (controllable), null to disable
 * @param onChange - Callback fired when fetch key should be updated
 * @param hidden - When true, hides the button completely
 * @param pauseWhenHidden - When true, pauses auto-update when button is hidden
 * @param onChangeAutoUpdateDelay - Callback fired when the user picks an interval (or "Off"); providing it shows the interval-selection dropdown
 * @param autoUpdateDelayOptions - Interval presets (ms) shown in the dropdown
 * @param showCountdownBorder - When true (default), shows the animated countdown border while auto-refresh is on
 */
const BAIFetchKeyButton: React.FC<BAIFetchKeyButtonProps> = ({
  loading,
  onChange,
  showLastLoadTime,
  autoUpdateDelay,
  size,
  hidden,
  lastLoadTime: lastLoadTimeProp,
  pauseWhenHidden = true,
  onChangeAutoUpdateDelay,
  autoUpdateDelayOptions = AUTO_UPDATE_DELAY_OPTIONS,
  showCountdownBorder = true,
  ...buttonProps
}) => {
  'use memo';

  // Providing `onChangeAutoUpdateDelay` opts the button into the
  // interval-selection dropdown; without it the component renders exactly as
  // before (a single refresh button), keeping all existing consumers unchanged.
  const isAutoUpdateConfigurable = onChangeAutoUpdateDelay !== undefined;

  const { t } = useBAIi18n();
  const [lastLoadTime, setLastLoadTime] = useControllableValue(
    // To use the default value when lastLoadTimeProp is undefined, we need to omit the value field
    omitNullAndUndefinedFields({
      value: lastLoadTimeProp,
    }),
    {
      defaultValue: new Date(),
    },
  );

  // The auto-refresh interval is a controllable value built on `autoUpdateDelay`
  // (`null` means "Off"): when the parent passes it the value is controlled and
  // the dropdown reports changes via `onChangeAutoUpdateDelay`; otherwise the
  // component keeps it internally. We assemble the props by hand — rather than
  // `omitNullAndUndefinedFields` (as used for `lastLoadTime` above) — because
  // that helper strips `null`, which would turn a controlled "Off" into an
  // uncontrolled value. So include `value` only when `autoUpdateDelay` is
  // defined, which preserves an explicit `null`.
  const selectedDelayControllableProps =
    autoUpdateDelay !== undefined
      ? { value: autoUpdateDelay, onChange: onChangeAutoUpdateDelay }
      : { onChange: onChangeAutoUpdateDelay };
  const [selectedDelay, setSelectedDelay] = useControllableValue<number | null>(
    selectedDelayControllableProps,
    {
      defaultValue: null,
    },
  );

  // display loading icon for at least "some ms" to avoid flickering
  const [displayLoading, setDisplayLoading] = useState(false);
  const turnOffTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadingStartTimeRef = useRef<number | null>(null);
  useEffect(() => {
    if (loading) {
      // a new load started: cancel any pending "turn-off" and show immediately
      if (turnOffTimeoutRef.current !== null) {
        clearTimeout(turnOffTimeoutRef.current);
        turnOffTimeoutRef.current = null;
      }
      loadingStartTimeRef.current = Date.now();
      // eslint-disable-next-line react-hooks/set-state-in-effect -- immediate icon-on preserves the min-700ms anti-flicker timing
      setDisplayLoading(true);
    } else if (loadingStartTimeRef.current !== null) {
      // loading finished: keep the icon visible for at least 700ms total
      const elapsedTime = Date.now() - loadingStartTimeRef.current;
      const remainingTime = Math.max(700 - elapsedTime, 0);
      loadingStartTimeRef.current = null;
      turnOffTimeoutRef.current = setTimeout(() => {
        setDisplayLoading(false);
        turnOffTimeoutRef.current = null;
      }, remainingTime);
    }
    return () => {
      if (turnOffTimeoutRef.current !== null) {
        clearTimeout(turnOffTimeoutRef.current);
        turnOffTimeoutRef.current = null;
      }
    };
  }, [loading]);

  const loadTimeMessage = useIntervalValue(
    () => {
      if (lastLoadTime) {
        return `${t('comp:BAIFetchKeyButton.LastUpdated')}: ${dayjs(lastLoadTime).fromNow()}`;
      }
      return '';
    },
    showLastLoadTime ? 5_000 : null,
    lastLoadTime.toISOString(),
    pauseWhenHidden,
  );

  // remember when loading is done to display when the last fetch was done
  useLayoutEffect(() => {
    if (!loading) {
      setLastLoadTime(new Date());
    }
  }, [loading, setLastLoadTime]);

  // Single entry point for every refresh, manual or automatic. Bumping
  // `cycleKey` re-anchors both the auto-refresh interval (via `useInterval`'s
  // `resetKey`) and the countdown border animation (via `BAICountdownBorder`'s
  // `resetKey`) to this exact moment, so a mid-cycle manual refresh restarts
  // the countdown instead of leaving it to fire on its stale schedule, and the
  // animation never drifts out of sync with the real reload — each refresh,
  // whichever triggered it, resets both clocks together.
  const [cycleKey, setCycleKey] = useState(0);
  const triggerRefresh = () => {
    onChange(new Date().toISOString());
    setCycleKey((key) => key + 1);
  };

  useInterval(
    triggerRefresh,
    // only start auto-updating after the previous loading is false(done).
    loading ? null : selectedDelay,
    pauseWhenHidden,
    cycleKey,
  );

  // When a consumer-supplied `loading` refresh finishes, re-anchor the countdown
  // to this moment. `useInterval` already restarts the paused interval on the
  // same `loading` true->false transition (its delay flips from null back to
  // `selectedDelay`); bumping `cycleKey` here restarts the border animation from
  // empty at the same instant, so the newly exposed countdown stays accurate
  // instead of finishing early on its request-start anchor.
  const [prevLoading, setPrevLoading] = useState(loading);
  if (loading !== prevLoading) {
    setPrevLoading(loading);
    if (!loading) {
      setCycleKey((key) => key + 1);
    }
  }

  const tooltipTitle = showLastLoadTime ? loadTimeMessage : undefined;
  const isAutoRefreshOn = selectedDelay !== null;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // "Sticky" off-list intervals: when an active value outside the consumer's
  // presets appears (e.g. a persisted legacy 7s), remember it for the lifetime
  // of the component so it stays selectable in the menu even after the user
  // switches to another interval — it must not vanish the way a transient
  // injection would. The consumer's `autoUpdateDelayOptions` is never mutated.
  const [seenOffListDelays, setSeenOffListDelays] = useState<number[]>([]);
  // The `undefined` sentinel (which `selectedDelay: number | null` never
  // equals) guarantees the first render is evaluated too.
  const [trackedDelay, setTrackedDelay] = useState<number | null | undefined>(
    undefined,
  );
  if (selectedDelay !== trackedDelay) {
    // On a real interval change (not the initial render), re-anchor the
    // countdown to this moment: `useInterval` already restarts its schedule on
    // the new delay, so bump `cycleKey` to remount `BAICountdownBorder` and
    // refill from empty over the new duration — instead of morphing the
    // in-flight fill to the new speed mid-cycle. `undefined` (the initial
    // `trackedDelay`) means "first render", where the border mounts fresh
    // anyway, so skip the bump there.
    if (trackedDelay !== undefined) {
      setCycleKey((key) => key + 1);
    }
    setTrackedDelay(selectedDelay);
    if (
      selectedDelay !== null &&
      !autoUpdateDelayOptions.includes(selectedDelay)
    ) {
      setSeenOffListDelays((prev) =>
        prev.includes(selectedDelay) ? prev : [...prev, selectedDelay],
      );
    }
  }

  // Icon-only refresh button. When the interval dropdown is shown, the selected
  // interval label ("Ns") lives on the dropdown trigger, not here.
  const refreshButton = (
    <Button
      title={tooltipTitle ? undefined : t('comp:BAIFetchKeyButton.Refresh')}
      loading={displayLoading}
      size={size}
      icon={<ReloadOutlined />}
      onClick={triggerRefresh}
      {...buttonProps}
    />
  );

  // While auto-refresh is on (and `showCountdownBorder`), wrap the control in
  // `BAICountdownBorder` so its border fills clockwise, once per selected
  // interval, restarting exactly on `cycleKey` (see `triggerRefresh` above) so
  // it never drifts out of sync with the real refresh — whether the cycle was
  // completed automatically or cut short by a manual click. While a
  // consumer-supplied `loading` refresh is in flight the border is frozen
  // (`paused={loading}`) instead of advancing, and it is re-anchored (via the
  // `cycleKey` bump on the `loading` true->false edge above) when the refresh
  // completes, so it never finishes or loops ahead of the real reload.
  const withCountdownBorder = (node: React.ReactNode) =>
    isAutoRefreshOn && showCountdownBorder ? (
      <BAICountdownBorder
        durationMs={selectedDelay as number}
        resetKey={cycleKey}
        paused={loading}
      >
        {node}
      </BAICountdownBorder>
    ) : (
      node
    );

  if (hidden) {
    return null;
  }

  // No interval handler wired (default): render exactly as before — a single
  // tooltip-wrapped refresh button. No layout or behavior change for the
  // existing consumers.
  if (!isAutoUpdateConfigurable) {
    return withCountdownBorder(
      <Tooltip title={tooltipTitle} placement="topLeft">
        {refreshButton}
      </Tooltip>,
    );
  }

  // Feature enabled: a Space.Compact group of the refresh button + a chevron
  // dropdown trigger to pick the auto-refresh interval (or turn it off). The
  // trigger shows the selected interval ("Ns") next to the chevron; the active
  // menu option carries a check mark. Inactive options render the same icon
  // hidden so every row stays aligned without a hardcoded spacer width.
  const checkMark = (active: boolean) => (
    <CheckOutlined style={{ visibility: active ? 'visible' : 'hidden' }} />
  );
  // Render an interval (ms) as a compact label, using the largest whole unit:
  // "30s" / "5m" / "1h". `dayjs.duration` only picks the unit; the unit text
  // itself is localized via i18n (e.g. ko "5분", ja "5分"), consistent with the
  // existing `time.*` translations.
  const formatInterval = (ms: number) => {
    const d = dayjs.duration(ms);
    const hours = d.asHours();
    const minutes = d.asMinutes();
    if (Number.isInteger(hours) && hours >= 1) {
      return t('comp:BAIFetchKeyButton.EveryHours', { count: hours });
    }
    if (Number.isInteger(minutes) && minutes >= 1) {
      return t('comp:BAIFetchKeyButton.EveryMinutes', { count: minutes });
    }
    return t('comp:BAIFetchKeyButton.EverySeconds', { count: d.asSeconds() });
  };
  // Menu options = the consumer's presets, plus any off-list interval that has
  // been active this session (sticky, so it stays selectable), plus the current
  // value. Deduped and ascending. This guarantees exactly one item is always
  // checked — the active value is always present — without ever mutating the
  // consumer's option list.
  const mergedOptions = [
    ...new Set([
      ...autoUpdateDelayOptions,
      ...seenOffListDelays,
      ...(selectedDelay !== null ? [selectedDelay] : []),
    ]),
  ].sort((a, b) => a - b);
  const menuItems: MenuProps['items'] = [
    {
      key: 'off',
      label: t('comp:BAIFetchKeyButton.Off'),
      icon: checkMark(selectedDelay === null),
      onClick: () => setSelectedDelay(null),
    },
    ...mergedOptions.map((ms) => ({
      key: String(ms),
      label: formatInterval(ms),
      icon: checkMark(selectedDelay === ms),
      onClick: () => setSelectedDelay(ms),
    })),
  ];

  const { token } = theme.useToken();

  return withCountdownBorder(
    <Space.Compact>
      <Tooltip title={tooltipTitle} placement="topLeft">
        {refreshButton}
      </Tooltip>
      <Dropdown
        trigger={['click']}
        placement="bottomRight"
        open={isDropdownOpen}
        onOpenChange={setIsDropdownOpen}
        menu={{ items: menuItems }}
      >
        <Tooltip title={t('comp:BAIFetchKeyButton.AutoRefresh')}>
          <Button
            size={size}
            style={{
              paddingInline: token.paddingXS,
            }}
            iconPlacement="end"
            icon={
              isDropdownOpen ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )
            }
            aria-label={t('comp:BAIFetchKeyButton.AutoRefresh')}
          >
            {isAutoRefreshOn ? formatInterval(selectedDelay as number) : null}
          </Button>
        </Tooltip>
      </Dropdown>
    </Space.Compact>,
  );
};

export default BAIFetchKeyButton;
