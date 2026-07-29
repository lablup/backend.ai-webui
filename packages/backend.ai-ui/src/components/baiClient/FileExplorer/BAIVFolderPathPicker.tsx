/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { toLocalId } from '../../../helper';
import { useBAIi18n } from '../../../hooks/useBAIi18n';
import BAIFlex from '../../BAIFlex';
import BAIUnmountAfterClose from '../../BAIUnmountAfterClose';
import BAIVFolderSelect, {
  BAIVFolderSelectProps,
} from '../../fragments/BAIVFolderSelect';
import BAIDirectoryPickerModal from './BAIDirectoryPickerModal';
import { useControllableValue } from 'ahooks';
import { Input, Typography, type InputProps } from 'antd';
import * as _ from 'lodash-es';
import { Suspense, useState } from 'react';

export interface BAIVFolderPathPickerProps {
  /**
   * The selected path as a single **name-based** string:
   * `"<vfolderName>"` for the vfolder root, or `"<vfolderName>/<sub/path>"`
   * below it. The vfolder's id is tracked internally (for the picker modal's
   * REST calls) and is not part of the value.
   *
   * Note: because the value carries no id, a value injected from outside
   * (initialValues, setFieldsValue) cannot re-open the picker modal until the
   * user re-picks the vfolder in the select.
   */
  value?: string;
  defaultValue?: string;
  onChange?: (selectedPath?: string) => void;
  disabled?: boolean;
  style?: React.CSSProperties;
  /** Forwarded to the embedded BAIVFolderSelect (scoping, filtering, …). */
  selectProps?: Omit<
    BAIVFolderSelectProps,
    'value' | 'defaultValue' | 'onChange' | 'mode' | 'valuePropName' | 'ref'
  >;
  /** Forwarded to the sub path trigger Input. */
  inputProps?: Omit<
    InputProps,
    'value' | 'onChange' | 'readOnly' | 'onClick' | 'disabled'
  >;
}

/**
 * An integrated "vfolder + sub path" picker: a `BAIVFolderSelect` next to a
 * read-only path field that opens a directory-only picker modal
 * (`BAIDirectoryPickerModal`). The value is a single name-based path string
 * (`"test/inner/path"`), so it plugs directly into a Form.Item;
 * `value`/`onChange` follow the controllable-state convention — the component
 * works both controlled and uncontrolled.
 *
 * The vfolder chosen in the select is the starting point of the path:
 * changing it restarts the path at that vfolder's root, clearing it clears
 * the whole value, and confirming a location in the modal appends the sub
 * path. The sub path can only be set through the modal (no free typing);
 * files are visible but not selectable there.
 */
const BAIVFolderPathPicker: React.FC<BAIVFolderPathPickerProps> = (props) => {
  'use memo';

  const { disabled, style, selectProps, inputProps } = props;
  const { t } = useBAIi18n();
  const [selectedPath, setSelectedPath] = useControllableValue<
    string | undefined
  >(props);
  // The selected vfolder's global id — needed for the select display and the
  // picker modal's REST calls; intentionally kept out of the (name-based)
  // value.
  const [vfolderGlobalId, setVFolderGlobalId] = useState<string | undefined>();
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  // First segment = the vfolder's name, the rest = sub path inside it.
  const separatorIndex = selectedPath?.indexOf('/') ?? -1;
  const vfolderName =
    separatorIndex === -1
      ? selectedPath
      : selectedPath?.slice(0, separatorIndex);
  const subPath =
    separatorIndex === -1
      ? ''
      : (selectedPath?.slice(separatorIndex + 1) ?? '');
  // Derive the select display from the value: when the value is cleared from
  // outside (e.g. form.resetFields()), the stale internal id is simply
  // ignored, so the select clears too without any state synchronization.
  const hasSelection = !!selectedPath && !!vfolderGlobalId;
  const canOpenPicker = !disabled && hasSelection;

  return (
    <>
      <BAIFlex gap="xxs" align="center" style={style}>
        <BAIVFolderSelect
          style={{ flex: 1, minWidth: 0 }}
          disabled={disabled}
          allowClear
          {...selectProps}
          value={hasSelection ? vfolderGlobalId : undefined}
          onChange={(vfolderId, option) => {
            // `undefined` = cleared via allowClear.
            if (!vfolderId) {
              setVFolderGlobalId(undefined);
              setSelectedPath(undefined);
              return;
            }
            // The selected vfolder is the starting point of the path — any
            // previously picked sub path belongs to the old vfolder, so the
            // path simply restarts at the new vfolder's root. The name comes
            // synchronously from the chosen option's label.
            const label = _.isArray(option) ? option[0]?.label : option?.label;
            setVFolderGlobalId(vfolderId);
            setSelectedPath(_.isString(label) ? label : undefined);
          }}
        />
        <Typography.Text type="secondary">/</Typography.Text>
        <Input
          readOnly
          // The separator between the select and this field already renders
          // '/', so show the bare sub path only (empty at the vfolder root).
          value={subPath || undefined}
          placeholder={
            hasSelection
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
            flex: 1,
            cursor: canOpenPicker ? 'pointer' : 'not-allowed',
          }}
          {...inputProps}
        />
      </BAIFlex>
      {/* Mounted only while open (BAIUnmountAfterClose), and it can only be
          opened once a vfolder is selected — so rendering unconditionally is
          safe. The modal fetches this vfolder's name and permissions on mount
          (Suspense). */}
      <Suspense fallback={null}>
        <BAIUnmountAfterClose>
          <BAIDirectoryPickerModal
            open={isPickerOpen}
            vfolderUuid={vfolderGlobalId ? toLocalId(vfolderGlobalId) : ''}
            defaultPath={subPath}
            onRequestClose={(selectedSubPath) => {
              // `undefined` means the modal was cancelled — keep the value.
              if (selectedSubPath !== undefined && vfolderName) {
                setSelectedPath(
                  selectedSubPath
                    ? `${vfolderName}/${selectedSubPath}`
                    : vfolderName,
                );
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
