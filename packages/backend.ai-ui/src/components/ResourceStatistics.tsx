import { convertToBinaryUnit, getDisplayUnitToInputSizeUnit } from '../helper';
import BAIFlex from './BAIFlex';
import BAIRowWrapWithDividers from './BAIRowWrapWithDividers';
import BAIStatistic, { BAIStatisticProps } from './BAIStatistic';
import { Empty, theme } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';

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
  progressMode?: BAIStatisticProps['progressMode'];
  precision?: number;
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
  progressMode = 'hidden',
  progressSteps,
  precision = 2,
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const hasResources =
    resourceData.cpu ||
    resourceData.memory ||
    resourceData.accelerators.length > 0;

  if (!hasResources) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={t('comp:ResourceStatistics.NoResourcesData') || ''}
      />
    );
  }

  return (
    <BAIFlex direction="row" wrap="wrap" gap={'lg'}>
      <BAIRowWrapWithDividers>
        {resourceData.cpu && (
          <BAIStatistic
            current={resourceData.cpu[displayType].current}
            total={resourceData.cpu[displayType].total}
            title={resourceData.cpu.metadata.title}
            unit={resourceData.cpu.metadata.displayUnit}
            progressMode={progressMode}
            progressSteps={progressSteps}
            precision={precision}
            style={{
              color: displayType === 'free' ? token.colorSuccess : undefined,
            }}
          />
        )}
        {resourceData.memory && (
          <BAIStatistic
            current={resourceData.memory[displayType].current}
            total={resourceData.memory[displayType].total}
            title={resourceData.memory.metadata.title}
            unit={resourceData.memory.metadata.displayUnit}
            progressMode={progressMode}
            progressSteps={progressSteps}
            precision={precision}
            style={{
              color: displayType === 'free' ? token.colorSuccess : undefined,
            }}
          />
        )}
      </BAIRowWrapWithDividers>

      {resourceData.accelerators.length > 0 && (
        <BAIRowWrapWithDividers
          dividerColor={token.colorBorder}
          style={{
            backgroundColor: token.colorBgLayout,
            borderRadius: token.borderRadiusLG,
            padding: token.padding,
          }}
        >
          {resourceData.accelerators.map((acc) => (
            <BAIStatistic
              key={acc.key}
              current={acc[displayType].current}
              total={acc[displayType].total}
              title={acc.metadata.title}
              unit={acc.metadata.displayUnit}
              progressMode={progressMode}
              progressSteps={progressSteps}
              precision={precision}
              style={{
                color: displayType === 'free' ? token.colorSuccess : undefined,
              }}
            />
          ))}
        </BAIRowWrapWithDividers>
      )}
    </BAIFlex>
  );
};

export default ResourceStatistics;
