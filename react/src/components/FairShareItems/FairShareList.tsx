import DomainFairShareTable from './DomainFairShareTable';
import ResourceGroupFairShareTable from './ResourceGroupFairShareTable';
import { Skeleton, Steps, theme } from 'antd';
import { createStyles } from 'antd-style';
import { StepsProps } from 'antd/lib';
import { BAIFlex } from 'backend.ai-ui';
import _ from 'lodash';
import { Ban } from 'lucide-react';
import { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = createStyles(({ css, token }) => ({
  stepItem: css`
    .ant-steps-item {
      flex: 1 !important;
    }
    .ant-steps-item-icon-number {
      display: none;
    }
    .ant-steps-item-content {
      color: ${token.colorTextDescription} !important;
    }
  `,
}));

type FairShareStepKey = 'resource-group' | 'domain' | 'project' | 'user';
type StepItem = NonNullable<StepsProps['items']>[number];

const FairShareList: React.FC = () => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { styles } = useStyles();
  const [currentStep, setCurrentStep] = useState(0);

  const [selectedResourceGroup, setSelectedResourceGroup] =
    useState<string>('');
  const [selectedDomain, setSelectedDomain] = useState<string>('');

  const stepItems: Array<StepItem & { key: FairShareStepKey }> = [
    {
      key: 'resource-group',
      title: t('fairShare.ResourceGroup'),
      content: selectedResourceGroup
        ? selectedResourceGroup
        : t('fairShare.step.ResourceGroupDescription'),
      onClick: () => {
        setCurrentStep(0);
        setSelectedResourceGroup('');
        setSelectedDomain('');
      },
    },
    {
      key: 'domain',
      title: t('fairShare.Domain'),
      content: !selectedResourceGroup
        ? t('fairShare.step.PleaseSelectResourceGroup')
        : !selectedDomain
          ? t('fairShare.step.DomainDescription')
          : selectedDomain,
      onClick: () => {
        if (selectedResourceGroup) {
          setCurrentStep(1);
          setSelectedDomain('');
        }
      },
    },
    {
      key: 'project',
      title: t('fairShare.Project'),
      content: '',
    },
    { key: 'user', title: t('fairShare.User'), content: '' },
  ];

  return (
    <BAIFlex direction="column" gap="md" align="stretch">
      <Steps
        className={styles.stepItem}
        current={currentStep}
        onChange={(step) => setCurrentStep(step)}
        items={_.map(stepItems, (item, idx) => ({
          ...item,
          disabled: idx > currentStep,
          icon: idx > currentStep ? <Ban /> : undefined,
        }))}
        style={{
          borderRadius: token.borderRadius,
          padding: token.paddingMD,
          border: `2px solid ${token.colorBorderSecondary}`,
        }}
      />

      {stepItems[currentStep].key === 'resource-group' && (
        <Suspense fallback={<Skeleton active />}>
          <ResourceGroupFairShareTable
            onClickGroupName={(name) => {
              setSelectedResourceGroup(name);
              setCurrentStep(1);
            }}
          />
        </Suspense>
      )}
      {stepItems[currentStep].key === 'domain' && (
        <Suspense fallback={<Skeleton active />}>
          <DomainFairShareTable
            selectedResourceGroupName={selectedResourceGroup || ''}
            onClickDomainName={(name) => {
              setSelectedDomain(name);
              setCurrentStep(2);
            }}
          />
        </Suspense>
      )}
    </BAIFlex>
  );
};

export default FairShareList;
