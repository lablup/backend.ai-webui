import { BAIArtifactRevisionDownloadButtonFragment$key } from '../../__generated__/BAIArtifactRevisionDownloadButtonFragment.graphql';
import BAIButton, { BAIButtonProps } from '../BAIButton';
import { useTheme } from '@astryxdesign/core/theme';
import * as _ from 'lodash-es';
import { Download } from 'lucide-react';
import { graphql, useFragment } from 'react-relay';

export interface BAIArtifactRevisionDownloadButtonProps extends Omit<
  BAIButtonProps,
  'icon'
> {
  loading?: boolean;
  revisionsFrgmt: BAIArtifactRevisionDownloadButtonFragment$key;
}

const BAIArtifactRevisionDownloadButton = ({
  revisionsFrgmt,
  ...buttonProps
}: BAIArtifactRevisionDownloadButtonProps) => {
  const { token } = useTheme();
  const revisions = useFragment<BAIArtifactRevisionDownloadButtonFragment$key>(
    graphql`
      fragment BAIArtifactRevisionDownloadButtonFragment on ArtifactRevision
      @relay(plural: true) {
        status
      }
    `,
    revisionsFrgmt,
  );

  const isDownloadable = revisions.some(
    (revision) => revision.status === 'SCANNED',
  );

  const isDisabled =
    !isDownloadable || buttonProps.disabled || buttonProps.loading;

  return (
    <BAIButton
      icon={<Download />}
      disabled={isDisabled}
      type="text"
      style={{
        color: isDisabled
          ? token('--color-text-disabled')
          : token('--color-info'),
        background: isDisabled
          ? token('--color-bg-container-disabled')
          : token('--color-info-bg'),
      }}
      {..._.omit(buttonProps, ['disabled', 'loading'])}
    />
  );
};

export default BAIArtifactRevisionDownloadButton;
