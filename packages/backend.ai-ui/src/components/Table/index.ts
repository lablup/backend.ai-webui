/**
 * to-astryx TICKET 30-D — the BAITable seam, closed.
 *
 * Ticket 25 shipped `BAITableAstryx` next to the antd `BAITable` and moved
 * three `*Nodes` across. Ticket 30-D moved the remaining 71 consumers and
 * deleted the antd engine, so there is exactly ONE table implementation now:
 *
 *   `BAITableAstryx`  Astryx `Table` + plugin pipeline
 *
 * The names that survive from the antd era are types, not components:
 * `BAITableProps` (~30 components embed it in their own public prop
 * interfaces) is an alias of `BAIAstryxTableProps`, and the column model
 * (`BAIColumnsType`) plus the persisted-override shape (`BAITableSettings`,
 * `BAITableColumnOverrideItem`) live in the engine-neutral `tableTypes`
 * module, which imports no table implementation at all.
 */
export { default as BAITableAstryx } from './BAITableAstryx';
/**
 * Exported for the app's own `TableColumnsSettingModal`, which serves the five
 * tables that predate `BAITableAstryx`'s built-in `tableSettings` and keep
 * their own `useHiddenColumnKeysSetting` persistence. It delegates its
 * rendering here so those tables' column settings look like every other
 * table's (QA-FINDINGS Q-13) without migrating their storage shape.
 */
export { default as BAITableAstryxSettingModal } from './BAITableAstryxSettingModal';
export type {
  BAITableAstryxSettingColumn,
  BAITableAstryxSettingResult,
  BAITableAstryxSettingModalProps,
} from './BAITableAstryxSettingModal';
export { default as BAINameActionCell } from './BAINameActionCell';
export type {
  BAINameActionCellAction,
  BAINameActionCellProps,
} from './BAINameActionCell';
export type {
  BAIAstryxTableProps,
  BAIAstryxTableProps as BAITableProps,
  BAIAstryxRowSelection,
  BAIAstryxPaginationConfig,
  BAIAstryxExpandable,
} from './BAITableAstryx';
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
