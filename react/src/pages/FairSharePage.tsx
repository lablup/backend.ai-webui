import { Steps, StepsProps, theme } from 'antd';
import { createStyles } from 'antd-style';
import { BAICard, BAIFlex, BAIUnmountAfterClose } from 'backend.ai-ui';
import _ from 'lodash';
import { Ban } from 'lucide-react';
import { useState } from 'react';
import DomainTable from 'src/components/FairShareSchedulerPageItem/DomainTable';
import ProjectTable from 'src/components/FairShareSchedulerPageItem/ProjectTable';
import ResourceGroupTable from 'src/components/FairShareSchedulerPageItem/ResourceGroupTable';
import UsageBucketHistoryModal from 'src/components/FairShareSchedulerPageItem/UsageBucketHistoryModal';
import UserTable from 'src/components/FairShareSchedulerPageItem/UserTable';

const useStyles = createStyles(({ css, token }) => ({
  stepItem: css`
    .ant-steps-item {
      flex: 1 !important;
    }
    .ant-steps-item-active .ant-steps-item-title {
      color: ${token.colorPrimary} !important;
    }
    .ant-steps-item-icon-number {
      display: none;
    }
  `,
}));

type FairShareSchedulerStepKey =
  | 'resourceGroup'
  | 'domain'
  | 'project'
  | 'user';
type StepItem = NonNullable<StepsProps['items']>[number];

interface FairShareSchedulerProps {}

export const FairShareScheduler: React.FC<FairShareSchedulerProps> = () => {
  'use memo';
  const { token } = theme.useToken();
  const { styles } = useStyles();

  const [currentStep, setCurrentStep] = useState(0);

  const [selectedResourceGroup, setSelectedResourceGroup] = useState<
    string | null
  >(null);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [usageTargetName, setUsageTargetName] = useState<string | null>(null);

  const stepItem: Array<StepItem & { key: FairShareSchedulerStepKey }> = [
    {
      key: 'resourceGroup',
      // TODO: i18n
      title: 'Resource Group',
      description: selectedResourceGroup
        ? selectedResourceGroup
        : '자원 그룹에 설정된 Fair Share 정책을 확인하고 수정합니다.',
      onClick: () => {
        setSelectedResourceGroup(null);
        setSelectedDomain(null);
        setSelectedProject(null);
        setCurrentStep(0);
      },
    },
    {
      key: 'domain',
      // TODO: i18n
      title: 'Domain',
      description: selectedDomain
        ? selectedDomain
        : selectedResourceGroup
          ? '도메인에 설정된 Fair Share 정책을 확인하고 수정합니다.'
          : '자원 그룹을 먼저 선택해주세요.',
      onClick: () => {
        setSelectedDomain(null);
        setSelectedProject(null);
        setCurrentStep(1);
      },
    },
    {
      key: 'project',
      // TODO: i18n
      title: 'Project',
      description: selectedProject
        ? selectedProject
        : selectedDomain
          ? '프로젝트에 설정된 Fair Share 정책을 확인하고 수정합니다.'
          : '도메인을 먼저 선택해주세요.',
      onClick: () => {
        setSelectedProject(null);
        setCurrentStep(2);
      },
    },
    {
      key: 'user',
      // TODO: i18n
      title: 'User',
      description: selectedProject
        ? '사용자에 설정된 Fair Share 정책을 확인하고 수정합니다.'
        : '프로젝트를 먼저 선택해주세요.',
    },
  ];

  return (
    <BAIFlex direction="column" gap="md" align="stretch">
      <BAICard>
        <Steps
          className={styles.stepItem}
          current={currentStep}
          onChange={(step) => setCurrentStep(step)}
          items={_.map(stepItem, (item, idx) => ({
            ...item,
            disabled: idx > currentStep,
            icon: idx > currentStep ? <Ban /> : undefined,
          }))}
          style={{
            borderRadius: token.borderRadius,
            backgroundColor: token.colorBgContainer,
          }}
          styles={{
            itemIcon: { borderRadius: '30%' },
          }}
        />
      </BAICard>
      {stepItem[currentStep].key === 'resourceGroup' && (
        <ResourceGroupTable
          onClickGroupName={(name) => {
            setCurrentStep(1);
            setSelectedResourceGroup(name);
          }}
        />
      )}
      {stepItem[currentStep].key === 'domain' && (
        <DomainTable
          onClickGroupName={(name) => {
            setCurrentStep(2);
            setSelectedDomain(name);
          }}
          onClickUsageBucketLog={(name) => {
            setUsageTargetName(name);
          }}
        />
      )}
      {stepItem[currentStep].key === 'project' && (
        <ProjectTable
          onClickProjectName={(name) => {
            setCurrentStep(3);
            setSelectedProject(name);
          }}
          onClickUsageBucketLog={(name) => {
            setUsageTargetName(name);
          }}
        />
      )}
      {stepItem[currentStep].key === 'user' && <UserTable />}

      <BAIUnmountAfterClose>
        <UsageBucketHistoryModal
          open={!!usageTargetName}
          onRequestClose={() => setUsageTargetName(null)}
          resourceGroupName={selectedResourceGroup}
          domainName={selectedDomain}
          projectName={selectedProject}
          usageTargetName={usageTargetName}
        />
      </BAIUnmountAfterClose>
    </BAIFlex>
  );
};

export default FairShareScheduler;
