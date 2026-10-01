/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { BAIDirectoryPickerModalQuery } from '../../../__generated__/BAIDirectoryPickerModalQuery.graphql';
import { useBAIi18n } from '../../../hooks/useBAIi18n';
import BAIButton from '../../BAIButton';
import BAIFlex from '../../BAIFlex';
import BAIModal, { BAIModalProps } from '../../BAIModal';
import BAIText from '../../BAIText';
import BAIFileExplorer from './BAIFileExplorer';
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
  query BAIDirectoryPickerModalQuery($vfolderId: UUID!) {
    vfolderV2(vfolderId: $vfolderId) {
      id
      metadata {
        name
      }
      permissions @since(version: "26.9.0rc1")
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
   * via `useQueryLoader`, keyed by this vfolder's id.
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
 * Suspends until the preloaded `vfolderV2` query (and the BAIClient
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
  // on this vfolder, same as FolderExplorerModalV2: `UPDATE` to write,
  // `SOFT_DELETE` to delete.
  const { vfolderV2 } = usePreloadedQuery<BAIDirectoryPickerModalQuery>(
    BAIDirectoryPickerQuery,
    queryRef,
  );
  const hasWriteContentPermission = _.includes(
    vfolderV2?.permissions,
    'UPDATE',
  );
  const hasDeleteContentPermission = _.includes(
    vfolderV2?.permissions,
    'SOFT_DELETE',
  );
  const folderName = vfolderV2?.metadata?.name;

  return (
    <BAIModal
      width={800}
      title={
        folderName
          ? t('comp:VFolderPathPicker.SelectAPathInFolder', { folderName })
          : t('comp:VFolderPathPicker.SelectAPath')
      }
      onCancel={() => {
        onRequestClose();
      }}
      footer={
        <BAIFlex justify="between" align="center" gap="sm">
          <BAIText type="secondary" ellipsis style={{ maxWidth: 460 }}>
            {t('comp:VFolderPathPicker.SelectedPath')}:&nbsp;
            <BAIText code>/{toSubPath(currentPath)}</BAIText>
          </BAIText>
          <BAIButton
            type="primary"
            onClick={() => {
              onRequestClose(toSubPath(currentPath));
            }}
          >
            {t('comp:VFolderPathPicker.SelectThisLocation')}
          </BAIButton>
        </BAIFlex>
      }
      {...modalProps}
    >
      <BAIFileExplorer
        mode="directoryPicker"
        targetVFolderId={vfolderUuid}
        targetVFolderName={folderName ?? undefined}
        defaultPath={toExplorerPath(defaultPath ?? '')}
        onChangeCurrentPath={setCurrentPath}
        enableWrite={hasWriteContentPermission}
        enableDelete={hasDeleteContentPermission}
      />
    </BAIModal>
  );
};

export default BAIDirectoryPickerModal;
