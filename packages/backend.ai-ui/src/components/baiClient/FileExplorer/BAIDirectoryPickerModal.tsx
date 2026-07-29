/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { BAIDirectoryPickerModalQuery } from '../../../__generated__/BAIDirectoryPickerModalQuery.graphql';
import { toGlobalId } from '../../../helper';
import { useBAIi18n } from '../../../hooks/useBAIi18n';
import BAIFlex from '../../BAIFlex';
import BAIModal, { BAIModalProps } from '../../BAIModal';
import BAIFileExplorer from './BAIFileExplorer';
import { Button, Typography } from 'antd';
import * as _ from 'lodash-es';
import { useState } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

// The picker works with sub paths ('' = vfolder root) while BAIFileExplorer
// uses '.' as its root path.
const toExplorerPath = (subPath: string) => (subPath === '' ? '.' : subPath);
const toSubPath = (explorerPath: string) =>
  explorerPath === '.' ? '' : explorerPath;

export interface BAIDirectoryPickerModalProps extends Omit<
  BAIModalProps,
  'onOk' | 'onCancel' | 'footer' | 'title'
> {
  vfolderUuid: string;
  vfolderName?: string;
  /** Sub path to start browsing from ('' = vfolder root). */
  defaultPath?: string;
  /** Called with the chosen sub path, or `undefined` when cancelled. */
  onRequestClose: (selectedSubPath?: string) => void;
}

/**
 * A directory-only picker built on `BAIFileExplorer`'s `directoryPicker`
 * mode: browse the vfolder (files visible but disabled, folder CRUD
 * available) and confirm the current location with the footer button.
 */
const BAIDirectoryPickerModal: React.FC<BAIDirectoryPickerModalProps> = ({
  vfolderUuid,
  vfolderName,
  defaultPath,
  onRequestClose,
  ...modalProps
}) => {
  'use memo';

  const { t } = useBAIi18n();
  const [currentPath, setCurrentPath] = useState(
    toExplorerPath(defaultPath ?? ''),
  );

  // Folder CRUD inside the picker follows the caller's effective permissions
  // on this vfolder, same as FolderExplorerModal.
  const { vfolder_node } = useLazyLoadQuery<BAIDirectoryPickerModalQuery>(
    graphql`
      query BAIDirectoryPickerModalQuery($vfolderGlobalId: String!) {
        vfolder_node(id: $vfolderGlobalId) {
          name
          permissions
        }
      }
    `,
    { vfolderGlobalId: toGlobalId('VirtualFolderNode', vfolderUuid) },
  );
  const hasWriteContentPermission = _.includes(
    vfolder_node?.permissions,
    'write_content',
  );
  const hasDeleteContentPermission = _.includes(
    vfolder_node?.permissions,
    'delete_content',
  );

  return (
    <BAIModal
      width={800}
      title={
        (vfolderName ?? vfolder_node?.name)
          ? t('comp:VFolderPathPicker.SelectAPathInFolder', {
              folderName: vfolderName ?? vfolder_node?.name,
            })
          : t('comp:VFolderPathPicker.SelectAPath')
      }
      onCancel={() => {
        onRequestClose();
      }}
      footer={
        <BAIFlex justify="between" align="center" gap="sm">
          <Typography.Text type="secondary" ellipsis style={{ maxWidth: 460 }}>
            {t('comp:VFolderPathPicker.SelectedPath')}:&nbsp;
            <Typography.Text code>/{toSubPath(currentPath)}</Typography.Text>
          </Typography.Text>
          <Button
            type="primary"
            onClick={() => {
              onRequestClose(toSubPath(currentPath));
            }}
          >
            {t('comp:VFolderPathPicker.SelectThisLocation')}
          </Button>
        </BAIFlex>
      }
      {...modalProps}
    >
      <BAIFileExplorer
        mode="directoryPicker"
        targetVFolderId={vfolderUuid}
        targetVFolderName={vfolderName}
        defaultPath={toExplorerPath(defaultPath ?? '')}
        onChangeCurrentPath={setCurrentPath}
        enableWrite={hasWriteContentPermission}
        enableDelete={hasDeleteContentPermission}
      />
    </BAIModal>
  );
};

export default BAIDirectoryPickerModal;
