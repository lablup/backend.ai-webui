/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { theme } from '../../theme-shim';
import AutoUpdateFetchKeyButton, {
  LONG_AUTO_UPDATE_DELAY_OPTIONS,
} from '../AutoUpdateFetchKeyButton';
import { Tooltip } from '@lablup/ui-common/Tooltip';
import {
  BAIButton,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAIGraphQLPropertyFilterProps,
  BAISelectionLabel,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { ChartNoAxesCombined, SquarePenIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * Reduce a filter to a single leaf condition by dropping the AND/OR/NOT
 * combinators a pre-26.7 manager rejects. Only reached when `sub-filter` is
 * unavailable, where a combinator can still arrive from a bookmarked or shared
 * URL that the filter control itself can no longer produce.
 */
export const flattenUnsupportedSubFilter = (
  filter: BAIGraphQLPropertyFilterProps['value'],
): BAIGraphQLPropertyFilterProps['value'] => {
  if (!_.isPlainObject(filter)) return undefined;
  const combinator = _.find(
    ['AND', 'OR', 'NOT'],
    (key) => !_.isUndefined(_.get(filter, key)),
  );
  if (!combinator) return filter;
  const branch = _.get(filter, combinator);
  const next = _.isArray(branch) ? _.find(branch, _.isPlainObject) : branch;
  return flattenUnsupportedSubFilter(
    next as BAIGraphQLPropertyFilterProps['value'],
  );
};

interface FairShareStepToolbarProps {
  filterProperties: BAIGraphQLPropertyFilterProps['filterProperties'];
  filterValue: BAIGraphQLPropertyFilterProps['value'];
  onChangeFilter: NonNullable<BAIGraphQLPropertyFilterProps['onChange']>;
  singleCondition?: BAIGraphQLPropertyFilterProps['singleCondition'];
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
  singleCondition,
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
        singleCondition={singleCondition}
      />
      <BAIFlex gap="xs">
        {selection && selection.selectedCount > 0 && (
          <>
            <BAISelectionLabel
              count={selection.selectedCount}
              onClearSelection={selection.onClearSelection}
            />
            <Tooltip
              content={t('general.ShowUsageGraph')}
              placement="above"
              alignment="start"
            >
              <BAIButton
                icon={
                  <ChartNoAxesCombined style={{ color: token.colorInfo }} />
                }
                onClick={selection.onShowUsage}
              />
            </Tooltip>
            <Tooltip
              content={t('general.BulkEdit')}
              placement="above"
              alignment="start"
            >
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
