/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '../hooks';
import OverlayNetworkSettingModal from './OverlayNetworkSettingModal';
import SchedulerSettingModal from './SchedulerSettingModal';
import SettingList, { SettingGroup } from './SettingList';
import { SettingOutlined } from '@ant-design/icons';
import { useToggle } from 'ahooks';
import { Alert, App, Button } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export type SchedulerType = 'fifo' | 'lifo' | 'drf';
export type ImagePullingBehavior = 'digest' | 'tag' | 'none';
export type SchedulerOptions = {
  num_retries_to_skip: string;
  [key: string]: string;
};
export type NetworkOptions = {
  mtu: string;
  [key: string]: string;
};

const defaultConfigurationsSettings: BAIConfigurationsSetting = {
  image_pulling_behavior: 'digest',
  cuda_gpu: false,
  cuda_fgpu: false,
  rocm_gpu: false,
  tpu: false,
  ipu: false,
  atom: false,
  atom_plus: false,
  atom_max: false,
  gaudi2: false,
  warboy: false,
  rngd: false,
  hyperaccel_lpu: false,
  schedulerType: 'fifo',
  scheduler: {
    num_retries_to_skip: '0',
  },
  network: {
    mtu: '',
  },
};

interface BAIConfigurationsSetting {
  image_pulling_behavior: ImagePullingBehavior;
  cuda_gpu: boolean;
  cuda_fgpu: boolean;
  rocm_gpu: boolean;
  tpu: boolean;
  ipu: boolean;
  atom: boolean;
  atom_plus: boolean;
  atom_max: boolean;
  gaudi2: boolean;
  warboy: boolean;
  rngd: boolean;
  hyperaccel_lpu: boolean;
  network: NetworkOptions;
  [key: string]: any;
}

const resourcesSlots: {
  [key: string]: keyof BAIConfigurationsSetting;
} = {
  'cuda.device': 'cuda_gpu',
  'cuda.shares': 'cuda_fgpu',
  'rocm.device': 'rocm_gpu',
  'tpu.device': 'tpu',
  'ipu.device': 'ipu',
  'atom.device': 'atom',
  'atom-plus.device': 'atom_plus',
  'atom-max.device': 'atom_max',
  'warboy.device': 'warboy',
  'rngd.device': 'rngd',
  'hyperaccel-lpu.device': 'hyperaccel_lpu',
};

const ConfigurationsSettingList = () => {
  const { t } = useTranslation();
  const [isOpenOverlayNetworkModal, { toggle: toggleOverlayNetworkModal }] =
    useToggle(false);
  const [isOpenSchedulerModal, { toggle: toggleSchedulerModal }] =
    useToggle(false);
  const [options, setOptions] = useState<BAIConfigurationsSetting>({
    ...defaultConfigurationsSettings,
  });

  const baiClient = useSuspendedBackendaiClient();
  const { message } = App.useApp();

  const updatePulling = async () => {
    const { result } = await baiClient.setting.get('docker/image/auto_pull');
    if (result === null || result === 'digest') {
      setOptions((prev) => ({ ...prev, image_pulling_behavior: 'digest' }));
    } else if (result === 'tag') {
      setOptions((prev) => ({ ...prev, image_pulling_behavior: 'tag' }));
    } else {
      setOptions((prev) => ({ ...prev, image_pulling_behavior: 'none' }));
    }
  };

  const setImagePullingBehavior = async (value: ImagePullingBehavior) => {
    if (value !== options.image_pulling_behavior) {
      try {
        const { result } = await baiClient.setting.set(
          'docker/image/auto_pull',
          value,
        );
        if (result === 'ok') {
          updatePulling();
          message.success(t('notification.SuccessfullyUpdated'));
        } else {
          message.error(t('settings.FailedToSaveSettings'));
        }
      } catch {
        message.error(t('settings.FailedToSaveSettings'));
      }
    }
  };

  const updateResourceSlots = () =>
    baiClient.get_resource_slots().then((response) => {
      setOptions((prev) => ({
        ...prev,
        ...Object.fromEntries(
          Object.keys(resourcesSlots).map((key) => [
            resourcesSlots[key],
            key in response,
          ]),
        ),
      }));
    });

  const updateSettings = () => {
    return Promise.all([updatePulling(), updateResourceSlots()]);
  };

  useEffect(() => {
    updateSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const settingGroupList: SettingGroup[] = [
    {
      'data-testid': 'settings-general',
      title: t('settings.General'),
      settingItems: [
        {
          type: 'select',
          title: t('settings.ImagePullBehavior'),
          description: t('settings.DescImagePullBehavior'),
          selectProps: {
            options: [
              { label: t('settings.image.Digest'), value: 'digest' },
              { label: t('settings.image.Tag'), value: 'tag' },
              { label: t('settings.image.None'), value: 'none' },
            ],
          },
          defaultValue: defaultConfigurationsSettings.image_pulling_behavior,
          value: options.image_pulling_behavior,
          onChange: (value) =>
            setImagePullingBehavior(value as ImagePullingBehavior),
        },
        {
          type: 'custom',
          title: t('settings.OverlayNetwork'),
          description: t('settings.OverlayNetworkConfiguration'),
          children: (
            <Button
              icon={<SettingOutlined />}
              onClick={toggleOverlayNetworkModal}
            >
              {t('settings.Config')}
            </Button>
          ),
          showResetButton: false,
        },
        {
          type: 'custom',
          title: t('settings.Scheduler'),
          description: t('settings.SchedulerConfiguration'),
          children: (
            <Button icon={<SettingOutlined />} onClick={toggleSchedulerModal}>
              {t('settings.Config')}
            </Button>
          ),
          showResetButton: false,
        },
      ],
    },
    {
      'data-testid': 'settings-plugins',
      title: t('settings.Plugins'),
      description: (
        <Alert title={t('settings.NoteAboutFixedSetup')} type="info" showIcon />
      ),
      settingItems: [
        {
          type: 'checkbox',
          title: t('settings.OpenSourceCudaGPUSupport'),
          description: (
            <>
              {t('settings.DescCudaGPUSupport')}{' '}
              {options.cuda_fgpu && (
                <>
                  <br />
                  {t('settings.CUDAGPUdisabledByFGPUsupport')}
                </>
              )}
            </>
          ),
          value: options.cuda_gpu,
          defaultValue: defaultConfigurationsSettings.cuda_gpu,
          checkboxProps: {
            disabled: true,
          },
        },
        {
          type: 'checkbox',
          title: t('settings.ROCMGPUSupport'),
          description: t('settings.DescRocmGPUSupport'),
          value: options.rocm_gpu,
          defaultValue: defaultConfigurationsSettings.rocm_gpu,
          checkboxProps: {
            disabled: true,
          },
        },
      ],
    },
    {
      'data-testid': 'settings-enterprise',
      title: t('settings.EnterpriseFeatures'),
      description: (
        <Alert title={t('settings.NoteAboutFixedSetup')} type="info" showIcon />
      ),
      settingItems: [
        {
          type: 'checkbox',
          title: t('settings.FractionalGPU'),
          description: (
            <>
              {t('settings.DescFractionalGPU')}
              <br />
              {t('settings.RequireFGPUPlugin')}
            </>
          ),
          value: options.cuda_fgpu,
          defaultValue: defaultConfigurationsSettings.cuda_fgpu,
          checkboxProps: {
            disabled: true,
          },
        },
        {
          type: 'checkbox',
          title: t('settings.TPU'),
          description: (
            <>
              {t('settings.DescTPU')}
              <br />
              {t('settings.RequireTPUPlugin')}
            </>
          ),
          value: options.tpu,
          defaultValue: defaultConfigurationsSettings.tpu,
          checkboxProps: {
            disabled: true,
          },
        },
        {
          type: 'checkbox',
          title: t('settings.IPUSupport'),
          description: (
            <>
              {t('settings.DescIPUSupport')}
              <br />
              {t('settings.RequireTPUPlugin')}
            </>
          ),
          value: options.ipu,
          defaultValue: defaultConfigurationsSettings.ipu,
          checkboxProps: {
            disabled: true,
          },
        },
        {
          type: 'checkbox',
          title: t('settings.ATOMSupport'),
          description: (
            <>
              {t('settings.DescATOMSupport')}
              <br />
              {t('settings.RequireATOMPlugin')}
            </>
          ),
          value: options.atom,
          defaultValue: defaultConfigurationsSettings.atom,
          checkboxProps: {
            disabled: true,
          },
        },
        {
          type: 'checkbox',
          title: t('settings.ATOMPlusSupport'),
          description: (
            <>
              {t('settings.DescATOMPlusSupport')}
              <br />
              {t('settings.RequireATOMPlusPlugin')}
            </>
          ),
          value: options.atom_plus,
          defaultValue: defaultConfigurationsSettings.atom_plus,
          checkboxProps: {
            disabled: true,
          },
        },
        {
          type: 'checkbox',
          title: t('settings.ATOMMaxSupport'),
          description: (
            <>
              {t('settings.DescATOMMaxSupport')}
              <br />
              {t('settings.RequireATOMMaxPlugin')}
            </>
          ),
          value: options.atom_max,
          defaultValue: defaultConfigurationsSettings.atom_max,
          checkboxProps: {
            disabled: true,
          },
        },
        {
          type: 'checkbox',
          title: t('settings.Gaudi2Support'),
          description: (
            <>
              {t('settings.DescGaudi2Support')}
              <br />
              {t('settings.RequireGaudi2Plugin')}
            </>
          ),
          value: options.gaudi2,
          defaultValue: defaultConfigurationsSettings.gaudi2,
          checkboxProps: {
            disabled: true,
          },
        },
        {
          type: 'checkbox',
          title: t('settings.WarboySupport'),
          description: (
            <>
              {t('settings.DescWarboySupport')}
              <br />
              {t('settings.RequireWarboyPlugin')}
            </>
          ),
          value: options.warboy,
          defaultValue: defaultConfigurationsSettings.warboy,
          checkboxProps: {
            disabled: true,
          },
        },
        {
          type: 'checkbox',
          title: t('settings.RNGDSupport'),
          description: (
            <>
              {t('settings.DescRNGDSupport')}
              <br />
              {t('settings.RequireRNGDPlugin')}
            </>
          ),
          value: options.rngd,
          defaultValue: defaultConfigurationsSettings.rngd,
          checkboxProps: {
            disabled: true,
          },
        },
        {
          type: 'checkbox',
          title: t('settings.HyperaccelLPUSupport'),
          description: (
            <>
              {t('settings.DescHyperaccelLPUSupport')}
              <br />
              {t('settings.RequireHyperaccelLPUPlugin')}
            </>
          ),
          value: options.hyperaccel_lpu,
          defaultValue: defaultConfigurationsSettings.hyperaccel_lpu,
          checkboxProps: {
            disabled: true,
          },
        },
      ],
    },
  ];

  return (
    <>
      <SettingList
        settingGroups={settingGroupList}
        showSearchBar
        showChangedOptionFilter
      />
      <OverlayNetworkSettingModal
        onRequestClose={toggleOverlayNetworkModal}
        open={isOpenOverlayNetworkModal}
      />
      <SchedulerSettingModal
        onRequestClose={toggleSchedulerModal}
        open={isOpenSchedulerModal}
      />
    </>
  );
};

export default ConfigurationsSettingList;
