/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  VFolderTableQuery,
  VFolderTableQuery$data,
} from '../__generated__/VFolderTableQuery.graphql';
import { useSuspendedBackendaiClient } from '../hooks';
import { useKeyPairLazyLoadQuery } from '../hooks/hooksUsingRelay';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import FolderCreateModal from './FolderCreateModal';
import { useFolderExplorerOpener } from './FolderExplorerOpener';
import TextHighlighter from './TextHighlighter';
import VFolderNodeIdenticon from './VFolderNodeIdenticon';
import VFolderPermissionTag from './VFolderPermissionTag';
import {
  QuestionCircleOutlined,
  ReloadOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Button,
  Descriptions,
  Form,
  Input,
  Space,
  TableProps,
  Tag,
  theme,
  Tooltip,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/lib/table';
import {
  BAIUserUnionIcon,
  BAIFlex,
  BAILink,
  BAITable,
  filterOutNullAndUndefined,
  mergeFilterValues,
  toLocalId,
  useEventNotStable,
  useUpdatableState,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import _ from 'lodash';
import { PlusIcon } from 'lucide-react';
import React, { useEffect, useState, useTransition } from 'react';
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

export type VFolderInTable = NonNullableNodeOnEdges<
  VFolderTableQuery$data['vfolder_nodes']
>;

type VFolderKey = string;

export interface VFolderSelectValue {
  alias?: string;
  key: string;
}

export interface AliasMap {
  [key: string]: string;
}

export interface VFolderTableProps extends Omit<
  TableProps<VFolderInTable>,
  'rowKey'
> {
  showAliasInput?: boolean;
  selectedRowKeys?: VFolderKey[];
  onChangeSelectedRowKeys?: (
    selectedKeys: VFolderKey[],
    selectedVFolders: VFolderInTable[],
  ) => void;
  aliasBasePath?: string;
  aliasMap?: AliasMap;
  onChangeAliasMap?: (aliasMap: AliasMap) => void;
  rowFilter?: (vFolder: VFolderInTable) => boolean;
  rowKey: string | number;
  onChangeAutoMountedFolders?: (names: Array<string>) => void;
  showAutoMountedFoldersSection?: boolean;
  ownerEmail?: string;
  onValidateSelectedRowKeys?: (
    invalidKeys: VFolderKey[],
    validVFolders: VFolderInTable[],
  ) => void;
}

export const vFolderAliasNameRegExp = /^[a-zA-Z0-9_/.-]*$/;
export const DEFAULT_ALIAS_BASE_PATH = '/home/work/';
const VFolderTable: React.FC<VFolderTableProps> = ({
  rowFilter,
  showAliasInput = false,
  selectedRowKeys: controlledSelectedRowKeys,
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
  const getRowKey = (record: VFolderInTable) => {
    if (rowKey === 'id') {
      return toLocalId(record.id) as VFolderKey;
    }
    const key = record[rowKey as keyof VFolderInTable];
    return (key ?? '') as VFolderKey;
  };

  const [isOpenCreateModal, setIsOpenCreateModal] = useState(false);

  const selectedRowKeys = controlledSelectedRowKeys ?? [];
  const aliasMap = controlledAliasMap ?? {};

  const baiClient = useSuspendedBackendaiClient();
  const [keypair] = useKeyPairLazyLoadQuery(baiClient?._config.accessKey);

  const [internalForm] = Form.useForm<AliasMap>();
  const syncFormWithAliasMap = useEventNotStable(() => {
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
  });
  useEffect(() => {
    syncFormWithAliasMap();
  }, [controlledAliasMap, syncFormWithAliasMap]);

  const { t } = useTranslation();
  const { token } = theme.useToken();
  const currentProject = useCurrentProjectValue();

  if (!currentProject.id) {
    throw new Error('Project is required for VFolderTable');
  }

  const [fetchKey, updateFetchKey] = useUpdatableState('first');
  const [isPendingRefetch, startRefetchTransition] = useTransition();

  const { vfolder_nodes, domain, group, keypair_resource_policy } =
    useLazyLoadQuery<VFolderTableQuery>(
      graphql`
        query VFolderTableQuery(
          $scopeId: ScopeField
          $filter: String
          $domain_name: String!
          $group_id: UUID!
          $keypair_resource_policy_name: String!
        ) {
          vfolder_nodes(scope_id: $scopeId, filter: $filter) {
            edges {
              node {
                id @required(action: NONE)
                name
                host
                status
                usage_mode
                permission
                created_at
                ownership_type
                group
                ...VFolderNodeIdenticonFragment
              }
            }
          }
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
        scopeId: `project:${currentProject.id}`,
        filter: mergeFilterValues([
          'status != "DELETE_PENDING" & status != "DELETE_ONGOING" & status != "DELETE_ERROR" & status != "DELETE_COMPLETE"',
          ownerEmail ? `user_email == "${ownerEmail}"` : undefined,
        ]),
        domain_name: baiClient._config.domainName,
        group_id: currentProject.id,
        keypair_resource_policy_name: keypair?.resource_policy || '',
      },
      {
        fetchPolicy: 'store-and-network',
        fetchKey: fetchKey,
      },
    );

  const allFolderList = filterOutNullAndUndefined(
    vfolder_nodes?.edges?.map((edge) => edge?.node),
  );

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
  const mountableVolumesByPermission = Object.keys(
    mergedVFolderPermissions,
  ).filter((volume) =>
    mergedVFolderPermissions[volume].includes('mount-in-session'),
  );

  const mountableFoldersByPermission = allFolderList.filter((folder) =>
    mountableVolumesByPermission.includes(folder.host ?? ''),
  );

  const validateSelectedRowKeys = useEventNotStable(() => {
    const invalidKeys = _.difference(
      selectedRowKeys,
      mountableFoldersByPermission.map((vf) => getRowKey(vf)),
    );
    if (invalidKeys.length === 0) return;

    onValidateSelectedRowKeys?.(
      invalidKeys,
      _.filter(mountableFoldersByPermission, (vf) =>
        _.includes(selectedRowKeys, getRowKey(vf)),
      ),
    );
  });
  useEffect(() => {
    validateSelectedRowKeys();
  }, [
    controlledSelectedRowKeys,
    mountableFoldersByPermission,
    validateSelectedRowKeys,
  ]);

  const autoMountedFolderNames = _.chain(mountableFoldersByPermission)
    .filter(
      (vf) => vf.status === 'ready' && (vf.name?.startsWith('.') ?? false),
    )
    .map((vf) => vf.name ?? '')
    .value();

  useEffect(() => {
    _.isFunction(onChangeAutoMountedFolders) &&
      onChangeAutoMountedFolders(autoMountedFolderNames);
    // Do not need to run when `autoMountedFolderNames` changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoMountedFolderNames]);

  useEffect(() => {
    // Reset selectedRowKeys when currentProject changes
    if (!controlledSelectedRowKeys || controlledSelectedRowKeys.length === 0) {
      onChangeSelectedRowKeys?.([], []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProject.id]);

  const [searchKey, setSearchKey] = useState('');
  const displayingFolders = _.chain(mountableFoldersByPermission)
    .filter((vf) => {
      // Apply external filter for display
      if (rowFilter && !rowFilter(vf)) {
        return false;
      }
      // Always show selected items
      if (selectedRowKeys.includes(getRowKey(vf))) {
        return true;
      }
      // Apply search filter
      return !searchKey || (vf.name?.includes(searchKey) ?? false);
    })
    .value();

  const setSelectedRowKeys = useEventNotStable(
    (action: React.SetStateAction<VFolderKey[]>) => {
      const newKeys =
        typeof action === 'function' ? action(selectedRowKeys) : action;
      const selectedVFolders = _.filter(displayingFolders, (folder) =>
        _.includes(newKeys, getRowKey(folder)),
      );
      onChangeSelectedRowKeys?.(newKeys, selectedVFolders);
    },
  );

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
  const inputToAliasPath = (name: VFolderKey, input?: string) => {
    if (input === undefined || input === '') {
      return `${aliasBasePath}${name}`;
    } else if (input.startsWith('/')) {
      return input;
    } else {
      return `${aliasBasePath}${input}`;
    }
  };

  const handleAliasUpdate = useEventNotStable(() => {
    onChangeAliasMap?.(
      _.mapValues(
        _.pickBy(internalForm.getFieldsValue({ strict: false }), (v) => !!v), //remove empty
        (v, k) => inputToAliasPath(k, v), // add alias base path
      ),
    );
    internalForm.validateFields().catch(() => {});
  });

  useEffect(() => {
    handleAliasUpdate();
  }, [controlledSelectedRowKeys, handleAliasUpdate]);

  const columns: ColumnsType<VFolderInTable> = [
    {
      title: (
        <BAIFlex direction="row" gap="xxs">
          <Typography.Text>{t('data.folders.Name')}</Typography.Text>
          {showAliasInput && (
            <>
              <Typography.Text
                type="secondary"
                style={{ fontWeight: 'normal' }}
              >
                ({t('session.launcher.FolderAlias')}{' '}
                <Tooltip
                  title={<Trans i18nKey={'session.launcher.DescFolderAlias'} />}
                >
                  <QuestionCircleOutlined />
                </Tooltip>
                )
              </Typography.Text>
            </>
          )}
        </BAIFlex>
      ),
      dataIndex: 'name',
      ellipsis: true,
      sorter: (a, b) => (a.name ?? '').localeCompare(b.name ?? ''),
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
            <BAIFlex direction="row" align="center" gap="xxs">
              <VFolderNodeIdenticon vfolderNodeIdenticonFrgmt={record} />
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
            </BAIFlex>
            {showAliasInput && isCurrentRowSelected && (
              <Form.Item
                noStyle
                // rerender when
                shouldUpdate={(prev, cur) =>
                  prev[getRowKey(record)] !== cur[getRowKey(record)]
                }
              >
                {() => {
                  const allAliasPathMap = _(selectedRowKeys).reduce(
                    (result, name) => {
                      result[name] =
                        aliasMap?.[name] || inputToAliasPath(name, undefined);

                      return result;
                    },
                    {} as AliasMap,
                  );

                  return (
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
                                    inputToAliasPath(getRowKey(record), value),
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
                        record.name ?? '',
                        internalForm.getFieldValue(getRowKey(record)),
                      )}
                    >
                      <Input
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        placeholder={t('session.launcher.FolderAlias')}
                        allowClear
                        onChange={() => {
                          handleAliasUpdate();
                        }}
                      ></Input>
                    </Form.Item>
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
      sorter: (a, b) => (a.usage_mode ?? '').localeCompare(b.usage_mode ?? ''),
    },
    {
      title: t('data.Host'),
      dataIndex: 'host',
    },
    {
      title: t('data.Type'),
      dataIndex: 'ownership_type',
      sorter: (a, b) =>
        (a.ownership_type ?? '').localeCompare(b.ownership_type ?? ''),
      render: (_, record) => {
        return (
          <BAIFlex direction="column">
            {record.ownership_type === 'user' ? (
              <BAIFlex gap={'xs'}>
                <Typography.Text>{t('data.User')}</Typography.Text>
                <UserOutlined style={{ color: token.colorTextTertiary }} />
              </BAIFlex>
            ) : (
              <BAIFlex gap={'xs'}>
                <Typography.Text>{t('data.Project')}</Typography.Text>
                <BAIUserUnionIcon style={{ color: token.colorTextTertiary }} />
              </BAIFlex>
            )}
          </BAIFlex>
        );
      },
    },
    {
      title: t('data.Permission'),
      dataIndex: 'permission',
      sorter: (a, b) => (a.permission ?? '').localeCompare(b.permission ?? ''),
      render: (_value, row) => {
        return <VFolderPermissionTag permission={row.permission ?? ''} />;
      },
    },
    {
      title: t('data.Created'),
      dataIndex: 'created_at',
      sorter: (a, b) => (a.created_at ?? '').localeCompare(b.created_at ?? ''),
      render: (value) => dayjs(value).format('L'),
      defaultSortOrder: 'descend',
    },
  ];
  return (
    <BAIFlex direction="column" align="stretch" gap={'xs'}>
      <BAIFlex direction="row" gap="xs" justify="between">
        <Input
          value={searchKey}
          onChange={(e) => setSearchKey(e.target.value)}
          allowClear
          placeholder={t('data.SearchByName')}
        />
        <Space.Compact>
          <Tooltip title={t('data.CreateANewStorageFolder')}>
            <Button
              icon={<PlusIcon />}
              onClick={() => {
                setIsOpenCreateModal(true);
              }}
            />
          </Tooltip>
          <Tooltip title={t('button.Refresh')}>
            <Button
              loading={isPendingRefetch}
              icon={<ReloadOutlined />}
              onClick={() => {
                startRefetchTransition(() => {
                  updateFetchKey();
                });
              }}
            />
          </Tooltip>
        </Space.Compact>
      </BAIFlex>
      <Form form={internalForm} component={false} preserve={false}>
        <BAITable
          // size="small"
          scroll={{ x: 'max-content' }}
          rowKey={getRowKey}
          rowSelection={{
            selectedRowKeys,
            onChange: (selectedRowKeys) => {
              setSelectedRowKeys(selectedRowKeys as VFolderKey[]);
              handleAliasUpdate();
            },
          }}
          showSorterTooltip={false}
          columns={columns}
          dataSource={displayingFolders}
          onRow={(record) => {
            return {
              onClick: (event) => {
                const target = event.target as HTMLElement;
                // allow click on selection column
                if (target?.classList?.contains('ant-table-selection-column')) {
                  event.stopPropagation();
                  selectedRowKeys.includes(getRowKey(record))
                    ? setSelectedRowKeys(
                        selectedRowKeys.filter((k) => k !== getRowKey(record)),
                      )
                    : setSelectedRowKeys([
                        ...selectedRowKeys,
                        getRowKey(record),
                      ]);
                }
              },
            };
          }}
          {...tableProps}
        />
      </Form>
      {showAutoMountedFoldersSection && autoMountedFolderNames.length > 0 ? (
        <>
          <Descriptions size="small">
            <Descriptions.Item label={t('data.AutomountFolders')}>
              {_.map(autoMountedFolderNames, (name) => {
                return <Tag key={name}>{name}</Tag>;
              })}
            </Descriptions.Item>
          </Descriptions>
        </>
      ) : null}
      <FolderCreateModal
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
