import { BAIArtifactRevisionDeleteButtonFragment$key } from '../../__generated__/BAIArtifactRevisionDeleteButtonFragment.graphql';
import { BAIButtonProps } from '../BAIButton';
export interface BAIArtifactRevisionDeleteButtonProps extends Omit<BAIButtonProps, 'icon'> {
    revisionsFrgmt: BAIArtifactRevisionDeleteButtonFragment$key;
    loading?: boolean;
}
declare const BAIArtifactRevisionDeleteButton: ({ revisionsFrgmt, ...buttonProps }: BAIArtifactRevisionDeleteButtonProps) => import("react").JSX.Element;
export default BAIArtifactRevisionDeleteButton;
