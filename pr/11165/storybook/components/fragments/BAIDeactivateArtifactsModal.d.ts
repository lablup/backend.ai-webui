import { BAIDeactivateArtifactsModalArtifactsFragment$key } from '../../__generated__/BAIDeactivateArtifactsModalArtifactsFragment.graphql';
import { BAIModalProps } from '../BAIModal';
export type BAIDeactivateArtifactsModalArtifactsFragmentKey = BAIDeactivateArtifactsModalArtifactsFragment$key;
export interface BAIDeactivateArtifactsModalProps extends Omit<BAIModalProps, 'onOk'> {
    selectedArtifactsFragment: BAIDeactivateArtifactsModalArtifactsFragmentKey;
    /** Called once the request settles; `failedArtifactIds` are the Relay ids of the artifacts that were not deactivated. */
    onOk?: (e: React.MouseEvent<HTMLButtonElement>, failedArtifactIds: string[]) => void;
}
declare const BAIDeactivateArtifactsModal: ({ selectedArtifactsFragment, onOk, onCancel, ...modalProps }: BAIDeactivateArtifactsModalProps) => import("react").JSX.Element;
export default BAIDeactivateArtifactsModal;
