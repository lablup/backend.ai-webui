/**
 * `BAITable` is the one table implementation: Astryx `Table` + plugin
 * pipeline. The antd engine was deleted in to-astryx ticket 30-D, and
 * FR-3564 dropped the `Astryx` suffix the two-engine era needed.
 *
 * The column model (`BAIColumnsType`) and the persisted-override shape
 * (`BAITableSettings`, `BAITableColumnOverrideItem`) live in the
 * engine-neutral `tableTypes` module, which imports no table implementation.
 */
export { default as BAITable } from './BAITable';
/**
 * Exported for the app's own `TableColumnsSettingModal`, which serves the five
 * tables that predate `BAITable`'s built-in `tableSettings` and keep
 * their own `useHiddenColumnKeysSetting` persistence. It delegates its
 * rendering here so those tables' column settings look like every other
 * table's (QA-FINDINGS Q-13) without migrating their storage shape.
 */
export { default as BAITableSettingModal } from './BAITableSettingModal';
export type {
  BAITableSettingColumn,
  BAITableSettingResult,
  BAITableSettingModalProps,
} from './BAITableSettingModal';
export { default as BAINameActionCell } from './BAINameActionCell';
export type {
  BAINameActionCellAction,
  BAINameActionCellProps,
} from './BAINameActionCell';
export type {
  BAITableProps,
  BAITableRowSelection,
  BAITablePaginationConfig,
  BAITableExpandable,
} from './BAITable';
export type {
  BAIAnyObject,
  BAIColumnType,
  BAIColumnGroupType,
  BAIColumnsType,
  BAITableSettings,
  BAITableColumnOverrideItem,
  BAITableColumnOverrideRecord,
  BAIExportSettings,
} from './tableTypes';
export {
  isColumnVisible,
  getVisibleColumns,
  restoreColumnToDefault,
  restoreAllColumnsToDefault,
  columnTitleToPlainText,
  renderColumnTitle,
} from './tableTypes';
