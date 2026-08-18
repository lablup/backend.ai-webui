/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `DragAndDrop` — the upload overlay shown while files are dragged over the
 folder explorer. Astryx `FileInput mode="dropzone"` is a file PICKER here, not
 a transport: it hands the `File[]` to `uploadFiles` (tus) through `onChange`.

 PILOT-DECISION — antd's `directory` is DROPPED; `FileInput` has no equivalent.
 Multi-FILE drag-and-drop and dropping a folder still work (both go through
 `DataTransfer`); picking a folder from the file dialog does not.
*/
import { useBAIi18n } from '../../../hooks/useBAIi18n';
import { useUploadVFolderFiles } from './hooks';
import type { RcFile } from './hooks';
import { FileInput } from '@astryxdesign/core/FileInput';
import { useRef } from 'react';
import { createPortal } from 'react-dom';

interface DragAndDropProps {
  onUpload: (files: Array<RcFile>, currentPath: string) => void;
  /** Optional container element for portal rendering */
  portalContainer?: HTMLElement | null;
  /** Dismisses the overlay once the drag is over. */
  onDragEnd?: () => void;
}

const DragAndDrop: React.FC<DragAndDropProps> = ({
  onUpload,
  portalContainer,
  onDragEnd,
}) => {
  'use memo';
  const { t } = useBAIi18n();
  const { uploadFiles } = useUploadVFolderFiles();
  const lastFileListRef = useRef<Array<RcFile>>([]);

  const overlay = (
    <div
      data-testid="folder-explorer-drop-overlay"
      // Deferred on purpose: `drop` is discrete priority, so closing during
      // the dispatch flushes synchronously and unmounts the dropzone before
      // React reaches `FileInput`'s own handler — the file is then silently
      // lost. Waiting for the event to finish is what makes the upload run
      // (FR-3575).
      onDropCapture={() => {
        setTimeout(() => onDragEnd?.(), 0);
      }}
      style={{
        position: 'absolute',
        inset: 0,
        // Astryx publishes no z-index token scale, and a var() with a fallback
        // would win forever (P19); the overlay is portalled over the explorer
        // body, not into the top layer.
        zIndex: 1001,
        backdropFilter: 'blur(4px)',
      }}
    >
      <FileInput
        mode="dropzone"
        // `FileInput` spreads unknown props onto its hidden <input>, so a
        // data-testid cannot reach the drop area — `className` can, and e2e
        // needs a repo-owned handle on it (never an `astryx-*` class).
        className="bai-file-explorer-dropzone"
        // The caption has to live INSIDE the drop area: `label` / `description`
        // render above it in the Field, on top of the explorer title (FR-3575).
        label={t('comp:FileExplorer.DragAndDropDesc')}
        isLabelHidden
        placeholder={t('comp:FileExplorer.DragAndDropDesc')}
        isMultiple
        value={null}
        onChange={(files) => {
          const fileList = (
            Array.isArray(files) ? files : files ? [files] : []
          ) as Array<RcFile>;
          if (fileList !== lastFileListRef.current) {
            uploadFiles(fileList, onUpload);
          }
          lastFileListRef.current = fileList;
        }}
        // `style` lands on the dropzone element, so the drop area itself fills
        // the overlay — the Field wrapper it sits in has no height of its own.
        style={{ position: 'absolute', inset: 0 }}
      />
    </div>
  );

  return portalContainer ? createPortal(overlay, portalContainer) : overlay;
};

export default DragAndDrop;
