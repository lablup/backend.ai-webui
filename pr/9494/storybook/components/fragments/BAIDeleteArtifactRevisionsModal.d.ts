import { BAIDeleteArtifactRevisionsModalArtifactFragment$key } from '../../__generated__/BAIDeleteArtifactRevisionsModalArtifactFragment.graphql';
import { BAIDeleteArtifactRevisionsModalArtifactRevisionFragment$key } from '../../__generated__/BAIDeleteArtifactRevisionsModalArtifactRevisionFragment.graphql';
import { BAIModalProps } from '../BAIModal';
export type BAIDeleteArtifactRevisionsModalArtifactFragmentKey = BAIDeleteArtifactRevisionsModalArtifactFragment$key;
export type BAIDeleteArtifactRevisionsModalArtifactRevisionFragmentKey = BAIDeleteArtifactRevisionsModalArtifactRevisionFragment$key;
export interface BAIDeleteArtifactRevisionsModalProps extends Omit<BAIModalProps, 'onOk' | 'onCancel'> {
    selectedArtifactFrgmt: BAIDeleteArtifactRevisionsModalArtifactFragment$key | null;
    selectedArtifactRevisionFrgmt: BAIDeleteArtifactRevisionsModalArtifactRevisionFragment$key;
    onOk: (e: React.MouseEvent<HTMLElement>) => void;
    onCancel: NonNullable<BAIModalProps['onCancel']>;
}
declare const BAIDeleteArtifactRevisionsModal: ({ selectedArtifactFrgmt, selectedArtifactRevisionFrgmt, onOk, onCancel, ...modalProps }: BAIDeleteArtifactRevisionsModalProps) => import("react").JSX.Element;
export default BAIDeleteArtifactRevisionsModal;
