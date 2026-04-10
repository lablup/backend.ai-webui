/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useBaiSignedRequestWithPromise } from '../helper';
import { useSuspenseTanQuery } from '../hooks/reactQueryAlias';
import useControllableState_deprecated from '../hooks/useControllableState';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import FolderCreateModal from './FolderCreateModal';
import { useFolderExplorerOpener } from './FolderExplorerOpener';
import { ReloadOutlined } from '@ant-design/icons';
import { Button, Select, type SelectProps, Space, Tooltip } from 'antd';
import { useUpdatableState, BAIFlex } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { FolderOpenIcon, PlusIcon } from 'lucide-react';
import React, { startTransition, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

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
        options={_.map(filteredVFolders, (vfolder) => {
          return {
            label: vfolder?.name,
            value: vfolder?.[valuePropName],
          };
        })}
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
            <Button
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
      <FolderCreateModal
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
