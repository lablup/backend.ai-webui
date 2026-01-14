import { SettingOutlined } from '@ant-design/icons';
import { theme, Tooltip, Typography } from 'antd';
import { ColumnType } from 'antd/es/table';
import { BAIButton, BAIFlex, BAITable, BAITableProps } from 'backend.ai-ui';
import { ChevronRight } from 'lucide-react';

interface ResourceGroupTableProps extends BAITableProps<any> {
  onClickGroupName?: (name: string) => void;
}

const ResourceGroupTable: React.FC<ResourceGroupTableProps> = ({
  onClickGroupName,
  ...tableProps
}) => {
  const { token } = theme.useToken();

  const columns: ColumnType<any>[] = [
    {
      key: 'name',
      title: 'Name',
      fixed: 'left',
      render: () => (
        <BAIFlex gap="xs" align="center">
          <span>resource group example</span>
          <Tooltip title="하위 도메인 목록으로 이동">
            <BAIButton
              type="text"
              size="small"
              icon={<ChevronRight size={16} />}
              onClick={() => onClickGroupName?.('resource group example')}
            />
          </Tooltip>
        </BAIFlex>
      ),
    },
    {
      key: 'controls',
      title: 'Controls',
      render: () => {
        return (
          <BAIFlex>
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
          </BAIFlex>
        );
      },
    },
    {
      key: 'half_life_days',
      title: 'Half Life (days)',
      render: () => '7',
    },
    {
      key: 'lookback_days',
      title: 'Lookback (days)',
      render: () => '28',
    },
    {
      key: 'decay_unit_days',
      title: 'Decay Unit (days)',
      render: () => '1',
    },
    {
      key: 'default_weight',
      title: 'Default Weight',
      render: () => '1.0',
    },
    {
      key: 'gap_policy',
      title: 'Gap Policy',
      render: () => 'interpolate',
    },
    {
      key: 'max_gap_hours',
      title: 'Max Gap (hours)',
      render: () => '24',
    },
  ];

  return (
    <BAIFlex direction="column" align="stretch">
      <Typography.Title level={4} style={{ margin: 0 }}>
        Resource Groups
      </Typography.Title>
      <Typography.Paragraph type="secondary">
        자원 그룹에 설정된 Fair Share 정책을 확인하고 수정합니다.
      </Typography.Paragraph>
      <BAITable {...tableProps} columns={columns} dataSource={[{}, {}, {}]} />
    </BAIFlex>
  );
};

export default ResourceGroupTable;
