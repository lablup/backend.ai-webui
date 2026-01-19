import { BAIArtifactRevisionDownloadButtonFragment$key } from '../../__generated__/BAIArtifactRevisionDownloadButtonFragment.graphql';
import BAIButton, { BAIButtonProps } from '../BAIButton';
import { theme } from 'antd';
import _ from 'lodash';
import { Download } from 'lucide-react';
import { graphql, useFragment } from 'react-relay';

export interface BAIArtifactRevisionDownloadButtonProps
  extends Omit<BAIButtonProps, 'icon'> {
  loading?: boolean;
  revisionsFrgmt: BAIArtifactRevisionDownloadButtonFragment$key;
}

const BAIArtifactRevisionDownloadButton = ({
  revisionsFrgmt,
  ...buttonProps
}: BAIArtifactRevisionDownloadButtonProps) => {
  const { token } = theme.useToken();
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
        color: isDisabled ? token.colorTextDisabled : token.colorInfo,
        background: isDisabled
          ? token.colorBgContainerDisabled
          : token.colorInfoBg,
      }}
      {..._.omit(buttonProps, ['disabled', 'loading'])}
    />
  );
};

export default BAIArtifactRevisionDownloadButton;
