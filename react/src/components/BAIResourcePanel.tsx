import BAICard from '../BAICard';
import {
  useCurrentProjectValue,
  useCurrentResourceGroupValue,
} from '../hooks/useCurrentProject';
import { useResourceLimitAndRemaining } from '../hooks/useResourceLimitAndRemaining';
import BAIProgressBar from './BAIProgressBar';
import Flex from './Flex';
import ResourceGroupSelectForCurrentProject from './ResourceGroupSelectForCurrentProject';
import { CardProps, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

interface BAIResourcePanelProps extends CardProps {
  width?: number;
  height?: number;
}

const BAIResourcePanel: React.FC<BAIResourcePanelProps> = ({
  width,
  height,
}) => {
  const { t } = useTranslation();
  const currentProject = useCurrentProjectValue();
  const currentResourceGroup = useCurrentResourceGroupValue();
  const fetchData = useResourceLimitAndRemaining({
    currentProjectName: currentProject.name,
    currentResourceGroup: currentResourceGroup || 'default',
  });

  console.log(fetchData);

  return (
    <BAICard
      style={{ width: width, height: height }}
      title={
        <Flex justify="between">
          <Typography.Text>{t('summary.ResourceStatistics')}</Typography.Text>
          <ResourceGroupSelectForCurrentProject />
        </Flex>
      }
    >
      <BAIProgressBar title="CPU" progressData={[]} />
    </BAICard>
  );
};

export default BAIResourcePanel;
