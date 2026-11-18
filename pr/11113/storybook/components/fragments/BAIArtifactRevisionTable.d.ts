import { BAIArtifactRevisionTableArtifactRevisionFragment$data, BAIArtifactRevisionTableArtifactRevisionFragment$key } from '../../__generated__/BAIArtifactRevisionTableArtifactRevisionFragment.graphql';
import { BAIArtifactRevisionTableLatestRevisionFragment$key } from '../../__generated__/BAIArtifactRevisionTableLatestRevisionFragment.graphql';
import { BAIColumnType, BAITableProps } from '../Table';
export type ArtifactRevision = NonNullable<NonNullable<BAIArtifactRevisionTableArtifactRevisionFragment$data>[number]>;
export interface BAIArtifactRevisionTableProps extends Omit<BAITableProps<ArtifactRevision>, 'dataSource' | 'columns' | 'rowKey'> {
    artifactRevisionFrgmt: BAIArtifactRevisionTableArtifactRevisionFragment$key;
    latestRevisionFrgmt: BAIArtifactRevisionTableLatestRevisionFragment$key | null | undefined;
    customizeColumns?: (baseColumns: BAIColumnType<ArtifactRevision>[]) => BAIColumnType<ArtifactRevision>[];
}
declare const BAIArtifactRevisionTable: ({ artifactRevisionFrgmt, latestRevisionFrgmt, customizeColumns, ...tableProps }: BAIArtifactRevisionTableProps) => import("react").JSX.Element;
export default BAIArtifactRevisionTable;
