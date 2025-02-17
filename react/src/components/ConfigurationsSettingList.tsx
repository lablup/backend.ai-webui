import useBAIConfigurationsSetting, {
  defaultConfigurationsSettings,
  NetworkOptions,
  SchedulerType,
} from '../hooks/useBAIConfigurationsSetting';
import OverlayNetworkSettingModal from './OverlayNetworkSettingModal';
import SchedulerSettingModal from './SchedulerSettingModal';
import SettingList, { SettingGroup } from './SettingList';
import { SettingOutlined } from '@ant-design/icons';
import { useToggle } from 'ahooks';
import { Alert, Button, theme } from 'antd';
import { useTranslation } from 'react-i18next';

const ConfigurationsSettingList = () => {
  const { t } = useTranslation();
  const {
    options,
    setNetwork,
    setScheduler,
    updateSelectedScheduler,
    deleteSetting,
    setImagePullingBehavior,
  } = useBAIConfigurationsSetting();
  const [isOpenOverlayNetworkModal, { toggle: toggleOverlayNetworkModal }] =
    useToggle(false);
  const [isOpenSchedulerModal, { toggle: toggleSchedulerModal }] =
    useToggle(false);

  const { token } = theme.useToken();

  const settingGroupList: SettingGroup = [
    {
      title: t('settings.Image'),
      settingItems: [
        {
          type: 'checkbox',
          title: t('settings.RegisterNewImagesFromRepo'),
          description: t('settings.DescRegisterNewImagesFromRepo'),
          value: false,
          defaultValue: false,
          disabled: true,
        },
        {
          type: 'select',
          title: t('settings.ImagePullBehavior'),
          description: (
            <>
              {t('settings.DescImagePullBehavior')}
              <br />
              {t('settings.Require2003orAbove')}
            </>
          ),
          selectProps: {
            options: [
              { label: t('settings.image.Digest'), value: 'digest' },
              { label: t('settings.image.Tag'), value: 'tag' },
              { label: t('settings.image.None'), value: 'none' },
            ],
          },
          setValue: (value) => setImagePullingBehavior(value),
          defaultValue: defaultConfigurationsSettings.image_pulling_behavior,
          value: options.image_pulling_behavior,
          onChange: (value) => setImagePullingBehavior(value),
        },
      ],
    },
    {
      title: t('settings.GUI'),
      settingItems: [
        {
          type: 'checkbox',
          title: t('settings.UseCLIonGUI'),
          description: t('settings.DescUseCLIonGUI'),
          value: false,
          defaultValue: false,
          disabled: true,
        },
        {
          type: 'checkbox',
          title: t('settings.UseGUIonWeb'),
          description: t('settings.DescUseGUIonWeb'),
          value: false,
          defaultValue: false,
          disabled: true,
        },
      ],
    },
    {
      title: t('settings.Scaling'),
      settingItems: [
        {
          type: 'checkbox',
          title: t('settings.AllowAgentSideRegistration'),
          description: t('settings.DescAllowAgentSideRegistration'),
          value: true,
          defaultValue: true,
          disabled: true,
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
        },
      ],
    },
    {
      title: t('settings.Plugins'),
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
          disabled: true,
        },
        {
          type: 'checkbox',
          title: t('settings.ROCMGPUSupport'),
          description: t('settings.DescRocmGPUSupport'),
          value: options.rocm_gpu,
          defaultValue: options.rocm_gpu,
          disabled: true,
        },
        {
          type: 'custom',
          title: t('settings.Scheduler'),
          description: (
            <>
              {t('settings.SchedulerConfiguration')}
              <br />
              {t('settings.Require2009orAbove')}
            </>
          ),
          children: (
            <Button icon={<SettingOutlined />} onClick={toggleSchedulerModal}>
              {t('settings.Config')}
            </Button>
          ),
        },
      ],
    },
    {
      title: t('settings.EnterpriseFeatures'),
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
          disabled: true,
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
          disabled: true,
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
          disabled: true,
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
          disabled: true,
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
          disabled: true,
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
          disabled: true,
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
          disabled: true,
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
          disabled: true,
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
          disabled: true,
        },
      ],
    },
  ];

  return (
    <>
      <Alert
        message={t('settings.EnvConfigWillDisappear')}
        showIcon
        type="warning"
        style={{
          marginInline: token.paddingContentHorizontal,
          marginTop: token.paddingContentHorizontal,
        }}
      />
      <SettingList
        settingGroup={settingGroupList}
        showSearchBar
        showChangedOptionFilter
        showResetButton
      />
      <OverlayNetworkSettingModal
        onRequestClose={toggleOverlayNetworkModal}
        open={isOpenOverlayNetworkModal}
        networkOptions={options.network}
        onSave={async (value: { [key: keyof NetworkOptions]: string }) => {
          await setNetwork(value);
          toggleOverlayNetworkModal();
        }}
        onDelete={() => deleteSetting('network/overlay', true)}
      />
      <SchedulerSettingModal
        onRequestClose={toggleSchedulerModal}
        open={isOpenSchedulerModal}
        onSave={async (key, value) => {
          await setScheduler(key, {
            num_retries_to_skip: value.num_retries_to_skip.toString(),
          });
          toggleSchedulerModal();
        }}
        onSchedulerTypeChange={async (schedulerType) =>
          updateSelectedScheduler(schedulerType)
        }
        onDelete={(key: SchedulerType) =>
          deleteSetting(`plugins/scheduler/${key}`, true)
        }
      />
    </>
  );
};

export default ConfigurationsSettingList;
