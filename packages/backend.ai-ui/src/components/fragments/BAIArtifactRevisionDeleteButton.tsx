import { BAIArtifactRevisionDeleteButtonFragment$key } from '../../__generated__/BAIArtifactRevisionDeleteButtonFragment.graphql';
import BAIButton, { BAIButtonProps } from '../BAIButton';
import { useTheme } from '@astryxdesign/core/theme';
import * as _ from 'lodash-es';
import { Trash2 } from 'lucide-react';
import { graphql, useFragment } from 'react-relay';

export interface BAIArtifactRevisionDeleteButtonProps extends Omit<
  BAIButtonProps,
  'icon'
> {
  revisionsFrgmt: BAIArtifactRevisionDeleteButtonFragment$key;
  loading?: boolean;
}

const BAIArtifactRevisionDeleteButton = ({
  revisionsFrgmt,
  ...buttonProps
}: BAIArtifactRevisionDeleteButtonProps) => {
  const { token } = useTheme();

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
      icon={<Trash2 size="1em" />}
      disabled={isDisabled}
      type="text"
      style={{
        color: isDisabled
          ? token('--color-text-disabled')
          : token('--color-error'),
        background: isDisabled
          ? token('--bai-color-bg-container-disabled')
          : token('--bai-color-error-bg'),
        ...buttonProps.style,
      }}
      {..._.omit(buttonProps, ['style', 'disabled', 'loading'])}
    />
  );
};

export default BAIArtifactRevisionDeleteButton;
