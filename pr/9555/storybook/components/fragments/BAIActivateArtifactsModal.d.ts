import { BAIActivateArtifactsModalArtifactsFragment$key } from '../../__generated__/BAIActivateArtifactsModalArtifactsFragment.graphql';
import { BAIModalProps } from '../BAIModal';
export type BAIActivateArtifactsModalArtifactsFragmentKey = BAIActivateArtifactsModalArtifactsFragment$key;
export interface BAIActivateArtifactsModalProps extends BAIModalProps {
    selectedArtifactsFragment: BAIActivateArtifactsModalArtifactsFragmentKey;
}
declare const BAIActivateArtifactsModal: ({ selectedArtifactsFragment, onOk, onCancel, ...props }: BAIActivateArtifactsModalProps) => import("react").JSX.Element;
export default BAIActivateArtifactsModal;
