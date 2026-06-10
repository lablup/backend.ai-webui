/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { VFolderSelectFallbackProbeQuery } from '../__generated__/VFolderSelectFallbackProbeQuery.graphql';
import { useBaiSignedRequestWithPromise } from '../helper';
import { useSuspenseTanQuery } from '../hooks/reactQueryAlias';
import useControllableState_deprecated from '../hooks/useControllableState';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import ErrorBoundaryWithNullFallback from './ErrorBoundaryWithNullFallback';
import FolderCreateModalV2 from './FolderCreateModalV2';
import { useFolderExplorerOpener } from './FolderExplorerOpener';
import { ReloadOutlined } from '@ant-design/icons';
import { Button, Select, type SelectProps, Space, Tooltip } from 'antd';
import {
  BAIButton,
  useUpdatableState,
  BAIFlex,
  toGlobalId,
  toLocalId,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { FolderOpenIcon, PlusIcon } from 'lucide-react';
import React, {
  Suspense,
  startTransition,
  useEffect,
  useEffectEvent,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

export type VFolder = {
  name: string;
  id: string;
  quota_scope_id: string;
  host: string;
  status: string;
  usage_mode: string;
  created_at: string;
  is_owner: boolean;
  permission: string;
  user: null;
  group: string | null;
  creator: string;
  user_email: null;
  group_name: string | null;
  ownership_type: string;
  type: string;
  cloneable: boolean;
  max_files: number;
  max_size: null | number;
  cur_size: number;
};

/**
 * Probe that resolves a folder's name by UUID via Relay's `vfolder_node`
 * query. Used as the last-resort fallback when the form value (a folder
 * UUID) does not appear in the project-scoped `/folders` REST response —
 * for example when the deployment's model folder is owned by a different
 * user/project and isn't surfaced by the project-scoped endpoint. The
 * probe reports the resolved folder back to the parent so the Select can
 * render a label instead of the raw UUID.
 */
interface VFolderSelectFallbackProbeProps {
  uuid: string;
  onResolved: (folder: { id: string; name: string }) => void;
}
const VFolderSelectFallbackProbe: React.FC<VFolderSelectFallbackProbeProps> = ({
  uuid,
  onResolved,
}) => {
  'use memo';
  const { vfolder_node } = useLazyLoadQuery<VFolderSelectFallbackProbeQuery>(
    graphql`
      query VFolderSelectFallbackProbeQuery($id: String!) {
        vfolder_node(id: $id) {
          id @required(action: THROW)
          name
        }
      }
    `,
    { id: toGlobalId('VirtualFolderNode', uuid) },
  );

  const reportResolved = useEffectEvent(() => {
    if (vfolder_node?.id && vfolder_node?.name) {
      onResolved({
        id: toLocalId(vfolder_node.id) ?? uuid,
        name: vfolder_node.name,
      });
    }
  });

  useEffect(() => {
    reportResolved();
  }, [vfolder_node?.id, vfolder_node?.name]);

  return null;
};

interface VFolderSelectProps extends SelectProps {
  autoSelectDefault?: boolean;
  showOpenButton?: boolean;
  showCreateButton?: boolean;
  showRefreshButton?: boolean;
  valuePropName?: 'id' | 'name';
  filter?: (vFolder: VFolder) => boolean;
}

const VFolderSelect: React.FC<VFolderSelectProps> = ({
  autoSelectDefault,
  showOpenButton,
  showCreateButton,
  showRefreshButton,
  valuePropName = 'name',
  filter,
  ...selectProps
}) => {
  const currentProject = useCurrentProjectValue();
  const baiRequestWithPromise = useBaiSignedRequestWithPromise();
  const { open: openFolderExplorer } = useFolderExplorerOpener();
  const { t } = useTranslation();
  const [value, setValue] = useControllableState_deprecated(selectProps);
  const [key, checkUpdate] = useUpdatableState('first');
  const [isOpenCreateModal, setIsOpenCreateModal] = useState(false);

  // const { vfolder_list } = useLazyLoadQuery<VFolderSelectQuery>(
  //   graphql`
  //     # query VFolderSelectQuery($group_id: UUID) {
  //     query VFolderSelectQuery {
  //       vfolder_list(limit: 20, offset: 0) {
  //         # vfolder_list(limit: 20, offset: 0, group_id: $group_id) {
  //         items {
  //           id
  //           name
  //           status
  //           usage_mode
  //           ownership_type
  //           user_email
  //           group
  //           group_name
  //         }
  //         total_count
  //       }
  //     }
  //   `,
  //   {
  //     // group_id: currentProject.id,
  //   },
  //   {
  //     fetchPolicy: "store-and-network",
  //   }
  // );

  const { data } = useSuspenseTanQuery({
    queryKey: ['VFolderSelectQuery', key, currentProject.id],
    queryFn: () => {
      const projectId = currentProject.id;
      if (!projectId) {
        throw new Error('Project ID is required for VFolderSelect');
      }
      const search = new URLSearchParams();
      search.set('group_id', projectId);
      return baiRequestWithPromise({
        method: 'GET',
        url: `/folders?${search.toString()}`,
      }) as Promise<VFolder[]>;
    },
    staleTime: 0,
  });

  const filteredVFolders = filter ? _.filter(data, filter) : data;

  const filteredOptions = _.map(filteredVFolders, (vfolder) => ({
    label: vfolder?.name,
    value: vfolder?.[valuePropName],
  }));

  // antd Select shows the raw `value` when no option matches it. In edit
  // flows the form is pre-filled with a folder that may no longer pass
  // `filter` (e.g. status changed away from 'ready' since the deployment
  // was created) or that isn't returned by the project-scoped `/folders`
  // endpoint at all (e.g. user-scope folders mounted into a deployment).
  // Resolve the value through two fallbacks so the name is rendered
  // instead of the raw UUID:
  //   1. Look it up in the unfiltered `data` (folder is in the project
  //      but excluded by `filter`).
  //   2. Otherwise issue a Relay `vfolder_node` query (folder isn't in
  //      `data` at all). Only attempted when `valuePropName === 'id'`
  //      since the lookup is keyed by UUID.
  const currentValueIsInFilteredOptions =
    value !== undefined && filteredOptions.some((o) => o.value === value);
  const fallbackFolder =
    !currentValueIsInFilteredOptions && value
      ? _.find(data, (vf) => vf?.[valuePropName] === value)
      : undefined;
  const [resolvedFallback, setResolvedFallback] = useState<{
    id: string;
    name: string;
  } | null>(null);
  // Discard a stale resolution if the value moves on to something else.
  useEffect(() => {
    if (resolvedFallback && resolvedFallback.id !== value) {
      setResolvedFallback(null);
    }
  }, [value, resolvedFallback]);
  const needsRelayLookup =
    !currentValueIsInFilteredOptions &&
    !fallbackFolder &&
    valuePropName === 'id' &&
    typeof value === 'string' &&
    value.length > 0;
  const options = (() => {
    if (resolvedFallback && resolvedFallback.id === value) {
      return [
        { label: resolvedFallback.name, value: resolvedFallback.id },
        ...filteredOptions,
      ];
    }
    if (fallbackFolder) {
      return [
        {
          label: fallbackFolder.name,
          value: fallbackFolder[valuePropName],
        },
        ...filteredOptions,
      ];
    }
    return filteredOptions;
  })();

  const autoSelectedOption = _.first(filteredVFolders)
    ? {
        label: _.first(filteredVFolders)?.name,
        value: _.first(filteredVFolders)?.[valuePropName],
      }
    : undefined;
  // TODO: use controllable value
  useEffect(() => {
    if (autoSelectDefault && autoSelectedOption) {
      setValue(autoSelectedOption.value, autoSelectedOption);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSelectDefault]);

  return (
    <BAIFlex direction="row" gap={'xs'}>
      {needsRelayLookup ? (
        <ErrorBoundaryWithNullFallback>
          <Suspense fallback={null}>
            <VFolderSelectFallbackProbe
              uuid={value as string}
              onResolved={setResolvedFallback}
            />
          </Suspense>
        </ErrorBoundaryWithNullFallback>
      ) : null}
      <Select
        showSearch={{
          optionFilterProp: 'label',
        }}
        {...selectProps}
        value={value}
        onChange={setValue}
        onOpenChange={(open) => {
          if (open) {
            startTransition(() => {
              checkUpdate();
            });
          }
        }}
        options={options}
      />
      <Space.Compact>
        {showOpenButton ? (
          <Tooltip title={t('modelService.OpenFolder')}>
            <Button
              icon={<FolderOpenIcon />}
              disabled={!value}
              onClick={() => {
                openFolderExplorer(_.toString(value));
              }}
            />
          </Tooltip>
        ) : null}
        {showCreateButton ? (
          <Tooltip title={t('data.CreateANewStorageFolder')}>
            <BAIButton
              icon={<PlusIcon />}
              variant="text"
              onClick={() => {
                setIsOpenCreateModal(true);
              }}
            />
          </Tooltip>
        ) : null}
        {showRefreshButton ? (
          <Tooltip title={t('button.Refresh')}>
            <Button
              icon={<ReloadOutlined />}
              variant="text"
              onClick={() => {
                startTransition(() => {
                  checkUpdate();
                });
              }}
            />
          </Tooltip>
        ) : null}
      </Space.Compact>
      <FolderCreateModalV2
        open={isOpenCreateModal}
        initialValues={{ usage_mode: 'model' }}
        onRequestClose={(result) => {
          setIsOpenCreateModal(false);
          if (result) {
            startTransition(() => {
              checkUpdate();
              setValue(
                result.id,
                _.map(filteredVFolders, (vfolder) => {
                  return {
                    label: vfolder?.name,
                    value: vfolder?.[valuePropName],
                  };
                }),
              );
            });
          }
        }}
      />
    </BAIFlex>
  );
};

export default VFolderSelect;
