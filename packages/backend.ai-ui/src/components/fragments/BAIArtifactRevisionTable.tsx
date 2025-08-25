import {
  BAIArtifactRevisionTableArtifactRevisionFragment$data,
  BAIArtifactRevisionTableArtifactRevisionFragment$key,
} from '../../__generated__/BAIArtifactRevisionTableArtifactRevisionFragment.graphql';
import { BAIArtifactRevisionTableLatestRevisionFragment$key } from '../../__generated__/BAIArtifactRevisionTableLatestRevisionFragment.graphql';
import { filterOutEmpty } from '../../helper';
import BAIFlex from '../BAIFlex';
import BAITag from '../BAITag';
import BAIText from '../BAIText';
import { BAIColumnsType, BAITable, BAITableProps } from '../Table';
import { Button, Tag } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

dayjs.extend(relativeTime);

export type ArtifactRevision = NonNullable<
  NonNullable<BAIArtifactRevisionTableArtifactRevisionFragment$data>[number]
>;

export interface BAIArtifactRevisionTableProps
  extends Omit<
    BAITableProps<ArtifactRevision>,
    'dataSource' | 'columns' | 'rowKey'
  > {
  artifactRevisionFrgmt: BAIArtifactRevisionTableArtifactRevisionFragment$key;
  onClickDownload: (revisionId: string) => void;
  latestRevisionFrgmt:
    | BAIArtifactRevisionTableLatestRevisionFragment$key
    | null
    | undefined;
}

const BAIArtifactRevisionTable = ({
  artifactRevisionFrgmt,
  onClickDownload,
  latestRevisionFrgmt,
  ...tableProps
}: BAIArtifactRevisionTableProps) => {
  const { t } = useTranslation();

  const artifactRevision =
    useFragment<BAIArtifactRevisionTableArtifactRevisionFragment$key>(
      graphql`
        fragment BAIArtifactRevisionTableArtifactRevisionFragment on ArtifactRevision
        @relay(plural: true) {
          id
          version
          size
          status
          updatedAt
        }
      `,
      artifactRevisionFrgmt,
    );
  const latestRevision =
    useFragment<BAIArtifactRevisionTableLatestRevisionFragment$key>(
      graphql`
        fragment BAIArtifactRevisionTableLatestRevisionFragment on ArtifactRevision {
          id
        }
      `,
      latestRevisionFrgmt,
    );

  const columns: BAIColumnsType<ArtifactRevision> = [
    {
      title: t('comp:BAIArtifactRevisionTable.Version'),
      dataIndex: 'version',
      key: 'version',
      width: '30%',
      render: (version: string, record: ArtifactRevision, index: number) => (
        <div>
          <BAIFlex align="center" gap={'xs'}>
            <BAIText monospace strong>
              {version}
            </BAIText>
            {latestRevision && latestRevision.id === record.id && (
              <Tag color="blue">Latest</Tag>
            )}
          </BAIFlex>
        </div>
      ),
    },
    {
      title: t('comp:BAIArtifactRevisionTable.Status'),
      dataIndex: 'status',
      key: 'status',
      width: '15%',
      render: (value: string) => {
        return <BAITag>{value}</BAITag>;
      },
    },
    {
      title: t('comp:BAIArtifactRevisionTable.Action'),
      key: 'action',
      width: '15%',
      render: (_, record: ArtifactRevision) => {
        const status = record.status;
        const isDownloadable = status === 'SCANNED';
        const isFailed = status === 'FAILED';
        const isLoading = status === 'PULLING' || status === 'VERIFYING';

        const getType = () => {
          if (isDownloadable) return 'primary';
          return 'default';
        };

        const getText = () => {
          if (status === 'PULLING') return 'Pulling';
          return 'Pull';
        };

        return (
          <Button
            icon={<Download size={16} />}
            type={getType()}
            size="small"
            onClick={() => {
              if (isDownloadable) {
                onClickDownload(record.id);
              }
            }}
            disabled={isLoading || isFailed}
            loading={isLoading}
          >
            {getText()}
          </Button>
        );
      },
    },
    {
      title: t('comp:BAIArtifactRevisionTable.Size'),
      dataIndex: 'size',
      key: 'size',
      width: '15%',
      render: (size: number) => {
        return (
          <BAIText monospace>
            {/* {convertToDecimalUnit(size, 'auto')?.displayValue} */}
          </BAIText>
        );
      },
    },
    {
      title: t('comp:BAIArtifactTable.Updated'),
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: '15%',
      render: (updated_at: string) => (
        <BAIText type="secondary" title={dayjs(updated_at).toString()}>
          {dayjs(updated_at).fromNow()}
        </BAIText>
      ),
    },
  ];

  return (
    <BAITable<ArtifactRevision>
      rowKey={(record) => record.id}
      resizable
      columns={filterOutEmpty(columns)}
      dataSource={artifactRevision}
      scroll={{ x: 'max-content' }}
      {...tableProps}
    ></BAITable>
  );
};

export default BAIArtifactRevisionTable;
