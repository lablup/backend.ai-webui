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
 * A sub path picker for a given vfolder: a select-like trigger that opens a
 * directory-only picker modal (`BAIDirectoryPickerModal`). The value is the
 * sub path inside the vfolder (`''` = root, `"inner/path"` below it) — the
 * vfolder itself is chosen elsewhere and passed in as `vfolderUuid`.
 * `value`/`onChange` follow the controllable-state convention, so the
 * component plugs directly into a Form.Item and works both controlled and
 * uncontrolled. The sub path can only be set through the modal (no free
 * typing); files are visible but not selectable there.
 */
declare const BAIVFolderPathPicker: React.FC<BAIVFolderPathPickerProps>;
export default BAIVFolderPathPicker;
