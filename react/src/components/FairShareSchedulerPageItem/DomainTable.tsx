import { SettingOutlined } from '@ant-design/icons';
import { theme, Tooltip, Typography } from 'antd';
import { ColumnType } from 'antd/es/table';
import { BAIButton, BAIFlex, BAITable, BAITableProps } from 'backend.ai-ui';
import { ChevronRight, SquareActivity } from 'lucide-react';

interface DomainTableProps extends BAITableProps<any> {
  onClickGroupName?: (name: string) => void;
  onClickUsageBucketLog?: (name: string) => void;
}

const DomainTable: React.FC<DomainTableProps> = ({
  onClickGroupName,
  onClickUsageBucketLog,
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
          <span>domain example</span>
          <Tooltip title="하위 프로젝트 목록으로 이동">
            <BAIButton
              type="text"
              size="small"
              icon={<ChevronRight size={16} />}
              onClick={() => onClickGroupName?.('domain example')}
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
            <Tooltip title="Bucket 기록 보기">
              <BAIButton
                type="text"
                icon={
                  <SquareActivity
                    style={{
                      color: token.colorInfo,
                    }}
                  />
                }
                onClick={() => {
                  onClickUsageBucketLog?.('domain example');
                }}
              />
            </Tooltip>
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
      key: 'weight',
      title: 'Weight',
      render: () => '1.0',
    },
    {
      key: 'fair_share_factor',
      title: 'Fair Share Factor',
      render: () => '0.85',
    },
    {
      key: 'rank',
      title: 'Rank',
      render: () => '1',
    },
  ];

  return (
    <BAIFlex direction="column" align="stretch">
      <Typography.Title level={4} style={{ margin: 0 }}>
        Domains
      </Typography.Title>
      <Typography.Paragraph type="secondary">
        도메인에 설정된 Fair Share 정책을 확인하고 수정합니다.
      </Typography.Paragraph>
      <BAITable {...tableProps} columns={columns} dataSource={[{}, {}, {}]} />
    </BAIFlex>
  );
};

export default DomainTable;
