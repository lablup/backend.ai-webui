/**
 * to-astryx TICKET 25 — the BAITable migration seam.
 *
 * Two engines ship side by side while the ~74 call sites move across:
 *
 *   `BAITable`        antd `Table` (also exported as `BAITableLegacy`)
 *   `BAITableAstryx`  Astryx `Table` + plugin pipeline — the successor
 *
 * Both accept the SAME antd-shaped column model (`BAIColumnsType`), so a
 * consumer flips by swapping the import. `BAITableLegacy` is the name later
 * waves rename the stragglers to; ticket 30 / 35 do the final swap of the
 * `BAITable` identifier onto the Astryx implementation once nothing is left on
 * the antd one.
 */
export { default as BAITable } from './BAITable';
// Same component as `BAITable`, under the name the migration renames call
// sites to when they must stay on antd for another wave.
export { default as BAITableLegacy } from './BAITable';
export { default as BAITableAstryx } from './BAITableAstryx';
export { default as BAINameActionCell } from './BAINameActionCell';
export type {
  BAINameActionCellAction,
  BAINameActionCellProps,
} from './BAINameActionCell';
export type {
  BAITableProps,
  BAIColumnType,
  BAIColumnsType,
  BAITableSettings,
  BAITableColumnOverrideItem,
  BAITableColumnOverrideRecord,
  BAIExportSettings,
} from './BAITable';
export type {
  BAIAstryxTableProps,
  BAIAstryxRowSelection,
  BAIAstryxPaginationConfig,
  BAIAstryxExpandable,
} from './BAITableAstryx';
export {
  isColumnVisible,
  getVisibleColumns,
  restoreColumnToDefault,
  restoreAllColumnsToDefault,
} from './BAITable';
