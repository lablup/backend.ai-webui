import { useBaiSignedRequestWithPromise } from '../helper';
import { useCurrentProjectValue, useUpdatableState } from '../hooks';
import { useTanQuery } from '../hooks/reactQueryAlias';
import DoubleTag, { DoubleTagObjectValue } from './DoubleTag';
import Flex from './Flex';
import TextHighlighter from './TextHighlighter';
import { VFolder } from './VFolderSelect';
import { ReloadOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input, Table, TableProps, Typography } from 'antd';
import { GetRowKey } from 'antd/es/table/interface';
import { ColumnsType } from 'antd/lib/table';
import dayjs from 'dayjs';
import _ from 'lodash';
import React, { Key, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';

export interface VFolderFile {
  name: string;
  type: 'FILE' | 'DIRECTORY';
  size: number;
  mode: string;
  created: string;
  modified: string;
}

export interface VFolderSelectValue {
  alias?: string;
  key: string;
}

export interface AliasMap {
  [key: string]: string;
}

type DataIndex = keyof VFolder;

interface Props extends TableProps<VFolder> {
  // defaultSelectedKeys?: React.Key[];
  selectedRowKeys?: React.Key[];
  showAliasInput?: boolean;
  onChangeSelectedRowKeys?: (selectedKeys: React.Key[]) => void;
  aliasMap?: AliasMap;
  onChangeAliasMap?: (aliasMap: AliasMap) => void;
  filter?: (vFolder: VFolder) => boolean;
}

const VFolderTable: React.FC<Props> = ({
  filter,
  showAliasInput = false,
  selectedRowKeys = [],
  onChangeSelectedRowKeys,
  aliasMap,
  onChangeAliasMap: onChangeAlias,
  rowKey = 'name',
  ...tableProps
}) => {
  const getRowKey = React.useMemo<GetRowKey<VFolder>>(() => {
    if (typeof rowKey === 'function') {
      return rowKey;
    }
    return (record: VFolder) => {
      const key = record && record[rowKey as DataIndex];
      return key as Key;
    };
  }, [rowKey]);

  const [internalForm] = Form.useForm<AliasMap>();
  // useEffect(() => {
  // TODO: check setFieldsValue performance
  if (aliasMap) {
    internalForm.setFieldsValue(aliasMap);
  }
  // }, [aliasMap, internalForm]);

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

  const handleAliasUpdate = (e: any) => {
    e.preventDefault();
    internalForm.validateFields().then((values) => {
      onChangeAlias && onChangeAlias(values);
    });
  };

  const hasPermission = (vFolder: VFolder, perm: string) => {
    if (vFolder.permission.includes(perm)) {
      return true;
    }
    if (vFolder.permission.includes('w') && perm === 'r') {
      return true;
    }
    return false;
  };

  const columns: ColumnsType<VFolder> = [
    {
      title: (
        <>
          <Typography.Text>{t('data.folders.Name')}</Typography.Text>
          {showAliasInput && (
            <Typography.Text type="secondary">
              {' '}
              ({t('session.launcher.FolderAlias')})
            </Typography.Text>
          )}
        </>
      ),
      dataIndex: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (value, record) => {
        return (
          <Flex direction="column" align="stretch" gap={'xxs'}>
            <TextHighlighter keyword={searchKey}>{value}</TextHighlighter>
            {showAliasInput && selectedRowKeys.includes(getRowKey(record)) && (
              <Form.Item
                name={getRowKey(record)}
                // rules={[
                //   {
                //     required: true,
                //   },
                // ]}
                noStyle
              >
                <Input
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  placeholder={`/home/work/${record.name}/}`}
                  onPressEnter={handleAliasUpdate}
                  onBlur={handleAliasUpdate}
                ></Input>
              </Form.Item>
            )}
          </Flex>
        );
      },
      fixed: 'left',
      // ...getColumnSearchProps('name'),
    },
    {
      title: 'Usage Mode',
      dataIndex: 'usage_mode',
      sorter: (a, b) => a.usage_mode.localeCompare(b.usage_mode),
    },
    {
      title: 'Host',
      dataIndex: 'host',
    },
    {
      title: 'Type',
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
      title: 'Permission',
      dataIndex: 'permission',
      sorter: (a, b) => a.permission.localeCompare(b.permission),
      render: (value, row) => {
        // console.log(value);
        const tagValues: DoubleTagObjectValue[] = _.chain({
          r: 'green',
          w: 'blue',
          d: 'red',
        })
          .map((color, perm) => {
            if (hasPermission(row, perm)) {
              return {
                label: perm.toUpperCase(),
                color,
              };
            }
            return undefined;
          })
          .compact()
          .value();

        return <DoubleTag values={tagValues} />;
      },
    },
    {
      title: 'Created',
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
          placeholder="Search by name"
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
              // setSelectedRowKeys(selectedRowKeys);
              console.log(selectedRowKeys);
              onChangeSelectedRowKeys?.(selectedRowKeys);
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
                    ? onChangeSelectedRowKeys?.(
                        selectedRowKeys.filter((k) => k !== getRowKey(record)),
                      )
                    : onChangeSelectedRowKeys?.([
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
