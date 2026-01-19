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
import { BAIColumnType, BAITable, BAITableProps } from '../Table';
import BAIArtifactRevisionDownloadButton from './BAIArtifactRevisionDownloadButton';
import BAIArtifactStatusTag from './BAIArtifactStatusTag';
import BAIArtifactTypeTag from './BAIArtifactTypeTag';
import { SyncOutlined } from '@ant-design/icons';
import { Button, theme, Typography } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import _ from 'lodash';
import { Package, Container, Brain, BanIcon, UndoIcon } from 'lucide-react';
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
  onClickDelete: (artifactId: string) => void;
  onClickRestore: (artifactId: string) => void;
}

const BAIArtifactTable = ({
  artifactFragment,
  onClickPull,
  onClickDelete,
  onClickRestore,
  ...tableProps
}: BAIArtifactTableProps) => {
  const { token } = theme.useToken();
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
        availability
        registry {
          name
          url
        }
        source {
          name
          url
        }
        ...BAIArtifactTypeTagFragment
        latestVersion: revisions(
          limit: 1
          orderBy: [
            { field: VERSION, direction: DESC }
            { field: UPDATED_AT, direction: DESC }
          ]
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

  const columns: Array<BAIColumnType<Artifact>> = [
    {
      title: t('comp:BAIArtifactRevisionTable.Name'),
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Artifact) => {
        return (
          <BAIFlex direction="column" align="start" wrap="wrap">
            <BAIFlex gap={'xs'}>
              <BAILink to={'/reservoir/' + toLocalId(record.id)} style={{}}>
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
    },
    {
      title: t('comp:BAIArtifactTable.Controls'),
      key: 'controls',
      render: (record: Artifact) => {
        const availability = record.availability;
        if (availability === 'ALIVE') {
          return (
            <Button
              title={t('comp:BAIArtifactTable.Deactivate')}
              size="small"
              // type="text"
              color={'red'}
              variant="filled"
              icon={<BanIcon />}
              onClick={() => onClickDelete(record.id)}
            />
          );
        } else if (availability === 'DELETED') {
          return (
            <Button
              title={t('comp:BAIArtifactTable.Activate')}
              size="small"
              color="blue"
              variant="filled"
              // type="text"
              icon={<UndoIcon />}
              onClick={() => onClickRestore(record.id)}
            />
          );
        }
      },
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
            <BAIArtifactStatusTag artifactRevisionFrgmt={latestVersion} />
            {latestVersion.status === 'SCANNED' ? (
              <BAIArtifactRevisionDownloadButton
                title={t('comp:BAIArtifactTable.PullLatestVersion')}
                revisionsFrgmt={[latestVersion]}
                disabled={record.availability !== 'ALIVE'}
                size="small"
                onClick={() => onClickPull(record.id, latestVersion.id)}
              />
            ) : null}
          </BAIFlex>
        );
      },
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
    },
    {
      title: t('comp:BAIArtifactTable.Registry'),
      dataIndex: 'registry.name',
      key: 'registry.name',
      render: (_value, record: Artifact) => {
        return record?.source ? (
          <Typography>
            {record?.registry
              ? `${record.registry.name} (${record.registry.url})`
              : 'N/A'}
          </Typography>
        ) : (
          '-'
        );
      },
      defaultHidden: true,
    },
    {
      title: t('comp:BAIArtifactTable.Source'),
      dataIndex: 'source.name',
      key: 'source.name',
      render: (_value, record: Artifact) => {
        return record?.source ? (
          <Typography.Link
            href={record.source.url ?? ''}
            target="_blank"
            rel="noopener noreferrer"
          >
            {record.source.name || 'N/A'}
          </Typography.Link>
        ) : (
          '-'
        );
      },
      defaultHidden: true,
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
