import { BAIArtifactTableArtifactFragment$data, BAIArtifactTableArtifactFragment$key } from '../../__generated__/BAIArtifactTableArtifactFragment.graphql';
import { BAITableProps } from '../Table';
export declare const getStatusColor: (status: string) => "warning" | "error" | "default" | "processing";
export declare const getStatusIcon: (status: string) => import("react").JSX.Element | null;
export declare const getTypeIcon: (type: string, size?: number) => import("react").JSX.Element | null;
export type Artifact = NonNullable<BAIArtifactTableArtifactFragment$data>[number];
export interface BAIArtifactTableProps extends Omit<BAITableProps<Artifact>, 'dataSource' | 'columns' | 'rowKey'> {
    artifactFragment: BAIArtifactTableArtifactFragment$key;
    onClickPull: (artifactId: string, revisionId: string) => void;
    onClickDelete: (artifactId: string) => void;
    onClickRestore: (artifactId: string) => void;
}
declare const BAIArtifactTable: ({ artifactFragment, onClickPull, onClickDelete, onClickRestore, ...tableProps }: BAIArtifactTableProps) => import("react").JSX.Element;
export default BAIArtifactTable;
