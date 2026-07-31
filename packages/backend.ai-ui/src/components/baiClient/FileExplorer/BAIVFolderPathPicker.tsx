/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useBAIi18n } from '../../../hooks/useBAIi18n';
import BAIUnmountAfterClose from '../../BAIUnmountAfterClose';
import BAIDirectoryPickerModal from './BAIDirectoryPickerModal';
import { useControllableValue } from 'ahooks';
import { Input, type InputProps } from 'antd';
import { Suspense, useState } from 'react';

export interface BAIVFolderPathPickerProps {
  /**
   * UUID of the vfolder to browse. Pair it with a separate vfolder select:
   * pass `disabled={!vfolderUuid}` until one is chosen, and reset the value
   * when the vfolder changes (a sub path only makes sense within the
   * vfolder it was picked from).
   */
  vfolderUuid?: string;
  /**
   * The selected sub path inside the vfolder: `''` for the vfolder root,
   * `"sub/path"` below it. `undefined` = nothing picked yet.
   */
  value?: string;
  defaultValue?: string;
  onChange?: (selectedSubPath?: string) => void;
  disabled?: boolean;
  style?: React.CSSProperties;
  /** Forwarded to the sub path trigger Input. */
  inputProps?: Omit<
    InputProps,
    'value' | 'onChange' | 'readOnly' | 'onClick' | 'disabled'
  >;
}

/**
 * A sub path picker for a given vfolder: a read-only path field that opens a
 * directory-only picker modal (`BAIDirectoryPickerModal`). The value is the
 * sub path inside the vfolder (`''` = root, `"inner/path"` below it) — the
 * vfolder itself is chosen elsewhere and passed in as `vfolderUuid`.
 * `value`/`onChange` follow the controllable-state convention, so the
 * component plugs directly into a Form.Item and works both controlled and
 * uncontrolled. The sub path can only be set through the modal (no free
 * typing); files are visible but not selectable there.
 */
const BAIVFolderPathPicker: React.FC<BAIVFolderPathPickerProps> = (props) => {
  'use memo';

  const { vfolderUuid, disabled, style, inputProps } = props;
  const { t } = useBAIi18n();
  const [selectedSubPath, setSelectedSubPath] = useControllableValue<
    string | undefined
  >(props);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const canOpenPicker = !disabled;

  return (
    <>
      <Input
        readOnly
        // Leading '/' distinguishes "vfolder root picked" ('' → '/') from
        // "nothing picked yet" (undefined → placeholder).
        value={
          selectedSubPath === undefined ? undefined : `/${selectedSubPath}`
        }
        placeholder={
          vfolderUuid
            ? t('comp:VFolderPathPicker.ClickToSelectPath')
            : t('comp:VFolderPathPicker.SelectFolderFirst')
        }
        disabled={!canOpenPicker}
        onClick={() => {
          if (canOpenPicker) {
            setIsPickerOpen(true);
          }
        }}
        onKeyDown={(e) => {
          if (canOpenPicker && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            setIsPickerOpen(true);
          }
        }}
        style={{
          cursor: canOpenPicker ? 'pointer' : 'not-allowed',
          ...style,
        }}
        {...inputProps}
      />
      {/* Mounted only while open (BAIUnmountAfterClose); callers disable the
          picker until a vfolder is provided, so rendering unconditionally is
          safe. The modal fetches this vfolder's name and permissions on mount
          (Suspense). */}
      <Suspense fallback={null}>
        <BAIUnmountAfterClose>
          <BAIDirectoryPickerModal
            open={isPickerOpen}
            vfolderUuid={vfolderUuid ?? ''}
            defaultPath={selectedSubPath ?? ''}
            onRequestClose={(newSubPath) => {
              // `undefined` means the modal was cancelled — keep the value.
              if (newSubPath !== undefined) {
                setSelectedSubPath(newSubPath);
              }
              setIsPickerOpen(false);
            }}
          />
        </BAIUnmountAfterClose>
      </Suspense>
    </>
  );
};

export default BAIVFolderPathPicker;
