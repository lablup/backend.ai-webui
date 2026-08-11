/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `DragAndDrop` on Astryx (to-astryx phase 3, wave 2 / ticket W2-D).

 antd `Upload.Dragger` -> Astryx `FileInput mode="dropzone"` (MAPPING §3.12).
 That entry is precise about why this is a near-direct fit: the repo already
 uses `Upload` as a file PICKER, not a transport — `beforeUpload` returning
 `false` plus `showUploadList={false}` means antd never uploaded anything, it
 only handed over the `FileList`. `FileInput` hands over the same files through
 `onChange` and owns the dropzone chrome, so the transport (`uploadFiles`, tus)
 is untouched.

 PILOT-DECISION — **`beforeUpload` returning `false` becomes `onChange`.**
 The de-dupe guard (`fileList !== lastFileListRef.current`) is kept: antd
 called `beforeUpload` once PER FILE with the same array, and while
 `FileInput.onChange` fires once per selection, the guard is cheap and keeps
 the double-drop behaviour identical.

 PILOT-DECISION — **`directory` is DROPPED.** MAPPING §3.12 lists it (×1 in
 the repo — this file) as having no `FileInput` equivalent. `FileInput` has
 `isMultiple`, which keeps multi-FILE drag-and-drop; what is lost is picking a
 whole folder through the file dialog. Dropping a folder onto the zone still
 works — that path goes through `DataTransfer`, not the input's
 `webkitdirectory` attribute.

 PILOT-DECISION — **the overlay keeps its inline positioning, and only its
 z-index changes source.** `token.zIndexPopupBase + 1` came from the antd token
 scale; the overlay is portalled over the explorer body (not into the top
 layer), so it is now a literal — Astryx publishes no z-index token scale, and
 inventing a `var()` name would be the P19 trap (a fallback that wins forever).
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
}

const DragAndDrop: React.FC<DragAndDropProps> = ({
  onUpload,
  portalContainer,
}) => {
  const { t } = useBAIi18n();
  const { uploadFiles } = useUploadVFolderFiles();
  const lastFileListRef = useRef<Array<RcFile>>([]);

  const overlay = (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 1001,
        backdropFilter: 'blur(4px)',
      }}
    >
      <FileInput
        mode="dropzone"
        label={t('comp:FileExplorer.DragAndDropDesc')}
        description={t('comp:FileExplorer.DragAndDropDesc')}
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
        width="100%"
      />
    </div>
  );

  return portalContainer ? createPortal(overlay, portalContainer) : overlay;
};

export default DragAndDrop;
