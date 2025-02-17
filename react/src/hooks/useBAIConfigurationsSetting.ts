import { useSuspendedBackendaiClient } from '.';
import { App } from 'antd';
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

export const defaultConfigurationsSettings: BAIConfigurationsSetting = {
  image_pulling_behavior: 'digest',
  cuda_gpu: false,
  cuda_fgpu: false,
  rocm_gpu: false,
  tpu: false,
  ipu: false,
  atom: false,
  atom_plus: false,
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
  gaudi2: boolean;
  warboy: boolean;
  rngd: boolean;
  hyperaccel_lpu: boolean;
  network: NetworkOptions;
  [key: string]: any;
}

export const optionRange: {
  [
    key:
      | keyof SchedulerOptions
      | keyof NetworkOptions
      | keyof BAIConfigurationsSetting
      | string
  ]: {
    min: number;
    max: number;
  };
} = {
  num_retries_to_skip: {
    min: 0,
    max: 1000,
  },
  mtu: {
    min: 0,
    max: 15000,
  },
};

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
  'warboy.device': 'warboy',
  'rngd.device': 'rngd',
  'hyperaccel-lpu.device': 'hyperaccel_lpu',
};

const useBAIConfigurationsSetting = () => {
  const [options, setOptions] = useState<BAIConfigurationsSetting>({
    ...defaultConfigurationsSettings,
  });
  const baiClient = useSuspendedBackendaiClient();
  const { message } = App.useApp();
  const { t } = useTranslation();

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
      const { result } = await baiClient.setting.set(
        'docker/image/auto_pull',
        value,
      );
      if (result === 'ok') {
        updatePulling();
        message.success(t('notification.SuccessfullyUpdated'));
      }
    }
  };

  const updateNetwork = async () => {
    Object.keys(options.network).forEach(async (key) => {
      const { result } = await baiClient.setting.get(`network/overlay/${key}`);
      setOptions((prev) => ({
        ...prev,
        network: {
          ...prev.network,
          [key]: result || '',
        },
      }));
    });
  };

  const setNetwork = async (value: { [key: string]: string }) => {
    const { result } = await baiClient.setting.set('network/overlay', value);
    if (result === 'ok') {
      updateNetwork();
      message.success(t('notification.SuccessfullyUpdated'));
    }
  };

  const updateSelectedScheduler = async (
    schedulerType: SchedulerType,
  ): Promise<SchedulerOptions> => {
    let newOptions: SchedulerOptions = { ...options.scheduler };

    for (const [key] of Object.entries(newOptions)) {
      const { result } = await baiClient.setting.get(
        `plugins/scheduler/${schedulerType}/${key}`,
      );
      newOptions[key] = result || '0';
    }
    return newOptions;
  };

  const setScheduler = async (
    key: SchedulerType,
    value: { num_retries_to_skip: string },
  ) => {
    if (key !== 'fifo' && value.num_retries_to_skip !== '0') {
      message.error(t('settings.FifoOnly'));
      return;
    }

    const { result } = await baiClient.setting.set(
      `plugins/scheduler/${key}`,
      value,
    );
    if (result === 'ok') {
      message.success(t('notification.SuccessfullyUpdated'));
    }
  };

  const updateResourceSlots = () =>
    baiClient.get_resource_slots().then((response) => {
      const newOptions: BAIConfigurationsSetting = { ...options };
      Object.keys(resourcesSlots).forEach((key) => {
        if (key in response) {
          newOptions[resourcesSlots[key]] = true;
        }
      });
    });

  const updateSettings = async () => {
    await Promise.all([
      updatePulling(),
      updateResourceSlots(),
      updateNetwork(),
    ]);
  };

  const deleteSetting = async (key: string, prefix: boolean = false) => {
    const { result } = await baiClient.setting.delete(key, prefix);
    if (result === 'ok') {
      await updateSettings();
    }
  };

  useEffect(() => {
    updateSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    options,
    setOptions,
    updateSettings,
    updateNetwork,
    updateSelectedScheduler,
    updateResourceSlots,
    updatePulling,
    setNetwork,
    setScheduler,
    setImagePullingBehavior,
    deleteSetting,
  };
};

export default useBAIConfigurationsSetting;
