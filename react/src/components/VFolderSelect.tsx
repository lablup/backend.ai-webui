import { useBaiSignedRequestWithPromise } from '../helper';
import { useUpdatableState } from '../hooks';
import { useSuspenseTanQuery } from '../hooks/reactQueryAlias';
import useControllableState_deprecated from '../hooks/useControllableState';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import FolderCreateModal from './FolderCreateModal';
import { useFolderExplorerOpener } from './FolderExplorerOpener';
import { Button, Select, SelectProps, Tooltip } from 'antd';
import { BAIFlex, BAILink } from 'backend.ai-ui';
import _ from 'lodash';
import { PlusIcon } from 'lucide-react';
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
  allowFolderExplorer?: boolean;
  allowCreateFolder?: boolean;
  valuePropName?: 'id' | 'name';
  filter?: (vFolder: VFolder) => boolean;
}

const VFolderSelect: React.FC<VFolderSelectProps> = ({
  autoSelectDefault,
  allowFolderExplorer,
  allowCreateFolder,
  valuePropName = 'name',
  filter,
  ...selectProps
}) => {
  const currentProject = useCurrentProjectValue();
  const baiRequestWithPromise = useBaiSignedRequestWithPromise();
  const { generateFolderPath } = useFolderExplorerOpener();
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
    queryKey: ['VFolderSelectQuery', key],
    queryFn: () => {
      const search = new URLSearchParams();
      search.set('group_id', currentProject.id);
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
    <BAIFlex gap="xs">
      <Select
        showSearch
        optionFilterProp={'label'}
        {...selectProps}
        value={value}
        labelRender={({ label, value }) =>
          allowFolderExplorer ? (
            <BAILink
              type="hover"
              to={generateFolderPath(_.toString(value))}
              onClick={(e: React.MouseEvent<HTMLSpanElement>) => {
                e.stopPropagation();
              }}
              onMouseDown={(e: React.MouseEvent<HTMLSpanElement>) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              {label}
            </BAILink>
          ) : (
            label
          )
        }
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
      {allowCreateFolder ? (
        <Tooltip title={t('data.CreateANewStorageFolder')}>
          <Button
            icon={<PlusIcon />}
            type="primary"
            ghost
            onClick={() => {
              setIsOpenCreateModal(true);
            }}
          />
        </Tooltip>
      ) : null}
      <FolderCreateModal
        usageMode="model"
        open={isOpenCreateModal}
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
