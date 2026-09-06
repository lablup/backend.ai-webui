import {
  BAIArtifactRevisionTableArtifactRevisionFragment$data,
  BAIArtifactRevisionTableArtifactRevisionFragment$key,
} from '../../__generated__/BAIArtifactRevisionTableArtifactRevisionFragment.graphql';
import { BAIArtifactRevisionTableLatestRevisionFragment$key } from '../../__generated__/BAIArtifactRevisionTableLatestRevisionFragment.graphql';
import {
  badgeVariantForTagColor,
  convertToDecimalUnit,
  filterOutEmpty,
} from '../../helper';
import { useBAIi18n } from '../../hooks/useBAIi18n';
import BAIFlex from '../BAIFlex';
import BAITag from '../BAITag';
import BAIText from '../BAIText';
import { BAIColumnType, BAITable, BAITableProps } from '../Table';
import BAIArtifactStatusTag from './BAIArtifactStatusTag';
import { Badge } from '@astryxdesign/core/Badge';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import * as _ from 'lodash-es';
import { graphql, useFragment } from 'react-relay';

dayjs.extend(relativeTime);

export type ArtifactRevision = NonNullable<
  NonNullable<BAIArtifactRevisionTableArtifactRevisionFragment$data>[number]
>;

export interface BAIArtifactRevisionTableProps extends Omit<
  BAITableProps<ArtifactRevision>,
  'dataSource' | 'columns' | 'rowKey'
> {
  artifactRevisionFrgmt: BAIArtifactRevisionTableArtifactRevisionFragment$key;
  latestRevisionFrgmt:
    BAIArtifactRevisionTableLatestRevisionFragment$key | null | undefined;
  customizeColumns?: (
    baseColumns: BAIColumnType<ArtifactRevision>[],
  ) => BAIColumnType<ArtifactRevision>[];
}

const BAIArtifactRevisionTable = ({
  artifactRevisionFrgmt,
  latestRevisionFrgmt,
  customizeColumns,
  ...tableProps
}: BAIArtifactRevisionTableProps) => {
  const { t } = useBAIi18n();

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
          ...BAIArtifactStatusTagFragment
          ...BAIArtifactRevisionDownloadButtonFragment
          ...BAIArtifactRevisionDeleteButtonFragment
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

  const baseColumns = _.map(
    filterOutEmpty<BAIColumnType<ArtifactRevision>>([
      {
        title: t('comp:BAIArtifactRevisionTable.Version'),
        dataIndex: 'version',
        key: 'version',
        render: (version: string, record: ArtifactRevision) => (
          <div>
            <BAIFlex align="center" gap={'xs'}>
              <BAIText monospace strong>
                {version}
              </BAIText>
              {latestRevision && latestRevision.id === record.id && (
                // to-astryx W2-D: antd `Tag` -> Astryx `Badge`, hue via the
                // repo-global lookup (MAPPING §3.5).
                <Badge
                  variant={badgeVariantForTagColor('blue')}
                  label="Latest"
                />
              )}
              {record.status === 'PULLED' && <BAITag>{record.status}</BAITag>}
            </BAIFlex>
          </div>
        ),
      },
      {
        title: t('comp:BAIArtifactRevisionTable.Status'),
        dataIndex: 'status',
        key: 'status',
        render: (_value: string, record: ArtifactRevision) => {
          return <BAIArtifactStatusTag artifactRevisionFrgmt={record} />;
        },
      },
      {
        title: t('comp:BAIArtifactRevisionTable.Size'),
        dataIndex: 'size',
        key: 'size',
        render: (size: number) => {
          if (!size) return <BAIText monospace>N/A</BAIText>;
          return (
            <BAIText monospace>
              {convertToDecimalUnit(size, 'auto')?.displayValue}
            </BAIText>
          );
        },
      },
      {
        title: t('comp:BAIArtifactTable.Updated'),
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        render: (updated_at: string) =>
          updated_at ? (
            <BAIText type="secondary" title={dayjs(updated_at).toString()}>
              {dayjs(updated_at).fromNow()}
            </BAIText>
          ) : (
            'N/A'
          ),
      },
    ]),
  );

  const allColumns = customizeColumns
    ? customizeColumns(baseColumns)
    : baseColumns;

  return (
    <BAITable<ArtifactRevision>
      // Restores the pre-migration pairing. The percentage column widths that
      // used to sit alongside it are gone: BAITable keeps only NUMERIC widths
      // in x mode, so they were inert. Use numbers if proportions are wanted.
      scroll={{ x: 'max-content' }}
      rowKey={(record) => record.id}
      resizable
      columns={allColumns}
      dataSource={artifactRevision}
      {...tableProps}
    ></BAITable>
  );
};

export default BAIArtifactRevisionTable;
