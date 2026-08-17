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
import { useBAIi18n } from '../../hooks/useBAIi18n';
import BAIButton from '../BAIButton';
import BAIFlex from '../BAIFlex';
import BAILink from '../BAILink';
import BAIText from '../BAIText';
import { BAIColumnType, BAITable, BAITableProps } from '../Table';
import BAIArtifactRevisionDownloadButton from './BAIArtifactRevisionDownloadButton';
import BAIArtifactStatusTag from './BAIArtifactStatusTag';
import BAIArtifactTypeTag from './BAIArtifactTypeTag';
import { Link } from '@astryxdesign/core/Link';
import { Text } from '@astryxdesign/core/Text';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import * as _ from 'lodash-es';
import {
  RefreshCw,
  Package,
  Container,
  Brain,
  BanIcon,
  UndoIcon,
} from 'lucide-react';
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
      return <RefreshCw className="bai-icon-spin" size="1em" />;
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

export interface BAIArtifactTableProps extends Omit<
  BAITableProps<Artifact>,
  'dataSource' | 'columns' | 'rowKey'
> {
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
  const { t } = useBAIi18n();

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
              <Text color="secondary" size="sm" display="block">
                {record.description}
              </Text>
            )}
          </BAIFlex>
        );
      },
    },
    {
      title: t('comp:BAIArtifactTable.Controls'),
      key: 'controls',
      // HISTORY (to-astryx W2-D): this column declared `render: (record) => …`
      // and every row threw `Cannot read properties of undefined (reading
      // 'availability')`. Under rc-table a `dataIndex`-less column happens to
      // receive the RECORD as `render`'s first argument; `BAITable` does
      // not reproduce that quirk, so the record must be taken from the SECOND
      // argument — the Astryx/antd `(value, record, index)` contract. This is
      // the canonical form for every computed column in this codebase.
      render: (_value, record: Artifact) => {
        const availability = record.availability;
        // PILOT-DECISION (to-astryx W2-D): antd v6's `color` + `variant`
        // emphasis pair has no Astryx counterpart — `Button.variant` is a
        // closed 4-value enum with no colour escape hatch (P5). Deactivate is
        // the destructive half of the pair and keeps that reading via
        // `danger`; Activate loses its blue fill and becomes the default
        // secondary button. `title` now reaches Astryx's real `tooltip` prop
        // AND supplies the icon-only button's accessible name (P8) — under
        // antd it was only a native `title` attribute.
        if (availability === 'ALIVE') {
          return (
            <BAIButton
              title={t('comp:BAIArtifactTable.Deactivate')}
              size="small"
              danger
              icon={<BanIcon />}
              onClick={() => onClickDelete(record.id)}
            />
          );
        } else if (availability === 'DELETED') {
          return (
            <BAIButton
              title={t('comp:BAIArtifactTable.Activate')}
              size="small"
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
          return <Text color="secondary">N/A</Text>;

        return <Text color="secondary">{dayjs(value).fromNow()}</Text>;
      },
    },
    {
      title: t('comp:BAIArtifactRevisionTable.Updated'),
      dataIndex: 'updatedAt',
      key: 'updated_at',
      render: (value: string) => {
        if (!value || _.isEmpty(value))
          return <Text color="secondary">N/A</Text>;

        return <Text color="secondary">{dayjs(value).fromNow()}</Text>;
      },
    },
    {
      title: t('comp:BAIArtifactTable.Registry'),
      dataIndex: 'registry.name',
      key: 'registry.name',
      render: (_value, record: Artifact) => {
        return record?.source ? (
          <Text>
            {record?.registry
              ? `${record.registry.name} (${record.registry.url})`
              : 'N/A'}
          </Text>
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
          <Link
            href={record.source.url ?? ''}
            target="_blank"
            rel="noopener noreferrer"
          >
            {record.source.name || 'N/A'}
          </Link>
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
      {...tableProps}
    ></BAITable>
  );
};

export default BAIArtifactTable;
