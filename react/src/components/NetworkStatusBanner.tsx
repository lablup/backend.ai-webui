import { useDebounce, useNetwork } from 'ahooks';
import { Alert } from 'antd';
import { createStyles } from 'antd-style';
import { atom, useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const isDisplayedNetworkStatusState = atom(false);

const useStyles = createStyles(({ token, css }) => ({
  borderError: css`
    border-bottom: 1px solid ${token.colorErrorBorder} !important;
    padding-left: ${token.marginLG}px;
    padding-right: ${token.marginLG}px;
  `,
  borderWarning: css`
    border-bottom: 1px solid ${token.colorWarningBorder} !important;
    padding-left: ${token.marginLG}px;
    padding-right: ${token.marginLG}px;
  `,
}));
const NetworkStatusBanner = () => {
  const { t } = useTranslation();
  const network = useNetwork();
  const setDisplayedStatus = useSetAtom(isDisplayedNetworkStatusState);
  const { styles } = useStyles();
  const [showSoftTimeoutAlert, setShowSoftTimeoutAlert] = useState(false);
  const [dismissSoftTimeoutAlert, setDismissSoftTimeoutAlert] = useState(false);

  useEffect(() => {
    const softHandler = () => {
      setShowSoftTimeoutAlert(true);
    };
    const successHandler = () => {
      setShowSoftTimeoutAlert(false);
    };
    document.addEventListener('backend-ai-network-soft-time-out', softHandler);
    document.addEventListener(
      'backend-ai-network-success-without-soft-time-out',
      successHandler,
    );
  }, []);

  const debouncedShowAlert = useDebounce(showSoftTimeoutAlert, {
    leading: true,
    trailing: true,
    wait: 5_000,
  });

  const shouldOpenOfflineAlert = !network.online;
  const shouldOpenSoftAlert =
    !shouldOpenOfflineAlert && debouncedShowAlert && !dismissSoftTimeoutAlert;

  useEffect(() => {
    setDisplayedStatus(shouldOpenOfflineAlert || shouldOpenSoftAlert);
  }, [setDisplayedStatus, shouldOpenOfflineAlert, shouldOpenSoftAlert]);

  return (
    <>
      {shouldOpenOfflineAlert && (
        <Alert
          title={t('webui.YouAreOffline')}
          className={styles.borderError}
          type="error"
          banner
        />
      )}
      {shouldOpenSoftAlert && (
        <Alert
          title={t('webui.NetworkSoftTimeout')}
          className={styles.borderWarning}
          banner
          closable
          onClose={() => {
            setDismissSoftTimeoutAlert(true);
          }}
        />
      )}
    </>
  );
};

export default NetworkStatusBanner;
