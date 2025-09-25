import { BAIArtifactRevisionDeleteButtonFragment$key } from '../../__generated__/BAIArtifactRevisionDeleteButtonFragment.graphql';
import { BAITrashBinIcon } from '../../icons';
import { Button, ButtonProps, theme } from 'antd';
import _ from 'lodash';
import { graphql, useFragment } from 'react-relay';

export interface BAIArtifactRevisionDeleteButtonProps
  extends Omit<ButtonProps, 'icon'> {
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

  return (
    <Button
      icon={<BAITrashBinIcon />}
      disabled={buttonProps.disabled || buttonProps.loading || !isDeletable}
      style={{
        color: isDeletable ? token.colorError : token.colorTextDisabled,
        backgroundColor: isDeletable
          ? token.colorErrorBg
          : token.colorBgContainerDisabled,
        ...buttonProps.style,
      }}
      {..._.omit(buttonProps, ['style', 'disabled', 'loading'])}
    />
  );
};

export default BAIArtifactRevisionDeleteButton;
