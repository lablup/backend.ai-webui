import { BAIArtifactRevisionDownloadButtonFragment$key } from '../../__generated__/BAIArtifactRevisionDownloadButtonFragment.graphql';
import { BAIButtonProps } from '../BAIButton';
export interface BAIArtifactRevisionDownloadButtonProps extends Omit<BAIButtonProps, 'icon'> {
    loading?: boolean;
    revisionsFrgmt: BAIArtifactRevisionDownloadButtonFragment$key;
}
declare const BAIArtifactRevisionDownloadButton: ({ revisionsFrgmt, ...buttonProps }: BAIArtifactRevisionDownloadButtonProps) => import("react").JSX.Element;
export default BAIArtifactRevisionDownloadButton;
