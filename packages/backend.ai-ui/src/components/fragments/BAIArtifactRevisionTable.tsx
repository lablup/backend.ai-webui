import {
  BAIArtifactRevisionTableArtifactRevisionFragment$data,
  BAIArtifactRevisionTableArtifactRevisionFragment$key,
} from '../../__generated__/BAIArtifactRevisionTableArtifactRevisionFragment.graphql';
import { BAIArtifactRevisionTableLatestRevisionFragment$key } from '../../__generated__/BAIArtifactRevisionTableLatestRevisionFragment.graphql';
import { convertToDecimalUnit, filterOutEmpty } from '../../helper';
import BAIFlex from '../BAIFlex';
import BAITag from '../BAITag';
import BAIText from '../BAIText';
import { BAIColumnType, BAITable, BAITableProps } from '../Table';
import BAIArtifactStatusTag from './BAIArtifactStatusTag';
import { Tag } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import _ from 'lodash';
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
  latestRevisionFrgmt:
    | BAIArtifactRevisionTableLatestRevisionFragment$key
    | null
    | undefined;
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
        width: '30%',
        render: (version: string, record: ArtifactRevision) => (
          <div>
            <BAIFlex align="center" gap={'xs'}>
              <BAIText monospace strong>
                {version}
              </BAIText>
              {latestRevision && latestRevision.id === record.id && (
                <Tag color="blue">Latest</Tag>
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
        width: '15%',
        render: (_value: string, record: ArtifactRevision) => {
          return <BAIArtifactStatusTag artifactRevisionFrgmt={record} />;
        },
      },
      {
        title: t('comp:BAIArtifactRevisionTable.Size'),
        dataIndex: 'size',
        key: 'size',
        width: '15%',
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
        width: '15%',
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
      rowKey={(record) => record.id}
      resizable
      columns={allColumns}
      dataSource={artifactRevision}
      scroll={{ x: 'max-content' }}
      {...tableProps}
    ></BAITable>
  );
};

export default BAIArtifactRevisionTable;
