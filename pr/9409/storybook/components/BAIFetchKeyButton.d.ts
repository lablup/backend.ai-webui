import { BAIButtonProps } from './BAIButton';
import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
/**
 * Default auto-refresh interval presets (in milliseconds) offered in the
 * interval-selection dropdown. "Off" (`null`) is always prepended by the
 * component and must NOT be included here. Consumers can override the list
 * via the `autoUpdateDelayOptions` prop.
 */
export declare const AUTO_UPDATE_DELAY_OPTIONS: readonly [5000, 10000, 15000, 30000, 60000];
export interface BAIFetchKeyButtonProps extends Omit<BAIButtonProps, 'value' | 'onChange' | 'loading'> {
    /**
     * Optional. The button self-generates its fetch key on each refresh
     * (`onChange(new Date().toISOString())`) and re-anchors its countdown via an
     * internal `cycleKey`, so it does not read this value. Consumers that drive
     * refetching directly (e.g. a preloaded `loadQuery(..., 'network-only')` in
     * `onChange`) can omit it entirely instead of threading a `useFetchKey`.
     */
    value?: string;
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
    size?: BAIButtonProps['size'];
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
declare const BAIFetchKeyButton: React.FC<BAIFetchKeyButtonProps>;
export default BAIFetchKeyButton;
