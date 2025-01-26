import SettingList, { SettingGroup } from '../components/SettingList';
import { SettingOutlined } from '@ant-design/icons';
import { Button, Card } from 'antd';
import { useTranslation } from 'react-i18next';
import { StringParam, useQueryParam, withDefault } from 'use-query-params';

type TabKey = 'maintenance';

const tabParam = withDefault(StringParam, 'configurations');

const ConfigurationsSettingList = () => {
  const { t } = useTranslation();

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
          defaultValue: 'digest',
          value: 'digest',
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
        },
        {
          type: 'checkbox',
          title: t('settings.UseGUIonWeb'),
          description: t('settings.DescUseGUIonWeb'),
          value: false,
          defaultValue: false,
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
        },
        {
          type: 'custom',
          title: t('settings.OverlayNetwork'),
          description: t('settings.OverlayNetworkConfiguration'),
          children: (
            <Button icon={<SettingOutlined />}>{t('settings.Config')}</Button>
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
          description: <>{t('settings.DescCudaGPUSupport')}</>,
          value: false,
          defaultValue: false,
        },
        {
          type: 'checkbox',
          title: t('settings.ROCMGPUSupport'),
          description: t('DescRocmGPUSupport.DescCudaGPUSupport'),
          value: false,
          defaultValue: false,
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
            <Button icon={<SettingOutlined />}>{t('settings.Config')}</Button>
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
          value: false,
          defaultValue: false,
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
          value: false,
          defaultValue: false,
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
          value: false,
          defaultValue: false,
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
          value: false,
          defaultValue: false,
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
          value: false,
          defaultValue: false,
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
          value: false,
          defaultValue: false,
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
          value: false,
          defaultValue: false,
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
          value: false,
          defaultValue: false,
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
          value: false,
          defaultValue: false,
        },
      ],
    },
  ];

  return <SettingList settingGroup={settingGroupList} showSearchBar />;
};

const ConfigurationsPage = () => {
  const { t } = useTranslation();
  const [curTabKey, setCurTabKey] = useQueryParam('tab', tabParam);

  return (
    <Card
      activeTabKey="configurations"
      onTabChange={(key) => setCurTabKey(key as TabKey)}
      tabList={[
        {
          key: 'configurations',
          tab: t('webui.menu.Configurations'),
        },
      ]}
      styles={{ body: { padding: 0 } }}
    >
      {curTabKey === 'configurations' && <ConfigurationsSettingList />}
    </Card>
  );
};

export default ConfigurationsPage;
