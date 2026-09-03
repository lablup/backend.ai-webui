import { BAIImportArtifactModalArtifactFragment$key } from '../../__generated__/BAIImportArtifactModalArtifactFragment.graphql';
import { BAIImportArtifactModalArtifactRevisionFragment$key } from '../../__generated__/BAIImportArtifactModalArtifactRevisionFragment.graphql';
import { BAIModalProps } from '../BAIModal';
export type BAIImportArtifactModalArtifactFragmentKey = BAIImportArtifactModalArtifactFragment$key;
export type BAIImportArtifactModalArtifactRevisionFragmentKey = BAIImportArtifactModalArtifactRevisionFragment$key;
export interface BAIImportArtifactModalProps extends Omit<BAIModalProps, 'onOk' | 'onCancel'> {
    selectedArtifactFrgmt: BAIImportArtifactModalArtifactFragment$key | null;
    selectedArtifactRevisionFrgmt: BAIImportArtifactModalArtifactRevisionFragment$key;
    onOk: (e: React.MouseEvent<HTMLElement>, tasks: {
        taskId: string;
        version: string;
        artifact: {
            id: string;
            name: string;
        };
    }[]) => void;
    onCancel: NonNullable<BAIModalProps['onCancel']>;
    connectionIds?: string[];
}
declare const BAIImportArtifactModal: ({ selectedArtifactFrgmt, selectedArtifactRevisionFrgmt, onOk, onCancel, connectionIds, ...modalProps }: BAIImportArtifactModalProps) => import("react").JSX.Element;
export default BAIImportArtifactModal;
