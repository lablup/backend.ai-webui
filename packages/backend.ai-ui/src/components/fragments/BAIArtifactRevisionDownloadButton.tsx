import { BAIArtifactRevisionDownloadButtonFragment$key } from '../../__generated__/BAIArtifactRevisionDownloadButtonFragment.graphql';
import { Button, ButtonProps } from 'antd';
import _ from 'lodash';
import { Download } from 'lucide-react';
import { graphql, useFragment } from 'react-relay';

export interface BAIArtifactRevisionDownloadButtonProps
  extends Omit<ButtonProps, 'icon'> {
  loading?: boolean;
  revisionsFrgmt: BAIArtifactRevisionDownloadButtonFragment$key;
}

const BAIArtifactRevisionDownloadButton = ({
  revisionsFrgmt,
  ...buttonProps
}: BAIArtifactRevisionDownloadButtonProps) => {
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
  return (
    <Button
      icon={<Download size={16} />}
      type="primary"
      disabled={!isDownloadable || buttonProps.disabled || buttonProps.loading}
      {..._.omit(buttonProps, ['disabled', 'loading'])}
    />
  );
};

export default BAIArtifactRevisionDownloadButton;
