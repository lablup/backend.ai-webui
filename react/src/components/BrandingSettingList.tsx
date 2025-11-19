import BAIAlert from './BAIAlert';
import ThemeColorPicker from './BrandingSettingItems/ThemeColorPicker';
import SettingList, { SettingGroup } from './SettingList';
import { ExportOutlined } from '@ant-design/icons';
import { App } from 'antd';
import { BAIButton, BAIFlex } from 'backend.ai-ui';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { downloadBlob } from 'src/helper/csv-util';
import { useBAISettingUserState } from 'src/hooks/useBAISetting';

interface BrandingSettingListProps {}

const BrandingSettingList: React.FC<BrandingSettingListProps> = () => {
  const { t } = useTranslation();
  const { message } = App.useApp();

  const [userCustomThemeConfig, setUserCustomThemeConfig] =
    useBAISettingUserState('custom_theme_config');

  const settingGroups: Array<SettingGroup> = [
    {
      'data-testid': 'group-theme-customization',
      title: t('userSettings.Theme'),
      titleExtra: (
        <BAIButton
          size="small"
          action={async () => {
            const previewWindow = window.open(window.location.origin, '_blank');
            previewWindow?.sessionStorage.setItem('isThemePreviewMode', 'true');
            previewWindow?.location.reload();
          }}
        >
          {t('userSettings.theme.Preview')}
        </BAIButton>
      ),
      settingItems: [
        {
          type: 'custom',
          title: t('userSettings.theme.PrimaryColor'),
          description: t('userSettings.theme.PrimaryColorDesc'),
          children: <ThemeColorPicker tokenName="token.colorPrimary" />,
          // for reset feature
          defaultValue: {},
          setValue: setUserCustomThemeConfig,
        },
        {
          type: 'custom',
          title: t('userSettings.theme.HeaderBg'),
          description: t('userSettings.theme.HeaderBgDesc'),
          children: <ThemeColorPicker tokenName="components.Layout.headerBg" />,
          defaultValue: {},
          setValue: setUserCustomThemeConfig,
        },
        {
          type: 'custom',
          title: t('userSettings.theme.LinkColor'),
          description: t('userSettings.theme.LinkColorDesc'),
          children: <ThemeColorPicker tokenName="token.colorLink" />,
          defaultValue: {},
          setValue: setUserCustomThemeConfig,
        },
        {
          type: 'custom',
          title: t('userSettings.theme.InfoColor'),
          description: t('userSettings.theme.InfoColorDesc'),
          children: <ThemeColorPicker tokenName="token.colorInfo" />,
          defaultValue: {},
          setValue: setUserCustomThemeConfig,
        },
        {
          type: 'custom',
          title: t('userSettings.theme.ErrorColor'),
          description: t('userSettings.theme.ErrorColorDesc'),
          children: <ThemeColorPicker tokenName="token.colorError" />,
          defaultValue: {},
          setValue: setUserCustomThemeConfig,
        },
        {
          type: 'custom',
          title: t('userSettings.theme.SuccessColor'),
          description: t('userSettings.theme.SuccessColorDesc'),
          children: <ThemeColorPicker tokenName="token.colorSuccess" />,
          defaultValue: {},
          setValue: setUserCustomThemeConfig,
        },
        {
          type: 'custom',
          title: t('userSettings.theme.TextColor'),
          description: t('userSettings.theme.TextColorDesc'),
          children: <ThemeColorPicker tokenName="token.colorText" />,
          defaultValue: {},
          setValue: setUserCustomThemeConfig,
        },
      ],
    },
  ];

  return (
    <BAIFlex direction="column" gap="md" align="stretch">
      <BAIAlert
        description={t('userSettings.theme.CustomThemeSettingAlert')}
        type="warning"
        showIcon
      />
      <SettingList
        showSearchBar
        showResetButton
        settingGroups={settingGroups}
        primaryButton={
          <BAIButton
            type="primary"
            icon={<ExportOutlined />}
            action={async () => {
              if (_.isEmpty(userCustomThemeConfig)) {
                message.error(t('userSettings.theme.NoChangesMade'));
                return;
              }

              const blob = new Blob(
                [JSON.stringify(userCustomThemeConfig, null, 2)],
                { type: 'application/json' },
              );
              downloadBlob(blob, `theme.json`);
            }}
          >
            {t('theme.button.ExportToJson')}
          </BAIButton>
        }
      />
    </BAIFlex>
  );
};

export default BrandingSettingList;
