/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { BAIDirectoryPickerModalQuery } from '../../../__generated__/BAIDirectoryPickerModalQuery.graphql';
import { useBAIi18n } from '../../../hooks/useBAIi18n';
import BAIFlex from '../../BAIFlex';
import BAIModal, { BAIModalProps } from '../../BAIModal';
import BAIFileExplorer from './BAIFileExplorer';
import { Button, Skeleton, Typography } from 'antd';
import * as _ from 'lodash-es';
import { Suspense, useEffect, useEffectEvent, useState } from 'react';
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
 * The suspending part of the modal: the preloaded `vfolder_node` query and the
 * `BAIFileExplorer` (which resolves the BAIClient via `use()`). Kept in a child
 * component so the modal shell can wrap it in its own `<Suspense>` and stay
 * self-contained — callers do not need to provide an outer boundary.
 */
const DirectoryPickerModalContent: React.FC<{
  vfolderUuid: string;
  queryRef: PreloadedQuery<BAIDirectoryPickerModalQuery>;
  defaultPath: string;
  onChangeCurrentPath: (currentPath: string) => void;
  onLoadFolderName: (folderName?: string) => void;
}> = ({
  vfolderUuid,
  queryRef,
  defaultPath,
  onChangeCurrentPath,
  onLoadFolderName,
}) => {
  'use memo';

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

  // Lift the resolved folder name up so the modal title can show it once the
  // query settles, without pulling the suspending query into the shell.
  const notifyFolderName = useEffectEvent(() => {
    onLoadFolderName(vfolder_node?.name ?? undefined);
  });
  useEffect(() => {
    notifyFolderName();
  }, [vfolder_node?.name]);

  return (
    <BAIFileExplorer
      mode="directoryPicker"
      targetVFolderId={vfolderUuid}
      targetVFolderName={vfolder_node?.name ?? undefined}
      defaultPath={toExplorerPath(defaultPath)}
      onChangeCurrentPath={onChangeCurrentPath}
      enableWrite={hasWriteContentPermission}
      enableDelete={hasDeleteContentPermission}
    />
  );
};

/**
 * A directory-only picker built on `BAIFileExplorer`'s `directoryPicker`
 * mode: browse the vfolder (files visible but disabled, folder CRUD
 * available) and confirm the current location with the footer button.
 *
 * Self-contained: the suspending content (preloaded query + explorer) sits
 * behind an internal `<Suspense>`, so the modal frame renders immediately and
 * no outer Suspense boundary is required.
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
  const [folderName, setFolderName] = useState<string>();

  return (
    <BAIModal
      width={800}
      title={
        folderName
          ? t('comp:VFolderPathPicker.SelectAPathInFolder', {
              folderName,
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
      <Suspense fallback={<Skeleton active paragraph={{ rows: 6 }} />}>
        <DirectoryPickerModalContent
          vfolderUuid={vfolderUuid}
          queryRef={queryRef}
          defaultPath={defaultPath ?? ''}
          onChangeCurrentPath={setCurrentPath}
          onLoadFolderName={setFolderName}
        />
      </Suspense>
    </BAIModal>
  );
};

export default BAIDirectoryPickerModal;
