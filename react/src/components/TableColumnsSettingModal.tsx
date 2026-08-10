/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 QA-FINDINGS Q-13 — "My Environments, RBAC Management 의 table settings modal
 에서만 다른 스타일을 갖고 있습니다. 다른 컴포넌트와 동일한 스타일을 유지하도록
 수정이 필요합니다."

 There are two column-settings surfaces in the app. Most tables use the one
 `BAITableAstryx` renders for its `tableSettings` prop
 (`BAITableAstryxSettingModal`): a `Dialog` with a title+subtitle header, an
 unlabelled search field, drag-to-reorder handles, locked required columns and
 Cancel/Apply. The five tables that predate that prop — `RoleNodes` (RBAC
 Management), `CustomizedImageList` (My Environments), `ImageList`,
 `ContainerRegistryList`, `AgentSummaryList` — reach this component instead,
 which drew its own `BAIModal` + `Form` with a LABELLED search field, a 220px
 box, no reordering and OK/Cancel. Same job, visibly different modal.

 So this component keeps its own prop contract and its own persistence, and
 DELEGATES the rendering. Those five tables store visibility as
 `hiddenColumnKeys` through `useHiddenColumnKeysSetting`, while
 `tableSettings` stores a richer `columnOverrides` record (hidden + order +
 width); migrating them is a storage change that would drop users' saved
 columns on first load, and it is not what the report asks for. Delegating gets
 one look out of one implementation with no storage change and no call-site
 edit.

 Two behaviours are deliberately NOT forwarded, because this contract cannot
 carry them:

 - **Drag-to-reorder** is disabled (`disableReorder`). `hiddenColumnKeys` has
   nowhere to put an order, so an order the user set would be silently lost on
   close. The shared modal already hides its grip handles in that mode.
 - **Required columns** are not marked. `BAIColumnsType` carries `required`,
   but these five call sites never set it, so nothing would render differently.

 The label flattening also comes from the shared helper now. The local
 `onChangeTitleToString` walked only the DIRECT string children of an element,
 so a header nesting its text one level deeper (a tooltip'd header, an icon +
 label pair) produced `undefined` and the row showed its raw column key —
 the same class of defect as Q-12, one narrower.
*/
import {
  BAITableAstryxSettingModal,
  columnTitleToPlainText,
  renderColumnTitle,
  type BAIColumnsType,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React from 'react';

interface FormValues {
  /** Kept for the callers' existing `onRequestClose(values)` handling. */
  selectedColumnKeys?: Array<string>;
}

interface TableColumnsSettingProps {
  open: boolean;
  onRequestClose: (formValues?: FormValues) => void;
  // Frontier note (ticket 19): typed against BUI's re-exported BAIColumnsType
  // so this shared modal no longer imports antd types directly; consumers'
  // antd `ColumnsType` values are structurally identical.
  columns: BAIColumnsType<any>;
  hiddenColumnKeys?: Array<string>;
}

const TableColumnsSettingModal: React.FC<TableColumnsSettingProps> = ({
  open,
  onRequestClose,
  columns,
  hiddenColumnKeys,
}) => {
  'use memo';
  const settingColumns = _.map(columns, (column) => {
    const key = _.toString(column.key);
    return {
      key,
      label: columnTitleToPlainText(renderColumnTitle(column)).trim() || key,
      required: !!(column as { required?: boolean }).required,
    };
  });

  return (
    <BAITableAstryxSettingModal
      open={open}
      columns={settingColumns}
      visibleColumnKeys={_.difference(
        _.map(settingColumns, 'key'),
        hiddenColumnKeys ?? [],
      )}
      disableReorder
      onRequestClose={(result) =>
        onRequestClose(
          result
            ? { selectedColumnKeys: result.selectedColumnKeys }
            : undefined,
        )
      }
    />
  );
};

export default TableColumnsSettingModal;
