import useBAIConfigurationsSetting, {
  optionRange,
  SchedulerType,
} from '../hooks/useBAIConfigurationsSetting';
import BAIModal, { BAIModalProps } from './BAIModal';
import Flex from './Flex';
import SettingList, { SettingGroup } from './SettingList';
import { SettingOutlined } from '@ant-design/icons';
import { useToggle } from 'ahooks';
import { Button, Form, InputNumber, Select, Typography } from 'antd';
import { FormInstance } from 'antd/lib';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface OverlayNetworkSettingsModalProps extends BAIModalProps {
  onRequestClose: () => void;
  value: number;
  onSave: (value: number) => void;
}

const OverlayNetworkSettingModal = ({
  onRequestClose,
  open,
  value,
  onSave,
}: OverlayNetworkSettingsModalProps) => {
  const { t } = useTranslation();

  const formRef = useRef<FormInstance>(null);

  return (
    <BAIModal
      open={open}
      title={t('settings.OverlayNetworkSettings')}
      onCancel={onRequestClose}
      centered
      destroyOnClose
      width={'auto'}
      footer={[
        <Button key="overlayNetworkClose" onClick={onRequestClose}>
          {t('button.Close')}
        </Button>,
        <Button
          key="overlayNetworkSave"
          type="primary"
          onClick={() =>
            formRef.current?.validateFields().then((values) => {
              onSave(values.mtu);
            })
          }
        >
          {t('button.Save')}
        </Button>,
      ]}
    >
      <Form ref={formRef} initialValues={{ mtu: value }}>
        <Form.Item label="MTU" required name="mtu">
          <InputNumber
            min={optionRange.mtu.min}
            max={optionRange.mtu.max}
            style={{
              width: '100%',
            }}
          />
        </Form.Item>
      </Form>
    </BAIModal>
  );
};

interface SchedulerSettingModalProps extends BAIModalProps {
  onRequestClose: () => void;
  schedulerType: SchedulerType;
  num_retries_to_skip: number;
  onSave: (key: SchedulerType, value: { num_retries_to_skip: number }) => void;
}

const SchedulerSettingModal = ({
  onRequestClose,
  open,
  schedulerType,
  num_retries_to_skip,
  onSave,
}: SchedulerSettingModalProps) => {
  const { t } = useTranslation();

  const formRef = useRef<FormInstance>(null);
  const initialValues = {
    schedulerType,
    num_retries_to_skip,
  };
  return (
    <BAIModal
      title={t('settings.ConfigPerJobSchduler')}
      open={open}
      centered
      destroyOnClose
      width={'auto'}
      onCancel={onRequestClose}
      footer={[
        <Button key="overlayNetworkClose" onClick={onRequestClose}>
          {t('button.Close')}
        </Button>,
        <Button
          key="overlayNetworkSave"
          type="primary"
          onClick={() =>
            formRef.current?.validateFields().then((values) => {
              onSave(values.schedulerType, {
                num_retries_to_skip: values.num_retries_to_skip,
              });
            })
          }
        >
          {t('button.Save')}
        </Button>,
      ]}
    >
      <Form initialValues={initialValues} ref={formRef}>
        <Form.Item
          label={t('settings.Scheduler')}
          name="schedulerType"
          required
        >
          <Select
            popupMatchSelectWidth={false}
            value={schedulerType}
            options={[
              {
                label: 'FIFO',
                value: 'fifo',
              },
              {
                label: 'LIFO',
                value: 'lifo',
              },
              {
                label: 'DRF',
                value: 'drf',
              },
            ]}
          />
        </Form.Item>
        <Flex direction="column" align="start" style={{ width: '100%' }}>
          <Typography.Text strong>
            {t('settings.SchedulerOptions')}
          </Typography.Text>
          <Form.Item
            label={t('settings.SessionCreationRetries')}
            name="num_retries_to_skip"
            required
          >
            <InputNumber
              min={optionRange.numRetries.min}
              max={optionRange.numRetries.max}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Flex>
      </Form>
    </BAIModal>
  );
};

const ConfigurationsSettingList = () => {
  const { t } = useTranslation();
  const { options, setNetwork, setSchedulerType } =
    useBAIConfigurationsSetting();
  const [isOpenOverlayNetworkModal, { toggle: toggleOverlayNetworkModal }] =
    useToggle(false);
  const [isOpenSchedulerModal, { toggle: toggleSchedulerModal }] =
    useToggle(false);

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
          defaultValue: options.image_pulling_behavior,
          value: options.image_pulling_behavior,
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
          defaultValue: options.cuda_gpu,
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
          defaultValue: options.cuda_fgpu,
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
          defaultValue: options.tpu,
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
          defaultValue: options.ipu,
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
          defaultValue: options.atom,
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
          defaultValue: options.atom_plus,
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
          defaultValue: options.gaudi2,
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
          defaultValue: options.warboy,
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
          defaultValue: options.rngd,
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
          defaultValue: options.hyperaccel_lpu,
          disabled: true,
        },
      ],
    },
  ];

  return (
    <>
      <SettingList settingGroup={settingGroupList} showSearchBar />
      <OverlayNetworkSettingModal
        onRequestClose={toggleOverlayNetworkModal}
        open={isOpenOverlayNetworkModal}
        value={Number(options.network.mtu)}
        onSave={async (value: number | null) => {
          if (await setNetwork({ mtu: value?.toString() || '' })) {
            toggleOverlayNetworkModal();
          }
        }}
      />
      <SchedulerSettingModal
        onRequestClose={toggleSchedulerModal}
        open={isOpenSchedulerModal}
        schedulerType={options.schedulerType}
        num_retries_to_skip={Number(options.scheduler.num_retries_to_skip)}
        onSave={async (key, value) => {
          if (
            await setSchedulerType(key, {
              num_retries_to_skip: value.num_retries_to_skip.toString(),
            })
          ) {
            toggleSchedulerModal();
          }
        }}
      />
    </>
  );
};

export default ConfigurationsSettingList;
