/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { BAIDirectoryPickerModalQuery } from '../../../__generated__/BAIDirectoryPickerModalQuery.graphql';
import { useBAIi18n } from '../../../hooks/useBAIi18n';
import BAIFlex from '../../BAIFlex';
import BAIModal, { BAIModalProps } from '../../BAIModal';
import BAIFileExplorer from './BAIFileExplorer';
import { Button, Typography } from 'antd';
import * as _ from 'lodash-es';
import { useState } from 'react';
import { graphql, PreloadedQuery, usePreloadedQuery } from 'react-relay';

// The picker works with sub paths ('' = vfolder root) while BAIFileExplorer
// uses '.' as its root path.
const toExplorerPath = (subPath: string) => (subPath === '' ? '.' : subPath);
const toSubPath = (explorerPath: string) =>
  explorerPath === '.' ? '' : explorerPath;

// Exported so openers can `loadQuery` it in the trigger's event handler
// (render-as-you-fetch): the trigger stays in control of the in-flight state
// (e.g. BAIVFolderPathPicker's select `loading`) instead of hiding it behind a
// Suspense gap. Operation name must match the generated artifact; the const
// name only differs to avoid clashing with the imported generated type.
export const BAIDirectoryPickerQuery = graphql`
  query BAIDirectoryPickerModalQuery($vfolderGlobalId: String!) {
    vfolder_node(id: $vfolderGlobalId) {
      name
      permissions
    }
  }
`;

export interface BAIDirectoryPickerModalProps extends Omit<
  BAIModalProps,
  'onOk' | 'onCancel' | 'footer' | 'title'
> {
  vfolderUuid: string;
  /**
   * Preloaded reference to `BAIDirectoryPickerQuery` produced by the opener
   * via `useQueryLoader`, keyed by this vfolder's global id.
   */
  queryRef: PreloadedQuery<BAIDirectoryPickerModalQuery>;
  /** Sub path to start browsing from ('' = vfolder root). */
  defaultPath?: string;
  /** Called with the chosen sub path, or `undefined` when cancelled. */
  onRequestClose: (selectedSubPath?: string) => void;
}

/**
 * A directory-only picker built on `BAIFileExplorer`'s `directoryPicker`
 * mode: browse the vfolder (files visible but disabled, folder CRUD
 * available) and confirm the current location with the footer button.
 *
 * Suspends until the preloaded `vfolder_node` query (and the BAIClient
 * promise consumed inside `BAIFileExplorer`) resolves, so it mounts fully
 * ready — folder name in the title, permissions applied. Openers must
 * therefore mount it inside a transition (`loadQuery` + open-state update
 * wrapped in `startTransition`, as `BAIVFolderPathPicker` does, surfacing
 * `isPending` on the trigger) or provide their own Suspense boundary.
 */
const BAIDirectoryPickerModal: React.FC<BAIDirectoryPickerModalProps> = ({
  vfolderUuid,
  queryRef,
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
  const { vfolder_node } = usePreloadedQuery<BAIDirectoryPickerModalQuery>(
    BAIDirectoryPickerQuery,
    queryRef,
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
        vfolder_node?.name
          ? t('comp:VFolderPathPicker.SelectAPathInFolder', {
              folderName: vfolder_node.name,
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
        targetVFolderName={vfolder_node?.name ?? undefined}
        defaultPath={toExplorerPath(defaultPath ?? '')}
        onChangeCurrentPath={setCurrentPath}
        enableWrite={hasWriteContentPermission}
        enableDelete={hasDeleteContentPermission}
      />
    </BAIModal>
  );
};

export default BAIDirectoryPickerModal;
