import BAIFlex from './BAIFlex';
import BAIRowWrapWithDividers from './BAIRowWrapWithDividers';
import BAIStatistic from './BAIStatistic';
import { Empty, theme } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface ResourceData {
  cpu: {
    using: { current: number; total?: number };
    remaining: { current: number; total?: number };
    metadata: { title: string; displayUnit: string };
  } | null;
  memory: {
    using: { current: number; total?: number };
    remaining: { current: number; total?: number };
    metadata: { title: string; displayUnit: string };
  } | null;
  accelerators: Array<{
    key: string;
    using: { current: number; total?: number };
    remaining: { current: number; total?: number };
    metadata: { title: string; displayUnit: string };
  }>;
}

interface ResourceStatisticsProps {
  resourceData: ResourceData;
  displayType: 'using' | 'remaining';
  showProgress?: boolean;
  precision?: number;
  progressSteps?: number;
}

const ResourceStatistics: React.FC<ResourceStatisticsProps> = ({
  resourceData,
  displayType,
  showProgress = false,
  progressSteps = 12,
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
        description={t('resourcePanel.NoResourcesAvailable') || ''}
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
            showProgress={showProgress}
            progressSteps={progressSteps}
            precision={precision}
          />
        )}
        {resourceData.memory && (
          <BAIStatistic
            current={resourceData.memory[displayType].current}
            total={resourceData.memory[displayType].total}
            title={resourceData.memory.metadata.title}
            unit={resourceData.memory.metadata.displayUnit}
            showProgress={showProgress}
            progressSteps={progressSteps}
            precision={precision}
          />
        )}
      </BAIRowWrapWithDividers>

      {resourceData.accelerators.length > 0 && (
        <BAIRowWrapWithDividers
          dividerColor={token.colorBorder}
          style={{
            backgroundColor: token.colorSuccessBg,
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
              showProgress={showProgress}
              progressSteps={progressSteps}
              precision={precision}
            />
          ))}
        </BAIRowWrapWithDividers>
      )}
    </BAIFlex>
  );
};

export default ResourceStatistics;
