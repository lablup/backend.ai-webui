/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { BAIDirectoryPickerModalQuery } from '../../../__generated__/BAIDirectoryPickerModalQuery.graphql';
import { toGlobalId } from '../../../helper';
import { useBAIi18n } from '../../../hooks/useBAIi18n';
import BAISelect, { type BAISelectProps } from '../../BAISelect';
import BAIUnmountAfterClose from '../../BAIUnmountAfterClose';
import BAIDirectoryPickerModal, {
  BAIDirectoryPickerQuery,
} from './BAIDirectoryPickerModal';
import { useControllableValue } from 'ahooks';
import { useState, useTransition } from 'react';
import { useQueryLoader } from 'react-relay';

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
  /** Forwarded to the sub path trigger select. */
  selectProps?: Omit<
    BAISelectProps,
    'value' | 'onChange' | 'open' | 'onOpenChange' | 'loading' | 'disabled'
  >;
}

/**
 * A sub path picker for a given vfolder: a select-like trigger that opens a
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

  const { vfolderUuid, disabled, style, selectProps } = props;
  const { t } = useBAIi18n();
  const [selectedSubPath, setSelectedSubPath] = useControllableValue<
    string | undefined
  >(props);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isPickerPending, startPickerTransition] = useTransition();
  const [pickerQueryRef, loadPickerQuery] =
    useQueryLoader<BAIDirectoryPickerModalQuery>(BAIDirectoryPickerQuery);

  const canOpenPicker = !disabled && !!vfolderUuid;

  const openPicker = () => {
    if (!canOpenPicker) {
      return;
    }
    // Render-as-you-fetch: kick off the modal's vfolder query here and open it
    // inside a transition, so while the data is in flight the select shows
    // `loading` (isPickerPending) instead of a blank Suspense gap.
    startPickerTransition(() => {
      loadPickerQuery(
        { vfolderGlobalId: toGlobalId('VirtualFolderNode', vfolderUuid) },
        { fetchPolicy: 'store-and-network' },
      );
      setIsPickerOpen(true);
    });
  };

  return (
    <>
      <BAISelect
        // Display-only trigger: the dropdown never opens (`open={false}`);
        // every open gesture (click, Enter, arrow keys) arrives through
        // onOpenChange and is redirected to the directory picker modal.
        open={false}
        onOpenChange={(nextOpen) => {
          if (nextOpen) {
            openPicker();
          }
        }}
        loading={isPickerPending}
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
        disabled={disabled}
        style={style}
        {...selectProps}
      />
      {/* Mounted only while open (BAIUnmountAfterClose) and only after the
          first loadQuery. The modal is self-contained (it wraps its own
          suspending content in a Suspense), so no boundary is needed here. */}
      {pickerQueryRef != null && (
        <BAIUnmountAfterClose>
          <BAIDirectoryPickerModal
            open={isPickerOpen}
            vfolderUuid={vfolderUuid ?? ''}
            queryRef={pickerQueryRef}
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
      )}
    </>
  );
};

export default BAIVFolderPathPicker;
