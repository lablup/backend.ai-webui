import { useWebUIUserSettingState } from '../hooks/useWebUISetting';
import Flex from './Flex';
import { ThunderboltTwoTone } from '@ant-design/icons';
import { Alert, AlertProps, Segmented, Typography, theme } from 'antd';
import { useTranslation } from 'react-i18next';
import { atom, useRecoilState } from 'recoil';

interface NeoSessionLauncherSwitchAlertProps extends AlertProps {
  onChange?: (value: 'current' | 'neo') => void;
}

const isClosedState = atom<boolean>({
  key: 'NeoSessionLauncherSwitchAlert:isCloseState',
  default: false,
});

const NeoSessionLauncherSwitchAlert: React.FC<
  NeoSessionLauncherSwitchAlertProps
> = ({ onChange, afterClose, ...props }) => {
  const [is2409Launcher, setIs2409Launcher] = useWebUIUserSettingState(
    'use_2409_session_launcher',
  );
  const { token } = theme.useToken();
  const { t } = useTranslation();

  const [isClosed, setIsClosed] = useRecoilState(isClosedState);
  return (
    isClosed || (
      <Alert
        message={
          <Flex gap={'md'}>
            <Typography.Text>
              {t('session.launcher.NeoSwitchDescription', {
                launcher: is2409Launcher
                  ? t('session.launcher.PreviousLauncher')
                  : t('session.launcher.NeoLauncher'),
              })}
            </Typography.Text>
            <Segmented
              options={[
                {
                  label: t('session.launcher.PreviousLauncher'),
                  value: 'current',
                },
                {
                  label: (
                    <Typography.Text
                      style={{
                        color: !is2409Launcher ? token.colorPrimary : undefined,
                      }}
                    >
                      {t('session.launcher.NeoLauncher')}
                    </Typography.Text>
                  ),
                  value: 'neo',
                  icon: (
                    // <ThunderboltFilled style={{ color: token.colorPrimary }} />
                    <ThunderboltTwoTone twoToneColor={token.colorWarning} />
                  ),
                },
              ]}
              value={is2409Launcher ? 'current' : 'neo'}
              onChange={(x) => {
                setIs2409Launcher(x === 'current' ? true : false);
                // @ts-ignore
                onChange && onChange(x);
              }}
            />
          </Flex>
        }
        type="info"
        showIcon
        closable
        afterClose={() => {
          setIsClosed(true);
        }}
        {...props}
      />
    )
  );
};

export default NeoSessionLauncherSwitchAlert;
