/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { VFolderTableProjectQuery } from '../__generated__/VFolderTableProjectQuery.graphql';
import { Form } from '../form-engine';
import { useBaiSignedRequestWithPromise } from '../helper';
import { useSuspendedBackendaiClient } from '../hooks';
import { useKeyPairLazyLoadQuery } from '../hooks/hooksUsingRelay';
import { useSuspenseTanQuery } from '../hooks/reactQueryAlias';
import useControllableState_deprecated from '../hooks/useControllableState';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import FolderCreateModalV2 from './FolderCreateModalV2';
import { useFolderExplorerOpener } from './FolderExplorerOpener';
import TextHighlighter from './TextHighlighter';
import VFolderPermissionTag from './VFolderPermissionTag';
import { VFolder } from './VFolderSelect';
import { AstryxFormTextInput } from './astryxFormControls';
import { Badge } from '@astryxdesign/core/Badge';
import { ButtonGroup } from '@astryxdesign/core/ButtonGroup';
import { IconButton } from '@astryxdesign/core/IconButton';
import {
  MetadataList,
  MetadataListItem,
} from '@astryxdesign/core/MetadataList';
import { Text } from '@astryxdesign/core/Text';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import {
  BAIUserUnionIcon,
  BAIFlex,
  BAILink,
  BAITableAstryx,
  useEventNotStable,
  useUpdatableState,
  type BAIColumnsType,
  type BAITableProps,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import { CircleHelp, RotateCw, User, PlusIcon } from 'lucide-react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

export interface VFolderFile {
  name: string;
  type: 'FILE' | 'DIRECTORY';
  size: number;
  mode: string;
  created: string;
  modified: string;
}
type VFolderKey = string;

export interface VFolderSelectValue {
  alias?: string;
  key: string;
}

export interface AliasMap {
  [key: string]: string;
}

type DataIndex = keyof VFolder;

export interface VFolderTableProps extends Omit<
  BAITableProps<VFolder>,
  'rowKey'
> {
  showAliasInput?: boolean;
  selectedRowKeys?: VFolderKey[];
  onChangeSelectedRowKeys?: (
    selectedKeys: VFolderKey[],
    selectedVFolders: VFolder[],
  ) => void;
  aliasBasePath?: string;
  aliasMap?: AliasMap;
  onChangeAliasMap?: (aliasMap: AliasMap) => void;
  rowFilter?: (vFolder: VFolder) => boolean;
  rowKey: string | number;
  onChangeAutoMountedFolders?: (names: Array<string>) => void;
  showAutoMountedFoldersSection?: boolean;
  ownerEmail?: string;
  onValidateSelectedRowKeys?: (
    invalidKeys: VFolderKey[],
    validVFolders: VFolder[],
  ) => void;
}

export const vFolderAliasNameRegExp = /^[a-zA-Z0-9_/.-]*$/;
export const DEFAULT_ALIAS_BASE_PATH = '/home/work/';
const VFolderTable: React.FC<VFolderTableProps> = ({
  rowFilter,
  showAliasInput = false,
  selectedRowKeys: controlledSelectedRowKeys = [],
  onChangeSelectedRowKeys,
  aliasBasePath = DEFAULT_ALIAS_BASE_PATH,
  aliasMap: controlledAliasMap,
  onChangeAliasMap,
  rowKey = 'name',
  onChangeAutoMountedFolders,
  showAutoMountedFoldersSection,
  ownerEmail,
  onValidateSelectedRowKeys,
  ...tableProps
}) => {
  'use memo';
  const { generateFolderPath } = useFolderExplorerOpener();
  const getRowKey = React.useMemo(() => {
    return (record: VFolder) => {
      const key = record && record[rowKey as DataIndex];
      return key as VFolderKey;
    };
  }, [rowKey]);

  const [isOpenCreateModal, setIsOpenCreateModal] = useState(false);

  const [selectedRowKeys, setSelectedRowKeys] = useControllableState_deprecated<
    VFolderKey[]
  >(
    {
      value: controlledSelectedRowKeys,
      onChange: (selectedKeys: VFolderKey[]) => {
        const selectedVFolders = _.filter(displayingFolders, (folder) =>
          _.includes(selectedKeys, getRowKey(folder)),
        );
        onChangeSelectedRowKeys?.(selectedKeys, selectedVFolders);
      },
    },
    {
      defaultValue: [],
    },
  );

  const [aliasMap, setAliasMap] = useControllableState_deprecated<AliasMap>(
    {
      value: controlledAliasMap,
      onChange: onChangeAliasMap,
    },
    {
      defaultValue: {},
    },
  );

  const baiClient = useSuspendedBackendaiClient();
  const [keypair] = useKeyPairLazyLoadQuery(baiClient?._config.accessKey);

  const [internalForm] = Form.useForm<AliasMap>();
  useEffect(() => {
    // TODO: check setFieldsValue performance
    if (aliasMap) {
      internalForm.setFieldsValue(
        _.mapValues(aliasMap, (v) => {
          if (v.startsWith(aliasBasePath)) {
            return v.slice(aliasBasePath.length);
          }
          return v;
        }),
      );
      internalForm.validateFields();
    }
  }, [aliasMap, internalForm, aliasBasePath]);

  const { t } = useTranslation();
  const baiRequestWithPromise = useBaiSignedRequestWithPromise();
  const currentProject = useCurrentProjectValue();

  if (!currentProject.id) {
    throw new Error('Project is required for VFolderTable');
  }

  const [fetchKey, updateFetchKey] = useUpdatableState('first');
  const [isPendingRefetch, startRefetchTransition] = useTransition();
  const { data: allFolderList } = useSuspenseTanQuery({
    queryKey: ['VFolderSelectQuery', fetchKey, currentProject.id, ownerEmail],
    queryFn: () => {
      const search = new URLSearchParams();
      // FIXME: filter by group_id does not work
      // search.set('group_id', currentProject.id);
      ownerEmail && search.set('owner_user_email', ownerEmail);
      return baiRequestWithPromise({
        method: 'GET',
        url: `/folders?${search.toString()}`,
      }) as Promise<VFolder[]>;
    },
    staleTime: 1000,
  });

  const { domain, group, keypair_resource_policy } =
    useLazyLoadQuery<VFolderTableProjectQuery>(
      graphql`
        query VFolderTableProjectQuery(
          $domain_name: String!
          $group_id: UUID!
          $keypair_resource_policy_name: String!
        ) {
          domain(name: $domain_name) {
            allowed_vfolder_hosts
          }
          group(id: $group_id, domain_name: $domain_name) {
            allowed_vfolder_hosts
          }
          keypair_resource_policy(name: $keypair_resource_policy_name) {
            allowed_vfolder_hosts
          }
        }
      `,
      {
        domain_name: baiClient._config.domainName,
        group_id: currentProject.id,
        keypair_resource_policy_name: keypair?.resource_policy || '',
      },
      {
        fetchPolicy: 'store-and-network',
        fetchKey: fetchKey,
      },
    );

  const mountableVolumesByPermission = useMemo(() => {
    const allowedVFolderHostsByDomain = JSON.parse(
      domain?.allowed_vfolder_hosts || '{}',
    );
    const allowedVFolderHostsByGroup = JSON.parse(
      group?.allowed_vfolder_hosts || '{}',
    );
    const allowedVFolderHostsByKeypairResourcePolicy = JSON.parse(
      keypair_resource_policy?.allowed_vfolder_hosts || '{}',
    );

    const mergedVFolderPermissions = _.merge(
      {}, // start with empty object
      allowedVFolderHostsByDomain,
      allowedVFolderHostsByGroup,
      allowedVFolderHostsByKeypairResourcePolicy,
    );
    // only allow mount if volume permission has 'mount-in-session'
    return Object.keys(mergedVFolderPermissions).filter((volume) =>
      mergedVFolderPermissions[volume].includes('mount-in-session'),
    );
  }, [domain, group, keypair_resource_policy]);

  const accessibleFoldersByCurrentProject = useMemo(() => {
    return (
      allFolderList?.filter(
        (folder) =>
          folder.ownership_type === 'user' ||
          !folder.group ||
          folder.group === currentProject.id,
      ) || []
    );
  }, [allFolderList, currentProject.id]);

  const mountableFoldersByPermission = useMemo(() => {
    return accessibleFoldersByCurrentProject.filter((folder) =>
      mountableVolumesByPermission.includes(folder.host),
    );
  }, [accessibleFoldersByCurrentProject, mountableVolumesByPermission]);

  useEffect(() => {
    // check selectedRowKeys are valid
    const invalidKeys = _.difference(
      selectedRowKeys,
      mountableFoldersByPermission.map((vf) => getRowKey(vf)),
    );

    onValidateSelectedRowKeys?.(
      invalidKeys,
      _.filter(mountableFoldersByPermission, (vf) =>
        _.includes(selectedRowKeys, getRowKey(vf)),
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    mountableFoldersByPermission,
    getRowKey,
    onValidateSelectedRowKeys,
    // Use JSON.stringify to compare array contents rather than reference
    // eslint-disable-next-line react-hooks/exhaustive-deps
    JSON.stringify(selectedRowKeys),
  ]);

  const autoMountedFolderNames = useMemo(
    () =>
      _.map(
        _.filter(
          mountableFoldersByPermission,
          (vf) => vf.status === 'ready' && vf.name?.startsWith('.'),
        ),
        (vf) => vf.name,
      ),
    [mountableFoldersByPermission],
  );

  useEffect(() => {
    _.isFunction(onChangeAutoMountedFolders) &&
      onChangeAutoMountedFolders(autoMountedFolderNames);
    // Omit `onChangeAutoMountedFolders` from deps so a parent re-render doesn't retrigger this effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoMountedFolderNames]);

  useEffect(() => {
    // Only reset selectedRowKeys when currentProject changes if there are no controlled selectedRowKeys
    if (!controlledSelectedRowKeys || controlledSelectedRowKeys.length === 0) {
      setSelectedRowKeys([]);
    }
    // Reset selectedRowKeys when currentProject changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProject.id]);

  const [searchKey, setSearchKey] = useState('');
  const displayingFolders = _.filter(mountableFoldersByPermission, (vf) => {
    // Apply external filter for display
    if (rowFilter && !rowFilter(vf)) {
      return false;
    }
    // Always show selected items
    if (selectedRowKeys.includes(getRowKey(vf))) {
      return true;
    }
    // Apply search filter
    return !searchKey || vf.name.includes(searchKey);
  });

  /**
   * Converts the input path to an aliased path based on the provided name and input.
   * If the input is empty, it appends the name to the alias base path.
   * If the input starts with '/', it returns the input as is.
   * Otherwise, it appends the input to the alias base path.
   *
   * @param name - The name of the VFolderKey.
   * @param input - The input path to be converted.
   * @returns The aliased path based on the name and input.
   */
  const inputToAliasPath = useCallback(
    (name: VFolderKey, input?: string) => {
      if (input === undefined || input === '') {
        return `${aliasBasePath}${name}`;
      } else if (input.startsWith('/')) {
        return input;
      } else {
        return `${aliasBasePath}${input}`;
      }
    },
    [aliasBasePath],
  );

  const handleAliasUpdate = useEventNotStable(() => {
    // Only carry aliases for currently-selected rows. The internal form
    // intentionally preserves values for deselected rows (so re-selecting
    // restores the user's previous alias), but `aliasMap` is the
    // authoritative payload for the parent form's mount list and must
    // mirror the selection.
    const allValues = internalForm.getFieldsValue({ strict: false });
    setAliasMap(
      _.mapValues(
        _.pickBy(_.pick(allValues, selectedRowKeys), (v) => !!v),
        (v, k) => inputToAliasPath(k, v),
      ),
    );
    internalForm.validateFields().catch(() => {});
  });

  useEffect(() => {
    handleAliasUpdate();
    // `selectedRowKeys` can be changed by parents at any time, so we need to check whether `selectedRowKeys` has changed using JSON.stringify
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(selectedRowKeys), handleAliasUpdate]);

  const columns: BAIColumnsType<VFolder> = [
    {
      title: (
        <BAIFlex direction="row" gap="xxs">
          <Text>{t('data.folders.Name')}</Text>
          {showAliasInput && (
            <Text type="supporting" weight="normal">
              ({t('session.launcher.FolderAlias')}{' '}
              <Tooltip
                content={<Trans i18nKey={'session.launcher.DescFolderAlias'} />}
              >
                <CircleHelp size="1em" />
              </Tooltip>
              )
            </Text>
          )}
        </BAIFlex>
      ),
      dataIndex: 'name',
      ellipsis: true,
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (value, record) => {
        const isCurrentRowSelected = selectedRowKeys.includes(
          getRowKey(record),
        );

        return (
          <BAIFlex
            direction="column"
            align="start"
            gap={'xxs'}
            style={
              showAliasInput && isCurrentRowSelected
                ? { display: 'inline-flex', height: 70, width: '100%' }
                : {
                    overflow: 'hidden',
                    width: '100%',
                  }
            }
          >
            <BAILink
              type="hover"
              to={generateFolderPath(record.id)}
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '100%',
                display: 'block',
              }}
            >
              <TextHighlighter keyword={searchKey}>{value}</TextHighlighter>
            </BAILink>
            {showAliasInput && isCurrentRowSelected && (
              <Form.Item
                noStyle
                // rerender when
                shouldUpdate={(prev, cur) =>
                  prev[getRowKey(record)] !== cur[getRowKey(record)]
                }
              >
                {() => {
                  const allAliasPathMap = _.reduce(
                    selectedRowKeys,
                    (result: AliasMap, name) => {
                      result[name] =
                        aliasMap?.[name] || inputToAliasPath(name, undefined);

                      return result;
                    },
                    {} as AliasMap,
                  );

                  return (
                    // Keeps a click inside the alias field from toggling the
                    // row's selection. This used to live inside a local
                    // `AliasInput` adapter; the field itself is the SHARED
                    // adapter now (D10 fold-back), so the guard moved out to
                    // where it belongs — around the whole form item.
                    <div onClick={(e) => e.stopPropagation()}>
                      <Form.Item
                        name={getRowKey(record)}
                        rules={[
                          {
                            // required: true,
                            type: 'string',
                            pattern: vFolderAliasNameRegExp,
                            message: t('session.launcher.FolderAliasInvalid'),
                          },
                          {
                            type: 'string',
                            validator: async (_rule, value) => {
                              if (
                                value &&
                                _.some(
                                  allAliasPathMap,
                                  (path, k) =>
                                    k !== getRowKey(record) && // not current row
                                    path ===
                                      inputToAliasPath(
                                        getRowKey(record),
                                        value,
                                      ),
                                )
                              ) {
                                return Promise.reject(
                                  t('session.launcher.FolderAliasOverlapping'),
                                );
                              }
                              return Promise.resolve();
                            },
                          },
                          {
                            type: 'string',
                            validator: async (_rule, value) => {
                              const aliasPath = inputToAliasPath(
                                getRowKey(record),
                                value,
                              );
                              if (
                                value &&
                                _.map(
                                  autoMountedFolderNames,
                                  // `n` is the name of the auto mounted folder. It cannot be empty.
                                  (n) => inputToAliasPath('', n),
                                ).includes(aliasPath)
                              ) {
                                return Promise.reject(
                                  t(
                                    'session.launcher.FolderAliasOverlappingToAutoMount',
                                  ),
                                );
                              }
                              return Promise.resolve();
                            },
                          },
                        ]}
                        // dependencies={[getRowKey(record)]}
                        extra={inputToAliasPath(
                          record.name,
                          internalForm.getFieldValue(getRowKey(record)),
                        )}
                      >
                        {/* `onValueChange` fires after `Form.Item`'s injected
                          `onChange` — that side-effect slot is what the local
                          adapter existed for (D10 fold-back). */}
                        <AstryxFormTextInput
                          label={t('session.launcher.FolderAlias')}
                          placeholder={t('session.launcher.FolderAlias')}
                          hasClear
                          onValueChange={handleAliasUpdate}
                        />
                      </Form.Item>
                    </div>
                  );
                }}
              </Form.Item>
            )}
          </BAIFlex>
        );
      },
      // ...getColumnSearchProps('name'),
    },
    {
      title: t('data.UsageMode'),
      dataIndex: 'usage_mode',
      sorter: (a, b) => a.usage_mode.localeCompare(b.usage_mode),
    },
    {
      title: t('data.Host'),
      dataIndex: 'host',
    },
    {
      title: t('data.Type'),
      dataIndex: 'type',
      sorter: (a, b) => a.type.localeCompare(b.type),
      render: (_, record) => {
        return (
          <BAIFlex direction="column">
            {record.ownership_type === 'user' ? (
              <BAIFlex gap={'xs'}>
                <Text>{t('data.User')}</Text>
                {/* The `colorTextTertiary` glyph tint is dropped (P5) — the
                    V2 twin renders these icons at inherited colour. */}
                <User size="1em" />
              </BAIFlex>
            ) : (
              <BAIFlex gap={'xs'}>
                <Text>{t('data.Project')}</Text>
                <BAIUserUnionIcon />
              </BAIFlex>
            )}
          </BAIFlex>
        );
      },
      // render: (value) =>
      //   value === 'group' ? (
      //     <GroupOutlined />
      //   ) : value === 'user' ? (
      //     <User size="1em" />
      //   ) : value ? (
      //     value
      //   ) : (
      //     '-'
      //   ),
      // filters: [
      //   {
      //     text: 'user',
      //     value: 'user',
      //   },
      //   {
      //     text: 'group',
      //     value: 'group',
      //   },
      // ],
      // onFilter: (value, record) => record.type.indexOf(value + '') === 0,
    },
    // {
    //   title: 'Group',
    //   dataIndex: 'group_name',
    //   sorter: (a, b) => (a.group || '').localeCompare(b.group || ''),
    //   render: (value) => value || '-',
    // },
    {
      title: t('data.Permission'),
      dataIndex: 'permission',
      sorter: (a, b) => a.permission.localeCompare(b.permission),
      render: (_value, row) => {
        return <VFolderPermissionTag permission={row.permission} />;
      },
    },
    {
      title: t('data.Created'),
      dataIndex: 'created_at',
      sorter: (a, b) => a.created_at.localeCompare(b.created_at),
      render: (value) => dayjs(value).format('L'),
      defaultSortOrder: 'descend',
    },
    // {
    //   title: 'Modified',
    //   dataIndex: 'modified',
    //   sorter: (a, b) => a.modified.localeCompare(b.modified),
    //   render: (value) => value || '-',
    // },
    // {
    //   title: 'Size',
    //   dataIndex: 'size',
    //   sorter: (a, b) => a.size - b.size,
    //   render: (value) => value || '-',
    // },
    // }
    // {
    //   title: 'Max Size',
    //   dataIndex: 'max_size',
    //   // sorter: (a, b) => a (a.max_size || '').localeCompare(b.max_size || ''),
    //   render: (value) => value || '-',
    // },
  ];
  return (
    <BAIFlex direction="column" align="stretch" gap={'xs'}>
      <BAIFlex direction="row" gap="xs" justify="between">
        {/* MAPPING §3.6: a bare `Input` -> `TextInput`; `onChange` takes the
            VALUE, `allowClear` -> `hasClear`, and the required `label` is
            hidden because the placeholder plus the surrounding table already
            name it. */}
        <TextInput
          label={t('data.SearchByName')}
          isLabelHidden
          value={searchKey}
          onChange={(next) => setSearchKey(next)}
          hasClear
          placeholder={t('data.SearchByName')}
          width="100%"
        />
        {/* `Space.Compact` -> `ButtonGroup`; the Tooltip+icon-Button pairs
            collapse into `IconButton`s that own their tooltip and accessible
            name (MAPPING §3.3). */}
        <ButtonGroup label={t('data.Folders')}>
          <IconButton
            icon={<PlusIcon />}
            label={t('data.CreateANewStorageFolder')}
            tooltip={t('data.CreateANewStorageFolder')}
            onClick={() => {
              setIsOpenCreateModal(true);
            }}
          />
          <IconButton
            isLoading={isPendingRefetch}
            icon={<RotateCw size="1em" />}
            label={t('button.Refresh')}
            tooltip={t('button.Refresh')}
            onClick={() => {
              startRefetchTransition(() => {
                updateFetchKey();
              });
            }}
          />
        </ButtonGroup>
      </BAIFlex>
      <Form form={internalForm} component={false}>
        <BAITableAstryx
          // size="small"
          rowKey={getRowKey}
          rowSelection={{
            selectedRowKeys,
            onChange: (selectedRowKeys) => {
              setSelectedRowKeys(selectedRowKeys as VFolderKey[]);
              handleAliasUpdate();
            },
          }}
          columns={columns}
          dataSource={displayingFolders}
          // PILOT-DECISION (ticket 30-D): the old `onRow` handler existed only
          // to re-implement "clicking the padding of antd's selection column
          // toggles the row" by sniffing that column's antd class name. The
          // class no longer exists on the Astryx engine, and the
          // Astryx checkbox column handles its own clicks, so the handler is
          // dropped rather than re-pointed at a design-system internal.
          {...tableProps}
        />
      </Form>
      {showAutoMountedFoldersSection && autoMountedFolderNames.length > 0 ? (
        <>
          {/* antd `Descriptions size="small"` -> `MetadataList` (MAPPING §4;
              `size` has no destination and is dropped). Each auto-mounted
              folder name was a colourless `<Tag>`, i.e. Astryx's default
              `neutral` Badge. */}
          <MetadataList columns="single">
            <MetadataListItem label={t('data.AutomountFolders')}>
              <BAIFlex gap="xxs" wrap="wrap">
                {_.map(autoMountedFolderNames, (name) => {
                  return <Badge key={name} label={name} />;
                })}
              </BAIFlex>
            </MetadataListItem>
          </MetadataList>
        </>
      ) : null}
      <FolderCreateModalV2
        open={isOpenCreateModal}
        onRequestClose={(result) => {
          setIsOpenCreateModal(false);
          if (result) {
            startRefetchTransition(() => {
              updateFetchKey();
              setSelectedRowKeys((x) => [
                ...x,
                // @ts-ignore
                result[rowKey],
              ]);
            });
          }
        }}
      />
    </BAIFlex>
  );
};

export default VFolderTable;
