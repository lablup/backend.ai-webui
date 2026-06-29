/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  UserFolderPermissionPanelV2Query,
  type KeypairResourcePolicyV2Filter,
} from '../__generated__/UserFolderPermissionPanelV2Query.graphql';
import { UserFolderPermissionPanelV2_storageVolumeFrgmt$key } from '../__generated__/UserFolderPermissionPanelV2_storageVolumeFrgmt.graphql';
import { useBAIPaginationOptionState } from '../hooks/reactPaginationQueryOptions';
import KeypairResourcePolicyStoragePermissionTableV2 from './KeypairResourcePolicyStoragePermissionTableV2';
import {
  BAIAlert,
  BAICard,
  BAIFetchKeyButton,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAIUserSelect,
  type GraphQLFilter,
  INITIAL_FETCH_KEY,
  useFetchKey,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, {
  useDeferredValue,
  useEffect,
  useEffectEvent,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';

interface UserFolderPermissionPanelV2Props {
  storageVolumeFrgmt: UserFolderPermissionPanelV2_storageVolumeFrgmt$key;
}

const UserFolderPermissionPanelV2: React.FC<
  UserFolderPermissionPanelV2Props
> = ({ storageVolumeFrgmt }) => {
  'use memo';
  const { t } = useTranslation();

  const storageVolume = useFragment(
    graphql`
      fragment UserFolderPermissionPanelV2_storageVolumeFrgmt on StorageVolume {
        ...KeypairResourcePolicyStoragePermissionTableV2_storageVolumeFrgmt
      }
    `,
    storageVolumeFrgmt,
  );

  const [userFilter, setUserFilter] = useState<GraphQLFilter | undefined>();
  // Extract the picked user's UUID to scope the keypairs connection (Assigned
  // Keypairs column); `GraphQLFilter` is index-typed so guard down to a string.
  const rawUserId = userFilter?.keypair?.userId?.equals;
  const selectedUserId = _.isString(rawUserId) ? rawUserId : undefined;

  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionState({ current: 1, pageSize: 10 });

  // The user filter narrows the result set, so reset to the first page when it
  // changes to avoid landing on an out-of-range offset.
  const resetToFirstPage = useEffectEvent(() => {
    setTablePaginationOption({
      current: 1,
      pageSize: tablePaginationOption.pageSize,
    });
  });
  useEffect(() => {
    resetToFirstPage();
  }, [selectedUserId]);

  const [fetchKey, updateFetchKey] = useFetchKey();
  const deferredFetchKey = useDeferredValue(fetchKey);

  const includeKeypairs = !!selectedUserId;
  const queryVariables = {
    filter: (userFilter ?? null) as KeypairResourcePolicyV2Filter | null,
    limit: baiPaginationOption.limit,
    offset: baiPaginationOption.offset,
    includeKeypairs,
    // Scope each policy's `keypairs` connection to the selected user too, so the
    // Assigned Keypairs column (access keys + `+N` count) reflects only that
    // user's keypairs governed by the policy — not every keypair on the policy.
    keypairFilter: selectedUserId
      ? { userId: { equals: selectedUserId } }
      : null,
  };
  const deferredQueryVariables = useDeferredValue(queryVariables);

  const { adminKeypairResourcePoliciesV2 } =
    useLazyLoadQuery<UserFolderPermissionPanelV2Query>(
      graphql`
        query UserFolderPermissionPanelV2Query(
          $filter: KeypairResourcePolicyV2Filter
          $limit: Int!
          $offset: Int!
          $includeKeypairs: Boolean!
          $keypairFilter: KeypairFilter
        ) {
          adminKeypairResourcePoliciesV2(
            filter: $filter
            limit: $limit
            offset: $offset
            orderBy: [{ field: NAME, direction: ASC }]
          ) {
            count
            edges {
              node {
                ...KeypairResourcePolicyStoragePermissionTableV2_nodeFrgmt
              }
            }
          }
        }
      `,
      deferredQueryVariables,
      {
        fetchKey: deferredFetchKey,
        fetchPolicy:
          deferredFetchKey === INITIAL_FETCH_KEY
            ? 'store-and-network'
            : 'network-only',
      },
    );

  return (
    <BAIFlex direction="column" align="stretch" gap="md">
      <BAIAlert
        type="info"
        showIcon
        description={t('storageHost.permission.UserFolderPermissionsNote')}
      />

      <BAICard
        title={t('storageHost.permission.KeypairResourcePolicies')}
        styles={{ body: { paddingTop: 0 } }}
      >
        <BAIFlex direction="column" align="stretch" gap="sm">
          <BAIFlex align="start" justify="between" gap="md" wrap="wrap">
            <BAIGraphQLPropertyFilter
              style={{ flex: 1 }}
              value={userFilter}
              onChange={setUserFilter}
              filterProperties={[
                {
                  key: 'keypair.userId',
                  propertyLabel: t('storageHost.permission.User'),
                  type: 'uuid',
                  fixedOperator: 'equals',
                  singleSelect: true,
                  renderInput: ({ value, onChange }) => (
                    <BAIUserSelect
                      valuePropName="id"
                      value={value}
                      onChange={onChange}
                      style={{ minWidth: 200 }}
                    />
                  ),
                },
              ]}
            />
            <BAIFetchKeyButton
              value={fetchKey}
              onChange={updateFetchKey}
              loading={deferredFetchKey !== fetchKey}
            />
          </BAIFlex>
          <KeypairResourcePolicyStoragePermissionTableV2
            storageVolumeFrgmt={storageVolume}
            policiesFrgmt={_.compact(
              adminKeypairResourcePoliciesV2?.edges?.map((edge) => edge?.node),
            )}
            selectedUserId={selectedUserId}
            loading={
              deferredFetchKey !== fetchKey ||
              deferredQueryVariables !== queryVariables
            }
            pagination={{
              pageSize: tablePaginationOption.pageSize,
              current: tablePaginationOption.current,
              total: adminKeypairResourcePoliciesV2?.count ?? 0,
              onChange: (current, pageSize) =>
                setTablePaginationOption({ current, pageSize }),
            }}
          />
        </BAIFlex>
      </BAICard>
    </BAIFlex>
  );
};

export default UserFolderPermissionPanelV2;
