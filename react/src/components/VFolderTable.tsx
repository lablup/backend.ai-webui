import { useBaiSignedRequestWithPromise } from '../helper';
import { useSuspendedBackendaiClient, useUpdatableState } from '../hooks';
import { useKeyPairLazyLoadQuery } from '../hooks/hooksUsingRelay';
import { useSuspenseTanQuery } from '../hooks/reactQueryAlias';
import useControllableState from '../hooks/useControllableState';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { useEventNotStable } from '../hooks/useEventNotStable';
import { useShadowRoot } from './DefaultProviders';
import Flex from './Flex';
import TextHighlighter from './TextHighlighter';
import VFolderPermissionTag from './VFolderPermissionTag';
import { VFolder } from './VFolderSelect';
import { VFolderTableProjectQuery } from './__generated__/VFolderTableProjectQuery.graphql';
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
  Table,
  TableProps,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import graphql from 'babel-plugin-relay/macro';
import dayjs from 'dayjs';
import _ from 'lodash';
import React, { useEffect, useMemo, useState, useTransition } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useLazyLoadQuery } from 'react-relay';

export interface VFolderFile {
  name: string;
  type: 'FILE' | 'DIRECTORY';
  size: number;
  mode: string;
  created: string;
  modified: string;
}
type VFolderKey = string | number;

export interface VFolderSelectValue {
  alias?: string;
  key: string;
}

export interface AliasMap {
  [key: string]: string;
}

type DataIndex = keyof VFolder;

export interface VFolderTableProps extends Omit<TableProps<VFolder>, 'rowKey'> {
  showAliasInput?: boolean;
  selectedRowKeys?: VFolderKey[];
  onChangeSelectedRowKeys?: (selectedKeys: VFolderKey[]) => void;
  aliasBasePath?: string;
  aliasMap?: AliasMap;
  onChangeAliasMap?: (aliasMap: AliasMap) => void;
  filter?: (vFolder: VFolder) => boolean;
  rowKey: string | number;
  onChangeAutoMountedFolders?: (names: Array<string>) => void;
  showAutoMountedFoldersSection?: boolean;
}

export const vFolderAliasNameRegExp = /^[a-zA-Z0-9_/.-]*$/;
export const DEFAULT_ALIAS_BASE_PATH = '/home/work/';
const VFolderTable: React.FC<VFolderTableProps> = ({
  filter,
  showAliasInput = false,
  selectedRowKeys: controlledSelectedRowKeys = [],
  onChangeSelectedRowKeys,
  aliasBasePath = DEFAULT_ALIAS_BASE_PATH,
  aliasMap: controlledAliasMap,
  onChangeAliasMap,
  rowKey = 'name',
  onChangeAutoMountedFolders,
  showAutoMountedFoldersSection,
  ...tableProps
}) => {
  const getRowKey = React.useMemo(() => {
    return (record: VFolder) => {
      const key = record && record[rowKey as DataIndex];
      return key as VFolderKey;
    };
  }, [rowKey]);

  const [selectedRowKeys, setSelectedRowKeys] = useControllableState<
    VFolderKey[]
  >(
    {
      value: controlledSelectedRowKeys,
      onChange: onChangeSelectedRowKeys,
    },
    {
      defaultValue: [],
    },
  );

  const [aliasMap, setAliasMap] = useControllableState<AliasMap>(
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
  const [fetchKey, updateFetchKey] = useUpdatableState('first');
  const [isPendingRefetch, startRefetchTransition] = useTransition();
  const { data: allFolderList } = useSuspenseTanQuery({
    queryKey: ['VFolderSelectQuery', fetchKey, currentProject.id],
    queryFn: () => {
      const search = new URLSearchParams();
      search.set('group_id', currentProject.id);
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

  const filteredFolderListByPermission = useMemo(() => {
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
      allowedVFolderHostsByDomain,
      allowedVFolderHostsByGroup,
      allowedVFolderHostsByKeypairResourcePolicy,
    );
    // only allow mount if volume permission has 'mount-in-session'
    const mountAllowedVolumes = Object.keys(mergedVFolderPermissions).filter(
      (volume) => mergedVFolderPermissions[volume].includes('mount-in-session'),
    );
    // Need to filter allFolderList from allowed vfolder
    return allFolderList?.filter((folder) =>
      mountAllowedVolumes.includes(folder.host),
    );
  }, [domain, group, keypair_resource_policy, allFolderList]);

  const autoMountedFolderNamesByPermission = useMemo(
    () =>
      _.chain(filteredFolderListByPermission)
        .filter((vf) => vf.status === 'ready' && vf.name?.startsWith('.'))
        .map((vf) => vf.name)
        .value(),
    [filteredFolderListByPermission],
  );

  useEffect(() => {
    _.isFunction(onChangeAutoMountedFolders) &&
      onChangeAutoMountedFolders(autoMountedFolderNamesByPermission);
    // Do not need to run when `autoMountedFolderNames` changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoMountedFolderNamesByPermission]);

  const [searchKey, setSearchKey] = useState('');
  const displayingFolders = _.chain(filteredFolderListByPermission)
    .filter((vf) => (filter ? filter(vf) : true))
    .filter((vf) => {
      if (selectedRowKeys.includes(getRowKey(vf))) {
        return true;
      }
      return !searchKey || vf.name.includes(searchKey);
    })
    .value();

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
  const inputToAliasPath = useEventNotStable(
    (name: VFolderKey, input?: string) => {
      if (_.isEmpty(input)) {
        return `${aliasBasePath}${name}`;
      } else if (input?.startsWith('/')) {
        return input;
      } else {
        return `${aliasBasePath}${input}`;
      }
    },
  );

  const handleAliasUpdate = useEventNotStable(() => {
    setAliasMap(
      _.mapValues(
        _.pickBy(internalForm.getFieldsValue(), (v) => !!v), //remove empty
        (v, k) => inputToAliasPath(k, v), // add alias base path
      ),
    );
    internalForm.validateFields().catch(() => {});
  });

  useEffect(() => {
    handleAliasUpdate();
    // `selectedRowKeys` can be changed by parents at any time, so we need to check whether `selectedRowKeys` has changed using JSON.stringify
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(selectedRowKeys), handleAliasUpdate]);

  const shadowRoot = useShadowRoot();

  const columns: ColumnsType<VFolder> = [
    {
      title: (
        <Flex direction="row" gap="xxs">
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
                  // @ts-ignore
                  getPopupContainer={() => shadowRoot}
                >
                  <QuestionCircleOutlined />
                </Tooltip>
                )
              </Typography.Text>
            </>
          )}
        </Flex>
      ),
      dataIndex: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (value, record) => {
        const isCurrentRowSelected = selectedRowKeys.includes(
          getRowKey(record),
        );

        return (
          <Flex
            direction="column"
            align="stretch"
            gap={'xxs'}
            style={
              showAliasInput && isCurrentRowSelected
                ? { display: 'inline-flex', height: 70, width: '100%' }
                : {
                    maxWidth: 200,
                  }
            }
          >
            <TextHighlighter keyword={searchKey}>{value}</TextHighlighter>
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
                          validator: async (rule, value) => {
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
                          validator: async (rule, value) => {
                            const aliasPath = inputToAliasPath(
                              getRowKey(record),
                              value,
                            );
                            if (
                              value &&
                              _.map(
                                autoMountedFolderNamesByPermission,
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
          </Flex>
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
      render: (value, record) => {
        return (
          <Flex direction="column">
            {record.type === 'user' ? (
              <UserOutlined title="User" />
            ) : (
              <div>Group</div>
            )}
            {record.type === 'group' && `(${record.group_name})`}
          </Flex>
        );
      },
      // render: (value) =>
      //   value === 'group' ? (
      //     <GroupOutlined />
      //   ) : value === 'user' ? (
      //     <UserOutlined />
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
      render: (value, row) => {
        return <VFolderPermissionTag permission={row.permission} />;
      },
    },
    {
      title: t('data.Created'),
      dataIndex: 'created_at',
      sorter: (a, b) => a.created_at.localeCompare(b.created_at),
      render: (value, record) => dayjs(value).format('L'),
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
    <Flex direction="column" align="stretch" gap={'xs'}>
      <Flex direction="row" gap="xs" justify="between">
        <Input
          value={searchKey}
          onChange={(e) => setSearchKey(e.target.value)}
          allowClear
          placeholder={t('data.SearchByName')}
        />
        <Button
          loading={isPendingRefetch}
          icon={<ReloadOutlined />}
          onClick={() => {
            startRefetchTransition(() => {
              updateFetchKey();
            });
          }}
        />
      </Flex>
      <Form form={internalForm} component={false}>
        <Table
          // size="small"
          scroll={{ x: 'max-content' }}
          rowKey={getRowKey}
          rowSelection={{
            selectedRowKeys,
            onChange: (selectedRowKeys) => {
              setSelectedRowKeys(selectedRowKeys as VFolderKey[]);
            },
          }}
          showSorterTooltip={false}
          columns={columns}
          dataSource={displayingFolders}
          onRow={(record, rowIndex) => {
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
      {showAutoMountedFoldersSection &&
      autoMountedFolderNamesByPermission.length > 0 ? (
        <>
          <Descriptions size="small">
            <Descriptions.Item label={t('data.AutomountFolders')}>
              {_.map(autoMountedFolderNamesByPermission, (name) => {
                return <Tag key={name}>{name}</Tag>;
              })}
            </Descriptions.Item>
          </Descriptions>
        </>
      ) : null}
    </Flex>
  );
};

export default VFolderTable;
