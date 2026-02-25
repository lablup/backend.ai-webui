/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
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
 */
export interface AppConfigExtra {
  // UI preferences
  selected_language?: string;
  compact_sidebar?: boolean;
  desktop_notification?: boolean;
  preserve_login?: boolean;
  auto_logout?: boolean;
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
 */
export const useAppConfig = (options?: {
  fetchPolicy?: 'store-and-network' | 'store-or-network' | 'network-only';
}) => {
  'use memo';
  const [fetchKey, updateFetchKey] = useUpdatableState('initial');

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
 */
export const useUserAppConfig = (options?: {
  fetchPolicy?: 'store-and-network' | 'store-or-network' | 'network-only';
}) => {
  'use memo';
  const [fetchKey, updateFetchKey] = useUpdatableState('initial');

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
