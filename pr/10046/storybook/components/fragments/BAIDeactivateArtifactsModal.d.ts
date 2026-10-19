import { BAIDeactivateArtifactsModalArtifactsFragment$key } from '../../__generated__/BAIDeactivateArtifactsModalArtifactsFragment.graphql';
import { BAIModalProps } from '../BAIModal';
export type BAIDeactivateArtifactsModalArtifactsFragmentKey = BAIDeactivateArtifactsModalArtifactsFragment$key;
export interface BAIDeactivateArtifactsModalProps extends BAIModalProps {
    selectedArtifactsFragment: BAIDeactivateArtifactsModalArtifactsFragmentKey;
}
declare const BAIDeactivateArtifactsModal: ({ selectedArtifactsFragment, onOk, onCancel, ...modalProps }: BAIDeactivateArtifactsModalProps) => import("react").JSX.Element;
export default BAIDeactivateArtifactsModal;
