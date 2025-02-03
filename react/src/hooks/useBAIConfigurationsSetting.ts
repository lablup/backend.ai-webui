import { useSuspendedBackendaiClient } from '.';
import { useSetBAINotification } from './useBAINotification';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface BAIConfigurationsSetting {
  image_pulling_behavior: 'digest' | 'tag' | 'none';
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
  schedulerType: 'fifo' | 'lifo' | 'drf';
  scheduler: {
    num_retries_to_skip: '0';
  };
  network: {
    mtu: string;
  };
  [key: string]: any;
}

export const optionRange = {
  numRetries: {
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
  });
  console.log(options);
  const baiClient = useSuspendedBackendaiClient();
  const { upsertNotification } = useSetBAINotification();
  const { t } = useTranslation();

  const updatePulling = async () => {
    try {
      const { result } = await baiClient.setting.get('docker/image/auto_pull');
      if (result === null || result === 'digest') {
        setOptions((prev) => ({ ...prev, image_pulling_behavior: 'digest' }));
      } else if (result === 'tag') {
        setOptions((prev) => ({ ...prev, image_pulling_behavior: 'tag' }));
      } else {
        setOptions((prev) => ({ ...prev, image_pulling_behavior: 'none' }));
      }
    } catch (e) {
      console.error(e);
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

  const setNetwork = async (value: {
    [key: string]: string;
  }): Promise<boolean> => {
    try {
      const { result } = await baiClient.setting.set('network/overlay', value);
      if (result !== 'ok') {
        throw new Error('Failed to set network overlay settings');
      }
      updateNetwork();
      upsertNotification({
        description: t('notification.SuccessfullyUpdated'),
        open: true,
      });
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const updateScheduler = async () => {
    Object.keys(options.scheduler).forEach(async (key) => {
      try {
        const { result } = await baiClient.setting.get(
          `plugins/scheduler/${options.schedulerType}/${key}`,
        );
        setOptions((prev) => ({
          ...prev,
          scheduler: {
            ...prev.scheduler,
            [key]: result || '0',
          },
        }));
      } catch (e) {
        console.error(e);
      }
    });
  };

  const updateResourceSlots = async () => {
    try {
      const response = await baiClient.get_resource_slots();
      const newOptions: BAIConfigurationsSetting = { ...options };
      Object.keys(resourcesSlots).forEach((key) => {
        if (key in response) {
          newOptions[resourcesSlots[key]] = true;
        }
      });
    } catch (e) {
      console.error(e);
    }
  };

  const updateSettings = async () => {
    await Promise.all([
      updatePulling(),
      updateScheduler(),
      updateResourceSlots(),
      updateNetwork(),
    ]);
  };

  useEffect(() => {
    updateSettings();
  }, []);

  return {
    options,
    setOptions,
    updateSettings,
    updateNetwork,
    updateScheduler,
    updateResourceSlots,
    updatePulling,
    setNetwork,
  };
};

export default useBAIConfigurationsSetting;
