/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ImportArtifactRevisionToFolderButtonFragment$key } from '../__generated__/ImportArtifactRevisionToFolderButtonFragment.graphql';
import { theme } from 'antd';
import { BAIButton, BAIButtonProps } from 'backend.ai-ui';
import _ from 'lodash';
import { FolderInput } from 'lucide-react';
import React from 'react';
import { graphql, useFragment } from 'react-relay';

export interface ImportArtifactRevisionToFolderButtonProps extends BAIButtonProps {
  loading?: boolean;
  revisionsFrgmt: ImportArtifactRevisionToFolderButtonFragment$key;
}

const ImportArtifactRevisionToFolderButton: React.FC<
  ImportArtifactRevisionToFolderButtonProps
> = ({ revisionsFrgmt, ...buttonProps }) => {
  const { token } = theme.useToken();
  const revisions =
    useFragment<ImportArtifactRevisionToFolderButtonFragment$key>(
      graphql`
        fragment ImportArtifactRevisionToFolderButtonFragment on ArtifactRevision
        @relay(plural: true) {
          status
        }
      `,
      revisionsFrgmt,
    );

  const isDownloadable = _.some(
    revisions,
    (revision) => revision.status === 'SCANNED',
  );

  const isDisabled =
    !isDownloadable || buttonProps.disabled || buttonProps.loading;

  return (
    <BAIButton
      icon={<FolderInput />}
      disabled={isDisabled}
      type="text"
      style={{
        color: isDisabled ? token.colorTextDisabled : token.colorInfo,
        background: isDisabled
          ? token.colorBgContainerDisabled
          : token.colorInfoBg,
        ...buttonProps.style,
      }}
      {..._.omit(buttonProps, ['disabled', 'loading'])}
    />
  );
};

export default ImportArtifactRevisionToFolderButton;
