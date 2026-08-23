import { convertToBinaryUnit, getDisplayUnitToInputSizeUnit } from '../helper';
import { useBAIi18n } from '../hooks/useBAIi18n';
import BAIFlex from './BAIFlex';
import BAIMeterRow from './BAIMeterRow';
import { BAIStatisticProps } from './BAIStatistic';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import * as _ from 'lodash-es';
import React from 'react';

interface ResourceData {
  cpu: {
    used: { current: number; total?: number };
    free: { current: number; total?: number };
    metadata: { title: string; displayUnit: string };
  } | null;
  memory: {
    used: { current: number; total?: number };
    free: { current: number; total?: number };
    metadata: { title: string; displayUnit: string };
  } | null;
  accelerators: Array<{
    key: string;
    used: { current: number; total?: number };
    free: { current: number; total?: number };
    metadata: { title: string; displayUnit: string };
  }>;
}

interface ResourceStatisticsProps {
  resourceData: ResourceData;
  displayType: 'used' | 'free';
  precision?: number;
  /** Accepted and ignored — the notch strip is a continuous track now.
      Kept so `backend.ai-ui`'s published surface does not break. */
  progressMode?: BAIStatisticProps['progressMode'];
  progressSteps?: number;
}

export const processMemoryValue = (value: any, displayUnit: string): number => {
  const numValue = convertToNumber(value);
  if (isFinite(numValue) && displayUnit) {
    const converted = convertToBinaryUnit(
      value,
      getDisplayUnitToInputSizeUnit(displayUnit),
    );
    return converted?.number || numValue;
  }
  return numValue;
};

export const convertToNumber = (value: any): number => {
  if (value === null || value === undefined || value === 'Infinity') {
    return Number.POSITIVE_INFINITY;
  }
  return Number(value) || 0;
};

const ResourceStatistics: React.FC<ResourceStatisticsProps> = ({
  resourceData,
  displayType,
  precision = 2,
}) => {
  const { t } = useBAIi18n();

  const hasResources =
    resourceData.cpu ||
    resourceData.memory ||
    resourceData.accelerators.length > 0;

  if (!hasResources) {
    // `EmptyState` with no `icon` is the frame-only variant this slot wants.
    return (
      <EmptyState title={t('comp:ResourceStatistics.NoResourcesData') || ''} />
    );
  }

  const rows = _.compact([
    resourceData.cpu && { key: 'cpu', ...resourceData.cpu },
    resourceData.memory && { key: 'memory', ...resourceData.memory },
    ...resourceData.accelerators,
  ]);

  return (
    <BAIFlex direction="column" align="stretch" gap={'lg'}>
      {_.map(rows, (row) => (
        <BAIMeterRow
          key={row.key}
          title={row.metadata.title}
          current={row[displayType].current}
          total={row[displayType].total}
          // The track always draws consumption, so a full bar reads the same
          // whether the card is showing "used" or "free".
          utilized={row.used.current}
          unit={row.metadata.displayUnit}
          precision={precision}
        />
      ))}
    </BAIFlex>
  );
};

export default ResourceStatistics;
