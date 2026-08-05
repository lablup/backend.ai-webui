/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import AutoUpdateFetchKeyButton, {
  LONG_AUTO_UPDATE_DELAY_OPTIONS,
} from '../AutoUpdateFetchKeyButton';
import { theme, Tooltip } from 'antd';
import {
  BAIButton,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAIGraphQLPropertyFilterProps,
  BAISelectionLabel,
} from 'backend.ai-ui';
import { ChartNoAxesCombined, SquarePenIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface FairShareStepToolbarProps {
  filterProperties: BAIGraphQLPropertyFilterProps['filterProperties'];
  filterValue: BAIGraphQLPropertyFilterProps['value'];
  onChangeFilter: NonNullable<BAIGraphQLPropertyFilterProps['onChange']>;
  fetchKeyLoading: boolean;
  onRefresh: () => void;
  // Selection actions are only rendered when `selection` is provided; the
  // resource-group step reuses this toolbar without any selection support.
  selection?: {
    selectedCount: number;
    onClearSelection: () => void;
    onShowUsage: () => void;
    onBulkEdit: () => void;
  };
}

const FairShareStepToolbar: React.FC<FairShareStepToolbarProps> = ({
  filterProperties,
  filterValue,
  onChangeFilter,
  fetchKeyLoading,
  onRefresh,
  selection,
}) => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();

  return (
    <BAIFlex justify="between" align="center" wrap="wrap" gap="sm">
      <BAIGraphQLPropertyFilter
        filterProperties={filterProperties}
        value={filterValue}
        onChange={onChangeFilter}
      />
      <BAIFlex gap="xs">
        {selection && selection.selectedCount > 0 && (
          <>
            <BAISelectionLabel
              count={selection.selectedCount}
              onClearSelection={selection.onClearSelection}
            />
            <Tooltip title={t('general.ShowUsageGraph')} placement="topLeft">
              <BAIButton
                icon={
                  <ChartNoAxesCombined style={{ color: token.colorInfo }} />
                }
                onClick={selection.onShowUsage}
              />
            </Tooltip>
            <Tooltip title={t('general.BulkEdit')} placement="topLeft">
              <BAIButton
                icon={<SquarePenIcon style={{ color: token.colorInfo }} />}
                onClick={selection.onBulkEdit}
              />
            </Tooltip>
          </>
        )}
        <AutoUpdateFetchKeyButton
          settingId="fair-share-list"
          autoUpdateDelayOptions={LONG_AUTO_UPDATE_DELAY_OPTIONS}
          loading={fetchKeyLoading}
          value=""
          onChange={onRefresh}
        />
      </BAIFlex>
    </BAIFlex>
  );
};

export default FairShareStepToolbar;
