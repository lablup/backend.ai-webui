import { BAIArtifactTableArtifactFragment$data, BAIArtifactTableArtifactFragment$key } from '../../__generated__/BAIArtifactTableArtifactFragment.graphql';
import { BAITableProps } from '../Table';
export declare const getStatusColor: (status: string) => "default" | "warning" | "error" | "processing";
export declare const getStatusIcon: (status: string) => import("react").JSX.Element | null;
export declare const getTypeIcon: (type: string, size?: number) => import("react").JSX.Element | null;
export type Artifact = NonNullable<BAIArtifactTableArtifactFragment$data>[number];
export declare const availableArtifactSorterKeys: readonly ["name", "type", "size", "scannedAt", "updatedAt"];
export type ArtifactSorterKey = (typeof availableArtifactSorterKeys)[number];
export declare const availableArtifactSorterValues: readonly ["name", "type", "size", "scannedAt", "updatedAt", ...("-name" | "-size" | "-type" | "-updatedAt" | "-scannedAt")[]];
export interface BAIArtifactTableProps extends Omit<BAITableProps<Artifact>, 'dataSource' | 'columns' | 'rowKey' | 'onChangeOrder'> {
    artifactFragment: BAIArtifactTableArtifactFragment$key;
    onClickPull: (artifactId: string, revisionId: string) => void;
    onClickDelete: (artifactId: string) => void;
    onClickRestore: (artifactId: string) => void;
    disableSorter?: boolean;
    onChangeOrder?: (order: (typeof availableArtifactSorterValues)[number] | null) => void;
}
declare const BAIArtifactTable: ({ artifactFragment, onClickPull, onClickDelete, onClickRestore, disableSorter, onChangeOrder, ...tableProps }: BAIArtifactTableProps) => import("react").JSX.Element;
export default BAIArtifactTable;
