/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { BAIDirectoryPickerModalQuery } from '../../../__generated__/BAIDirectoryPickerModalQuery.graphql';
import { toGlobalId } from '../../../helper';
import { useControllableValue } from '../../../hooks';
import { useBAIi18n } from '../../../hooks/useBAIi18n';
import BAIUnmountAfterClose from '../../BAIUnmountAfterClose';
import BAIDirectoryPickerModal, {
  BAIDirectoryPickerQuery,
} from './BAIDirectoryPickerModal';
import { ComplexSelector } from '@astryxdesign/core/ComplexSelector';
import {
  useEffectEvent,
  useLayoutEffect,
  useState,
  useTransition,
} from 'react';
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
  /**
   * Accessible name of the trigger; visually hidden (the surrounding
   * Form.Item renders the visible label). Defaults to the picker's own
   * "Select a path" copy.
   */
  label?: string;
}

/**
 * Any popover open (ArrowDown bypasses the trigger's click path) is redirected
 * to the directory picker modal before paint.
 */
const PopoverToModalRedirect: React.FC<{
  isOpen: boolean;
  close: () => void;
  openPicker: () => void;
}> = ({ isOpen, close, openPicker }) => {
  'use memo';

  const redirect = useEffectEvent(() => {
    close();
    openPicker();
  });
  useLayoutEffect(() => {
    if (isOpen) {
      redirect();
    }
  }, [isOpen]);
  return null;
};

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

  const { vfolderUuid, disabled, style, label } = props;
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
      <ComplexSelector<string | undefined>
        // Display-only trigger. Astryx `Selector` owns its popup with no open
        // hook (BAISelect keeps `open`/`onOpenChange` inert), so the trigger
        // is a ComplexSelector: preventDefault() makes composeEventHandlers
        // skip its own popover-open handler, and the modal opens instead.
        onClick={(e) => {
          e.preventDefault();
          openPicker();
        }}
        label={label ?? t('comp:VFolderPathPicker.SelectAPath')}
        isLabelHidden
        value={selectedSubPath}
        isLoading={isPickerPending}
        // Leading '/' distinguishes "vfolder root picked" ('' → '/') from
        // "nothing picked yet" (undefined → placeholder).
        triggerLabel={
          selectedSubPath === undefined ? undefined : `/${selectedSubPath}`
        }
        placeholder={
          vfolderUuid
            ? t('comp:VFolderPathPicker.ClickToSelectPath')
            : t('comp:VFolderPathPicker.SelectFolderFirst')
        }
        isDisabled={disabled}
        width={style?.width}
        style={style}
      >
        {(_value, _onChange, close, { isOpen }) => (
          <PopoverToModalRedirect
            isOpen={isOpen}
            close={close}
            openPicker={openPicker}
          />
        )}
      </ComplexSelector>
      {/* Mounted only while open (BAIUnmountAfterClose) and only after the
          first loadQuery. The modal suspends until its preloaded query
          resolves; because it mounts inside the transition above, React
          delays the commit (surfaced as the select's `loading`) instead of
          needing a Suspense boundary here. */}
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
