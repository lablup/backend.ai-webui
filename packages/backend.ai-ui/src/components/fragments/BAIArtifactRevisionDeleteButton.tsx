import { BAIArtifactRevisionDeleteButtonFragment$key } from '../../__generated__/BAIArtifactRevisionDeleteButtonFragment.graphql';
import { BAITrashBinIcon } from '../../icons';
import BAIButton, { BAIButtonProps } from '../BAIButton';
import { theme } from 'antd';
import _ from 'lodash';
import { graphql, useFragment } from 'react-relay';

export interface BAIArtifactRevisionDeleteButtonProps
  extends Omit<BAIButtonProps, 'icon'> {
  revisionsFrgmt: BAIArtifactRevisionDeleteButtonFragment$key;
  loading?: boolean;
}

const BAIArtifactRevisionDeleteButton = ({
  revisionsFrgmt,
  ...buttonProps
}: BAIArtifactRevisionDeleteButtonProps) => {
  const { token } = theme.useToken();

  const revisions = useFragment<BAIArtifactRevisionDeleteButtonFragment$key>(
    graphql`
      fragment BAIArtifactRevisionDeleteButtonFragment on ArtifactRevision
      @relay(plural: true) {
        status
      }
    `,
    revisionsFrgmt,
  );

  const isDeletable = revisions.some(
    (revision) =>
      revision.status !== 'SCANNED' && revision.status !== 'PULLING',
  );

  const isDisabled =
    buttonProps.disabled || buttonProps.loading || !isDeletable;

  return (
    <BAIButton
      icon={<BAITrashBinIcon />}
      disabled={isDisabled}
      type="text"
      style={{
        color: isDisabled ? token.colorTextDisabled : token.colorError,
        background: isDisabled
          ? token.colorBgContainerDisabled
          : token.colorErrorBg,
        ...buttonProps.style,
      }}
      {..._.omit(buttonProps, ['style', 'disabled', 'loading'])}
    />
  );
};

export default BAIArtifactRevisionDeleteButton;
