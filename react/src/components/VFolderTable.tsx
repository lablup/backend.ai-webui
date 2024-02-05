import { useBaiSignedRequestWithPromise } from '../helper';
import { useCurrentProjectValue, useUpdatableState } from '../hooks';
import { useTanQuery } from '../hooks/reactQueryAlias';
import { useShadowRoot } from './DefaultProviders';
import Flex from './Flex';
import TextHighlighter from './TextHighlighter';
import VFolderPermissionTag from './VFolderPermissionTag';
import { VFolder } from './VFolderSelect';
import {
  QuestionCircleOutlined,
  ReloadOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useControllableValue } from 'ahooks';
import {
  Button,
  Form,
  Input,
  Table,
  TableProps,
  Tooltip,
  Typography,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import dayjs from 'dayjs';
import _ from 'lodash';
import React, { useEffect, useState, useTransition } from 'react';
import { Trans, useTranslation } from 'react-i18next';

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
}

const VFolderTable: React.FC<VFolderTableProps> = ({
  filter,
  showAliasInput = false,
  selectedRowKeys: controlledSelectedRowKeys = [],
  onChangeSelectedRowKeys,
  aliasBasePath = '/home/work/',
  aliasMap: controlledAliasMap,
  onChangeAliasMap,
  rowKey = 'name',
  ...tableProps
}) => {
  const getRowKey = React.useMemo(() => {
    return (record: VFolder) => {
      const key = record && record[rowKey as DataIndex];
      return key as VFolderKey;
    };
  }, [rowKey]);

  const [selectedRowKeys, setSelectedRowKeys] = useControllableValue<
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

  const [aliasMap, setAliasMap] = useControllableValue<AliasMap>(
    {
      value: controlledAliasMap,
      onChange: onChangeAliasMap,
    },
    {
      defaultValue: {},
    },
  );

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
  const { data: allFolderList } = useTanQuery({
    queryKey: ['VFolderSelectQuery', fetchKey],
    queryFn: () => {
      return baiRequestWithPromise({
        method: 'GET',
        url: `/folders?group_id=${currentProject.id}`,
      }) as Promise<VFolder[]>;
    },
    staleTime: 0,
  });
  const [searchKey, setSearchKey] = useState('');
  const displayingFolders = _.filter(allFolderList, (vf) => {
    // keep selected folders
    if (selectedRowKeys.includes(getRowKey(vf))) {
      return true;
    }
    // filter by search key
    return (
      (!filter || filter(vf)) && (!searchKey || vf.name.includes(searchKey))
    );
  });
  // const { token } = theme.useToken();
  // const searchInput = useRef<InputRef>(null);

  // TODO: set defaults
  // useUpdateEffect(() => {
  //   setSelectedRowKeys(defaultSelectedKeys || []);
  // }, [defaultSelectedKeys]);

  const handleAliasUpdate = (e?: any) => {
    e?.preventDefault();
    internalForm
      .validateFields()
      .then((values) => {})
      .catch(() => {})
      .finally(() => {
        setAliasMap(
          _.mapValues(
            _.pickBy(internalForm.getFieldsValue(), (v) => !!v), //remove empty
            (v, k) => mapAliasToPath(k, v), // add alias base path
          ),
        );
      });
  };

  const mapAliasToPath = (name: VFolderKey, input?: string) => {
    if (_.isEmpty(input)) {
      return `${aliasBasePath}${name}`;
    } else if (input?.startsWith('/')) {
      return input;
    } else {
      return `${aliasBasePath}${input}`;
    }
  };

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
                  style={{
                    zIndex: 10000,
                  }}
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
                : undefined
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
                        aliasMap?.[name] || mapAliasToPath(name, undefined);

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
                          pattern: /^[a-zA-Z0-9_/-]*$/,
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
                                    mapAliasToPath(getRowKey(record), value),
                              )
                            ) {
                              return Promise.reject(
                                t('session.launcher.FolderAliasOverlapping'),
                              );
                            }
                            return Promise.resolve();
                          },
                        },
                      ]}
                      // dependencies={[getRowKey(record)]}
                      extra={mapAliasToPath(
                        record.name,
                        internalForm.getFieldValue(getRowKey(record)),
                      )}
                    >
                      <Input
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        placeholder={t('session.launcher.FolderAlias')}
                        // onPressEnter={handleAliasUpdate}
                        // onBlur={handleAliasUpdate}
                        onChange={handleAliasUpdate}
                        allowClear
                      ></Input>
                    </Form.Item>
                  );
                }}
              </Form.Item>
            )}
          </Flex>
        );
      },
      fixed: 'left',
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
      <Form form={internalForm}>
        <Table
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
    </Flex>
  );
};

export default VFolderTable;
