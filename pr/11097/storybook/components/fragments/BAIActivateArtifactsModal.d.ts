import { BAIActivateArtifactsModalArtifactsFragment$key } from '../../__generated__/BAIActivateArtifactsModalArtifactsFragment.graphql';
import { BAIModalProps } from '../BAIModal';
export type BAIActivateArtifactsModalArtifactsFragmentKey = BAIActivateArtifactsModalArtifactsFragment$key;
export interface BAIActivateArtifactsModalProps extends Omit<BAIModalProps, 'onOk'> {
    selectedArtifactsFragment: BAIActivateArtifactsModalArtifactsFragmentKey;
    /** Called once the request settles; `failedArtifactIds` are the Relay ids of the artifacts that were not activated. */
    onOk?: (e: React.MouseEvent<HTMLButtonElement>, failedArtifactIds: string[]) => void;
}
declare const BAIActivateArtifactsModal: ({ selectedArtifactsFragment, onOk, onCancel, ...props }: BAIActivateArtifactsModalProps) => import("react").JSX.Element;
export default BAIActivateArtifactsModal;
