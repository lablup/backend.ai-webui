import {
  hasStoredUserSetting,
  useBAISettingUserState,
} from '../hooks/useBAISetting';
import { BAIFetchKeyButton } from 'backend.ai-ui';
import React, { ComponentProps } from 'react';

/**
 * Closed set of stable ids used to persist each consumer's auto-refresh
 * interval (`fetchKeyAutoUpdateDelay.<settingId>`). Typing `settingId` against
 * this union — instead of a bare `string` — gives every call site a single
 * auditable registry and turns typos or unregistered ids into compile errors,
 * mirroring `useHiddenColumnKeysSetting`'s `KnownSettingName`. (Uniqueness is
 * not enforced by the type system — two call sites can still pick the same id;
 * the union below is the manual guard against collisions.)
 */
export type FetchKeyAutoUpdateSettingId =
  // Compute session surfaces (user / admin / project-admin)
  | 'session-list'
  | 'admin-session-list'
  | 'project-admin-session'
  | 'pending-session-list'
  | 'session-detail'
  // Deployment lists
  | 'deployment-list'
  | 'admin-deployment-list'
  | 'project-admin-deployments'
  | 'deployment-replicas'
  // VFolder lists
  | 'vfolder-list'
  | 'admin-vfolder-list'
  | 'project-admin-data'
  // Other admin / detail surfaces
  | 'project-admin-users'
  | 'agent-detail'
  | 'agent-list'
  | 'storage-proxy-list'
  | 'scoped-audit-log'
  | 'login-history'
  | 'login-session'
  // Expensive / heavy views — default to the longer interval presets
  | 'fair-share-list'
  | 'user-sessions-metrics'
  | 'prometheus-preset'
  | 'reservoir'
  | 'reservoir-artifact-detail';

/**
 * Longer interval presets (ms) for expensive/heavy views (Prometheus metric
 * queries, fair-share). Pass via `autoUpdateDelayOptions` at those call sites so
 * their dropdown offers coarser cadences instead of the default 5–60s set.
 */
export const LONG_AUTO_UPDATE_DELAY_OPTIONS = [
  30_000, 60_000, 300_000, 600_000,
] as const;

type BAIFetchKeyButtonProps = ComponentProps<typeof BAIFetchKeyButton>;

interface AutoUpdateFetchKeyButtonProps extends Omit<
  BAIFetchKeyButtonProps,
  'onChangeAutoUpdateDelay' | 'autoUpdateDelay'
> {
  /**
   * Stable id used to persist the user-selected auto-refresh interval in user
   * settings (`fetchKeyAutoUpdateDelay.<settingId>`). Each consumer keeps its
   * own remembered interval. Must be a member of
   * {@link FetchKeyAutoUpdateSettingId} so typos/unregistered ids are caught at
   * compile time.
   */
  settingId: FetchKeyAutoUpdateSettingId;
  /**
   * Interval (ms) used the first time this consumer renders, before the user
   * has ever picked anything from the dropdown. Once the user picks an
   * interval (including "Off"), that choice is persisted and always wins over
   * this default. Pass the consumer's pre-FR-3147 fixed interval here so
   * pages that already auto-refreshed keep doing so; omit (defaults to `null`
   * / Off) for consumers newly gaining auto-refresh.
   */
  defaultAutoUpdateDelay?: number | null;
}

/**
 * Host wrapper around `BAIFetchKeyButton` that exposes the opt-in auto-refresh
 * interval dropdown (FR-3147) and persists the chosen interval via
 * `useBAISetting`, keyed per consumer by `settingId`.
 *
 * Auto-refresh starts at `defaultAutoUpdateDelay` (or off, if omitted) until
 * the user picks an interval from the dropdown; from then on their choice is
 * remembered per consumer across reloads and always wins over the default.
 *
 * The dropdown shows the default presets ({@link AUTO_UPDATE_DELAY_OPTIONS} in
 * BAIFetchKeyButton). A consumer can offer a different cadence by passing
 * `autoUpdateDelayOptions` (e.g. {@link LONG_AUTO_UPDATE_DELAY_OPTIONS} for
 * expensive views), which is forwarded to the underlying button.
 */
const AutoUpdateFetchKeyButton: React.FC<AutoUpdateFetchKeyButtonProps> = ({
  settingId,
  defaultAutoUpdateDelay = null,
  ...props
}) => {
  'use memo';
  const settingName = `fetchKeyAutoUpdateDelay.${settingId}` as const;
  const [autoUpdateDelay, setAutoUpdateDelay] =
    useBAISettingUserState(settingName);
  // Only fall back to `defaultAutoUpdateDelay` before the user has ever
  // touched the dropdown for this consumer. Once they have (including
  // explicitly choosing "Off"), the persisted value is `null` too, but it
  // must not be re-overridden by the default on every subsequent render.
  const resolvedAutoUpdateDelay = hasStoredUserSetting(settingName)
    ? (autoUpdateDelay ?? null)
    : defaultAutoUpdateDelay;
  return (
    <BAIFetchKeyButton
      {...props}
      autoUpdateDelay={resolvedAutoUpdateDelay}
      onChangeAutoUpdateDelay={setAutoUpdateDelay}
    />
  );
};

export default AutoUpdateFetchKeyButton;
