import {
  BAIArtifactTableArtifactFragment$data,
  BAIArtifactTableArtifactFragment$key,
} from '../../__generated__/BAIArtifactTableArtifactFragment.graphql';
import {
  convertToDecimalUnit,
  filterOutEmpty,
  filterOutNullAndUndefined,
  toLocalId,
} from '../../helper';
import BAIFlex from '../BAIFlex';
import BAILink from '../BAILink';
import BAIText from '../BAIText';
import { BAITable, BAITableProps } from '../Table';
import BAIArtifactRevisionDownloadButton from './BAIArtifactRevisionDownloadButton';
import BAIArtifactStatusTag from './BAIArtifactStatusTag';
import BAIArtifactTypeTag from './BAIArtifactTypeTag';
import { SyncOutlined } from '@ant-design/icons';
import { TableColumnsType, theme, Typography } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import _ from 'lodash';
import { Package, Container, Brain } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

dayjs.extend(relativeTime);

export const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pulling':
      return 'processing';
    case 'verifying':
      return 'warning';
    case 'available':
      return 'default';
    case 'failed':
      return 'error';
    default:
      return 'default';
  }
};

export const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pulling':
    case 'verifying':
      return <SyncOutlined spin />;
    default:
      return null;
  }
};

export const getTypeIcon = (type: string, size: number = 16) => {
  const colorMap = {
    model: '#1677ff',
    package: '#52c41a',
    image: '#fa8c16',
  };

  switch (type.toLowerCase()) {
    case 'model':
      return <Brain size={size} color={colorMap.model} />;
    case 'package':
      return <Package size={size} color={colorMap.package} />;
    case 'image':
      return <Container size={size} color={colorMap.image} />;
    default:
      return null;
  }
};

export type Artifact =
  NonNullable<BAIArtifactTableArtifactFragment$data>[number];

export interface BAIArtifactTableProps
  extends Omit<BAITableProps<Artifact>, 'dataSource' | 'columns' | 'rowKey'> {
  artifactFragment: BAIArtifactTableArtifactFragment$key;
  onClickPull: (artifactId: string, revisionId: string) => void;
}

const BAIArtifactTable = ({
  artifactFragment,
  onClickPull,
  ...tableProps
}: BAIArtifactTableProps) => {
  const { token } = theme.useToken();
  // const navigate = useNavigate();
  const { t } = useTranslation();

  const artifact = useFragment<BAIArtifactTableArtifactFragment$key>(
    graphql`
      fragment BAIArtifactTableArtifactFragment on Artifact
      @relay(plural: true) {
        id
        name
        description
        updatedAt
        scannedAt
        ...BAIArtifactTypeTagFragment
        latestVersion: revisions(
          first: 1
          orderBy: { field: VERSION, direction: DESC }
        ) {
          edges {
            node {
              id
              version
              size
              status
              ...BAIArtifactStatusTagFragment
              ...BAIArtifactRevisionDownloadButtonFragment
            }
          }
        }
      }
    `,
    artifactFragment,
  );

  const columns: TableColumnsType<Artifact> = [
    {
      title: t('comp:BAIArtifactRevisionTable.Name'),
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Artifact) => {
        return (
          <BAIFlex direction="column" align="start">
            <BAIFlex gap={'xs'}>
              <BAILink to={'/reservoir/' + toLocalId(record.id)}>
                {name}
              </BAILink>
              <BAIArtifactTypeTag artifactTypeFrgmt={record} />
            </BAIFlex>
            {record.description && (
              <Typography.Text
                type="secondary"
                style={{ display: 'block', fontSize: token.fontSizeSM }}
              >
                {record.description}
              </Typography.Text>
            )}
          </BAIFlex>
        );
      },
      width: '30%',
    },
    {
      title: t('comp:BAIArtifactRevisionTable.LatestVersion'),
      key: 'latest_version',
      render: (_value, record: Artifact) => {
        const latestVersion = record.latestVersion?.edges[0]?.node;

        if (!latestVersion || _.isEmpty(latestVersion))
          return <BAIText monospace>N/A</BAIText>;

        return (
          <BAIFlex gap={'xs'} wrap="wrap" align="center">
            <BAIText monospace>{latestVersion.version}</BAIText>
            <BAIFlex>
              <BAIArtifactStatusTag artifactRevisionFrgmt={latestVersion} />
              {latestVersion.status === 'SCANNED' ? (
                <BAIArtifactRevisionDownloadButton
                  title={t('comp:BAIArtifactTable.PullLatestVersion')}
                  revisionsFrgmt={[latestVersion]}
                  size="small"
                  onClick={() => onClickPull(record.id, latestVersion.id)}
                />
              ) : null}
            </BAIFlex>
          </BAIFlex>
        );
      },
      width: '25%',
    },
    {
      title: t('comp:BAIArtifactRevisionTable.Size'),
      key: 'size',
      render: (_value, record: Artifact) => {
        const latestVersion = record.latestVersion?.edges[0]?.node;
        if (!latestVersion || _.isEmpty(latestVersion) || !latestVersion.size)
          return <BAIText monospace>N/A</BAIText>;

        return (
          <BAIText monospace>
            {convertToDecimalUnit(latestVersion.size, 'auto')?.displayValue}
          </BAIText>
        );
      },
      width: '15%',
    },
    {
      title: t('comp:BAIArtifactTable.Scanned'),
      dataIndex: 'scannedAt',
      key: 'scanned_at',
      render: (value: string) => {
        if (!value || _.isEmpty(value))
          return <Typography.Text type="secondary">N/A</Typography.Text>;

        return (
          <Typography.Text type="secondary">
            {dayjs(value).fromNow()}
          </Typography.Text>
        );
      },
      width: '15%',
    },
    {
      title: t('comp:BAIArtifactRevisionTable.Updated'),
      dataIndex: 'updatedAt',
      key: 'updated_at',
      render: (value: string) => {
        if (!value || _.isEmpty(value))
          return <Typography.Text type="secondary">N/A</Typography.Text>;

        return (
          <Typography.Text type="secondary">
            {dayjs(value).fromNow()}
          </Typography.Text>
        );
      },
      width: '15%',
    },
  ];

  return (
    <BAITable<Artifact>
      rowKey={(record) => record.id}
      columns={filterOutEmpty(columns)}
      dataSource={filterOutNullAndUndefined(artifact)}
      scroll={{ x: 'max-content' }}
      {...tableProps}
    ></BAITable>
  );
};

export default BAIArtifactTable;
