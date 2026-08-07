/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { handleRowSelectionChange } from '../../helper';
import { useState } from 'react';

/**
 * Bundles the selection state (multi-row + single-row) and the modal open state
 * shared by the Domain/Project/User fair-share steps. The `keyField` identifies
 * a row within its list so row-selection toggles can be reconciled across pages.
 */
export const useFairShareStepSelectionState = <
  T extends object,
  K extends keyof T,
>(
  keyField: K,
) => {
  'use memo';

  const [selectedRows, setSelectedRows] = useState<Array<T>>([]);
  const [selectedSingleRow, setSelectedSingleRow] = useState<T | null>(null);
  const [openWeightSettingModal, setOpenWeightSettingModal] = useState(false);
  const [openUsageModal, setOpenUsageModal] = useState(false);

  const handleRowSelect = (
    selectedRowKeys: React.Key[],
    currentPageItems: readonly T[],
  ) => {
    handleRowSelectionChange(
      selectedRowKeys,
      currentPageItems,
      setSelectedRows,
      keyField,
    );
  };

  const clearSelection = () => {
    setSelectedRows([]);
  };

  const closeModals = () => {
    setSelectedSingleRow(null);
    setOpenWeightSettingModal(false);
  };

  return {
    selectedRows,
    selectedSingleRow,
    openWeightSettingModal,
    openUsageModal,
    setSelectedSingleRow,
    setOpenWeightSettingModal,
    setOpenUsageModal,
    handleRowSelect,
    clearSelection,
    closeModals,
  };
};
