import { SettingOutlined } from '@ant-design/icons';
import { theme, Typography } from 'antd';
import { ColumnType } from 'antd/es/table';
import { BAIButton, BAIFlex, BAITable, BAITableProps } from 'backend.ai-ui';

interface UserTableProps extends BAITableProps<any> {}

const UserTable: React.FC<UserTableProps> = ({ ...tableProps }) => {
  const { token } = theme.useToken();
  const columns: ColumnType<any>[] = [
    {
      key: 'name',
      title: 'Name',
      fixed: 'left',
      render: () => <span>user@example.com</span>,
    },
    {
      key: 'controls',
      title: 'Controls',
      render: () => {
        return (
          <div>
            <BAIButton
              type="text"
              icon={
                <SettingOutlined
                  style={{
                    color: token.colorInfo,
                  }}
                />
              }
            />
          </div>
        );
      },
    },
    {
      key: 'weight',
      title: 'Weight',
      render: () => '1.0',
    },
    {
      key: 'fair_share_factor',
      title: 'Fair Share Factor',
      render: () => '0.65',
    },
    {
      key: 'rank',
      title: 'Rank',
      render: () => '3',
    },
  ];

  return (
    <BAIFlex direction="column" align="stretch">
      <Typography.Title level={4} style={{ margin: 0 }}>
        Users
      </Typography.Title>
      <Typography.Paragraph type="secondary">
        사용자에 설정된 Fair Share 정책을 확인하고 수정합니다.
      </Typography.Paragraph>
      <BAITable {...tableProps} columns={columns} dataSource={[{}, {}, {}]} />
    </BAIFlex>
  );
};

export default UserTable;
