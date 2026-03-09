/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
// TODO(needs-backend): Migration plan for Domain Configuration API
//
// When the backend implements the new schema (spec: 2026.1.23), this file
// should be updated as follows:
//
// 1. Queries:
//    - mergedAppConfig { extraConfig }  →  userPreference { mergedValue }
//    - userAppConfig { extraConfig }    →  userPreference { value }
//
// 2. Mutations:
//    - upsertUserAppConfig (full replacement)  →  setUserPreference (partial update)
//    - deleteUserAppConfig                     →  TBD (clarify with backend)
//
// 3. New hooks to add:
//    - useDomainConfig(domain): reads DomainConfig with scoped fields
//      (publicConfig, authenticatedConfig, adminConfig, userPreferenceDefaults)
//    - useDomainPublicConfig(domain): reads public config without auth
//      (for pre-login theme/branding)
//    - useSetDomainConfig(): admin mutation for domain-level settings
//
// 4. Access control scopes (DomainConfig fields):
//    - publicConfig:             anyone (including anonymous)
//    - authenticatedConfig:      logged-in users
//    - adminConfig:              admin only
//    - userPreferenceDefaults:   logged-in users (read), admin (write)
//
// The consumer-facing `useAppSetting` hook interface should remain unchanged,
// so page-level components (e.g., UserSettingsPage) won't need modifications.
import type { useAppConfigDeleteUserMutation } from '../__generated__/useAppConfigDeleteUserMutation.graphql';
import type { useAppConfigMergedQuery } from '../__generated__/useAppConfigMergedQuery.graphql';
import type { useAppConfigUpsertUserMutation } from '../__generated__/useAppConfigUpsertUserMutation.graphql';
import type { useAppConfigUserQuery } from '../__generated__/useAppConfigUserQuery.graphql';
import { useUpdatableState } from 'backend.ai-ui';
import { useCallback } from 'react';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';

/**
 * Shape of the `extraConfig` JSON stored in AppConfig.
 *
 * All keys are optional — absence means "use domain default" (or no value set).
 * Keep this flat (single-level keys) because the backend uses shallow merge.
 *
 * TODO(needs-backend): This interface corresponds to the `UserPreference.value`
 * JSON blob in the new spec. The shape can remain the same; consider renaming
 * to `UserPreferenceValue` for clarity.
 */
export interface AppConfigExtra {
  // UI preferences
  selected_language?: string;
  compact_sidebar?: boolean;
  desktop_notification?: boolean;
  preserve_login?: boolean;
  auto_logout?: boolean;
  automatic_update_check?: boolean;
  experimental_ai_agents?: boolean;
  max_concurrent_uploads?: number;
  beta_feature?: boolean;
  resource_panel_type?:
    | 'MyResource'
    | 'MyResourceWithinResourceGroup'
    | 'TotalResourceWithinResourceGroup';
}

/**
 * Reads the merged (domain + user) app configuration.
 *
 * The merged config combines domain-level defaults with user-level overrides,
 * where user settings take precedence for the same keys (shallow merge).
 *
 * This hook suspends while loading — wrap with a Suspense boundary.
 *
 * TODO(needs-backend): Replace `mergedAppConfig { extraConfig }` with
 * `userPreference { mergedValue }` when the Domain Configuration API lands.
 * The returned shape stays the same — only the GraphQL operation changes.
 */
export const useAppConfig = (options?: {
  fetchPolicy?: 'store-and-network' | 'store-or-network' | 'network-only';
}) => {
  'use memo';
  const [fetchKey, updateFetchKey] = useUpdatableState('first');

  const data = useLazyLoadQuery<useAppConfigMergedQuery>(
    graphql`
      query useAppConfigMergedQuery {
        mergedAppConfig {
          extraConfig @since(version: "25.16.0")
        }
      }
    `,
    {},
    {
      fetchPolicy: options?.fetchPolicy ?? 'store-and-network',
      fetchKey,
    },
  );

  const config = (data.mergedAppConfig?.extraConfig ?? {}) as AppConfigExtra;

  const refresh = useCallback(() => {
    updateFetchKey();
  }, [updateFetchKey]);

  return [config, { refresh }] as const;
};

/**
 * Reads the user-level app configuration (without domain defaults).
 *
 * Use this when you need to distinguish between what the user has explicitly
 * set vs what comes from domain defaults.
 *
 * Returns `null` if no user config has been set yet.
 *
 * TODO(needs-backend): Replace `userAppConfig { extraConfig }` with
 * `userPreference { value }`. Once the new API supports partial updates via
 * `setUserPreference`, this hook will only be needed for displaying which
 * values the user has explicitly overridden (vs domain defaults).
 */
export const useUserAppConfig = (options?: {
  fetchPolicy?: 'store-and-network' | 'store-or-network' | 'network-only';
}) => {
  'use memo';
  const [fetchKey, updateFetchKey] = useUpdatableState('first');

  const data = useLazyLoadQuery<useAppConfigUserQuery>(
    graphql`
      query useAppConfigUserQuery {
        userAppConfig {
          extraConfig @since(version: "25.16.0")
        }
      }
    `,
    {},
    {
      fetchPolicy: options?.fetchPolicy ?? 'store-and-network',
      fetchKey,
    },
  );

  const config = data.userAppConfig
    ? (data.userAppConfig.extraConfig as AppConfigExtra)
    : null;

  const refresh = useCallback(() => {
    updateFetchKey();
  }, [updateFetchKey]);

  return [config, { refresh }] as const;
};

/**
 * Returns a function to upsert (create or replace) the user's app configuration.
 *
 * IMPORTANT: The backend performs a full replacement — the provided `extraConfig`
 * completely replaces the existing user config. To do a partial update, first
 * read the current config with `useUserAppConfig()`, merge your changes, then
 * call the upsert function with the full merged object.
 *
 * TODO(needs-backend): Replace with `setUserPreference` mutation which supports
 * native partial updates. This will eliminate the read-merge-write pattern —
 * callers can simply send `{ value: { [key]: newValue } }` and the backend
 * will merge it. The `useAppSetting` hook can then be greatly simplified.
 *
 * @example
 * ```tsx
 * const [currentConfig] = useUserAppConfig();
 * const [upsertConfig, isUpserting] = useUpsertUserAppConfig();
 *
 * const handleUpdate = () => {
 *   upsertConfig({
 *     ...currentConfig,
 *     compact_sidebar: true,
 *   });
 * };
 * ```
 */
export const useUpsertUserAppConfig = () => {
  'use memo';
  const [commitMutation, isInFlight] =
    useMutation<useAppConfigUpsertUserMutation>(graphql`
      mutation useAppConfigUpsertUserMutation($input: UpsertUserConfigInput!) {
        upsertUserAppConfig(input: $input) @since(version: "25.16.0") {
          appConfig {
            extraConfig
          }
        }
      }
    `);

  const upsertConfig = useCallback(
    (
      extraConfig: AppConfigExtra,
      callbacks?: {
        onCompleted?: (
          response: useAppConfigUpsertUserMutation['response'],
        ) => void;
        onError?: (error: Error) => void;
      },
    ) => {
      commitMutation({
        variables: {
          input: {
            extraConfig,
          },
        },
        onCompleted: callbacks?.onCompleted,
        onError: callbacks?.onError,
      });
    },
    [commitMutation],
  );

  return [upsertConfig, isInFlight] as const;
};

/**
 * Returns a function to delete the user's app configuration.
 *
 * After deletion, `mergedAppConfig` will return only domain-level defaults.
 *
 * TODO(needs-backend): The new spec does not define a separate delete mutation
 * for user preferences. Clarify with backend whether deletion will be handled
 * via `setUserPreference(value: {})` or a dedicated mutation.
 */
export const useDeleteUserAppConfig = () => {
  'use memo';
  const [commitMutation, isInFlight] =
    useMutation<useAppConfigDeleteUserMutation>(graphql`
      mutation useAppConfigDeleteUserMutation($input: DeleteUserConfigInput!) {
        deleteUserAppConfig(input: $input) @since(version: "25.16.0") {
          deleted
        }
      }
    `);

  const deleteConfig = useCallback(
    (callbacks?: {
      onCompleted?: (
        response: useAppConfigDeleteUserMutation['response'],
      ) => void;
      onError?: (error: Error) => void;
    }) => {
      commitMutation({
        variables: {
          input: {},
        },
        onCompleted: callbacks?.onCompleted,
        onError: callbacks?.onError,
      });
    },
    [commitMutation],
  );

  return [deleteConfig, isInFlight] as const;
};
