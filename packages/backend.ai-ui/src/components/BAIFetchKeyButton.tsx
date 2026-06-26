import { omitNullAndUndefinedFields } from '../helper';
import { useBAIi18n } from '../hooks/useBAIi18n';
import { useInterval, useIntervalValue } from '../hooks/useIntervalValue';
import {
  CaretDownOutlined,
  CaretUpOutlined,
  CheckOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useControllableValue } from 'ahooks';
import {
  Button,
  Dropdown,
  Space,
  Tooltip,
  type ButtonProps,
  type MenuProps,
} from 'antd';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

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
      // eslint-disable-next-line react-hooks/set-state-in-effect
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

  useInterval(
    () => {
      onChange(new Date().toISOString());
    },
    // only start auto-updating after the previous loading is false(done).
    loading ? null : selectedDelay,
    pauseWhenHidden,
  );

  const tooltipTitle = showLastLoadTime ? loadTimeMessage : undefined;
  const isAutoRefreshOn = isAutoUpdateConfigurable && selectedDelay !== null;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Icon-only refresh button. When the interval dropdown is shown, the selected
  // interval label ("Ns") lives on the dropdown trigger, not here.
  const refreshButton = (
    <Button
      title={tooltipTitle ? undefined : t('comp:BAIFetchKeyButton.Refresh')}
      loading={displayLoading}
      size={size}
      icon={<ReloadOutlined />}
      onClick={() => {
        onChange(new Date().toISOString());
      }}
      {...buttonProps}
    />
  );

  if (hidden) {
    return null;
  }

  // No interval handler wired (default): render exactly as before — a single
  // tooltip-wrapped refresh button. No layout or behavior change for the
  // existing consumers.
  if (!isAutoUpdateConfigurable) {
    return (
      <Tooltip title={tooltipTitle} placement="topLeft">
        {refreshButton}
      </Tooltip>
    );
  }

  // Feature enabled: a Space.Compact group of the refresh button + a caret
  // dropdown trigger to pick the auto-refresh interval (or turn it off). The
  // trigger shows the selected interval ("Ns") next to the caret; the active
  // menu option carries a check mark. Inactive options render the same icon
  // hidden so every row stays aligned without a hardcoded spacer width.
  const checkMark = (active: boolean) => (
    <CheckOutlined style={{ visibility: active ? 'visible' : 'hidden' }} />
  );
  // Guarantee exactly one menu item is ever checked: if the active interval is
  // on (non-null) but not one of the consumer-supplied presets (e.g. a legacy
  // 7s poller vs the default options), merge it in — deduped and ascending — so
  // it renders as a normal interval row instead of leaving the menu with
  // nothing checked while a timer runs. The consumer's option list itself is
  // never mutated.
  const mergedOptions =
    selectedDelay !== null && !autoUpdateDelayOptions.includes(selectedDelay)
      ? [...autoUpdateDelayOptions, selectedDelay].sort((a, b) => a - b)
      : autoUpdateDelayOptions;
  const menuItems: MenuProps['items'] = [
    {
      key: 'off',
      label: t('comp:BAIFetchKeyButton.Off'),
      icon: checkMark(selectedDelay === null),
      onClick: () => setSelectedDelay(null),
    },
    ...mergedOptions.map((ms) => ({
      key: String(ms),
      label: t('comp:BAIFetchKeyButton.EverySeconds', { count: ms / 1000 }),
      icon: checkMark(selectedDelay === ms),
      onClick: () => setSelectedDelay(ms),
    })),
  ];

  return (
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
            {...buttonProps}
            size={size}
            iconPosition="end"
            icon={isDropdownOpen ? <CaretUpOutlined /> : <CaretDownOutlined />}
            aria-label={t('comp:BAIFetchKeyButton.AutoRefresh')}
          >
            {isAutoRefreshOn
              ? t('comp:BAIFetchKeyButton.EverySeconds', {
                  count: (selectedDelay as number) / 1000,
                })
              : null}
          </Button>
        </Tooltip>
      </Dropdown>
    </Space.Compact>
  );
};

export default BAIFetchKeyButton;
