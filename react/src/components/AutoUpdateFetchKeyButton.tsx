import { useBAISettingUserState } from '../hooks/useBAISetting';
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
}

/**
 * Host wrapper around `BAIFetchKeyButton` that exposes the opt-in auto-refresh
 * interval dropdown (FR-3147) and persists the chosen interval via
 * `useBAISetting`, keyed per consumer by `settingId`.
 *
 * Auto-refresh is off by default; it only runs once the user picks an interval
 * from the dropdown, and the choice is remembered per consumer across reloads.
 *
 * The dropdown shows the default presets ({@link AUTO_UPDATE_DELAY_OPTIONS} in
 * BAIFetchKeyButton). A consumer can offer a different cadence by passing
 * `autoUpdateDelayOptions` (e.g. {@link LONG_AUTO_UPDATE_DELAY_OPTIONS} for
 * expensive views), which is forwarded to the underlying button.
 */
const AutoUpdateFetchKeyButton: React.FC<AutoUpdateFetchKeyButtonProps> = ({
  settingId,
  ...props
}) => {
  'use memo';
  const [autoUpdateDelay, setAutoUpdateDelay] = useBAISettingUserState(
    `fetchKeyAutoUpdateDelay.${settingId}`,
  );
  return (
    <BAIFetchKeyButton
      {...props}
      autoUpdateDelay={autoUpdateDelay ?? null}
      onChangeAutoUpdateDelay={setAutoUpdateDelay}
    />
  );
};

export default AutoUpdateFetchKeyButton;
