import BAICard from '../BAICard';
import { bytesToBinarySize } from '../helper';
import {
  useCurrentProjectValue,
  useCurrentResourceGroupValue,
} from '../hooks/useCurrentProject';
import {
  MergedResourceLimits,
  ResourceLimits,
  useResourceLimitAndRemaining,
} from '../hooks/useResourceLimitAndRemaining';
import BAIProgressBar from './BAIProgressBar';
import Flex from './Flex';
import ResourceGroupSelectForCurrentProject from './ResourceGroupSelectForCurrentProject';
import { Badge, CardProps, Typography, theme } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

const deviceNameMap = {
  cpu: 'CPU',
  mem: 'RAM',
  'cuda.device': 'GPU',
  'cuda.shares': 'FGPU',
  'rocm.device': 'ROCm GPU',
  'tpu.device': 'TPU',
  'ipu.device': 'IPU',
  'atom.device': 'ATOM',
  'atom-plus.device': 'ATOM+',
  'warboy.device': 'Warboy',
  'hyperaccel-lpu.device': 'Hyperaccel LPU',
};
interface BAIResourcePanelProps extends CardProps {
  width?: number | string;
  height?: number | string;
}

const BAIResourcePanel: React.FC<BAIResourcePanelProps> = ({
  width,
  height,
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const currentProject = useCurrentProjectValue();
  const currentResourceGroup = useCurrentResourceGroupValue();
  const fetchData = useResourceLimitAndRemaining({
    currentProjectName: currentProject.name,
    currentResourceGroup: currentResourceGroup || 'default',
  })[0];
  const deviceKeys = _.keysIn(fetchData?.checkPresetInfo?.keypair_limits || {});

  return (
    <BAICard
      style={{ width: width }}
      title={
        <Flex justify="between">
          <Typography.Text>{t('summary.ResourceStatistics')}</Typography.Text>
          <ResourceGroupSelectForCurrentProject />
        </Flex>
      }
    >
      <Flex
        align="start"
        direction="column"
        gap={token.marginMD}
        style={{ width: '100%', height: height, overflowY: 'scroll' }}
      >
        <Flex
          direction="column"
          align="start"
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 1,
            backgroundColor: token.colorWhite,
            width: '100%',
          }}
        >
          <Flex gap={token.marginXS}>
            <Badge color={token.blue7} />
            <Typography.Text type="secondary">
              {t('session.launcher.CurrentResourceGroup')} (
              {currentResourceGroup})
            </Typography.Text>
          </Flex>
          <Flex gap={token.marginXS}>
            <Badge color={token.green7} />
            <Typography.Text type="secondary">
              {t('session.launcher.UserResourceLimit')}
            </Typography.Text>
          </Flex>
        </Flex>
        {_.map(deviceKeys, (device: keyof ResourceLimits) => {
          const total_resource_slot =
            fetchData?.resourceLimits[device as keyof MergedResourceLimits]
              ?.max ||
            fetchData?.resourceLimits.accelerators[
              device as keyof MergedResourceLimits
            ]?.max;
          //TODO: 각가의 변수명이 제대로 매칭되어 있는지 확인
          const scaling_groups_using =
            fetchData?.checkPresetInfo?.keypair_using[device];
          const used_resource_group_slot =
            fetchData?.checkPresetInfo?.scaling_groups[
              currentResourceGroup || 'default'
            ].using[device];

          return (
            <Flex
              gap={token.marginMD}
              align="center"
              justify="center"
              style={{ width: 'inherit' }}
            >
              <Typography.Text
                strong
                style={{
                  flex: 1,
                  display: 'flex',
                  justifyContent: 'end',
                  wordBreak: 'break-all',
                }}
              >
                {deviceNameMap[device]}
              </Typography.Text>
              <Flex
                gap={token.marginXXS}
                direction="column"
                style={{ flex: 4, width: '100%' }}
              >
                <BAIProgressBar
                  max={
                    device === 'mem'
                      ? bytesToBinarySize(
                          parseFloat(total_resource_slot as string),
                          'GiB',
                        ).number
                      : Number(total_resource_slot)
                  }
                  current={
                    used_resource_group_slot
                      ? device === 'mem'
                        ? bytesToBinarySize(
                            parseFloat(used_resource_group_slot as string),
                            'GiB',
                          ).number
                        : Number(used_resource_group_slot)
                      : 0
                  }
                  prefix={device === 'mem' ? 'GiB' : undefined}
                  showPercentage
                  color={token.blue7}
                />
                <BAIProgressBar
                  max={
                    device === 'mem'
                      ? bytesToBinarySize(
                          parseFloat(total_resource_slot as string),
                          'GiB',
                        ).number
                      : Number(total_resource_slot)
                  }
                  current={
                    scaling_groups_using
                      ? device === 'mem'
                        ? bytesToBinarySize(
                            parseFloat(scaling_groups_using as string),
                            'GiB',
                          ).number
                        : Number(scaling_groups_using)
                      : 0
                  }
                  prefix={device === 'mem' ? 'GiB' : undefined}
                  showPercentage
                  color={token.green7}
                />
              </Flex>
            </Flex>
          );
        })}
      </Flex>
    </BAICard>
  );
};

export default BAIResourcePanel;
